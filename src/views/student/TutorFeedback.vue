<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">导师评价</h1>
        <p class="page-subtitle">阶段结束后对本阶段导师进行评价，评价内容仅管理员可见</p>
      </div>
    </div>

    <!-- 提示横幅 -->
    <div class="info-banner">
      <span class="banner-icon">🔒</span>
      <span>您的评价内容仅管理员可见，导师本人不会收到通知，请如实填写</span>
    </div>

    <!-- 评价表单 -->
    <div class="section-card">
      <div v-if="!submitted">
        <h2 class="section-title">填写本阶段评价</h2>
        <div class="form-meta">
          <div class="meta-item">
            <span class="meta-label">当前阶段</span>
            <span class="meta-val">2025年 第二期</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">我的导师</span>
            <span class="meta-val">王师傅</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">评价截止</span>
            <span class="meta-val deadline">2025-12-31</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">综合评分</label>
          <div class="star-row">
            <button
              v-for="n in 5"
              :key="n"
              class="star-btn"
              :class="{ active: n <= form.rating }"
              @click="form.rating = n"
            >★</button>
            <span class="star-hint">{{ ratingLabel }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">教学方法</label>
          <div class="tag-group">
            <button
              v-for="tag in teachingTags"
              :key="tag"
              class="tag-btn"
              :class="{ selected: form.tags.includes(tag) }"
              @click="toggleTag(tag)"
            >{{ tag }}</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">文字评语 <span class="optional">（选填）</span></label>
          <textarea
            v-model="form.comment"
            class="textarea"
            rows="5"
            placeholder="请描述导师的教学风格、对您的帮助、改进建议等..."
          ></textarea>
          <span class="char-count">{{ form.comment.length }} / 500</span>
        </div>

        <div class="form-actions">
          <button class="btn-submit" @click="handleSubmit" :disabled="form.rating === 0">
            提交评价
          </button>
          <span class="save-hint">{{ form.rating === 0 ? '请先选择评分' : '评价提交后不可修改' }}</span>
        </div>
      </div>

      <!-- 已提交状态 -->
      <div v-else class="submitted-state">
        <div class="success-icon">✅</div>
        <h3>评价已提交</h3>
        <p>感谢您的反馈，管理员将查阅您的评价内容</p>
        <div class="submitted-summary">
          <div class="summary-stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ lit: n <= form.rating }">★</span>
          </div>
          <p class="summary-comment">{{ form.comment || '（未填写文字评语）' }}</p>
        </div>
      </div>
    </div>

    <!-- 历史评价记录 -->
    <div class="section-card">
      <h2 class="section-title">历史评价记录</h2>
      <div v-if="history.length === 0" class="empty-state">
        <span>暂无历史评价</span>
      </div>
      <div v-else class="history-list">
        <div v-for="item in history" :key="item.id" class="history-item">
          <div class="history-header">
            <span class="history-period">{{ item.period }}</span>
            <span class="history-tutor">导师：{{ item.tutor }}</span>
            <div class="history-stars">
              <span v-for="n in 5" :key="n" class="star-sm" :class="{ lit: n <= item.rating }">★</span>
            </div>
          </div>
          <p class="history-comment">{{ item.comment }}</p>
          <span class="history-date">评价于 {{ item.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const submitted = ref(false)
const form = ref({ rating: 0, tags: [], comment: '' })

const teachingTags = ['讲解清晰', '耐心负责', '实操指导好', '理论扎实', '互动性强', '严格要求']

const ratingLabels = ['', '较差', '一般', '良好', '很好', '非常好']
const ratingLabel = computed(() => ratingLabels[form.value.rating] || '')

const toggleTag = (tag) => {
  const idx = form.value.tags.indexOf(tag)
  if (idx >= 0) form.value.tags.splice(idx, 1)
  else form.value.tags.push(tag)
}

const handleSubmit = () => {
  if (form.value.rating === 0) return
  submitted.value = true
}

const history = ref([
  {
    id: 1,
    period: '2025年 第一期',
    tutor: '李师傅',
    rating: 4,
    comment: '李师傅教学认真，对数控操作讲解很细致，遇到不懂的地方也会耐心解答。实操课上给了很多实用技巧。',
    date: '2025-06-30'
  }
])
</script>

<style scoped>
.page { padding: 28px 32px; max-width: 800px; }

.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: var(--text-muted); margin: 0; }

.info-banner {
  display: flex; align-items: center; gap: 10px;
  background: rgba(79, 110, 242, 0.08);
  border: 1px solid rgba(79, 110, 242, 0.2);
  border-radius: var(--radius-md);
  padding: 12px 16px; margin-bottom: 20px;
  font-size: 13px; color: var(--text-secondary);
}
.banner-icon { font-size: 16px; }

.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 24px; margin-bottom: 20px;
}
.section-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 20px; }

