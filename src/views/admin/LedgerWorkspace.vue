<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2>培训台账</h2>
        <p>一张表管排班、执行、考核、评价、资料归档和导出前检查。</p>
      </div>
      <div class="header-actions">
        <el-button>导入Excel/企微表</el-button>
        <el-button type="primary">导出当前台账</el-button>
      </div>
    </div>

    <el-row :gutter="12" class="summary-row">
      <el-col :span="6">
        <el-card shadow="never">
          <el-statistic title="培训场次" :value="stats.totalTraining">
            <template #suffix>场</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <el-statistic title="闭环率" :value="stats.completionRate">
            <template #suffix>%</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <el-statistic title="待补数据" :value="todos.length">
            <template #suffix>项</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <el-statistic title="考核通过" :value="stats.passCount">
            <template #suffix>人次</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="toolbar">
          <div class="filters">
            <el-select v-model="studioFilter" style="width: 160px">
              <el-option label="全部工作室" value="all" />
              <el-option label="一号工作室" value="studio_a" />
              <el-option label="二号工作室" value="studio_b" />
            </el-select>
            <el-select v-model="statusFilter" style="width: 140px">
              <el-option label="全部状态" value="all" />
              <el-option label="未完成闭环" value="incomplete" />
              <el-option label="未开始" value="upcoming" />
              <el-option label="已完成" value="completed" />
              <el-option label="已考核" value="assessed" />
              <el-option label="已闭环" value="evaluated" />
            </el-select>
            <el-input v-model="keyword" clearable placeholder="搜主题/导师/学员" style="width: 220px" />
          </div>
          <el-button type="primary">新增一场培训</el-button>
        </div>
      </template>

      <el-table
        :data="pagedTrainings"
        stripe
        style="width: 100%"
        row-key="id"
        @row-click="openDrawer"
      >
        <el-table-column prop="sequenceNo" label="#" width="56" />
        <el-table-column prop="courseName" label="培训主题" min-width="180" />
        <el-table-column prop="studioName" label="工作室" width="130" />
        <el-table-column prop="tutor" label="导师" width="90" />
        <el-table-column label="学员" min-width="180">
          <template #default="{ row }">
            <span class="muted">{{ row.students.join('、') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            <div>{{ row.startDate }}</div>
            <div class="muted">{{ row.startTime }}-{{ row.endTime }} / {{ row.durationHours }}h</div>
          </template>
        </el-table-column>
        <el-table-column label="闭环状态" width="260">
          <template #default="{ row }">
            <div class="chips">
              <el-tag :type="getTrainingDisplayType(row)" size="small">{{ getTrainingDisplayStatus(row) }}</el-tag>
              <el-tag :type="hasExecutionMaterials(row) ? 'success' : 'warning'" size="small">资料 {{ row.photos.length }}/3</el-tag>
              <el-tag :type="hasCompleteAssessments(row) ? 'success' : 'warning'" size="small">考核</el-tag>
              <el-tag :type="hasCompleteStudentTutorEvaluations(row) ? 'success' : 'warning'" size="small">学员评导师</el-tag>
              <el-tag :type="hasCompleteTutorStudentEvaluations(row) ? 'success' : 'warning'" size="small">导师评学员</el-tag>
              <el-tag size="small" effect="plain">资料 {{ row.coursewares.length }} 份</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="待补" min-width="180">
          <template #default="{ row }">
            <span v-if="!getTrainingGaps(row).length" class="ok-text">已齐</span>
            <div v-else class="chips">
              <el-tag v-for="gap in getTrainingGaps(row)" :key="gap" type="warning" size="small">
                {{ gap }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <span class="pagination-total">共 {{ filteredTrainings.length }} 场</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredTrainings.length"
          layout="sizes, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <el-drawer
      v-model="drawerVisible"
      :title="selectedTraining ? selectedTraining.courseName : '补数据'"
      size="520px"
    >
      <template v-if="selectedTraining">
        <el-alert
          :title="drawerHint"
          type="info"
          :closable="false"
          show-icon
          class="drawer-alert"
        />

        <el-tabs v-model="drawerTab">
          <el-tab-pane label="执行" name="execution">
            <el-form label-width="90px">
              <el-form-item label="是否完成">
                <el-switch
                  v-model="draft.completed"
                  active-text="已完成"
                  inactive-text="未完成"
                />
              </el-form-item>
              <el-form-item label="达成目的">
                <el-input v-model="draft.purpose" />
              </el-form-item>
              <el-form-item label="成果检验">
                <el-input v-model="draft.resultCheck" />
              </el-form-item>
              <el-form-item label="执行备注">
                <el-input v-model="draft.executionRemark" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item label="现场照片">
                <div class="photo-box">
                  <el-tag v-for="photo in selectedTraining.photos" :key="photo" type="success">
                    {{ photo }}
                  </el-tag>
                  <el-button size="small">上传照片</el-button>
                  <span class="muted">最多 3 张</span>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="考核" name="assessment">
            <el-table :data="assessmentRows" border size="small">
              <el-table-column prop="name" label="学员" width="90" />
              <el-table-column label="分数" width="130">
                <template #default="{ row }">
                  <el-input-number v-model="row.score" :min="0" :max="100" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="结果" width="80">
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
            <el-table :data="evaluationRows" border size="small">
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="person" label="对象" width="90" />
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
          </el-tab-pane>

          <el-tab-pane label="课卷" name="courseware">
            <div v-if="selectedTraining.coursewares.length" class="file-list">
              <div v-for="file in selectedTraining.coursewares" :key="file.id" class="file-item">
                <strong>{{ file.name }}</strong>
                <el-tag size="small">{{ file.type }}</el-tag>
              </div>
            </div>
            <el-empty v-else description="暂无课件资料，不影响台账闭环" />
            <el-button type="primary" class="full-button">上传/替换课件资料</el-button>
          </el-tab-pane>
        </el-tabs>

        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDraft">保存到台账</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  trainingPlans,
  getDashboardStats,
  getTrainingDisplayStatus,
  getTrainingDisplayType,
  getTrainingGaps,
  getTodoItems,
  hasCompleteAssessments,
  hasCompleteStudentTutorEvaluations,
  hasCompleteTutorStudentEvaluations,
  hasExecutionMaterials,
  isTrainingClosed
} from '../../api/mockData'

const route = useRoute()
const studioFilter = ref('all')
const statusFilter = ref('all')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const drawerVisible = ref(false)
const drawerTab = ref('execution')
const selectedTraining = ref(null)
const assessmentRows = ref([])
const evaluationRows = ref([])

const draft = reactive({
  completed: false,
  purpose: '',
  resultCheck: '',
  executionRemark: ''
})

const filteredTrainings = computed(() => trainingPlans.filter(plan => {
  const studioMatch = studioFilter.value === 'all' || plan.studio === studioFilter.value
  const statusMatch = statusFilter.value === 'all'
    || (statusFilter.value === 'incomplete' && isIncompleteTraining(plan))
    || plan.status === statusFilter.value
  const text = `${plan.courseName} ${plan.tutor} ${plan.students.join(' ')}`
  const keywordMatch = !keyword.value || text.includes(keyword.value)
  return studioMatch && statusMatch && keywordMatch
}))
const pagedTrainings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTrainings.value.slice(start, start + pageSize.value)
})

