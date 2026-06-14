<template>
  <div class="page-container fade-in-up">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">📋</div>
        <div class="stat-content">
          <div class="stat-label">我的培训</div>
          <div class="stat-value">{{ trainings.length }}<sup>场</sup></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">📚</div>
        <div class="stat-content">
          <div class="stat-label">可查看资料</div>
          <div class="stat-value">{{ coursewareCount }}<sup>份</sup></div>
        </div>
      </div>
      <div class="stat-card" :class="{ 'stat-card--alert': pendingEvaluation.length > 0 }">
        <div class="stat-icon amber">⏰</div>
        <div class="stat-content">
          <div class="stat-label">待评价导师</div>
          <div class="stat-value">{{ pendingEvaluation.length }}<sup>场</sup></div>
          <div class="stat-note" v-if="pendingEvaluation.length">需要您的反馈</div>
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
          <span>待参加</span>
          <strong>{{ scopedUpcoming.length }}</strong>
        </div>
        <div class="schedule-summary-item">
          <span>待评价</span>
          <strong>{{ scopedPendingEvaluation.length }}</strong>
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
          @click="focusTraining(training)"
        >
          <div class="schedule-date">
            <span>{{ formatMonthDay(training.startDate) }}</span>
            <strong>{{ getWeekdayLabel(training.startDate) }}</strong>
          </div>
          <div class="schedule-main">
            <div class="schedule-course">{{ training.courseName }}</div>
            <div class="schedule-meta">{{ training.startTime }}–{{ training.endTime }} · {{ training.tutor }}</div>
          </div>
          <el-tag :type="getStatusType(training.status)" size="small">
            {{ getStatusText(training.status) }}
          </el-tag>
        </button>
      </div>
      <el-empty v-else :description="`${scheduleScope}暂无课程安排`" />
    </div>

    <!-- 待处理提醒 -->
    <div v-if="pendingEvaluation.length" class="todo-banner">
      <div class="todo-banner-icon">🔔</div>
      <div class="todo-banner-content">
        <div class="todo-banner-title">待我处理</div>
        <div class="todo-items">
          <div v-for="t in pendingEvaluation" :key="t.id" class="todo-item-row">
            <span class="todo-dot"></span>
            <span>《{{ t.courseName }}》已完成，请评价导师 <strong>{{ t.tutor }}</strong></span>
            <button class="todo-action" @click="evaluateTutor(t)">去评价 →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 培训台账 -->
    <div class="section-card">
      <div class="section-header">
        <div>
          <h3 class="section-title">我的培训台账</h3>
          <p class="section-subtitle">查看培训记录、学习资料和考核结果</p>
        </div>
        <el-segmented v-model="statusFilter" :options="filterOptions" />
      </div>

      <div class="history-filters">
        <el-date-picker
          v-model="historyDateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          clearable
          style="width: 280px"
        />
        <span v-if="historyDateRange && historyDateRange.length" class="filter-tip">
          共 {{ filteredTrainings.length }} 条记录
        </span>
      </div>

      <el-table :data="filteredTrainings" stripe style="width:100%" @row-click="() => {}">
        <el-table-column prop="courseName" label="培训主题" min-width="180" />
        <el-table-column label="导师" width="90">
          <template #default="{ row }">
            <span class="tutor-pill">{{ row.tutor }}</span>
          </template>
        </el-table-column>
        <el-table-column label="日期时间" width="160">
          <template #default="{ row }">
            <div class="cell-date">{{ row.startDate }}</div>
            <div class="text-muted">{{ row.startTime }}–{{ row.endTime }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="trainingContent" label="培训内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="我的考核" width="130">
          <template #default="{ row }">
            <div v-if="getMyAssessment(row)" class="score-cell">
              <span class="score-num" :class="getScoreClass(getMyAssessment(row).score)">
                {{ getMyAssessment(row).score }}分
              </span>
              <span class="score-result">{{ getMyAssessment(row).result }}</span>
            </div>
            <span v-else class="text-muted">未录入</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="240">
          <template #default="{ row }">
            <div class="action-group">
              <el-button v-if="row.coursewares.length" size="small" @click="viewCourseware(row)">
                📖 学习资料
              </el-button>
              <el-button v-if="getMyAssessment(row)" size="small" @click="viewAssessment(row)">
                🏆 考核结果
              </el-button>
              <el-button v-if="needsTutorEvaluation(row)" type="primary" size="small" @click="evaluateTutor(row)">
                ⭐ 评价导师
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredTrainings.length === 0" description="暂无相关培训记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserTrainings, getStatusText, getStatusType } from '../../api/mockData'

