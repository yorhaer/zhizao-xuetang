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
          <el-statistic title="已完成" :value="stats.completedTraining">
            <template #suffix>场</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <el-statistic title="完成率" :value="stats.completionRate">
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
        <el-tag
          v-for="todo in studioTodos"
          :key="todo.id"
          effect="plain"
          class="todo-tag"
          type="warning"
        >
          {{ todo.courseName }}：{{ todo.title }}（{{ todo.owner }}）
        </el-tag>
      </div>
      <el-empty v-else description="当前没有待补数据" />
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <span class="card-title">培训台账</span>
            <span class="card-subtitle">按 Excel 台账字段组织，优先减少重复翻表</span>
          </div>
          <div class="header-actions">
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
              <el-option label="未开始" value="upcoming" />
              <el-option label="已完成" value="completed" />
              <el-option label="已考核" value="assessed" />
              <el-option label="已评价" value="evaluated" />
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

      <el-table :data="filteredTrainings" stripe style="width: 100%" row-key="id">
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
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
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
            <el-button size="small" type="primary" plain v-if="row.status === 'completed'">
              录考核
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
import { useUserStore } from '../../stores/user'
import {
  trainingPlans,
  tutors,
  students,
  getStatusText,
  getStatusType,
  getTrainingGaps,
  getTodoItems,
  getDashboardStats
} from '../../api/mockData'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const trainings = ref([])
const statusFilter = ref('')
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
const filteredTrainings = computed(() => statusFilter.value ? trainings.value.filter(item => item.status === statusFilter.value) : trainings.value)
const studioTodos = computed(() => getTodoItems(trainings.value))
const stats = computed(() => getDashboardStats(trainings.value))

const loadTrainings = () => {
  trainings.value = trainingPlans.filter(p => p.studio === userStore.currentStudio)
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

watch(() => userStore.currentStudio, loadTrainings)

onMounted(loadTrainings)
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.summary-row,
.todo-card {
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
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.todo-tag,
.student-tag,
.gap-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}
</style>