.form-meta {
  display: flex; gap: 24px; flex-wrap: wrap;
  padding: 12px 16px; margin-bottom: 24px;
  background: var(--bg-surface-subtle);
  border-radius: var(--radius-md);
}
.meta-item { display: flex; flex-direction: column; gap: 2px; }
.meta-label { font-size: 11px; color: var(--text-muted); }
.meta-val { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.meta-val.deadline { color: var(--color-warning); }

.form-group { margin-bottom: 22px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; }
.optional { font-weight: 400; color: var(--text-muted); }

.star-row { display: flex; align-items: center; gap: 6px; }
.star-btn {
  background: none; border: none; cursor: pointer;
  font-size: 28px; color: #d1d5db; transition: color 0.15s, transform 0.1s;
  padding: 0; line-height: 1;
}
.star-btn:hover, .star-btn.active { color: #f59e0b; }
.star-btn:hover { transform: scale(1.15); }
.star-hint { font-size: 13px; color: var(--text-muted); margin-left: 8px; }

.tag-group { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-btn {
  padding: 6px 14px; border-radius: var(--radius-full);
  border: 1px solid var(--border-medium);
  background: transparent; font-size: 12px; color: var(--text-secondary);
  cursor: pointer; transition: all 0.15s;
}
.tag-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.tag-btn.selected { background: rgba(79,110,242,0.1); border-color: var(--color-primary); color: var(--color-primary); font-weight: 600; }

.textarea {
  width: 100%; padding: 12px 14px;
  background: var(--bg-surface-subtle); border: 1px solid var(--border-light);
  border-radius: var(--radius-md); color: var(--text-primary);
  font-size: 14px; line-height: 1.6; resize: vertical;
  box-sizing: border-box; transition: border-color 0.15s;
}
.textarea:focus { outline: none; border-color: var(--color-primary); }
.char-count { font-size: 11px; color: var(--text-muted); float: right; margin-top: 4px; }

.form-actions { display: flex; align-items: center; gap: 14px; margin-top: 8px; }
.btn-submit {
  padding: 10px 28px; border-radius: var(--radius-md); border: none;
  background: var(--color-primary); color: white;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.btn-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.save-hint { font-size: 12px; color: var(--text-muted); }

/* Submitted state */
.submitted-state { text-align: center; padding: 20px; }
.success-icon { font-size: 48px; margin-bottom: 12px; }
.submitted-state h3 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; }
.submitted-state p { font-size: 14px; color: var(--text-muted); margin: 0 0 20px; }
.submitted-summary { text-align: center; padding: 16px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); }
.summary-stars { display: flex; justify-content: center; gap: 4px; margin-bottom: 10px; }
.star.lit, .summary-stars .star.lit { color: #f59e0b; }
.star { font-size: 22px; color: #d1d5db; }
.summary-comment { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

/* History */
.empty-state { text-align: center; padding: 24px; color: var(--text-muted); font-size: 14px; }
.history-list { display: flex; flex-direction: column; gap: 16px; }
.history-item {
  padding: 16px; border: 1px solid var(--border-light);
  border-radius: var(--radius-md); background: var(--bg-surface-subtle);
}
.history-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
.history-period { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.history-tutor { font-size: 12px; color: var(--text-muted); }
.history-stars { display: flex; gap: 2px; margin-left: auto; }
.star-sm { font-size: 14px; color: #d1d5db; }
.star-sm.lit { color: #f59e0b; }
.history-comment { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 8px; }
.history-date { font-size: 11px; color: var(--text-muted); }
</style>
