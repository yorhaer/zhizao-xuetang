<template>
  <div class="page-container fade-in-up">
    <div class="summary-strip">
      <div class="summary-metric">
        <div class="summary-icon amber">⭐</div>
        <div>
          <div class="stat-label">学员评导师</div>
          <div class="stat-value">{{ studentToTutorStats.avg.toFixed(1) }}<sup>/5.0</sup></div>
          <div class="stat-note">{{ studentToTutorStats.count }}条评价</div>
        </div>
      </div>
      <div class="summary-metric">
        <div class="summary-icon indigo">讲</div>
        <div>
          <div class="stat-label">导师评学员</div>
          <div class="stat-value">{{ tutorToStudentStats.avg.toFixed(1) }}<sup>/5.0</sup></div>
          <div class="stat-note">{{ tutorToStudentStats.count }}条评价</div>
        </div>
      </div>
      <div class="summary-metric">
        <div class="summary-icon blue">微</div>
        <div>
          <div class="stat-label">企微来源</div>
          <div class="stat-value">{{ wecomCount }}<sup>条</sup></div>
          <div class="stat-note">移动端收集</div>
        </div>
      </div>
      <div class="summary-metric" :class="{ 'summary-metric--alert': missingEvaluationTrainings.length > 0 }">
        <div class="summary-icon amber">缺</div>
        <div>
          <div class="stat-label">缺评价培训</div>
          <div class="stat-value">{{ missingEvaluationTrainings.length }}<sup>场</sup></div>
          <div class="stat-note">影响台账闭环</div>
        </div>
      </div>
    </div>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <span class="card-title">评价汇总</span>
            <span class="card-subtitle">合并系统内评价与企微导入评价</span>
          </div>
          <div class="header-actions">
            <el-select v-model="typeFilter" style="width: 150px">
              <el-option label="全部类型" value="all" />
              <el-option label="学员评导师" value="student_to_tutor" />
              <el-option label="导师评学员" value="tutor_to_student" />
            </el-select>
            <el-button>导入企微评价表</el-button>
            <el-button type="primary">导出评价明细</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredEvaluations" stripe style="width: 100%">
        <el-table-column prop="typeText" label="类型" width="120" />
        <el-table-column prop="courseName" label="培训主题" min-width="180" />
        <el-table-column prop="evaluator" label="评价人" width="110" />
        <el-table-column prop="target" label="被评价人" width="110" />
        <el-table-column label="评分" width="150">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="内容" min-width="220" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" width="110">
          <template #default="{ row }">
            <el-tag :type="row.source === '企微导入' ? 'success' : 'info'" size="small">
              {{ row.source }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="missing-card" shadow="never">
      <template #header>
        <span>缺评价提醒</span>
      </template>
      <el-table :data="missingEvaluationTrainings" stripe style="width: 100%">
        <el-table-column prop="courseName" label="培训主题" min-width="180" />
        <el-table-column prop="studioName" label="工作室" width="140" />
        <el-table-column prop="tutor" label="导师" width="100" />
        <el-table-column prop="startDate" label="培训日期" width="120" />
        <el-table-column label="缺口" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="gap in getTrainingGaps(row).filter(item => item.includes('评价'))"
              :key="gap"
              type="warning"
              size="small"
              class="gap-tag"
            >
              {{ gap }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { trainingPlans, students, tutors, getTrainingGaps } from '../../api/mockData'

const typeFilter = ref('all')

const getStudentName = (studentId) => students.find(item => item.id === studentId)?.name || '未知学员'
const getTutorName = (tutorId) => tutors.find(item => item.id === tutorId)?.name || '未知导师'

const evaluations = computed(() => trainingPlans.flatMap(plan => plan.evaluations.map(item => {
  const isStudentToTutor = item.type === 'student_to_tutor'
  return {
    ...item,
    courseName: plan.courseName,
    studioName: plan.studioName,
    typeText: isStudentToTutor ? '学员评导师' : '导师评学员',
    evaluator: isStudentToTutor ? getStudentName(item.studentId) : getTutorName(item.tutorId),
    target: isStudentToTutor ? getTutorName(item.tutorId) : getStudentName(item.studentId)
  }
})))

const filteredEvaluations = computed(() => {
  if (typeFilter.value === 'all') return evaluations.value
  return evaluations.value.filter(item => item.type === typeFilter.value)
})

const summarize = (type) => {
  const rows = evaluations.value.filter(item => item.type === type)
  const total = rows.reduce((sum, item) => sum + item.rating, 0)
  return {
    count: rows.length,
    avg: rows.length ? total / rows.length : 0
  }
}

const studentToTutorStats = computed(() => summarize('student_to_tutor'))
const tutorToStudentStats = computed(() => summarize('tutor_to_student'))
const wecomCount = computed(() => evaluations.value.filter(item => item.source === '企微导入').length)
const missingEvaluationTrainings = computed(() => trainingPlans.filter(plan =>
  getTrainingGaps(plan).some(item => item.includes('评价'))
))
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.summary-strip,
.missing-card {
  margin-bottom: 16px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--border-light);
  box-shadow: var(--shadow-sm);
}

.summary-metric {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  min-height: 82px;
  padding: 12px 14px;
  background: var(--bg-surface);
}

.summary-metric--alert {
  background: #fffbeb;
}

.summary-icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
}

.summary-icon.amber {
  color: #b45309;
  background: #fef3c7;
}

.summary-icon.indigo {
  color: #4f46e5;
  background: #eef2ff;
}

.summary-icon.blue {
  color: #2563eb;
  background: #dbeafe;
}

.card-subtitle {
  color: #909399;
  font-size: 12px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 12px;
}

.stat-value {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.stat-value sup {
  margin-left: 3px;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
}

.stat-note {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-title {
  font-weight: 700;
}

.card-subtitle {
  margin-left: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gap-tag {
  margin-right: 6px;
}

@media (max-width: 900px) {
  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
