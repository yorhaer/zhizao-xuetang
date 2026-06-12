<template>
  <div class="page-container">
    <el-row :gutter="16" class="summary-row">
      <el-col :span="8">
        <el-card shadow="never">
          <el-statistic title="自动闭环" :value="autoClosedTrainings.length">
            <template #suffix>场</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <el-statistic title="人工闭环" :value="manualClosedTrainings.length">
            <template #suffix>场</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <el-statistic title="待补闭环" :value="openTrainings.length">
            <template #suffix>场</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <span class="card-title">培训执行记录</span>
            <span class="card-subtitle">用于替代企微执行表回填和现场照片归档</span>
          </div>
          <el-button>导入企微执行表</el-button>
        </div>
      </template>

      <el-table :data="pagedTrainings" stripe style="width: 100%" @row-click="selectTraining">
        <el-table-column prop="courseName" label="培训主题" min-width="180" />
        <el-table-column prop="tutor" label="导师" width="90" />
        <el-table-column label="日期时间" width="180">
          <template #default="{ row }">
            <div>{{ row.startDate }}</div>
            <div class="muted">{{ row.startTime }}-{{ row.endTime }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getTrainingDisplayType(row)">{{ getTrainingDisplayStatus(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="照片" width="100">
          <template #default="{ row }">
            <el-tag :type="row.photos.length ? 'success' : 'warning'" size="small">
              {{ row.photos.length }}/3
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="executionRemark" label="执行备注" min-width="220" show-overflow-tooltip />
        <el-table-column label="闭环缺口" min-width="180">
          <template #default="{ row }">
            <template v-if="getTrainingGaps(row).length">
              <el-tag
                v-for="gap in getTrainingGaps(row)"
                :key="gap"
                size="small"
                type="warning"
                class="gap-tag"
              >
                {{ gap }}
              </el-tag>
            </template>
            <span v-else class="ok-text">{{ row.manualClosed ? '人工确认闭环' : '已闭环' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <span class="pagination-total">共 {{ trainings.length }} 场</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="trainings.length"
          layout="sizes, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ selectedTraining ? `${selectedTraining.courseName} - 执行详情` : '执行详情' }}</span>
          <el-tag v-if="selectedTraining" :type="getTrainingDisplayType(selectedTraining)">
            {{ getTrainingDisplayStatus(selectedTraining) }}
          </el-tag>
        </div>
      </template>

      <el-empty v-if="!selectedTraining" description="从上方表格选择一场培训" />

      <template v-else>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="工作室">{{ selectedTraining.studioName }}</el-descriptions-item>
          <el-descriptions-item label="导师">{{ selectedTraining.tutor }}</el-descriptions-item>
          <el-descriptions-item label="学员">{{ selectedTraining.students.join('、') }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ selectedTraining.startDate }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ selectedTraining.startTime }}-{{ selectedTraining.endTime }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ selectedTraining.source }}</el-descriptions-item>
        </el-descriptions>

        <el-alert
          :title="closureTitle"
          :description="closureDescription"
          :type="isTrainingClosed(selectedTraining) ? 'success' : 'warning'"
          :closable="false"
          show-icon
          class="closure-alert"
        />

        <el-form :model="executionForm" label-width="110px" class="execution-form">
          <el-form-item label="完成状态">
            <el-switch
              v-model="executionForm.completed"
              active-text="已完成"
              inactive-text="未完成"
            />
          </el-form-item>
          <el-form-item label="达成目的">
            <el-input v-model="executionForm.purpose" placeholder="记录本场培训达成目的" />
          </el-form-item>
          <el-form-item label="成果检验">
            <el-input v-model="executionForm.resultCheck" placeholder="例如：现场提问、拆解演示、线下考核" />
          </el-form-item>
          <el-form-item label="执行备注">
            <el-input
              v-model="executionForm.executionRemark"
              type="textarea"
              :rows="3"
              placeholder="缺席、顺延、补排等情况在这里说明"
            />
          </el-form-item>
          <el-form-item label="人工闭环">
            <el-switch
              v-model="executionForm.manualClosed"
              active-text="确认闭环"
              inactive-text="继续待补"
            />
          </el-form-item>
          <el-form-item v-if="executionForm.manualClosed" label="闭环说明">
            <el-input
              v-model="executionForm.manualCloseReason"
              type="textarea"
              :rows="2"
              placeholder="说明为何允许在资料未齐时闭环，例如纸质材料已归档、线下已确认"
            />
          </el-form-item>
        </el-form>

        <el-divider />

        <div class="upload-section">
          <div class="section-title">
            <span>现场照片</span>
            <span class="muted">JPG/PNG，单场最多 3 张</span>
          </div>
          <el-upload
            v-model:file-list="fileList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleRemove"
            multiple
            accept=".jpg,.jpeg,.png"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="existing-photos" v-if="selectedTraining.photos.length">
            <el-tag v-for="photo in selectedTraining.photos" :key="photo" type="success" effect="plain">
              {{ photo }}
            </el-tag>
          </div>
        </div>

        <div class="footer-actions">
          <el-button type="primary" @click="confirmSave" :loading="saving">
            保存执行记录
          </el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../../stores/user'
