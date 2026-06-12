<template>
  <div class="page-container fade-in-up">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>学员评价</h2>
        <p>对已执行培训的学员进行星级评价，系统将自动换算为百分制分数</p>
      </div>
    </div>

    <!-- Empty state: no trainings at all -->
    <div v-if="trainingsWithStudents.length === 0" class="empty-wrap section-card">
      <el-empty description="暂无可评价的培训" />
    </div>

    <!-- Training cards -->
    <div v-else class="training-list">
      <div
        v-for="training in trainingsWithStudents"
        :key="training.id"
        class="training-card"
      >
        <!-- Card header -->
        <div class="training-card__header">
          <div class="training-card__title-row">
            <span class="training-card__icon">📚</span>
            <div>
              <div class="training-card__name">{{ training.courseName }}</div>
              <div class="training-card__meta">
                {{ training.startDate }}
                <span class="meta-sep">→</span>
                {{ training.endDate }}
                &ensp;·&ensp;
                <span class="meta-count">{{ training.students.length }} 名学员</span>
              </div>
            </div>
          </div>

          <div class="progress-pill">
            <span class="progress-done">
              {{ training.students.filter(s => s.evaluated).length }}
            </span>
            <span class="progress-sep">/</span>
            <span class="progress-total">{{ training.students.length }}</span>
            <span class="progress-label">已评</span>
          </div>
        </div>

        <!-- Student grid -->
        <div class="student-grid">
          <div
            v-for="student in training.students"
            :key="student.id"
            class="student-item"
            :class="{ 'student-item--evaluated': student.evaluated }"
          >
            <div class="student-item__avatar" :class="student.evaluated ? 'avatar--done' : 'avatar--pending'">
              {{ (student.name || '？').charAt(0) }}
            </div>
            <div class="student-item__info">
              <div class="student-item__name">{{ student.name }}</div>
              <div v-if="student.evaluated" class="student-item__rating">
                <el-rate
                  v-model="student.rating"
                  disabled
                  show-score
                  text-color="#f59e0b"
                  score-template="{value}"
                  size="small"
                />
              </div>
              <div v-else class="student-item__status">待评价</div>
            </div>
            <el-button
              v-if="!student.evaluated"
              type="primary"
              size="small"
              class="evaluate-btn"
              @click="openEvaluateDialog(training, student)"
            >
              评价
            </el-button>
            <span v-else class="evaluated-badge">✓ 已完成</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Evaluate Dialog -->
    <el-dialog
      v-model="evaluateDialogVisible"
      :title="`评价学员 · ${currentStudent.name}`"
      width="520px"
      destroy-on-close
    >
      <div class="dialog-context-bar">
        <span class="dialog-context-icon">📚</span>
        <span class="dialog-context-text">{{ currentTraining.courseName }}</span>
      </div>

      <el-form
        :model="evaluateForm"
        :rules="rules"
        ref="formRef"
        label-width="90px"
        style="margin-top: 20px"
      >
        <el-form-item label="星级评分" prop="rating">
          <el-rate
            v-model="evaluateForm.rating"
            :texts="['很差', '较差', '一般', '较好', '很好']"
            show-text
            text-color="#f59e0b"
          />
          <div class="rating-hint">1–5 星，系统换算为百分制（20 / 40 / 60 / 80 / 100）</div>
        </el-form-item>

        <el-form-item label="评价内容" prop="comment">
          <el-input
            v-model="evaluateForm.comment"
            type="textarea"
            :rows="5"
            placeholder="请输入您对该学员的培训表现评价（至少 10 字）..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="evaluateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEvaluate" :loading="submitting">
          提交评价
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { getUserTrainings, students } from '../../api/mockData'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const trainings = ref([])
const evaluateDialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const currentTraining = reactive({ courseName: '' })
const currentStudent = reactive({ id: 0, name: '' })

const evaluateForm = reactive({
  rating: 0,
  comment: ''
})

const rules = {
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
  comment: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 10, message: '评价内容至少10个字', trigger: 'blur' }
  ]
}

// BUG FIX: match only tutor_to_student evaluations; use .rating not .tutorRating
const trainingsWithStudents = computed(() => {
  return trainings.value.map(training => ({
    ...training,
    students: training.students.map((name, index) => {
      const studentId = training.studentIds[index]
      const existingEval = training.evaluations?.find(
        e => e.type === 'tutor_to_student' && e.studentId === studentId
      )
      return {
        id: studentId,
        name,
        evaluated: !!existingEval,
        rating: existingEval ? existingEval.rating || 0 : 0
      }
    })
  }))
})

const loadTrainings = () => {
  const allTrainings = getUserTrainings(1, 'tutor')
  trainings.value = allTrainings
}

const openEvaluateDialog = (training, student) => {
  currentTraining.courseName = training.courseName
  currentTraining.id = training.id
  currentStudent.id = student.id
  currentStudent.name = student.name
  evaluateForm.rating = 0
  evaluateForm.comment = ''
  evaluateDialogVisible.value = true
}

const submitEvaluate = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        ElMessage.success('评价提交成功！')
        evaluateDialogVisible.value = false
        submitting.value = false
        loadTrainings()
      }, 1000)
    }
  })
}

onMounted(() => {
  loadTrainings()
})
</script>

<style scoped>
/* Training list */
.training-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Training card */
.training-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}

.training-card:hover {
  box-shadow: var(--shadow-md);
}

/* Card header */
.training-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-surface-subtle);
  border-bottom: 1px solid var(--border-light);
}

.training-card__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.training-card__icon {
  font-size: 22px;
  flex-shrink: 0;
}

.training-card__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.training-card__meta {
  margin-top: 3px;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-sep {
  color: var(--border-medium);
}

.meta-count {
  color: var(--color-primary);
  font-weight: 500;
}

/* Progress pill */
.progress-pill {
  display: flex;
  align-items: baseline;
  gap: 2px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  padding: 4px 14px;
  font-size: 13px;
  white-space: nowrap;
}

.progress-done {
  font-weight: 700;
  color: var(--color-success);
  font-size: 15px;
}

.progress-sep {
  color: var(--text-muted);
  margin: 0 1px;
}

.progress-total {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
}

.progress-label {
  margin-left: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

/* Student grid */
.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1px;
  background: var(--border-light);
}

/* Student item */
.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-surface);
  transition: background var(--transition-fast);
}

.student-item:hover {
  background: var(--color-primary-subtle);
}

.student-item--evaluated {
  background: var(--bg-surface-subtle);
}

/* Avatar */
.student-item__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.avatar--pending {
  background: linear-gradient(135deg, #eef2ff, #c7d2fe);
  color: var(--color-primary);
}

.avatar--done {
  background: linear-gradient(135deg, #ecfdf5, #a7f3d0);
  color: var(--color-success);
}

/* Info area */
.student-item__info {
  flex: 1;
  min-width: 0;
}

.student-item__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3px;
}

.student-item__rating {
  display: flex;
  align-items: center;
}

.student-item__status {
  font-size: 12px;
  color: var(--text-muted);
}

/* Action area */
.evaluate-btn {
  flex-shrink: 0;
}

.evaluated-badge {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

/* Dialog extras */
.dialog-context-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-primary-subtle);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary-light);
}

.dialog-context-icon {
  font-size: 18px;
}

.dialog-context-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.rating-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Empty wrap */
.empty-wrap {
  padding: 48px 0;
}

.section-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}
</style>