const router = useRouter()
const trainings = ref([])
const currentStudentId = 1
const statusFilter = ref('全部')
const historyDateRange = ref([])
const scheduleScope = ref('本周')
const filterOptions = ['全部', '未开始', '已完成', '已考核', '已评价']
const scheduleScopeOptions = ['本周', '本月']

const statusLabelMap = { 未开始: 'upcoming', 已完成: 'completed', 已考核: 'assessed', 已评价: 'evaluated' }

const filteredTrainings = computed(() => {
  const status = statusLabelMap[statusFilter.value]
  let list = status ? trainings.value.filter(item => item.status === status) : trainings.value
  if (historyDateRange.value && historyDateRange.value.length === 2) {
    const [start, end] = historyDateRange.value
    list = list.filter(item => item.startDate >= start && item.startDate <= end)
  }
  return list
})

const coursewareCount = computed(() => trainings.value.reduce((sum, item) => sum + item.coursewares.length, 0))
const pendingEvaluation = computed(() => trainings.value.filter(needsTutorEvaluation))
const scheduleRange = computed(() => scheduleScope.value === '本周' ? getCurrentWeekRange() : getCurrentMonthRange())
const scopedTrainings = computed(() => trainings.value
  .filter(item => item.startDate >= scheduleRange.value.start && item.startDate <= scheduleRange.value.end)
  .sort((a, b) => `${a.startDate} ${a.startTime}`.localeCompare(`${b.startDate} ${b.startTime}`)))
const scopedUpcoming = computed(() => scopedTrainings.value.filter(item => item.status === 'upcoming'))
const scopedPendingEvaluation = computed(() => scopedTrainings.value.filter(needsTutorEvaluation))
const scopedCompleted = computed(() => scopedTrainings.value.filter(item => ['completed', 'assessed', 'evaluated'].includes(item.status)))
const scheduleRangeText = computed(() => `${scheduleRange.value.start} 至 ${scheduleRange.value.end}`)

const getMyAssessment = (training) => training.assessments.find(item => item.studentId === currentStudentId)

const needsTutorEvaluation = (training) =>
  ['completed', 'assessed'].includes(training.status) &&
  !training.evaluations.some(item => item.type === 'student_to_tutor' && item.studentId === currentStudentId)

const getScoreClass = (score) => score >= 90 ? 'score-excellent' : score >= 60 ? 'score-pass' : 'score-fail'

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

const loadTrainings = () => { trainings.value = getUserTrainings(currentStudentId, 'student') }

const viewCourseware = (row) => router.push(`/student/courseware/${row.id}`)
const viewAssessment = (row) => router.push(`/student/assessment/${row.id}`)
const evaluateTutor = (row) => router.push(`/student/evaluate/${row.id}`)
const focusTraining = (row) => {
  statusFilter.value = '全部'
  if (getMyAssessment(row)) {
    viewAssessment(row)
    return
  }
  if (row.coursewares.length) {
    viewCourseware(row)
    return
  }
  if (needsTutorEvaluation(row)) evaluateTutor(row)
}

onMounted(loadTrainings)
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card--alert {
  border-color: var(--color-warning) !important;
  background: linear-gradient(135deg, #fff, #fffbeb) !important;
}

/* 近期课程 */
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
}

.schedule-row {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 74px;
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

/* 待处理横幅 */
.todo-banner {
  display: flex;
  gap: 16px;
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  border: 1px solid #fde68a;
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  margin-bottom: 20px;
}

.todo-banner-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }

.todo-banner-content { flex: 1; }

.todo-banner-title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.todo-items { display: flex; flex-direction: column; gap: 8px; }

.todo-item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #78350f;
}

.todo-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  flex-shrink: 0;
}

.todo-action {
  margin-left: auto;
  padding: 3px 12px;
  border: 1px solid #f59e0b;
  border-radius: var(--radius-full);
  background: transparent;
  color: #92400e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.todo-action:hover { background: #f59e0b; color: white; }

/* 历史记录筛选栏 */
.history-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-tip {
  font-size: 13px;
  color: var(--text-muted);
}

/* 区域卡片 */
.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.section-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 3px;
}

/* 表格内容 */
.tutor-pill {
  display: inline-block;
  padding: 2px 10px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

.cell-date { font-size: 13px; font-weight: 500; color: var(--text-primary); }

.score-cell { display: flex; align-items: center; gap: 6px; }
.score-num { font-weight: 700; font-size: 14px; }
.score-result { font-size: 11px; color: var(--text-muted); }
.score-excellent { color: var(--color-success); }
.score-pass { color: var(--color-primary); }
.score-fail { color: var(--color-danger); }

.action-group { display: flex; flex-wrap: wrap; gap: 6px; }

@media (max-width: 900px) {
  .stats-grid,
  .schedule-summary {
    grid-template-columns: 1fr;
  }

  .schedule-panel-header {
    flex-direction: column;
  }
}
</style>
