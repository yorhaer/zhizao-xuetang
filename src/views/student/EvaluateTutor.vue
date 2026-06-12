<template>
  <div class="page-container fade-in-up">
    <el-page-header @back="$router.back()" title="返回">
      <template #content>
        <span class="page-back-title">评价导师 — {{ training.tutor }}</span>
      </template>
    </el-page-header>

    <div class="detail-body">
      <!-- 培训信息提要 -->
      <div class="training-banner">
        <div class="banner-icon">🎓</div>
        <div class="banner-content">
          <div class="banner-title">{{ training.courseName }}</div>
          <div class="banner-meta">
            <span>{{ training.tutor }}</span>
            <span class="meta-sep">·</span>
            <span>{{ training.startDate }}</span>
          </div>
        </div>
      </div>

      <!-- 评价表单 -->
      <div class="eval-form-card">
        <div class="eval-section">
          <div class="eval-section-title">📊 总体评分</div>
          <div class="rate-wrapper">
            <el-rate
              v-model="evaluationForm.rating"
              :texts="['很差', '较差', '一般', '较好', '很好']"
              show-text
              text-color="#f59e0b"
              :colors="['#f43f5e', '#f97316', '#f59e0b', '#10b981', '#4f6ef2']"
            />
            <div class="rate-hint">1–5 星评分，将换算为 20–100 分制</div>
          </div>
          <div class="rating-preview" v-if="evaluationForm.rating">
            <span class="rating-score">{{ evaluationForm.rating * 20 }}</span>
            <span class="rating-unit">分</span>
            <span class="rating-label">/ 100</span>
          </div>
        </div>

        <el-divider />

        <div class="eval-section">
          <div class="eval-section-title">💬 评价内容</div>
          <el-input
            v-model="evaluationForm.comment"
            type="textarea"
            :rows="5"
            placeholder="请填写您对导师的评价，例如：讲解清晰、耐心指导、内容实用…（至少 10 字）"
            maxlength="500"
            show-word-limit
          />
        </div>

        <div class="form-actions">
          <el-button @click="$router.back()" style="min-width:100px">取消</el-button>
          <el-button type="primary" @click="submitEvaluation" :loading="submitting" style="min-width:140px">
            提交评价
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trainingPlans } from '../../api/mockData'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const training = ref({})

const evaluationForm = reactive({ rating: 0, comment: '' })

const submitEvaluation = async () => {
  if (!evaluationForm.rating || evaluationForm.rating === 0) {
    ElMessage.warning('请选择评分（1–5 星）')
    return
  }
  if (!evaluationForm.comment || evaluationForm.comment.trim().length < 10) {
    ElMessage.warning('评价内容至少 10 个字')
    return
  }
  submitting.value = true
  setTimeout(() => {
    ElMessage.success('评价提交成功！')
    router.push('/student/training')
    submitting.value = false
  }, 1000)
}

onMounted(() => {
  const id = parseInt(route.params.id)
  training.value = trainingPlans.find(p => p.id === id) || {}
})
</script>

<style scoped>
.page-back-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.detail-body { margin-top: 20px; display: flex; flex-direction: column; gap: 16px; }

.training-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  box-shadow: var(--shadow-sm);
}

.banner-icon { font-size: 32px; }

.banner-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.banner-meta { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: flex; gap: 6px; }
.meta-sep { color: var(--border-medium); }

/* 评价表单卡 */
.eval-form-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.eval-section { margin-bottom: 4px; }
.eval-section-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; }

.rate-wrapper { display: flex; flex-direction: column; gap: 8px; }
.rate-hint { font-size: 12px; color: var(--text-muted); }

.rating-preview {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 10px;
  padding: 8px 20px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
}

.rating-score { font-size: 28px; font-weight: 800; color: var(--color-primary); }
.rating-unit { font-size: 16px; font-weight: 600; color: var(--color-primary); }
.rating-label { font-size: 13px; color: var(--text-muted); }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}
</style>