const stats = computed(() => getDashboardStats(filteredTrainings.value))
const todos = computed(() => getTodoItems(filteredTrainings.value))
const drawerHint = computed(() => {
  const gaps = selectedTraining.value ? getTrainingGaps(selectedTraining.value) : []
  return gaps.length ? `当前待补：${gaps.join('、')}` : '这场培训的台账信息已齐。'
})

const isIncompleteTraining = (plan) => {
  return !isTrainingClosed(plan)
}

const openDrawer = (row, preferredTab = '') => {
  selectedTraining.value = row
  drawerTab.value = preferredTab || (getTrainingGaps(row).includes('待录考核') ? 'assessment' : 'execution')
  draft.completed = ['completed', 'assessed', 'evaluated'].includes(row.status)
  draft.purpose = row.purpose
  draft.resultCheck = row.resultCheck
  draft.executionRemark = row.executionRemark
  assessmentRows.value = row.students.map((name, index) => {
    const studentId = row.studentIds[index]
    const existing = row.assessments.find(item => item.studentId === studentId)
    return {
      studentId,
      name,
      score: existing?.score ?? 80,
      remark: existing?.remark || ''
    }
  })
  evaluationRows.value = [
    ...row.students.map((name, index) => {
      const studentId = row.studentIds[index]
      const existing = row.evaluations.find(item => item.type === 'student_to_tutor' && item.studentId === studentId)
      return {
        type: '学员评导师',
        person: name,
        rating: existing?.rating || 0,
        comment: existing?.comment || ''
      }
    }),
    ...row.students.map((name, index) => {
      const studentId = row.studentIds[index]
      const existing = row.evaluations.find(item => item.type === 'tutor_to_student' && item.studentId === studentId)
      return {
        type: '导师评学员',
        person: name,
        rating: existing?.rating || 0,
        comment: existing?.comment || ''
      }
    })
  ]
  drawerVisible.value = true
}

const saveDraft = () => {
  ElMessage.success('已保存到台账原型，真实写入待接后端')
  drawerVisible.value = false
}

const openRouteTraining = () => {
  const trainingId = Number(route.query.trainingId)
  if (!trainingId) return
  const row = trainingPlans.find(plan => plan.id === trainingId)
  if (!row) return
  const preferredTab = typeof route.query.tab === 'string' ? route.query.tab : ''
  openDrawer(row, preferredTab)
}

watch([studioFilter, statusFilter, keyword, pageSize], () => {
  currentPage.value = 1
})
watch(() => [route.query.trainingId, route.query.tab], openRouteTraining, { immediate: true })
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header,
.toolbar,
.filters,
.header-actions,
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

.page-header p,
.muted {
  color: #909399;
  font-size: 12px;
}

.summary-row,
.table-card {
  margin-bottom: 16px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.ok-text {
  color: #67c23a;
  font-weight: 600;
}

.drawer-alert {
  margin-bottom: 12px;
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
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #ebeef5;
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

.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.pagination-total {
  color: #909399;
  font-size: 12px;
}
</style>
