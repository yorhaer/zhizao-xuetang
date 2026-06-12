<template>
  <div class="page-container fade-in-up">
    <div class="stats-grid three-col">
      <div class="stat-card" :class="{ 'stat-card--alert': pendingAssessments.length > 0 }">
        <div class="stat-icon amber">⏳</div>
        <div class="stat-content">
          <div class="stat-label">待录考核</div>
          <div class="stat-value">{{ pendingAssessments.length }}<sup>场</sup></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div class="stat-content">
          <div class="stat-label">已录考核</div>
          <div class="stat-value">{{ enteredAssessments.length }}<sup>场</sup></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rose">⚠️</div>
        <div class="stat-content">
          <div class="stat-label">未通过人次</div>
          <div class="stat-value">{{ failedCount }}<sup>人</sup></div>
        </div>
      </div>
    </div>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <span class="card-title">考核录入</span>
            <span class="card-subtitle">线下考核后按培训主题批量录入分数</span>
          </div>
          <el-select v-model="selectedTrainingId" placeholder="选择培训" style="width: 260px">
            <el-option
              v-for="training in assessableTrainings"
              :key="training.id"
              :label="`${training.courseName} / ${training.startDate}`"
              :value="training.id"
            />
          </el-select>
        </div>
      </template>

      <el-empty v-if="!selectedTraining" description="请选择一场已执行培训" />

      <template v-else>
        <el-descriptions :column="3" border class="training-info">
          <el-descriptions-item label="培训主题">{{ selectedTraining.courseName }}</el-descriptions-item>
          <el-descriptions-item label="导师">{{ selectedTraining.tutor }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ selectedTraining.startDate }}</el-descriptions-item>
          <el-descriptions-item label="培训内容">{{ selectedTraining.trainingContent }}</el-descriptions-item>
          <el-descriptions-item label="成果检验">{{ selectedTraining.resultCheck || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ selectedTraining.source }}</el-descriptions-item>
        </el-descriptions>

        <el-table :data="assessmentRows" border style="width: 100%" class="assessment-table">
          <el-table-column prop="studentName" label="学员姓名" width="140" />
          <el-table-column prop="company" label="所属公司" width="140" />
          <el-table-column label="分数" width="180">
            <template #default="{ row }">
              <el-input-number
                v-model="row.score"
                :min="0"
                :max="100"
                controls-position="right"
              />
            </template>
          </el-table-column>
          <el-table-column label="通过状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.score >= 60 ? 'success' : 'danger'">
                {{ row.score >= 60 ? '通过' : '未通过' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template #default="{ row }">
              <el-input v-model="row.remark" placeholder="例如：需补考、理论需巩固" />
            </template>
          </el-table-column>
        </el-table>

        <div class="footer-actions">
          <el-alert
            type="info"
            :closable="false"
            title="保存后学员可在“我的考核”中查看结果，台账状态进入已考核。"
          />
          <el-button type="primary" @click="saveAssessments" :loading="saving">
            批量保存
          </el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { trainingPlans, students } from '../../api/mockData'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const selectedTrainingId = ref(null)
const assessmentRows = ref([])
const saving = ref(false)

const studioTrainings = computed(() => trainingPlans.filter(plan => plan.studio === userStore.currentStudio))
const assessableTrainings = computed(() => studioTrainings.value.filter(plan => ['completed', 'assessed', 'evaluated'].includes(plan.status)))
const selectedTraining = computed(() => assessableTrainings.value.find(plan => plan.id === selectedTrainingId.value))
const pendingAssessments = computed(() => assessableTrainings.value.filter(plan => plan.assessments.length === 0))
const enteredAssessments = computed(() => assessableTrainings.value.filter(plan => plan.assessments.length > 0))
const failedCount = computed(() => studioTrainings.value.flatMap(plan => plan.assessments).filter(item => item.score < 60).length)

const buildRows = () => {
  if (!selectedTraining.value) {
    assessmentRows.value = []
    return
  }
  assessmentRows.value = selectedTraining.value.studentIds.map((studentId, index) => {
    const student = students.find(item => item.id === studentId)
    const existing = selectedTraining.value.assessments.find(item => item.studentId === studentId)
    return {
      studentId,
      studentName: selectedTraining.value.students[index],
      company: student?.company || '未维护',
      score: existing?.score ?? 80,
      remark: existing?.remark || ''
    }
  })
}

const saveAssessments = () => {
  if (!selectedTraining.value) return
  saving.value = true
  setTimeout(() => {
    ElMessage.success('考核成绩已保存，原型数据未写回')
    saving.value = false
  }, 600)
}

const resetSelectedTraining = () => {
  selectedTrainingId.value = assessableTrainings.value[0]?.id || null
  buildRows()
}

watch(selectedTrainingId, buildRows)
watch(() => userStore.currentStudio, resetSelectedTraining)

onMounted(resetSelectedTraining)
</script>

<style scoped>
.stats-grid.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card--alert {
  border-color: #fcd34d !important;
  background: linear-gradient(135deg, #fff, #fffbeb) !important;
}

.stat-icon.rose { background: linear-gradient(135deg, var(--color-danger-bg), #ffe4e6); color: #e11d48; }

.card-header,
.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-title { font-weight: 700; }

.card-subtitle {
  margin-left: 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.training-info,
.assessment-table {
  margin-top: 16px;
}

.footer-actions { margin-top: 16px; }
.footer-actions .el-alert { flex: 1; }
</style>
