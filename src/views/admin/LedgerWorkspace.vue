<template>
  <div class="page-container fade-in-up">
    <div class="page-header">
      <div>
        <h2>培训台账</h2>
        <p>按原 Excel 字段、顺序和三行合并关系维护台账，同时保留考核、评价、课件等系统补充信息。</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Upload" @click="router.push('/admin/import')">导入 Excel</el-button>
        <el-button :icon="Download" type="primary" @click="router.push('/admin/export')">导出当前台账</el-button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">培训主题</div>
        <div class="stat-value">{{ stats.groupCount }}<sup>项</sup></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">人员记录</div>
        <div class="stat-value">{{ stats.personRowCount }}<sup>条</sup></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">完成率</div>
        <div class="stat-value">{{ stats.completionRate }}<sup>%</sup></div>
      </div>
      <div class="stat-card" :class="{ 'stat-card--alert': stats.pendingGroupCount > 0 }">
        <div class="stat-label">合并单元格</div>
        <div class="stat-value">{{ stats.mergeCount }}<sup>个</sup></div>
      </div>
    </div>

    <div class="ledger-shell">
      <div class="ledger-toolbar">
        <div class="filters">
          <el-input v-model="keyword" clearable placeholder="搜主题/师傅/人员" style="width: 240px" />
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 280px"
          />
          <el-select v-model="completionFilter" style="width: 140px">
            <el-option label="全部" value="all" />
            <el-option label="已完成" value="completed" />
            <el-option label="待完成" value="pending" />
          </el-select>
          <el-segmented v-model="ledgerViewMode" :options="ledgerViewOptions" />
        </div>
        <div class="toolbar-actions">
          <el-popover placement="bottom-end" width="360" trigger="click">
            <template #reference>
              <el-button :icon="Setting">字段配置</el-button>
            </template>
            <div class="field-config">
              <div class="config-title">闭环字段</div>
              <div v-for="field in closureFieldDefinitions" :key="field.key" class="field-config-row">
                <span>{{ field.label }}</span>
                <el-tag size="small" effect="plain">{{ field.scope === 'group' ? '主题级' : '人员级' }}</el-tag>
              </div>
              <el-alert
                title="原始 Excel 字段固定在表格主体中，闭环字段只在抽屉和闭环台账导出里出现。"
                type="info"
                :closable="false"
              />
            </div>
          </el-popover>
          <el-button :icon="Plus" type="primary" @click="addMockGroup">新增相关条目</el-button>
        </div>
      </div>

      <el-alert
        :title="ledgerViewMode === '课程合并' ? '课程合并视图按培训主题和师傅聚合，便于集中维护分批课程；每条记录仍保留原 Excel 序号。' : '合并字段在页面上按 3 行合并显示；修改合并字段会同步影响同一序号下的 3 条人员记录。'"
        type="warning"
        :closable="false"
        show-icon
        class="ledger-alert"
      />

      <el-table
        v-if="ledgerViewMode === 'Excel 原表'"
        :data="ledgerRows"
        border
        height="620"
        row-key="rowKey"
        :span-method="spanMethod"
        :row-class-name="rowClassName"
        class="excel-ledger-table"
      >
        <el-table-column prop="sequenceNo" label="序号" width="72" fixed>
          <template #default="{ row }">
            <strong>{{ row.group.sequenceNo }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="trainingTopic" label="培训主题" min-width="230" fixed>
          <template #default="{ row }">
            <el-input v-model="row.group.trainingTopic" autosize type="textarea" @focus="markGroupEdit(row.group)" />
          </template>
        </el-table-column>
        <el-table-column prop="trainingContent" label="培训内容" min-width="280">
          <template #default="{ row }">
            <el-input
              v-if="isMergedCell(row, 'trainingContent')"
              v-model="row.group.trainingContent"
              autosize
              type="textarea"
              @focus="markGroupEdit(row.group)"
            />
            <el-input
              v-else
              v-model="row.personRow.trainingContent"
              autosize
              type="textarea"
              placeholder="空"
            />
          </template>
        </el-table-column>
        <el-table-column prop="trainer" label="培训师傅" width="120">
          <template #default="{ row }">
            <el-input v-model="row.group.trainer" @focus="markGroupEdit(row.group)" />
          </template>
        </el-table-column>
        <el-table-column prop="trainee" label="培训人员" width="140">
          <template #default="{ row }">
            <el-input v-model="row.personRow.trainee" />
          </template>
        </el-table-column>
        <el-table-column prop="trainingDate" label="培训日期" width="110">
          <template #default="{ row }">
            <el-input v-model="row.personRow.trainingDate" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="培训开始时间" width="130">
          <template #default="{ row }">
            <el-input v-model="row.personRow.startTime" />
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="培训结束时间" width="130">
          <template #default="{ row }">
            <el-input v-model="row.personRow.endTime" />
          </template>
        </el-table-column>
        <el-table-column prop="durationHours" label="培训时长（H）" width="130">
          <template #default="{ row }">
            <el-input-number v-model="row.personRow.durationHours" :min="0" :step="0.5" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column prop="completedText" label="是否完成" width="110">
          <template #default="{ row }">
            <el-select v-model="row.personRow.completedText">
              <el-option label="√" value="√" />
              <el-option label="空" value="" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="达成目的" min-width="220">
          <template #default="{ row }">
            <el-input v-model="row.group.purpose" autosize type="textarea" @focus="markGroupEdit(row.group)" />
          </template>
        </el-table-column>
        <el-table-column prop="resultCheck" label="成果检验" width="150">
          <template #default="{ row }">
            <el-input v-model="row.group.resultCheck" @focus="markGroupEdit(row.group)" />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180">
          <template #default="{ row }">
            <el-input v-model="row.personRow.remark" placeholder="空" />
          </template>
        </el-table-column>
        <el-table-column label="相关条目" width="140" fixed="right">
          <template #default="{ row }">
            <el-button :icon="Edit" link type="primary" @click="openDrawer(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="course-ledger-list">
        <div v-for="courseGroup in mergedCourseGroups" :key="courseGroup.groupKey" class="course-ledger-card">
          <div class="course-ledger-header">
            <div>
              <div class="course-ledger-title">{{ courseGroup.trainingTopic }}</div>
              <div class="course-ledger-meta">
                {{ courseGroup.trainer || '未填写师傅' }} · 序号 {{ courseGroup.sequenceNos.join('、') }}
                · {{ courseGroup.personCount }} 条人员记录 · {{ courseGroup.dateRange }}
              </div>
            </div>
            <div class="course-ledger-tags">
              <el-tag :type="courseGroup.completedCount === courseGroup.personCount ? 'success' : 'warning'" size="small">
                完成 {{ courseGroup.completedCount }}/{{ courseGroup.personCount }}
              </el-tag>
              <el-tag :type="courseGroup.coursewareCount ? 'success' : 'warning'" size="small">
                课件 {{ courseGroup.coursewareCount }} 份
              </el-tag>
              <el-tag :type="courseGroup.gapCount ? 'warning' : 'success'" size="small">
                {{ courseGroup.gapCount ? `缺口 ${courseGroup.gapCount}` : '闭环' }}
              </el-tag>
            </div>
          </div>

          <div class="course-content-list">
            <div v-for="item in courseGroup.contentItems" :key="item.key" class="course-content-item">
              <span>序号 {{ item.sequenceNo }}</span>
              <strong>{{ item.content || '未填写培训内容' }}</strong>
            </div>
          </div>

          <el-table :data="courseGroup.rows" border size="small" class="course-ledger-table">
            <el-table-column prop="sequenceNo" label="序号" width="72" />
            <el-table-column prop="content" label="内容" min-width="220" show-overflow-tooltip />
            <el-table-column prop="trainee" label="培训人员" width="140" />
            <el-table-column prop="trainingDateText" label="培训日期" width="120" />
            <el-table-column label="时间" width="150">
              <template #default="{ row }">
                {{ row.startTime }}-{{ row.endTime }}
              </template>
            </el-table-column>
            <el-table-column label="完成" width="90">
              <template #default="{ row }">
                <el-tag :type="row.completedText === '√' ? 'success' : 'warning'" size="small">
                  {{ row.completedText === '√' ? '已完成' : '待完成' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="考核" width="130">
              <template #default="{ row }">
                {{ formatAssessmentCell(row.group, row.rowIndex) }}
              </template>
            </el-table-column>
            <el-table-column label="评价" min-width="210">
              <template #default="{ row }">
                {{ formatEvaluationCell(row.group, row.rowIndex) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="110" fixed="right">
              <template #default="{ row }">
                <el-button :icon="Edit" link type="primary" @click="openDrawer(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <el-drawer
      v-model="drawerVisible"
      :title="selectedGroup ? `序号 ${selectedGroup.sequenceNo}：${selectedGroup.trainingTopic}` : '相关条目'"
      size="620px"
    >
      <template v-if="selectedGroup">
        <el-alert
          :title="drawerHint"
          type="info"
          :closable="false"
          show-icon
          class="drawer-alert"
        />

        <el-tabs v-model="drawerTab">
          <el-tab-pane label="原始字段" name="original">
            <el-form label-width="96px">
              <el-form-item label="培训主题">
                <el-input v-model="selectedGroup.trainingTopic" type="textarea" autosize />
              </el-form-item>
              <el-form-item label="培训内容">
                <el-input v-model="selectedGroup.trainingContent" type="textarea" :rows="4" />
              </el-form-item>
              <el-form-item label="培训师傅">
                <el-input v-model="selectedGroup.trainer" />
              </el-form-item>
              <el-form-item label="达成目的">
                <el-input v-model="selectedGroup.purpose" type="textarea" autosize />
              </el-form-item>
              <el-form-item label="成果检验">
                <el-input v-model="selectedGroup.resultCheck" />
              </el-form-item>
            </el-form>

            <div class="drawer-section-title">人员安排</div>
            <el-table :data="selectedGroup.rows" border size="small">
              <el-table-column prop="trainee" label="培训人员" min-width="120">
                <template #default="{ row }">
                  <el-input v-model="row.trainee" size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="trainingDate" label="日期" width="92">
                <template #default="{ row }">
                  <el-input v-model="row.trainingDate" size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="startTime" label="开始" width="104">
                <template #default="{ row }">
                  <el-input v-model="row.startTime" size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="endTime" label="结束" width="104">
                <template #default="{ row }">
                  <el-input v-model="row.endTime" size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="completedText" label="完成" width="84">
                <template #default="{ row }">
                  <el-select v-model="row.completedText" size="small">
                    <el-option label="√" value="√" />
                    <el-option label="空" value="" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>

            <div class="drawer-section-title">闭环字段预览</div>
            <div class="closure-summary-grid">
              <div class="closure-summary-item">
                <span>闭环状态</span>
                <el-tag :type="getClosureSummary(selectedGroup).closureStatus === '已闭环' ? 'success' : 'warning'">
                  {{ getClosureSummary(selectedGroup).closureStatus }}
                </el-tag>
              </div>
              <div class="closure-summary-item">
                <span>缺口说明</span>
                <strong>{{ getClosureSummary(selectedGroup).gapSummary }}</strong>
              </div>
              <div class="closure-summary-item">
                <span>课件状态</span>
                <el-tag :type="getClosureSummary(selectedGroup).coursewareStatus === '已上传' ? 'success' : 'warning'">
                  {{ getClosureSummary(selectedGroup).coursewareStatus }}
                </el-tag>
              </div>
              <div class="closure-summary-item">
                <span>课件清单</span>
                <strong>{{ getClosureSummary(selectedGroup).coursewareList || '无' }}</strong>
              </div>
            </div>
            <el-table :data="selectedGroup.rows" border size="small" class="closure-row-table">
              <el-table-column prop="trainee" label="培训人员" width="120" />
              <el-table-column label="考核" width="150">
                <template #default="{ $index }">
                  {{ formatAssessmentCell(selectedGroup, $index) }}
                </template>
              </el-table-column>
              <el-table-column label="评价" min-width="220">
                <template #default="{ $index }">
                  {{ formatEvaluationCell(selectedGroup, $index) }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="执行" name="execution">
            <el-form label-width="96px">
              <el-form-item label="完成情况">
                <el-tag :type="isGroupCompleted(selectedGroup) ? 'success' : 'warning'">
                  {{ isGroupCompleted(selectedGroup) ? '全部完成' : '存在未完成人员' }}
                </el-tag>
              </el-form-item>
              <el-form-item label="达成目的">
                <el-input v-model="selectedGroup.purpose" type="textarea" autosize />
              </el-form-item>
              <el-form-item label="成果检验">
                <el-input v-model="selectedGroup.resultCheck" />
              </el-form-item>
              <el-form-item label="现场照片">
                <div class="photo-box">
                  <el-tag v-for="photo in selectedGroup.system.photos" :key="photo" type="success">
                    {{ photo }}
                  </el-tag>
                  <el-button size="small" :icon="Plus" @click="addPhoto">添加照片</el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="考核" name="assessment">
            <el-table :data="selectedGroup.system.assessments" border size="small">
              <el-table-column prop="trainee" label="学员" width="120" />
              <el-table-column label="分数" width="140">
                <template #default="{ row }">
                  <el-input-number v-model="row.score" :min="0" :max="100" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="结果" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.score >= 60 ? 'success' : 'danger'" size="small">
                    {{ row.score >= 60 ? '通过' : '未过' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="备注">
                <template #default="{ row }">
                  <el-input v-model="row.remark" size="small" />
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="评价" name="evaluation">
            <el-table :data="selectedGroup.system.evaluations" border size="small">
              <el-table-column label="类型" width="120">
                <template #default="{ row }">
                  <el-select v-model="row.type" size="small">
                    <el-option label="学员评导师" value="student_to_tutor" />
                    <el-option label="导师评学员" value="tutor_to_student" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="person" label="对象" width="120">
                <template #default="{ row }">
                  <el-input v-model="row.person" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="评分" width="170">
                <template #default="{ row }">
                  <el-rate v-model="row.rating" />
                </template>
              </el-table-column>
              <el-table-column label="内容">
                <template #default="{ row }">
                  <el-input v-model="row.comment" size="small" />
                </template>
              </el-table-column>
            </el-table>
            <el-button class="full-button" :icon="Plus" @click="addEvaluation">新增评价</el-button>
          </el-tab-pane>

          <el-tab-pane label="课卷" name="courseware">
            <div v-if="selectedGroup.system.coursewares.length" class="file-list">
              <div v-for="file in selectedGroup.system.coursewares" :key="file.id" class="file-item">
                <strong>{{ file.name }}</strong>
                <el-tag size="small">{{ file.type }}</el-tag>
              </div>
            </div>
            <el-empty v-else description="暂无课件资料" />
            <el-button type="primary" class="full-button" :icon="Plus" @click="addCourseware">上传/替换课件资料</el-button>
          </el-tab-pane>
        </el-tabs>

        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDrawer">保存到台账</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, Edit, Plus, Setting, Upload } from '@element-plus/icons-vue'
import {
  cloneLedgerGroups,
  closureFieldDefinitions,
  flattenLedgerGroups,
  getClosureRowValues,
  getClosureSummary,
  getExcelLedgerStats
} from '../../api/excelLedgerMock'

const router = useRouter()
const route = useRoute()
const groups = ref(cloneLedgerGroups())
const keyword = ref('')
const dateRange = ref([])
const completionFilter = ref('all')
const ledgerViewMode = ref('课程合并')
const ledgerViewOptions = ['课程合并', 'Excel 原表']
const drawerVisible = ref(false)
const drawerTab = ref('original')
const selectedGroup = ref(null)
const selectedRow = ref(null)

const filteredGroups = computed(() => groups.value.filter(group => {
  const text = [
    group.sequenceNo,
    group.trainingTopic,
    group.trainingContent,
    group.trainer,
    group.purpose,
    group.resultCheck,
    group.rows.map(row => row.trainee).join(' ')
  ].join(' ')
  const keywordMatch = !keyword.value || text.includes(keyword.value)
  const dateMatch = isGroupInDateRange(group)
  const groupCompleted = isGroupCompleted(group)
  const completionMatch = completionFilter.value === 'all'
    || (completionFilter.value === 'completed' && groupCompleted)
    || (completionFilter.value === 'pending' && !groupCompleted)
  return keywordMatch && dateMatch && completionMatch
}))

const ledgerRows = computed(() => flattenLedgerGroups(filteredGroups.value))
const stats = computed(() => getExcelLedgerStats(filteredGroups.value))
const mergedCourseGroups = computed(() => {
  const grouped = new Map()

  filteredGroups.value.forEach(group => {
    const groupKey = `${normalizeText(group.trainingTopic)}::${normalizeText(group.trainer)}`
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        groupKey,
        trainingTopic: group.trainingTopic,
        trainer: group.trainer,
        groups: [],
        dates: [],
        rows: []
      })
    }

    const courseGroup = grouped.get(groupKey)
    courseGroup.groups.push(group)
    group.rows.forEach((row, rowIndex) => {
      courseGroup.dates.push(normalizeLedgerDate(row.trainingDate))
      courseGroup.rows.push({
        ...row,
        personRow: row,
        group,
        rowIndex,
        rowKey: `${group.id}-${rowIndex}`,
        sequenceNo: group.sequenceNo,
        content: row.trainingContent ?? group.trainingContent,
        trainingDateText: row.trainingDate
      })
    })
  })

  return Array.from(grouped.values()).map(courseGroup => {
    const sortedDates = [...new Set(courseGroup.dates.filter(Boolean))].sort()
    const sequenceNos = courseGroup.groups.map(group => group.sequenceNo)
    const completedCount = courseGroup.rows.filter(row => row.completedText === '√').length
    const coursewareCount = courseGroup.groups.reduce((sum, group) => sum + group.system.coursewares.length, 0)
    const gapCount = courseGroup.groups
      .map(group => getClosureSummary(group).gapSummary)
      .filter(text => text && text !== '已齐全')
      .length
    const contentItems = courseGroup.groups.map(group => ({
      key: group.id,
      sequenceNo: group.sequenceNo,
      content: group.trainingContent || group.rows.map(row => row.trainingContent).filter(Boolean).join('；')
    }))

    return {
      ...courseGroup,
      sequenceNos,
      personCount: courseGroup.rows.length,
      completedCount,
      coursewareCount,
      gapCount,
      contentItems,
      dateRange: sortedDates.length > 1 ? `${sortedDates[0]} 至 ${sortedDates[sortedDates.length - 1]}` : (sortedDates[0] || '未填写日期'),
      rows: courseGroup.rows.sort((a, b) => `${normalizeLedgerDate(a.trainingDate)} ${a.startTime}`.localeCompare(`${normalizeLedgerDate(b.trainingDate)} ${b.startTime}`))
    }
  }).sort((a, b) => a.sequenceNos[0] - b.sequenceNos[0])
})
const drawerHint = computed(() => {
  if (!selectedGroup.value) return ''
  const groupLevel = ['培训主题', '培训内容', '培训师傅', '达成目的', '成果检验']
  return `主题级字段会同步影响本序号下 ${selectedGroup.value.rows.length} 条人员记录：${groupLevel.join('、')}。`
})

const isGroupCompleted = (group) => group.rows.every(row => row.completedText === '√')

const isMergedCell = (row, key) => row.group.mergedColumns.includes(key)

const normalizeText = (value) => String(value || '').replace(/\s+/g, '').trim()

const normalizeLedgerDate = (value) => {
  const [month, day] = String(value || '').split('.')
  if (!month || !day) return ''
  return `2026-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

const isGroupInDateRange = (group) => {
  if (!dateRange.value || dateRange.value.length !== 2) return true
  const [start, end] = dateRange.value
  return group.rows.some(row => {
    const date = normalizeLedgerDate(row.trainingDate)
    return date && date >= start && date <= end
  })
}

const spanMethod = ({ row, column }) => {
  if (!column.property || !isMergedCell(row, column.property)) return [1, 1]
  return row.rowIndex === 0 ? [row.group.rows.length, 1] : [0, 0]
}

const rowClassName = ({ row }) => row.rowIndex === 0 ? 'group-start-row' : ''

const markGroupEdit = (group) => {
  group._editingGroupField = true
}

const openDrawer = (row) => {
  selectedRow.value = row.personRow
  selectedGroup.value = row.group
  drawerTab.value = 'original'
  drawerVisible.value = true
}

const addMockGroup = () => {
  const nextNo = groups.value.length + 1
  const newGroup = {
    ...cloneLedgerGroups()[0],
    id: `excel-group-${Date.now()}`,
    sequenceNo: nextNo,
    trainingTopic: '新增培训主题',
    trainingContent: '',
    trainer: '',
    purpose: '',
    resultCheck: '',
    mergedColumns: ['sequenceNo', 'trainingTopic', 'trainingContent', 'trainer'],
    rows: [
      { id: `${Date.now()}-1`, trainee: '', trainingDate: '', startTime: '09:30:00', endTime: '11:30:00', durationHours: 2, completedText: '', remark: '', trainingContent: null, closureValues: {} },
      { id: `${Date.now()}-2`, trainee: '', trainingDate: '', startTime: '09:30:00', endTime: '11:30:00', durationHours: 2, completedText: '', remark: '', trainingContent: null, closureValues: {} },
      { id: `${Date.now()}-3`, trainee: '', trainingDate: '', startTime: '09:30:00', endTime: '11:30:00', durationHours: 2, completedText: '', remark: '', trainingContent: null, closureValues: {} }
    ],
    system: {
      photos: [],
      coursewares: [],
      assessments: [],
      evaluations: []
    }
  }
  groups.value.push(newGroup)
  ElMessage.success('已新增一组前端原型条目')
}

const addPhoto = () => {
  selectedGroup.value.system.photos.push(`site-photo-${selectedGroup.value.system.photos.length + 1}.jpg`)
}

const addCourseware = () => {
  selectedGroup.value.system.coursewares.push({
    id: `courseware-${Date.now()}`,
    name: `新增课件-${selectedGroup.value.system.coursewares.length + 1}.pdf`,
    type: 'PDF'
  })
}

const addEvaluation = () => {
  selectedGroup.value.system.evaluations.push({
    type: 'student_to_tutor',
    person: selectedGroup.value.rows[0]?.trainee || '',
    rating: 0,
    comment: ''
  })
}

const saveDrawer = () => {
  ElMessage.success('已保存到前端台账原型')
  drawerVisible.value = false
}

const formatAssessmentCell = (group, rowIndex) => {
  const rowValues = getClosureRowValues(group, rowIndex)
  if (!rowValues.assessmentScore) return '未录入'
  return `${rowValues.assessmentScore}分 / ${rowValues.assessmentResult}`
}

const formatEvaluationCell = (group, rowIndex) => {
  const rowValues = getClosureRowValues(group, rowIndex)
  return `${rowValues.studentToTutorEvaluation}；${rowValues.tutorToStudentEvaluation}`
}

const openRouteTarget = () => {
  if (!route.query.tab && !route.query.sequenceNo && !route.query.trainingId) return
  const sequenceNo = Number(route.query.sequenceNo || route.query.trainingId)
  const group = groups.value.find(item => item.sequenceNo === sequenceNo) || groups.value[0]
  if (!group) return
  selectedGroup.value = group
  selectedRow.value = group.rows[0]
  drawerTab.value = typeof route.query.tab === 'string' ? route.query.tab : 'original'
  drawerVisible.value = true
}

watch(() => [route.query.sequenceNo, route.query.trainingId, route.query.tab], openRouteTarget, { immediate: true })
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header,
.header-actions,
.ledger-toolbar,
.filters,
.toolbar-actions,
.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
}

.page-header p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card {
  padding: 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.stat-card--alert {
  border-color: #f59e0b;
  background: #fffbeb;
}

.stat-label {
  color: var(--text-muted);
  font-size: 12px;
}

.stat-value {
  margin-top: 8px;
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 700;
}

.stat-value sup {
  margin-left: 4px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
}

.ledger-shell {
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-surface);
  padding: 14px;
}

.ledger-toolbar {
  margin-bottom: 12px;
}

.ledger-alert {
  margin-bottom: 12px;
}

.excel-ledger-table :deep(.el-table__cell) {
  vertical-align: middle;
}

.excel-ledger-table :deep(.group-start-row td) {
  border-top: 2px solid #94a3b8;
}

.excel-ledger-table :deep(.el-textarea__inner),
.excel-ledger-table :deep(.el-input__wrapper) {
  box-shadow: none;
  border-radius: 4px;
  background: transparent;
}

.course-ledger-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.course-ledger-card {
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: #fff;
}

.course-ledger-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-surface-subtle);
}

.course-ledger-title {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
}

.course-ledger-meta {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.course-ledger-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  min-width: 240px;
}

.course-content-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.course-content-item {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  color: var(--text-secondary);
  font-size: 13px;
}

.course-content-item span {
  color: var(--text-muted);
}

.course-content-item strong {
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.45;
}

.course-ledger-table :deep(.el-table__cell) {
  vertical-align: middle;
}

.field-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.config-title,
.drawer-section-title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.field-config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
}

.drawer-alert {
  margin-bottom: 12px;
}

.drawer-section-title {
  margin: 18px 0 10px;
}

.closure-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.closure-summary-item {
  display: flex;
  min-height: 58px;
  flex-direction: column;
  gap: 7px;
  justify-content: center;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-surface-subtle);
}

.closure-summary-item span {
  color: var(--text-muted);
  font-size: 12px;
}

.closure-summary-item strong {
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.45;
}

.closure-row-table {
  margin-top: 12px;
}

.photo-box,
.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.file-list {
  flex-direction: column;
  align-items: stretch;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
}

.full-button {
  width: 100%;
  margin-top: 14px;
}

.drawer-footer {
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 900px) {
  .page-header,
  .ledger-toolbar,
  .course-ledger-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters,
  .course-ledger-tags {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
