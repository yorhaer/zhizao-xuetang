<template>
  <div class="page-container fade-in-up">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">📋</div>
        <div class="stat-content">
          <div class="stat-label">我的授课</div>
          <div class="stat-value">{{ trainings.length }}<sup>场</sup></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon indigo">📁</div>
        <div class="stat-content">
          <div class="stat-label">沉淀资料</div>
          <div class="stat-value">{{ resourceRows.length }}<sup>份</sup></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">🌐</div>
        <div class="stat-content">
          <div class="stat-label">已公开</div>
          <div class="stat-value">{{ publicResourceCount }}<sup>份</sup></div>
        </div>
      </div>
      <div class="stat-card" :class="{ 'stat-card--alert': missingCourseware.length > 0 }">
        <div class="stat-icon amber">⚠️</div>
        <div class="stat-content">
          <div class="stat-label">待补资料</div>
          <div class="stat-value">{{ missingCourseware.length }}<sup>场</sup></div>
        </div>
      </div>
    </div>

    <!-- 近期课程窗口 -->
    <div class="schedule-panel">
      <div class="schedule-panel-header">
        <div>
          <h3 class="schedule-title">近期课程</h3>
          <p class="schedule-subtitle">{{ scheduleRangeText }}</p>
        </div>
        <el-segmented v-model="scheduleScope" :options="scheduleScopeOptions" />
      </div>

      <div class="schedule-summary">
        <div class="schedule-summary-item">
          <span>课程</span>
          <strong>{{ scopedTrainings.length }}</strong>
        </div>
        <div class="schedule-summary-item">
          <span>待授课</span>
          <strong>{{ scopedUpcoming.length }}</strong>
        </div>
        <div class="schedule-summary-item">
          <span>待补资料</span>
          <strong>{{ scopedMissingCourseware.length }}</strong>
        </div>
        <div class="schedule-summary-item">
          <span>已完成</span>
          <strong>{{ scopedCompleted.length }}</strong>
        </div>
      </div>

      <div v-if="scopedTrainings.length" class="schedule-list">
        <button
          v-for="training in scopedTrainings"
          :key="training.id"
          type="button"
          class="schedule-row"
          @click="openSchedule(training)"
        >
          <div class="schedule-date">
            <span>{{ formatMonthDay(training.startDate) }}</span>
            <strong>{{ getWeekdayLabel(training.startDate) }}</strong>
          </div>
          <div class="schedule-main">
            <div class="schedule-course">{{ training.courseName }}</div>
            <div class="schedule-meta">
              {{ training.startTime }}-{{ training.endTime }} · {{ training.students.join('、') }}
            </div>
          </div>
          <div class="schedule-actions">
            <el-tag :type="getStatusType(training.status)" size="small">
              {{ getStatusText(training.status) }}
            </el-tag>
            <el-button
              v-if="!training.coursewares.length"
              size="small"
              type="warning"
              plain
              @click.stop="openUpload(training)"
            >
              补资料
            </el-button>
          </div>
        </button>
      </div>
      <el-empty v-else :description="`${scheduleScope}暂无授课安排`" />
    </div>

    <el-card shadow="never" class="workspace-card">
      <template #header>
        <div class="card-header">
          <div>
            <strong>资料与授课</strong>
            <span class="header-note">按课程沉淀资料，控制学员是否可见</span>
          </div>
          <el-button type="primary" @click="openUpload(trainings[0])" :disabled="trainings.length === 0">
            <el-icon><UploadFilled /></el-icon>
            上传资料
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="授课日志" name="log">
          <div class="toolbar">
            <el-input
              v-model="keyword"
              clearable
              placeholder="搜索课程、内容、学员"
              class="search-input"
            />
            <el-date-picker
              v-model="logDateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
              style="width: 280px"
            />
            <el-segmented v-model="statusFilter" :options="filterOptions" />
          </div>

          <el-table
            :data="teachingLedgerRows"
            border
            stripe
            style="width: 100%"
            :span-method="teachingSpanMethod"
            row-key="rowKey"
            class="teaching-ledger-table"
          >
            <el-table-column prop="courseName" label="课程" min-width="200" />
            <el-table-column prop="trainingContent" label="内容" min-width="240" show-overflow-tooltip />
            <el-table-column prop="studentName" label="学员" width="120" />
            <el-table-column label="时间" width="170">
              <template #default="{ row }">
                <div>{{ row.startDate }}</div>
                <div class="muted">{{ row.startTime }}-{{ row.endTime }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="地点" width="130" show-overflow-tooltip />
            <el-table-column label="资料" width="130">
              <template #default="{ row }">
                <el-tag :type="row.training.coursewares.length ? 'success' : 'warning'" size="small">
                  {{ row.training.coursewares.length ? `${row.training.coursewares.length} 份` : '待上传' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.training.status)">
                  {{ getStatusText(row.training.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="250">
              <template #default="{ row }">
                <el-button size="small" @click="openSchedule(row.training)">改期/代课</el-button>
                <el-button size="small" @click="openUpload(row.training)">上传资料</el-button>
                <el-button
                  v-if="['completed', 'assessed'].includes(row.training.status)"
                  size="small"
                  @click="inputAssessment(row.training)"
                >
                  录成绩
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="资料库" name="resources">
          <div class="resource-group-list">
            <div v-for="group in resourceGroups" :key="group.groupKey" class="resource-group">
              <div class="resource-group-header">
                <div>
                  <div class="resource-course-title">{{ group.courseName }}</div>
                  <div class="muted">
                    {{ group.dateRange }} · {{ group.sessionCount }} 场授课 · {{ group.studentNames.join('、') }}
                  </div>
                </div>
                <div class="resource-group-actions">
                  <el-tag :type="group.files.length ? 'success' : 'warning'" size="small">
                    {{ group.files.length ? `${group.files.length} 份课件` : '待上传' }}
                  </el-tag>
                  <el-button size="small" type="primary" plain @click="openUpload(group.training)">上传资料</el-button>
                </div>
              </div>

              <div v-if="group.files.length" class="resource-file-list">
                <div v-for="file in group.files" :key="file.id" class="resource-file-row">
                  <div class="resource-file-main">
                    <div class="file-title">{{ file.name }}</div>
                    <div class="muted">{{ file.type }} · {{ file.summary || '未填写用途说明' }}</div>
                    <div class="resource-tags">
                      <el-tag v-for="tag in file.knowledgeTags" :key="tag" size="small" class="inline-tag">
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>
                  <el-select v-model="file.visibility" size="small" class="visibility-select" @change="saveResourceVisibility(file)">
                    <el-option label="公开" value="public" />
                    <el-option label="本课可见" value="class" />
                    <el-option label="草稿" value="draft" />
                  </el-select>
                  <div class="resource-file-actions">
                    <el-button size="small">预览</el-button>
                    <el-button size="small" @click="openResourceEdit(file)">编辑</el-button>
                  </div>
                </div>
              </div>
              <el-empty v-else description="这节课还没有资料" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="scheduleDialogVisible"
      :title="`${scheduleForm.courseName || '课程'} - 改期/代课`"
      width="760px"
    >
      <el-form label-width="92px" class="two-column-form">
        <el-form-item label="课程名称">
          <el-input v-model="scheduleForm.courseName" />
        </el-form-item>
        <el-form-item label="授课导师">
          <el-select v-model="scheduleForm.tutorId" style="width: 100%">
            <el-option v-for="tutor in availableTutors" :key="tutor.id" :label="tutor.name" :value="tutor.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="培训日期">
          <el-date-picker v-model="scheduleForm.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="scheduleForm.location" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker v-model="scheduleForm.startTime" value-format="HH:mm" format="HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker v-model="scheduleForm.endTime" value-format="HH:mm" format="HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="参训学员" class="full-row">
          <el-select v-model="scheduleForm.studentIds" multiple filterable style="width: 100%">
            <el-option
              v-for="student in availableStudents"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="培训内容" class="full-row">
          <el-input v-model="scheduleForm.trainingContent" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="变更原因" class="full-row">
          <el-input
            v-model="scheduleForm.changeReason"
            type="textarea"
            :rows="2"
            placeholder="例如：导师临时出差，课程顺延；或由同工作室导师代课"
          />
        </el-form-item>
      </el-form>

      <div v-if="currentTraining.changeLogs?.length" class="change-log">
        <h4>变更日志</h4>
        <el-timeline>
          <el-timeline-item
            v-for="log in currentTraining.changeLogs"
            :key="`${log.time}-${log.action}`"
            :timestamp="log.time"
          >
            <strong>{{ log.action }}</strong>
            <span class="muted"> / {{ log.operator }}</span>
            <div>{{ log.detail }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSchedule">保存变更</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="uploadDialogVisible"
      :title="`${currentTraining.courseName || '课程'} - 上传资料`"
      width="620px"
    >
      <el-form label-width="92px">
        <el-form-item label="资料名称">
          <el-input v-model="uploadForm.name" placeholder="例如：液压阀结构图解.pdf" />
        </el-form-item>
        <el-form-item label="学员可见">
          <el-radio-group v-model="uploadForm.visibility">
            <el-radio-button label="public">公开</el-radio-button>
            <el-radio-button label="class">本课可见</el-radio-button>
            <el-radio-button label="draft">草稿</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="知识标签">
          <el-select v-model="uploadForm.tags" multiple filterable allow-create default-first-option>
            <el-option label="液压阀" value="液压阀" />
            <el-option label="实操" value="实操" />
            <el-option label="故障判断" value="故障判断" />
            <el-option label="过程记录" value="过程记录" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="uploadForm.summary"
            type="textarea"
            :rows="3"
            placeholder="给学员看的资料说明，帮助他们判断是否需要点进去"
          />
        </el-form-item>
        <el-form-item label="文件">
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">原型支持 PDF、Word、图片、视频；本次不做真实上传。</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload" :loading="uploading">
          保存资料
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="resourceDialogVisible"
      :title="`${resourceForm.name || '资料'} - 编辑`"
      width="620px"
    >
      <el-form label-width="92px">
        <el-form-item label="资料名称">
          <el-input v-model="resourceForm.name" />
        </el-form-item>
        <el-form-item label="学员可见">
          <el-radio-group v-model="resourceForm.visibility">
            <el-radio-button label="public">公开</el-radio-button>
            <el-radio-button label="class">本课可见</el-radio-button>
            <el-radio-button label="draft">草稿</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="知识标签">
          <el-select v-model="resourceForm.knowledgeTags" multiple filterable allow-create default-first-option>
            <el-option label="液压阀" value="液压阀" />
            <el-option label="实操" value="实操" />
            <el-option label="故障判断" value="故障判断" />
            <el-option label="过程记录" value="过程记录" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="resourceForm.summary" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="resourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveResource">保存资料</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="assessmentDialogVisible"
      :title="`${currentTraining.courseName || '培训'} - 录入考核成绩`"
      width="760px"
    >
      <el-table :data="assessmentRows" border>
        <el-table-column prop="name" label="学员姓名" width="150" />
        <el-table-column label="成绩（0-100）">
          <template #default="{ row }">
            <el-input-number v-model="row.score" :min="0" :max="100" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="结果" width="120">
          <template #default="{ row }">
            <el-tag :type="row.score >= 60 ? 'success' : 'danger'">
              {{ row.score >= 60 ? '通过' : '未通过' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template #default="{ row }">
            <el-input v-model="row.remark" placeholder="可选" />
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="assessmentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssessment" :loading="submitting">
          批量保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getUserTrainings, getStatusText, getStatusType, tutors, students } from '../../api/mockData'

const currentTutorId = 1
const trainings = ref([])
const activeTab = ref('log')
const keyword = ref('')
const statusFilter = ref('全部')
const logDateRange = ref([])
const scheduleScope = ref('本周')
const filterOptions = ['全部', '未开始', '已完成', '已考核', '已评价']
const scheduleScopeOptions = ['本周', '本月']
const uploadDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)
const resourceDialogVisible = ref(false)
const assessmentDialogVisible = ref(false)
const uploading = ref(false)
const submitting = ref(false)
const uploadedFile = ref(null)
const assessmentRows = ref([])
const currentTraining = reactive({ id: null, courseName: '', studio: '', changeLogs: [] })
const uploadForm = reactive({
  name: '',
  visibility: 'public',
  tags: [],
  summary: ''
})
const scheduleForm = reactive({
  id: null,
  courseName: '',
  trainingContent: '',
  tutorId: null,
  startDate: '',
  startTime: '',
  endTime: '',
  location: '',
  studentIds: [],
  changeReason: ''
})
const resourceForm = reactive({
  id: null,
  trainingId: null,
  sourceRefs: [],
  name: '',
  visibility: 'public',
  knowledgeTags: [],
  summary: ''
})

const statusLabelMap = {
  未开始: 'upcoming',
  已完成: 'completed',
  已考核: 'assessed',
  已评价: 'evaluated'
}

const missingCourseware = computed(() => trainings.value.filter(item => item.coursewares.length === 0))
const resourceRows = computed(() => trainings.value.flatMap(training => training.coursewares.map(file => ({
  ...file,
  courseName: training.courseName,
  trainingId: training.id
}))))
const resourceGroups = computed(() => {
  const grouped = new Map()

  trainings.value.forEach(training => {
    const groupKey = `${training.courseName}::${training.trainingContent}`
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        groupKey,
        training,
        courseName: training.courseName,
        trainingContent: training.trainingContent,
        dates: [],
        studentNames: new Set(),
        sessionIds: new Set(),
        filesByKey: new Map()
      })
    }

    const group = grouped.get(groupKey)
    group.dates.push(training.startDate)
    group.sessionIds.add(training.id)
    training.students.forEach(name => group.studentNames.add(name))

    training.coursewares.forEach(file => {
      const fileKey = `${file.url || file.name}::${file.name}::${file.type}`
      if (!group.filesByKey.has(fileKey)) {
        group.filesByKey.set(fileKey, {
          ...file,
          courseName: training.courseName,
          trainingId: training.id,
          sourceRefs: []
        })
      }
      group.filesByKey.get(fileKey).sourceRefs.push({
        trainingId: training.id,
        fileId: file.id
      })
    })
  })

  return Array.from(grouped.values()).map(group => {
    const sortedDates = [...new Set(group.dates)].sort()
    return {
      groupKey: group.groupKey,
      training: group.training,
      courseName: group.courseName,
      trainingContent: group.trainingContent,
      dateRange: sortedDates.length > 1 ? `${sortedDates[0]} 至 ${sortedDates[sortedDates.length - 1]}` : sortedDates[0],
      sessionCount: group.sessionIds.size,
      studentNames: Array.from(group.studentNames),
      files: Array.from(group.filesByKey.values()).sort((a, b) => a.name.localeCompare(b.name))
    }
  }).sort((a, b) => `${a.courseName} ${a.dateRange}`.localeCompare(`${b.courseName} ${b.dateRange}`))
})
const publicResourceCount = computed(() => resourceRows.value.filter(item => item.visibility === 'public').length)
const availableTutors = computed(() => tutors.filter(item => item.studio === currentTraining.studio))
const availableStudents = computed(() => students.filter(item => item.studio === currentTraining.studio))
const scheduleRange = computed(() => scheduleScope.value === '本周' ? getCurrentWeekRange() : getCurrentMonthRange())
const scopedTrainings = computed(() => trainings.value
  .filter(item => item.startDate >= scheduleRange.value.start && item.startDate <= scheduleRange.value.end)
  .sort((a, b) => `${a.startDate} ${a.startTime}`.localeCompare(`${b.startDate} ${b.startTime}`)))
const scopedUpcoming = computed(() => scopedTrainings.value.filter(item => item.status === 'upcoming'))
const scopedMissingCourseware = computed(() => scopedTrainings.value.filter(item => item.coursewares.length === 0))
const scopedCompleted = computed(() => scopedTrainings.value.filter(item => ['completed', 'assessed', 'evaluated'].includes(item.status)))
const scheduleRangeText = computed(() => `${scheduleRange.value.start} 至 ${scheduleRange.value.end}`)

const filteredTrainings = computed(() => {
  const status = statusLabelMap[statusFilter.value]
  const text = keyword.value.trim()
  return trainings.value.filter(item => {
    const matchesStatus = status ? item.status === status : true
    const matchesKeyword = text
      ? [item.courseName, item.trainingContent, item.students.join(' ')].join(' ').includes(text)
      : true
    const matchesDate = logDateRange.value && logDateRange.value.length === 2
      ? item.startDate >= logDateRange.value[0] && item.startDate <= logDateRange.value[1]
      : true
    return matchesStatus && matchesKeyword && matchesDate
  })
})
const teachingLedgerRows = computed(() => {
  const sorted = [...filteredTrainings.value].sort((a, b) => {
    const courseCompare = `${a.courseName} ${a.trainingContent}`.localeCompare(`${b.courseName} ${b.trainingContent}`)
    if (courseCompare) return courseCompare
    return `${a.startDate} ${a.startTime}`.localeCompare(`${b.startDate} ${b.startTime}`)
  })
  const grouped = new Map()

  sorted.forEach(training => {
    const groupKey = `${training.courseName}::${training.trainingContent}`
    if (!grouped.has(groupKey)) grouped.set(groupKey, [])
    training.students.forEach((studentName, studentIndex) => {
      grouped.get(groupKey).push({
        rowKey: `${training.id}-${studentIndex}`,
        groupKey,
        courseName: training.courseName,
        trainingContent: training.trainingContent,
        studentName,
        studentId: training.studentIds[studentIndex],
        startDate: training.startDate,
        startTime: training.startTime,
        endTime: training.endTime,
        location: training.location,
        training,
        isFirstInGroup: false,
        groupRowspan: 1
      })
    })
  })

  return Array.from(grouped.values()).flatMap(rows => rows.map((row, index) => ({
    ...row,
    isFirstInGroup: index === 0,
    groupRowspan: index === 0 ? rows.length : 0
  })))
})

const teachingSpanMethod = ({ row, column }) => {
  if (!['courseName', 'trainingContent'].includes(column.property)) return [1, 1]
  return row.isFirstInGroup ? [row.groupRowspan, 1] : [0, 0]
}

const loadTrainings = () => {
  trainings.value = getUserTrainings(currentTutorId, 'tutor')
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getCurrentWeekRange = () => {
  const today = new Date()
  const day = today.getDay() || 7
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day + 1)
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
  return { start: formatDate(start), end: formatDate(end) }
}

const getCurrentMonthRange = () => {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { start: formatDate(start), end: formatDate(end) }
}

const formatMonthDay = (dateText) => {
  const [, month, day] = dateText.split('-')
  return `${Number(month)}/${Number(day)}`
}

const getWeekdayLabel = (dateText) => {
  const date = new Date(`${dateText}T00:00:00`)
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
}

const openUpload = (row) => {
  if (!row) return
  currentTraining.id = row.id
  currentTraining.courseName = row.courseName
  currentTraining.studio = row.studio
  currentTraining.changeLogs = row.changeLogs || []
  uploadForm.name = ''
  uploadForm.visibility = 'public'
  uploadForm.tags = []
  uploadForm.summary = ''
  uploadDialogVisible.value = true
}

const openSchedule = (row) => {
  currentTraining.id = row.id
  currentTraining.courseName = row.courseName
  currentTraining.studio = row.studio
  currentTraining.changeLogs = row.changeLogs || []
  Object.assign(scheduleForm, {
    id: row.id,
    courseName: row.courseName,
    trainingContent: row.trainingContent,
    tutorId: row.tutorId,
    startDate: row.startDate,
    startTime: row.startTime,
    endTime: row.endTime,
    location: row.location,
    studentIds: [...row.studentIds],
    changeReason: ''
  })
  scheduleDialogVisible.value = true
}

const saveSchedule = () => {
  const training = trainings.value.find(item => item.id === scheduleForm.id)
  if (!training) return
  const tutor = tutors.find(item => item.id === scheduleForm.tutorId)
  const selectedStudents = students.filter(item => scheduleForm.studentIds.includes(item.id))
  Object.assign(training, {
    courseName: scheduleForm.courseName,
    trainingContent: scheduleForm.trainingContent,
    tutorId: scheduleForm.tutorId,
    tutor: tutor?.name || training.tutor,
    startDate: scheduleForm.startDate,
    endDate: scheduleForm.startDate,
    startTime: scheduleForm.startTime,
    endTime: scheduleForm.endTime,
    location: scheduleForm.location,
    studentIds: [...scheduleForm.studentIds],
    students: selectedStudents.map(item => item.name)
  })
  training.changeLogs = [
    ...(training.changeLogs || []),
    {
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      operator: '导师',
      action: '改期/代课',
      detail: scheduleForm.changeReason || '更新了授课安排'
    }
  ]
  ElMessage.success('授课安排已更新，原型数据仅本次会话有效')
  scheduleDialogVisible.value = false
}

const handleFileChange = (file) => {
  uploadedFile.value = file
  if (!uploadForm.name) uploadForm.name = file.name
}

const confirmUpload = () => {
  if (!uploadForm.name) {
    ElMessage.warning('请填写资料名称')
    return
  }
  uploading.value = true
  setTimeout(() => {
    ElMessage.success('资料已保存，原型数据未写回')
    uploadDialogVisible.value = false
    uploadedFile.value = null
    uploading.value = false
  }, 600)
}

const openResourceEdit = (row) => {
  Object.assign(resourceForm, {
    id: row.id,
    trainingId: row.trainingId,
    sourceRefs: [...(row.sourceRefs || [{ trainingId: row.trainingId, fileId: row.id }])],
    name: row.name,
    visibility: row.visibility,
    knowledgeTags: [...(row.knowledgeTags || [])],
    summary: row.summary || ''
  })
  resourceDialogVisible.value = true
}

const saveResource = () => {
  resourceForm.sourceRefs.forEach(({ trainingId, fileId }) => {
    const training = trainings.value.find(item => item.id === trainingId)
    const resource = training?.coursewares.find(item => item.id === fileId)
    if (!resource) return
    Object.assign(resource, {
      name: resourceForm.name,
      visibility: resourceForm.visibility,
      knowledgeTags: [...resourceForm.knowledgeTags],
      summary: resourceForm.summary
    })
  })
  ElMessage.success('资料信息已更新，原型数据仅本次会话有效')
  resourceDialogVisible.value = false
}

const saveResourceVisibility = (row) => {
  const refs = row.sourceRefs || [{ trainingId: row.trainingId, fileId: row.id }]
  refs.forEach(({ trainingId, fileId }) => {
    const training = trainings.value.find(item => item.id === trainingId)
    const resource = training?.coursewares.find(item => item.id === fileId)
    if (resource) resource.visibility = row.visibility
  })
  ElMessage.success('资料可见范围已更新')
}

const inputAssessment = (row) => {
  currentTraining.id = row.id
  currentTraining.courseName = row.courseName
  assessmentRows.value = row.students.map((name, index) => {
    const existing = row.assessments.find(item => item.studentId === row.studentIds[index])
    return {
      name,
      studentId: row.studentIds[index],
      score: existing?.score || 80,
      remark: existing?.remark || ''
    }
  })
  assessmentDialogVisible.value = true
}

const confirmAssessment = () => {
  submitting.value = true
  setTimeout(() => {
    ElMessage.success('成绩保存成功，原型数据未写回')
    assessmentDialogVisible.value = false
    submitting.value = false
  }, 600)
}

onMounted(loadTrainings)
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card--alert {
  border-color: #fcd34d !important;
  background: linear-gradient(135deg, #fff, #fffbeb) !important;
}

.schedule-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 18px 20px;
  margin-bottom: 20px;
}

.schedule-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.schedule-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.schedule-subtitle {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 12px;
}

.schedule-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.schedule-summary-item {
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-surface-subtle);
}

.schedule-summary-item span {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
}

.schedule-summary-item strong {
  display: block;
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 22px;
}

.schedule-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 10px;
}

.schedule-row {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 78px;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

.schedule-row:hover {
  border-color: var(--color-primary);
  box-shadow: 0 6px 16px rgba(79, 110, 242, 0.12);
  transform: translateY(-1px);
}

.schedule-date {
  display: flex;
  height: 54px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.schedule-date span {
  font-size: 16px;
  font-weight: 800;
}

.schedule-date strong {
  margin-top: 2px;
  font-size: 11px;
}

.schedule-main {
  min-width: 0;
}

.schedule-course {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-meta {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 12px;
}

.schedule-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.workspace-card { margin-bottom: 16px; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-note {
  margin-left: 12px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 400;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input { width: 280px; }

.teaching-ledger-table :deep(.el-table__cell) {
  vertical-align: middle;
}

.teaching-ledger-table :deep(.el-table__row td:nth-child(1)),
.teaching-ledger-table :deep(.el-table__row td:nth-child(2)) {
  background: rgba(79, 110, 242, 0.03);
}

.two-column-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 12px;
}

.full-row,
.change-log {
  grid-column: 1 / -1;
}

.change-log {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.change-log h4 {
  margin: 0 0 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.inline-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.file-title {
  font-weight: 600;
  color: var(--text-primary);
}

.resource-group-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.resource-group {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: #fff;
  overflow: hidden;
}

.resource-group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-surface-subtle);
  border-bottom: 1px solid var(--border-light);
}

.resource-course-title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.resource-group-actions,
.resource-file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.resource-file-list {
  display: flex;
  flex-direction: column;
}

.resource-file-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.resource-file-row:last-child {
  border-bottom: none;
}

.resource-file-main {
  min-width: 0;
}

.resource-tags {
  margin-top: 6px;
}

.visibility-select {
  width: 120px;
}

.muted {
  color: var(--text-muted);
  font-size: 12px;
}

@media (max-width: 900px) {
  .stats-grid,
  .schedule-summary {
    grid-template-columns: 1fr;
  }

  .schedule-panel-header {
    flex-direction: column;
  }

  .resource-group-header,
  .resource-file-row {
    display: flex;
    align-items: stretch;
    flex-direction: column;
  }

  .resource-group-actions,
  .resource-file-actions {
    justify-content: flex-start;
  }
}
</style>
