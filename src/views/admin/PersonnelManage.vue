<template>
  <div class="page-container">
    <el-tabs v-model="activeTab">
      <!-- 导师管理 -->
      <el-tab-pane label="导师管理" name="tutors">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>导师列表</span>
              <el-button type="primary" @click="openTutorDialog">
                <el-icon><Plus /></el-icon>
                新增导师
              </el-button>
            </div>
          </template>

          <el-table :data="tutorRows" stripe style="width: 100%">
            <el-table-column label="导师" min-width="190">
              <template #default="{ row }">
                <div class="person-cell">
                  <div class="person-photo tutor-photo">{{ row.name.slice(-1) }}</div>
                  <div>
                    <div class="person-name">{{ row.name }}</div>
                    <div class="muted">{{ row.title }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="company" label="所属公司" width="140" />
            <el-table-column prop="phone" label="联系电话" width="150" />
            <el-table-column label="授课情况" width="140">
              <template #default="{ row }">
                <div>{{ row.trainingCount }} 场</div>
                <div class="muted">闭环 {{ row.closedCount }} 场</div>
              </template>
            </el-table-column>
            <el-table-column label="学员评价" width="110">
              <template #default="{ row }">
                <span :class="['score-text', row.avgRating >= 4.5 ? 'score-excellent' : 'score-pass']">
                  {{ row.avgRating ? `${row.avgRating}分` : '暂无' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="专长" min-width="180">
              <template #default="{ row }">
                <el-tag v-for="tag in row.specialtyTags.slice(0, 2)" :key="tag" size="small" class="inline-tag">
                  {{ tag }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="工作室" width="150">
              <template #default="{ row }">
                {{ row.studio === 'studio_a' ? '一号工作室' : '二号工作室' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="viewTutorProfile(row)">查看档案</el-button>
                <el-button size="small" @click="editTutor(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteTutor(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 学员管理 -->
      <el-tab-pane label="学员管理" name="students">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>学员列表</span>
              <el-button type="primary" @click="openStudentDialog">
                <el-icon><Plus /></el-icon>
                新增学员
              </el-button>
            </div>
          </template>

          <el-table :data="studentRows" stripe style="width: 100%">
            <el-table-column label="学员" min-width="180">
              <template #default="{ row }">
                <div class="person-cell">
                  <div class="person-photo">{{ row.name.slice(-1) }}</div>
                  <div>
                    <div class="person-name">{{ row.name }}</div>
                    <div class="muted">{{ row.roleTitle }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="company" label="所属公司" width="120" />
            <el-table-column prop="phone" label="联系电话" width="140" />
            <el-table-column label="培训情况" width="150">
              <template #default="{ row }">
                <div>{{ row.trainingCount }} 场</div>
                <div class="muted">闭环 {{ row.closedCount }} 场</div>
              </template>
            </el-table-column>
            <el-table-column label="阶段考试" width="120">
              <template #default="{ row }">
                <span :class="['score-text', getScoreClass(row.stageFinalScore)]">
                  {{ row.stageFinalScore ? `${row.stageFinalScore}分` : '暂无' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="最近培训" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.latestTraining?.courseName || '暂无培训' }}
              </template>
            </el-table-column>
            <el-table-column label="工作室" width="150">
              <template #default="{ row }">
                {{ row.studio === 'studio_a' ? '一号工作室' : '二号工作室' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="210" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="viewStudentProfile(row)">查看档案</el-button>
                <el-button size="small" @click="editStudent(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteStudent(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 导师对话框 -->
    <el-dialog
      v-model="tutorDialogVisible"
      :title="isEditTutor ? '编辑导师' : '新增导师'"
      width="500px"
    >
      <el-form :model="tutorForm" :rules="tutorRules" ref="tutorFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="tutorForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="tutorForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="公司" prop="company">
          <el-input v-model="tutorForm.company" placeholder="请输入所属公司" />
        </el-form-item>
        <el-form-item label="工作室" prop="studio">
          <el-select v-model="tutorForm.studio" placeholder="请选择工作室" style="width: 100%">
            <el-option label="一号工作室" value="studio_a" />
            <el-option label="二号工作室" value="studio_b" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="tutorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTutor" :loading="submitting">
          确认{{ isEditTutor ? '修改' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 学员对话框 -->
    <el-dialog
      v-model="studentDialogVisible"
      :title="isEditStudent ? '编辑学员' : '新增学员'"
      width="500px"
    >
      <el-form :model="studentForm" :rules="studentRules" ref="studentFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="公司" prop="company">
          <el-input v-model="studentForm.company" placeholder="请输入所属公司" />
        </el-form-item>
        <el-form-item label="工作室" prop="studio">
          <el-select v-model="studentForm.studio" placeholder="请选择工作室" style="width: 100%">
            <el-option label="一号工作室" value="studio_a" />
            <el-option label="二号工作室" value="studio_b" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStudent" :loading="submitting">
          确认{{ isEditStudent ? '修改' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="studentProfileVisible"
      :title="selectedStudent ? `${selectedStudent.name} · 学员档案` : '学员档案'"
      size="720px"
    >
      <template v-if="selectedStudent">
        <div class="profile-header">
          <div class="profile-photo-container" style="width: 76px; height: 96px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid var(--border-light); flex-shrink: 0; margin-right: 14px; display: inline-block; vertical-align: top;">
            <img v-if="selectedStudentProfile.photo" :src="selectedStudentProfile.photo" style="width: 100%; height: 100%; object-fit: cover;" />
            <div v-else class="profile-photo" style="width: 100%; height: 100%; border-radius: 0; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #409eff, #10b981); color: white;">{{ selectedStudent.name.slice(-1) }}</div>
          </div>
          <div class="profile-main" style="display: inline-block; vertical-align: top; width: calc(100% - 100px);">
            <div class="profile-name-row">
              <h3 style="margin: 0; font-size: 20px; font-weight: 700;">{{ selectedStudent.name }}</h3>
              <el-tag>{{ selectedStudent.roleTitle || '技术工' }}</el-tag>
            </div>
            <div class="profile-meta" style="margin-top: 6px; color: var(--text-secondary); font-size: 13px;">
              {{ selectedStudent.company }} · {{ selectedStudent.phone }} · {{ selectedStudent.studio === 'studio_a' ? '一号工作室' : '二号工作室' }}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">
              📅 入职时间：{{ selectedStudentProfile.entryDate }}
            </div>
          </div>
        </div>

        <el-row :gutter="12" class="profile-stats" style="margin-top: 18px;">
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="培训场次" :value="selectedStudentTrainings.length" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="最终得分" :value="studentProfile.stageFinalScore || 0">
                <template #suffix>分</template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="实操成绩" :value="studentProfile.practicalScore || 0">
                <template #suffix>分</template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="平时评价" :value="studentProfile.classroomScore || 0">
                <template #suffix>分</template>
              </el-statistic>
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="profile-section" v-if="studentProfile.latestStageAssessment" style="margin-top: 14px;">
          <template #header>
            <div class="card-header">
              <span>阶段考试结论</span>
              <el-tag :type="getResultType(studentProfile.latestStageAssessment.result)">
                {{ studentProfile.latestStageAssessment.result }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="考核方案">{{ studentProfile.latestStageAssessment.scheme.name }}</el-descriptions-item>
            <el-descriptions-item label="技能项目">{{ studentProfile.latestStageAssessment.scheme.skillName }}</el-descriptions-item>
            <el-descriptions-item label="笔试">{{ formatScore(studentProfile.latestStageAssessment.writtenScore) }}</el-descriptions-item>
            <el-descriptions-item label="实操">{{ formatScore(studentProfile.latestStageAssessment.practicalScore) }}</el-descriptions-item>
            <el-descriptions-item label="平时评价">{{ formatScore(studentProfile.latestStageAssessment.classroomScore) }}</el-descriptions-item>
            <el-descriptions-item label="综合分">{{ formatScore(studentProfile.latestStageAssessment.finalScore) }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ studentProfile.latestStageAssessment.remark }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="profile-section" style="margin-top: 14px;">
          <template #header>
            <div class="card-header">
              <span>照片与附件材料</span>
              <el-tag size="small" type="info">学员档案材料</el-tag>
            </div>
          </template>
          <div v-if="!selectedStudentProfile.attachments || selectedStudentProfile.attachments.length === 0" class="muted" style="text-align: center; padding: 14px; font-size: 12px;">
            该学员暂未上传任何个人照片或附件文件。
          </div>
          <div v-else style="display: flex; flex-direction: column; gap: 8px;">
            <div v-for="(file, idx) in selectedStudentProfile.attachments" :key="idx" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-surface-subtle); border: 1px solid var(--border-light); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                <span>📄</span>
                <div style="display: flex; flex-direction: column; min-width: 0;">
                  <span style="font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="file.name">{{ file.name }}</span>
                  <span style="font-size: 11px; color: var(--text-muted);">{{ file.size }} · {{ file.date }}</span>
                </div>
              </div>
              <el-button size="small" text type="primary" @click="downloadAttachment(file)">下载</el-button>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="profile-section" style="margin-top: 14px;">
          <template #header>
            <div class="card-header">
              <span>培训与平时评价</span>
              <span class="muted">按日期倒序</span>
            </div>
          </template>
          <el-table :data="selectedStudentTrainings" stripe size="small" style="width: 100%">
            <el-table-column prop="courseName" label="培训主题" min-width="180" show-overflow-tooltip />
            <el-table-column prop="startDate" label="日期" width="110" />
            <el-table-column prop="tutor" label="导师" width="90" />
            <el-table-column label="平时评价" width="100">
              <template #default="{ row }">
                <span v-if="row.dailyEvaluation" :class="['score-text', getScoreClass(ratingToScore(row.dailyEvaluation.rating))]">
                  {{ ratingToScore(row.dailyEvaluation.rating) }}分
                </span>
                <span v-else class="muted">暂无</span>
              </template>
            </el-table-column>
            <el-table-column label="星级" width="90">
              <template #default="{ row }">
                <el-rate v-if="row.dailyEvaluation" v-model="row.dailyEvaluation.rating" disabled size="small" />
                <span v-else class="muted">-</span>
              </template>
            </el-table-column>
            <el-table-column label="闭环" width="90">
              <template #default="{ row }">
                <el-tag :type="row.closed ? 'success' : 'warning'" size="small">
                  {{ row.closed ? '已闭环' : '待补' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="dailyEvaluation.comment" label="评价说明" min-width="160" show-overflow-tooltip />
          </el-table>
        </el-card>
      </template>
    </el-drawer>

    <el-drawer
      v-model="tutorProfileVisible"
      :title="selectedTutor ? `${selectedTutor.name} · 导师档案` : '导师档案'"
      size="760px"
    >
      <template v-if="selectedTutor">
        <div class="profile-header">
          <div class="profile-photo tutor-photo">{{ selectedTutor.name.slice(-1) }}</div>
          <div class="profile-main">
            <div class="profile-name-row">
              <h3>{{ selectedTutor.name }}</h3>
              <el-tag>{{ selectedTutor.level }}</el-tag>
              <el-tag type="success">{{ selectedTutor.title }}</el-tag>
            </div>
            <div class="profile-meta">
              {{ selectedTutor.company }} · {{ selectedTutor.phone }} · {{ selectedTutor.studio === 'studio_a' ? '一号工作室' : '二号工作室' }}
            </div>
            <div class="tag-row">
              <el-tag v-for="tag in selectedTutor.specialtyTags" :key="tag" size="small" effect="plain">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-row :gutter="12" class="profile-stats">
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="授课场次" :value="tutorProfile.trainingCount" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="覆盖学员" :value="tutorProfile.studentCount" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="平均评价" :value="tutorProfile.avgRating || 0">
                <template #suffix>分</template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="闭环课程" :value="tutorProfile.closedCount" />
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="profile-section">
          <template #header>
            <div class="card-header">
              <span>照片与履历</span>
              <el-tag size="small" type="info">{{ selectedTutor.photoMaterial }}</el-tag>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="履历摘要">{{ selectedTutor.profileSummary }}</el-descriptions-item>
            <el-descriptions-item label="教学年限">{{ selectedTutor.years }} 年</el-descriptions-item>
            <el-descriptions-item label="证书">
              <el-tag v-for="cert in selectedTutor.certificates" :key="cert" size="small" class="inline-tag">
                {{ cert }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="profile-section">
          <template #header>
            <div class="card-header">
              <span>授课与反馈</span>
              <span class="muted">按日期倒序</span>
            </div>
          </template>
          <el-table :data="tutorProfile.trainings" stripe size="small" style="width: 100%">
            <el-table-column prop="courseName" label="培训主题" min-width="180" show-overflow-tooltip />
            <el-table-column prop="startDate" label="日期" width="110" />
            <el-table-column label="学员" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row.students.join('、') }}</template>
            </el-table-column>
            <el-table-column label="单课均分" width="100">
              <template #default="{ row }">
                <span v-if="row.avgScore" :class="['score-text', getScoreClass(row.avgScore)]">
                  {{ row.avgScore }}分
                </span>
                <span v-else class="muted">未录入</span>
              </template>
            </el-table-column>
            <el-table-column label="闭环" width="90">
              <template #default="{ row }">
                <el-tag :type="row.closed ? 'success' : 'warning'" size="small">
                  {{ row.closed ? '已闭环' : '待补' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import {
  tutors,
  students,
  trainingPlans,
  getStudentProfileSummary,
  getTutorProfileSummary,
  ratingToScore
} from '../../api/mockData'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const activeTab = ref('tutors')
const tutorDialogVisible = ref(false)
const studentDialogVisible = ref(false)
const isEditTutor = ref(false)
const isEditStudent = ref(false)
const submitting = ref(false)
const tutorFormRef = ref(null)
const studentFormRef = ref(null)
const studentProfileVisible = ref(false)
const selectedStudent = ref(null)
const tutorProfileVisible = ref(false)
const selectedTutor = ref(null)

const tutorForm = reactive({
  id: null,
  name: '',
  phone: '',
  company: '',
  studio: 'studio_a'
})

const studentForm = reactive({
  id: null,
  name: '',
  phone: '',
  company: '',
  studio: 'studio_a'
})

const tutorRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  company: [{ required: true, message: '请输入所属公司', trigger: 'blur' }],
  studio: [{ required: true, message: '请选择工作室', trigger: 'change' }]
}

const studentRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  company: [{ required: true, message: '请输入所属公司', trigger: 'blur' }],
  studio: [{ required: true, message: '请选择工作室', trigger: 'change' }]
}

const currentTutors = computed(() => {
  return tutors.filter(t => t.studio === userStore.currentStudio)
})

const currentStudents = computed(() => {
  return students.filter(s => s.studio === userStore.currentStudio)
})

const studentRows = computed(() => currentStudents.value.map(student => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  let completedCount = 0
  let totalCount = 0
  if (listStr) {
    const list = JSON.parse(listStr)
    list.forEach(group => {
      group.rows.forEach(r => {
        if (r.trainee === student.name) {
          totalCount++
          if (r.completedText === '√') completedCount++
        }
      })
    })
  }
  const summary = getStudentSummary(student.id)
  return {
    ...student,
    ...summary,
    trainingCount: totalCount || summary.trainingCount || 0,
    closedCount: completedCount || summary.closedCount || 0
  }
}))

const tutorRows = computed(() => currentTutors.value.map(tutor => ({
  ...tutor,
  ...getTutorSummary(tutor.id)
})))

const studentProfile = computed(() => selectedStudent.value ? getStudentSummary(selectedStudent.value.id) : {
  trainingCount: 0,
  closedCount: 0,
  avgScore: 0,
  passCount: 0,
  stageFinalScore: 0,
  practicalScore: 0,
  classroomScore: 0,
  latestStageAssessment: null,
  stageAssessments: [],
  classroomPerformance: { records: [], avgScore: 0, count: 0 },
  photos: [],
  trainings: []
})

const selectedStudentProfile = computed(() => {
  if (!selectedStudent.value) return { entryDate: '2025-09-01', photo: '', attachments: [] }
  try {
    const override = JSON.parse(localStorage.getItem(`profile:student:${selectedStudent.value.id}`) || '{}')
    const defaultDates = {
      '学员A': '2025-09-01',
      '学员B': '2025-10-01',
      '学员C': '2025-11-01',
      '学员D': '2025-12-01',
      '学员E': '2026-01-01',
      '学员F': '2026-02-01',
      '张三（鑫泰）': '2025-09-15',
      '李四（鑫悦）': '2025-10-15',
      '王五（盛泰）': '2025-11-15'
    }
    return {
      entryDate: defaultDates[selectedStudent.value.name] || '2025-09-01',
      photo: '',
      attachments: [],
      ...override
    }
  } catch {
    return { entryDate: '2025-09-01', photo: '', attachments: [] }
  }
})

const selectedStudentTrainings = computed(() => {
  if (!selectedStudent.value) return []
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return studentProfile.value.trainings || []
  
  const list = JSON.parse(listStr)
  const result = []
  list.forEach(group => {
    group.rows.forEach((row, rowIndex) => {
      if (row.trainee === selectedStudent.value.name && row.completedText === '√') {
        result.push({
          id: `${group.id}-${rowIndex}`,
          courseName: group.trainingTopic,
          startDate: row.trainingDate || '2026-06-15',
          tutor: group.trainer,
          dailyEvaluation: row.remark ? { rating: row.rating || 0, comment: row.remark } : null,
          closed: row.completedText === '√'
        })
      }
    })
  })
  
  result.sort((a, b) => b.startDate.localeCompare(a.startDate))
  return result.length > 0 ? result : (studentProfile.value.trainings || [])
})

const downloadAttachment = (file) => {
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success(`正在下载「${file.name}」`)
}

const tutorProfile = computed(() => selectedTutor.value ? getTutorSummary(selectedTutor.value.id) : {
  trainingCount: 0,
  closedCount: 0,
  studentCount: 0,
  avgRating: 0,
  ratingCount: 0,
  coursewares: [],
  trainings: []
})

const getTutorTrainingCount = (tutorId) => {
  return trainingPlans.filter(plan => plan.tutorId === tutorId).length
}

const getStudentTrainingCount = (studentId) => {
  return trainingPlans.filter(plan => plan.studentIds.includes(studentId)).length
}

const getStudentSummary = (studentId) => {
  return getStudentProfileSummary(studentId)
}

const getTutorSummary = (tutorId) => {
  return getTutorProfileSummary(tutorId)
}

const getScoreClass = (score) => {
  if (!score) return 'score-empty'
  if (score >= 90) return 'score-excellent'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

const getResultType = (result) => {
  if (result === '通过') return 'success'
  if (result === '实操待补') return 'warning'
  if (result === '未通过') return 'danger'
  return 'info'
}

const formatScore = (score) => typeof score === 'number' ? `${score}分` : '待录入'

// 导师操作
const openTutorDialog = () => {
  isEditTutor.value = false
  resetTutorForm()
  tutorDialogVisible.value = true
}

const editTutor = (row) => {
  isEditTutor.value = true
  tutorForm.id = row.id
  tutorForm.name = row.name
  tutorForm.phone = row.phone
  tutorForm.company = row.company
  tutorForm.studio = row.studio
  tutorDialogVisible.value = true
}

const viewTutorProfile = (row) => {
  selectedTutor.value = row
  tutorProfileVisible.value = true
}

const resetTutorForm = () => {
  tutorForm.id = null
  tutorForm.name = ''
  tutorForm.phone = ''
  tutorForm.company = ''
  tutorForm.studio = userStore.currentStudio
  if (tutorFormRef.value) {
    tutorFormRef.value.clearValidate()
  }
}

const submitTutor = async () => {
  if (!tutorFormRef.value) return
  await tutorFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        ElMessage.success(isEditTutor.value ? '修改成功' : '添加成功')
        tutorDialogVisible.value = false
        submitting.value = false
      }, 1000)
    }
  })
}

const deleteTutor = (row) => {
  const count = getTutorTrainingCount(row.id)
  ElMessageBox.confirm(`导师"${row.name}"已关联${count}场培训。原型中只提示风险，不直接删除历史姓名。`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 学员操作
const openStudentDialog = () => {
  isEditStudent.value = false
  resetStudentForm()
  studentDialogVisible.value = true
}

const editStudent = (row) => {
  isEditStudent.value = true
  studentForm.id = row.id
  studentForm.name = row.name
  studentForm.phone = row.phone
  studentForm.company = row.company
  studentForm.studio = row.studio
  studentDialogVisible.value = true
}

const viewStudentProfile = (row) => {
  selectedStudent.value = row
  studentProfileVisible.value = true
}

const resetStudentForm = () => {
  studentForm.id = null
  studentForm.name = ''
  studentForm.phone = ''
  studentForm.company = ''
  studentForm.studio = userStore.currentStudio
  if (studentFormRef.value) {
    studentFormRef.value.clearValidate()
  }
}

const submitStudent = async () => {
  if (!studentFormRef.value) return
  await studentFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        ElMessage.success(isEditStudent.value ? '修改成功' : '添加成功')
        studentDialogVisible.value = false
        submitting.value = false
      }, 1000)
    }
  })
}

const deleteStudent = (row) => {
  const count = getStudentTrainingCount(row.id)
  ElMessageBox.confirm(`学员"${row.name}"已关联${count}场培训。原型中只提示风险，不直接删除历史姓名。`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.person-cell,
.profile-header,
.profile-name-row,
.tag-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.person-photo,
.profile-photo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, #409eff, #10b981);
}

.person-photo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 14px;
}

.tutor-photo {
  background: linear-gradient(135deg, #059669, #10b981);
}

.profile-photo {
  width: 82px;
  height: 82px;
  border-radius: 10px;
  font-size: 28px;
}

.person-name {
  color: #303133;
  font-weight: 700;
}

.muted {
  color: #909399;
  font-size: 12px;
}

.score-text {
  font-weight: 700;
}

.score-excellent {
  color: #67c23a;
}

.score-pass {
  color: #409eff;
}

.score-fail {
  color: #f56c6c;
}

.score-empty {
  color: #909399;
}

.profile-header {
  align-items: flex-start;
  margin-bottom: 18px;
}

.profile-main {
  flex: 1;
}

.profile-name-row h3 {
  margin: 0;
  color: #303133;
}

.profile-meta {
  margin-top: 6px;
  color: #606266;
  font-size: 13px;
}

.tag-row {
  flex-wrap: wrap;
  margin-top: 10px;
}

.profile-stats,
.profile-section {
  margin-top: 14px;
}

.inline-tag {
  margin-right: 6px;
}
</style>
