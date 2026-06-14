<template>
  <div class="page-container">
    <el-row :gutter="16" class="summary-row">
      <el-col :span="6">
        <el-card shadow="never">
          <el-statistic title="当前工作室培训" :value="stats.totalTraining">
            <template #suffix>场</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <el-statistic title="已闭环" :value="stats.completedTraining">
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
          <el-statistic title="待处理缺口" :value="studioTodos.length">
            <template #suffix>项</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="todo-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>今日优先处理</span>
          <el-tag type="warning">{{ userStore.studioName }}</el-tag>
        </div>
      </template>
      <div v-if="studioTodos.length" class="todo-list">
        <button
          v-for="todo in studioTodos"
          :key="todo.id"
          type="button"
          class="todo-action"
          @click="handleTodo(todo)"
        >
          <span class="todo-action-title">{{ todo.courseName }}：{{ todo.title }}</span>
          <span class="todo-action-meta">{{ todo.date }} · {{ todo.owner }} · 去处理</span>
        </button>
      </div>
      <el-empty v-else description="当前没有待补数据" />
    </el-card>

    <el-card class="month-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <span class="card-title">月排班视图</span>
            <span class="card-subtitle">{{ monthTitle }}，共 {{ monthTrainingCount }} 场</span>
          </div>
          <div class="header-actions">
            <el-button @click="shiftMonth(-1)">上月</el-button>
            <el-button @click="goCurrentMonth">本月</el-button>
            <el-button @click="shiftMonth(1)">下月</el-button>
          </div>
        </div>
      </template>

      <div class="month-weekdays">
        <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
      </div>
      <div class="month-grid">
        <button
          v-for="day in monthDays"
          :key="day.date"
          type="button"
          :class="[
            'month-day',
            {
              'month-day--today': day.isToday,
              'month-day--active': selectedDate === day.date,
              'month-day--outside': !day.inCurrentMonth
            }
          ]"
          @click="selectMonthDay(day.date)"
        >
          <div class="month-day-head">
            <strong>{{ day.dayOfMonth }}</strong>
            <span v-if="day.sessions.length">{{ day.sessions.length }} 场</span>
          </div>
          <div v-if="day.sessions.length" class="month-session-list">
            <div v-for="session in day.sessions.slice(0, 2)" :key="session.id" class="month-session">
              <div class="month-session-title">{{ session.courseName }}</div>
              <div class="month-session-meta">
                {{ session.startTime }} · {{ session.tutor }} · {{ session.students.join('、') }}
              </div>
            </div>
            <div v-if="day.sessions.length > 2" class="month-more">
              还有 {{ day.sessions.length - 2 }} 场
            </div>
          </div>
        </button>
      </div>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <span class="card-title">排班列表</span>
            <span class="card-subtitle">
              {{ scheduleFilterText }}
            </span>
          </div>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 280px"
              @change="handleDateRangeChange"
            />
            <el-button v-if="selectedDate || hasDateRange" @click="clearDateFilter">清除日期</el-button>
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
              <el-option label="未开始" value="upcoming" />
              <el-option label="已完成" value="completed" />
              <el-option label="已考核" value="assessed" />
              <el-option label="已闭环" value="evaluated" />
            </el-select>
            <el-button>
              导入Excel
            </el-button>
            <el-button type="primary" @click="openCreateDialog">
              <el-icon><Plus /></el-icon>
              新增培训
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="pagedTrainings" stripe style="width: 100%" row-key="id">
        <el-table-column prop="sequenceNo" label="序号" width="70" />
        <el-table-column prop="courseName" label="培训主题" min-width="180" />
        <el-table-column prop="trainingContent" label="培训内容" min-width="220" show-overflow-tooltip />
        <el-table-column prop="tutor" label="导师" width="90" />
        <el-table-column label="培训人员" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="student in row.students"
              :key="student"
              size="small"
              class="student-tag"
            >
              {{ student }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="日期时间" width="180">
          <template #default="{ row }">
            <div>{{ row.startDate }}</div>
            <div class="muted">{{ row.startTime }}-{{ row.endTime }} / {{ row.durationHours }}h</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getTrainingDisplayType(row)">
              {{ getTrainingDisplayStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据缺口" min-width="170">
          <template #default="{ row }">
            <template v-if="getTrainingGaps(row).length">
              <el-tag
                v-for="gap in getTrainingGaps(row)"
                :key="gap"
                type="warning"
                size="small"
                class="gap-tag"
              >
                {{ gap }}
              </el-tag>
            </template>
            <span v-else class="muted">已齐全</span>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editPlan(row)">编辑</el-button>
            <el-button size="small" type="success" plain v-if="row.status === 'upcoming'">
              标记完成
            </el-button>
            <el-button size="small" type="primary" plain v-if="row.status === 'completed'" @click="goLedgerAssessment(row)">
              去台账录考核
            </el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑培训' : '新增培训'"
      width="760px"
    >
      <el-form :model="planForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="培训主题" prop="courseName">
          <el-input v-model="planForm.courseName" placeholder="例如：液压阀基础知识（3）" />
        </el-form-item>
        <el-form-item label="培训内容" prop="trainingContent">
          <el-input v-model="planForm.trainingContent" type="textarea" :rows="3" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="导师" prop="tutorId">
              <el-select v-model="planForm.tutorId" placeholder="请选择导师" style="width: 100%">
                <el-option v-for="tutor in availableTutors" :key="tutor.id" :label="tutor.name" :value="tutor.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学员" prop="studentIds">
              <el-select v-model="planForm.studentIds" multiple placeholder="请选择学员" style="width: 100%">
                <el-option v-for="student in availableStudents" :key="student.id" :label="student.name" :value="student.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="日期" prop="startDate">
              <el-date-picker v-model="planForm.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-picker v-model="planForm.startTime" value-format="HH:mm" format="HH:mm" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束时间" prop="endTime">
              <el-time-picker v-model="planForm.endTime" value-format="HH:mm" format="HH:mm" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="达成目的">
          <el-input v-model="planForm.purpose" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="planForm.executionRemark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPlan" :loading="submitting">
          确认{{ isEdit ? '修改' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import {
  trainingPlans,
  tutors,
  students,
  getTrainingDisplayStatus,
  getTrainingDisplayType,
  getTrainingGaps,
  getTodoItems,
  getDashboardStats
} from '../../api/mockData'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const trainings = ref([])
const statusFilter = ref('')
const selectedDate = ref('')
const dateRange = ref([])
const monthCursor = ref(new Date())
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const planForm = reactive({
  id: null,
  courseName: '',
  trainingContent: '',
  tutorId: null,
  studentIds: [],
  startDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  executionRemark: ''
})

const rules = {
  courseName: [{ required: true, message: '请输入培训主题', trigger: 'blur' }],
  trainingContent: [{ required: true, message: '请输入培训内容', trigger: 'blur' }],
  tutorId: [{ required: true, message: '请选择导师', trigger: 'change' }],
  studentIds: [{ required: true, message: '请选择学员', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const availableTutors = computed(() => tutors.filter(t => t.studio === userStore.currentStudio))
const availableStudents = computed(() => students.filter(s => s.studio === userStore.currentStudio))
const hasDateRange = computed(() => dateRange.value && dateRange.value.length === 2)
const filteredTrainings = computed(() => trainings.value.filter(item => {
  const statusMatch = !statusFilter.value || item.status === statusFilter.value
  const dateMatch = matchesDateFilter(item.startDate)
  return statusMatch && dateMatch
}))
const pagedTrainings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTrainings.value.slice(start, start + pageSize.value)
})
const studioTodos = computed(() => getTodoItems(trainings.value))
const stats = computed(() => getDashboardStats(trainings.value))
const weekdayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const monthStart = computed(() => new Date(monthCursor.value.getFullYear(), monthCursor.value.getMonth(), 1))
const calendarStart = computed(() => {
  const first = monthStart.value
  const weekday = first.getDay() || 7
  return addDays(first, 1 - weekday)
})
const monthDays = computed(() => Array.from({ length: 42 }, (_, index) => {
  const date = addDays(calendarStart.value, index)
  const dateKey = formatDate(date)
  return {
    date: dateKey,
    dayOfMonth: date.getDate(),
    inCurrentMonth: date.getMonth() === monthCursor.value.getMonth(),
    isToday: dateKey === formatDate(new Date()),
    sessions: trainings.value
      .filter(item => item.startDate === dateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }
}))
const monthTitle = computed(() => {
  const year = monthCursor.value.getFullYear()
  const month = String(monthCursor.value.getMonth() + 1).padStart(2, '0')
  return `${year}年${month}月`
})
const monthTrainingCount = computed(() => monthDays.value
  .filter(day => day.inCurrentMonth)
  .reduce((total, day) => total + day.sessions.length, 0))
const scheduleFilterText = computed(() => {
  if (selectedDate.value) return `${selectedDate.value} 的排班`
  if (hasDateRange.value) return `${dateRange.value[0]} 至 ${dateRange.value[1]} 的排班`
  return '按 Excel 台账字段组织，优先减少重复翻表'
})

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date, days) => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + days)
  return next
}

const matchesDateFilter = (date) => {
  if (selectedDate.value) return date === selectedDate.value
  if (hasDateRange.value) {
    const [start, end] = dateRange.value
    return date >= start && date <= end
  }
  return true
}

const loadTrainings = () => {
  trainings.value = trainingPlans.filter(p => p.studio === userStore.currentStudio)
  currentPage.value = 1
}

const shiftMonth = (offset) => {
  monthCursor.value = new Date(monthCursor.value.getFullYear(), monthCursor.value.getMonth() + offset, 1)
}

const goCurrentMonth = () => {
  monthCursor.value = new Date()
}

const selectMonthDay = (date) => {
  selectedDate.value = selectedDate.value === date ? '' : date
  if (selectedDate.value) dateRange.value = []
  currentPage.value = 1
}

const handleDateRangeChange = () => {
  selectedDate.value = ''
  currentPage.value = 1
}

const clearDateFilter = () => {
  dateRange.value = []
  selectedDate.value = ''
  currentPage.value = 1
}

const getTodoTab = (title) => {
  if (title.includes('考核')) return 'assessment'
  if (title.includes('评价')) return 'evaluation'
  return 'execution'
}

const handleTodo = (todo) => {
  const training = trainings.value.find(item => item.id === todo.trainingId)
  router.push({
    path: '/admin/ledger',
    query: {
      sequenceNo: training?.sequenceNo || todo.trainingId,
      tab: getTodoTab(todo.title)
    }
  })
}

const goLedgerAssessment = (row) => {
  router.push({
    path: '/admin/ledger',
    query: {
      sequenceNo: row.sequenceNo,
      tab: 'assessment'
    }
  })
}

const openCreateDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const editPlan = (row) => {
  isEdit.value = true
  Object.assign(planForm, {
    id: row.id,
    courseName: row.courseName,
    trainingContent: row.trainingContent,
    tutorId: row.tutorId,
    studentIds: [...row.studentIds],
    startDate: row.startDate,
    startTime: row.startTime,
    endTime: row.endTime,
    purpose: row.purpose,
    executionRemark: row.executionRemark
  })
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(planForm, {
    id: null,
    courseName: '',
    trainingContent: '',
    tutorId: null,
    studentIds: [],
    startDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    executionRemark: ''
  })
  formRef.value?.clearValidate()
}

const submitPlan = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    submitting.value = true
    setTimeout(() => {
      ElMessage.success(isEdit.value ? '修改成功，原型数据未写回' : '创建成功，原型数据未写回')
      dialogVisible.value = false
      submitting.value = false
    }, 600)
  })
}

watch(() => userStore.currentStudio, () => {
  selectedDate.value = ''
  dateRange.value = []
  loadTrainings()
})
watch([statusFilter, selectedDate, dateRange, pageSize], () => {
  currentPage.value = 1
})

onMounted(loadTrainings)
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.summary-row,
.todo-card,
.month-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-title {
  font-weight: 700;
  color: #303133;
}

.card-subtitle,
.muted {
  color: #909399;
  font-size: 12px;
}

.card-subtitle {
  margin-left: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.todo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}

.student-tag,
.gap-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.todo-action {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 72px;
  padding: 10px 12px;
  text-align: left;
  border: 1px solid #f3d19e;
  border-radius: 8px;
  background: #fdf6ec;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.todo-action:hover {
  border-color: #e6a23c;
  box-shadow: 0 6px 16px rgba(230, 162, 60, 0.15);
  transform: translateY(-1px);
}

.todo-action-title {
  color: #7d4f00;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.todo-action-meta {
  color: #a36b00;
  font-size: 12px;
  line-height: 1.4;
}

.month-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 8px;
}

.month-weekdays span {
  color: #606266;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.month-day {
  min-height: 136px;
  padding: 12px;
  text-align: left;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.month-day:hover {
  border-color: #a0cfff;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.12);
  transform: translateY(-1px);
}

.month-day--today {
  border-color: #67c23a;
}

.month-day--active {
  border-color: #409eff;
  background: #ecf5ff;
}

.month-day--outside {
  opacity: 0.48;
  background: #f8fafc;
}

.month-day-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 13px;
}

.month-day-head strong {
  color: #303133;
  font-size: 14px;
}

.month-day-head span {
  color: #409eff;
  font-size: 12px;
  font-weight: 700;
}

.month-session-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.month-session {
  padding: 7px;
  border-radius: 6px;
  background: rgba(64, 158, 255, 0.08);
}

.month-session-title {
  color: #303133;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.month-session-meta,
.month-more {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.month-more {
  text-align: center;
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

@media (max-width: 1200px) {
  .month-grid,
  .month-weekdays {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