import {
  trainingPlans,
  getTrainingDisplayStatus,
  getTrainingDisplayType,
  getTrainingGaps,
  isTrainingAutoClosed,
  isTrainingClosed
} from '../../api/mockData'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const trainings = ref([])
const selectedTraining = ref(null)
const saving = ref(false)
const fileList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

const executionForm = reactive({
  completed: false,
  purpose: '',
  resultCheck: '',
  executionRemark: '',
  manualClosed: false,
  manualCloseReason: ''
})

const autoClosedTrainings = computed(() => trainings.value.filter(item => isTrainingAutoClosed(item) && !item.manualClosed))
const manualClosedTrainings = computed(() => trainings.value.filter(item => item.manualClosed))
const openTrainings = computed(() => trainings.value.filter(item => !isTrainingClosed(item)))
const pagedTrainings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return trainings.value.slice(start, start + pageSize.value)
})

const loadTrainings = () => {
  trainings.value = trainingPlans.filter(p => p.studio === userStore.currentStudio)
  selectedTraining.value = trainings.value[0] || null
  currentPage.value = 1
  syncForm()
}

const selectTraining = (row) => {
  selectedTraining.value = row
  fileList.value = []
  syncForm()
}

const syncForm = () => {
  if (!selectedTraining.value) return
  executionForm.completed = ['completed', 'assessed', 'evaluated'].includes(selectedTraining.value.status)
  executionForm.purpose = selectedTraining.value.purpose
  executionForm.resultCheck = selectedTraining.value.resultCheck
  executionForm.executionRemark = selectedTraining.value.executionRemark
  executionForm.manualClosed = Boolean(selectedTraining.value.manualClosed)
  executionForm.manualCloseReason = selectedTraining.value.manualCloseReason || ''
}

const closureTitle = computed(() => {
  if (!selectedTraining.value) return ''
  if (selectedTraining.value.manualClosed) return '已由人工确认闭环'
  if (isTrainingAutoClosed(selectedTraining.value)) return '系统已自动判定闭环'
  return '仍有闭环数据待补'
})

const closureDescription = computed(() => {
  if (!selectedTraining.value) return ''
  if (selectedTraining.value.manualClosed) return selectedTraining.value.manualCloseReason || '人工确认后，该场培训计入闭环完成。'
  const gaps = getTrainingGaps(selectedTraining.value)
  return gaps.length ? `待补：${gaps.join('、')}` : '考核、评价和执行资料均已齐全。'
})

const handleFileChange = (file, files) => {
  const existingCount = selectedTraining.value?.photos.length || 0
  if (existingCount + files.length > 3) {
    ElMessage.warning('单场现场照片最多 3 张')
    files.splice(3 - existingCount)
  }
  fileList.value = files
}

const handleRemove = (file, files) => {
  fileList.value = files
}

const confirmSave = () => {
  if (!selectedTraining.value) return
  saving.value = true
  setTimeout(() => {
    selectedTraining.value.manualClosed = executionForm.manualClosed
    selectedTraining.value.manualCloseReason = executionForm.manualCloseReason
    ElMessage.success(executionForm.manualClosed ? '已人工确认闭环，原型数据仅本次会话生效' : '执行记录已保存，原型数据仅本次会话生效')
    fileList.value = []
    saving.value = false
  }, 600)
}

watch(() => userStore.currentStudio, loadTrainings)
watch(pageSize, () => {
  currentPage.value = 1
})

onMounted(loadTrainings)
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.summary-row,
.detail-card {
  margin-top: 16px;
}

.card-header,
.section-title,
.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-weight: 700;
}

.card-subtitle,
.muted {
  color: #909399;
  font-size: 12px;
}

.card-subtitle {
  margin-left: 10px;
}

.gap-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.ok-text {
  color: #67c23a;
  font-weight: 600;
}

.execution-form {
  margin-top: 18px;
}

.closure-alert {
  margin-top: 16px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.existing-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.footer-actions {
  justify-content: flex-end;
  margin-top: 18px;
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
