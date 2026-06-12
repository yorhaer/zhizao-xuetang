<template>
  <div class="page-container fade-in-up">
    <el-page-header @back="$router.back()" title="返回">
      <template #content>
        <span class="page-back-title">{{ training.courseName }} — 考核结果</span>
      </template>
    </el-page-header>

    <div class="detail-body">
      <!-- 课程基础信息 -->
      <div class="info-banner">
        <div class="info-banner-main">
          <div class="info-row">
            <span class="info-icon">👨‍🏫</span>
            <span>导师：<strong>{{ training.tutor }}</strong></span>
          </div>
          <div class="info-row">
            <span class="info-icon">📅</span>
            <span>{{ training.startDate }}</span>
          </div>
        </div>
      </div>

      <!-- 成绩展示 -->
      <div v-if="myAssessment" class="score-showcase">
        <div class="score-bg-deco"></div>
        <div class="score-content">
          <div class="score-label-top">我的考核成绩</div>
          <div class="score-big">
            <span class="score-number" :class="getScoreClass(myAssessment.score)">{{ myAssessment.score }}</span>
            <span class="score-unit">分</span>
          </div>
          <div class="score-result-badge" :class="getScoreClass(myAssessment.score)">
            {{ myAssessment.result }}
          </div>
          <div class="score-remark" v-if="myAssessment.remark">
            💬 {{ myAssessment.remark }}
          </div>
          <div class="congrats-text">🎉 恭喜完成培训考核！</div>
        </div>
      </div>
      <div v-else class="section-card" style="margin-top:16px">
        <el-empty description="暂无考核结果，请等待导师录入" />
      </div>

      <!-- 导师对我的评价（Bug修复：区分类型） -->
      <div class="section-card" style="margin-top:16px" v-if="tutorEvalForMe">
        <div class="section-label">👨‍🏫 导师对您的评价</div>
        <div class="eval-card">
          <el-rate v-model="tutorEvalForMe.rating" disabled show-score text-color="#ff9900" />
          <p class="eval-comment">{{ tutorEvalForMe.comment }}</p>
        </div>
      </div>

      <!-- 我对导师的评价 -->
      <div class="section-card" style="margin-top:16px" v-if="myEvalForTutor">
        <div class="section-label">⭐ 您对导师的评价</div>
        <div class="eval-card">
          <el-rate v-model="myEvalForTutor.rating" disabled show-score text-color="#ff9900" />
          <p class="eval-comment">{{ myEvalForTutor.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { trainingPlans } from '../../api/mockData'

const route = useRoute()
const training = ref({})
const currentStudentId = 1

// Bug修复：正确使用类型过滤
const myAssessment = computed(() => training.value.assessments?.find(a => a.studentId === currentStudentId) || null)
const myEvalForTutor = computed(() =>
  training.value.evaluations?.find(e => e.type === 'student_to_tutor' && e.studentId === currentStudentId) || null
)
const tutorEvalForMe = computed(() =>
  training.value.evaluations?.find(e => e.type === 'tutor_to_student' && e.studentId === currentStudentId) || null
)

const getScoreClass = (score) => score >= 90 ? 'excellent' : score >= 60 ? 'pass' : 'fail'

onMounted(() => {
  const id = parseInt(route.params.id)
  training.value = trainingPlans.find(p => p.id === id) || {}
})
</script>

<style scoped>
.page-back-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.detail-body { margin-top: 20px; }

.info-banner {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  gap: 24px;
  box-shadow: var(--shadow-sm);
}

.info-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); }
.info-icon { font-size: 18px; }

/* 成绩展示 */
.score-showcase {
  position: relative;
  margin-top: 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1a2642 50%, #1e3a5f 100%);
  border-radius: var(--radius-xl);
  padding: 40px;
  text-align: center;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.score-bg-deco {
  position: absolute;
  top: -40px; right: -40px;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: rgba(79,110,242,0.1);
  pointer-events: none;
}

.score-content { position: relative; z-index: 2; }

.score-label-top {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.score-big { display: flex; align-items: baseline; justify-content: center; gap: 6px; margin-bottom: 16px; }

.score-number {
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
}

.excellent { color: #34d399; }
.pass { color: #60a5fa; }
.fail { color: #fb7185; }

.score-unit { font-size: 24px; font-weight: 600; color: #94a3b8; }

.score-result-badge {
  display: inline-block;
  padding: 6px 20px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
  background: rgba(255,255,255,0.08);
}

.score-remark {
  font-size: 14px;
  color: #94a3b8;
  background: rgba(255,255,255,0.05);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  margin-bottom: 12px;
}

.congrats-text { font-size: 14px; color: #64748b; }

/* 评价卡 */
.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.section-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 14px;
}

.eval-card {
  background: var(--bg-surface-subtle);
  border-radius: var(--radius-md);
  padding: 16px;
}

.eval-comment { margin-top: 10px; color: var(--text-secondary); font-size: 14px; line-height: 1.6; }
</style>
