<template>
  <div class="page-container fade-in-up">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>学员评价反馈</h2>
        <p>汇总学员对本次培训的星级评分与文字反馈，按主题或评分快速筛选</p>
      </div>
    </div>

    <!-- Stat Summary Grid -->
    <div class="stats-grid" v-if="feedbacks.length">
      <div class="stat-card">
        <div class="stat-icon amber">⭐</div>
        <div class="stat-content">
          <div class="stat-label">平均评分</div>
          <div class="stat-value">{{ avgRating.toFixed(1) }}<sup> / 5</sup></div>
          <div class="stat-note">满分 5 星</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon indigo">📊</div>
        <div class="stat-content">
          <div class="stat-label">折算分数</div>
          <div class="stat-value">{{ avgScore.toFixed(0) }}<sup> 分</sup></div>
          <div class="stat-note">百分制换算</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">💬</div>
        <div class="stat-content">
          <div class="stat-label">评价总数</div>
          <div class="stat-value">{{ feedbacks.length }}<sup> 条</sup></div>
          <div class="stat-note">累计收到评价</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">👍</div>
        <div class="stat-content">
          <div class="stat-label">好评率</div>
          <div class="stat-value">{{ positiveRate.toFixed(0) }}<sup> %</sup></div>
          <div class="stat-note">4 星及以上</div>
        </div>
      </div>
    </div>

    <!-- Main Panel -->
    <div class="section-card">

      <!-- Filter Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select
            v-model="courseFilter"
            placeholder="全部主题"
            style="width: 210px"
            clearable
            @clear="courseFilter = 'all'"
          >
            <el-option label="全部主题" value="all" />
            <el-option
              v-for="course in courseOptions"
              :key="course"
              :label="course"
              :value="course"
            />
          </el-select>

          <el-select
            v-model="ratingFilter"
            placeholder="全部评分"
            style="width: 148px"
            clearable
            @clear="ratingFilter = 'all'"
          >
            <el-option label="全部评分" value="all" />
            <el-option label="⭐⭐⭐⭐⭐  5 星" :value="5" />
            <el-option label="⭐⭐⭐⭐  4 星" :value="4" />
            <el-option label="⭐⭐⭐  3 星及以下" value="low" />
          </el-select>
        </div>

        <div class="result-badge">
          <span class="result-dot"></span>
          当前显示 <strong>{{ filteredFeedbacks.length }}</strong> 条
        </div>
      </div>

      <!-- Empty State (no data at all) -->
      <div v-if="feedbacks.length === 0" class="empty-wrap">
        <el-empty description="暂无学员评价" />
      </div>

      <!-- Feedback Table -->
      <el-table
        v-else
        :data="filteredFeedbacks"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }"
      >
        <el-table-column prop="date" label="日期" width="110" />

        <el-table-column prop="courseName" label="培训主题" min-width="170" show-overflow-tooltip />

        <el-table-column label="学员" width="120">
          <template #default="{ row }">
            <div class="student-cell">
              <span class="student-avatar">{{ (row.studentName || '？').charAt(0) }}</span>
              <span>{{ row.studentName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="评分" width="190">
          <template #default="{ row }">
            <el-rate
              v-model="row.rating"
              disabled
              show-score
              text-color="#f59e0b"
              score-template="{value}"
            />
          </template>
        </el-table-column>

        <el-table-column prop="comment" label="评价内容" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="comment-text">{{ row.comment }}</span>
          </template>
        </el-table-column>

        <el-table-column label="来源" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.source === '企微导入' ? 'success' : 'info'"
              size="small"
            >
              {{ row.source }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- Filter no-match state -->
      <div
        v-if="feedbacks.length > 0 && filteredFeedbacks.length === 0"
        class="empty-wrap"
      >
        <el-empty description="没有符合筛选条件的评价，请调整筛选项" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserTrainings, ratingToScore } from '../../api/mockData'

const trainings = ref([])
const courseFilter = ref('all')
const ratingFilter = ref('all')

const feedbacks = computed(() => {
  const result = []
  trainings.value.forEach(training => {
    training.evaluations?.forEach(evalItem => {
      if (evalItem.type !== 'student_to_tutor' || evalItem.tutorId !== 1) return
      const studentName = training.students.find((_, idx) =>
        training.studentIds[idx] === evalItem.studentId
      )
      result.push({
        studentName: studentName || '未知学员',
        courseName: training.courseName,
        rating: evalItem.rating,
        comment: evalItem.comment,
        source: evalItem.source || '系统录入',
        date: training.endDate
      })
    })
  })

  // Prototype-only: duplicate a few rows to verify the dense table layout.
  if (result.length > 0 && result.length < 8) {
    const seed = [...result]
    while (result.length < 8) {
      const item = seed[result.length % seed.length]
      result.push({
        ...item,
        studentName: `${item.studentName}`,
        comment: `${item.comment}（补充样例）`
      })
    }
  }
  return result
})

const courseOptions = computed(() => [...new Set(feedbacks.value.map(item => item.courseName))])

const filteredFeedbacks = computed(() => feedbacks.value.filter(item => {
  const courseMatched = courseFilter.value === 'all' || item.courseName === courseFilter.value
  const ratingMatched = ratingFilter.value === 'all' ||
    item.rating === ratingFilter.value ||
    (ratingFilter.value === 'low' && item.rating <= 3)
  return courseMatched && ratingMatched
}))

const avgRating = computed(() => {
  if (feedbacks.value.length === 0) return 0
  const sum = feedbacks.value.reduce((acc, item) => acc + item.rating, 0)
  return sum / feedbacks.value.length
})

const avgScore = computed(() => ratingToScore(Math.round(avgRating.value)))

const positiveRate = computed(() => {
  if (feedbacks.value.length === 0) return 0
  const positiveCount = feedbacks.value.filter(f => f.rating >= 4).length
  return (positiveCount / feedbacks.value.length) * 100
})

const loadTrainings = () => {
  trainings.value = getUserTrainings(1, 'tutor')
}

onMounted(loadTrainings)
</script>

<style scoped>
/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

/* Section Card */
.section-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Result badge */
.result-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  padding: 5px 14px;
  white-space: nowrap;
}

.result-badge strong {
  color: var(--color-primary);
  font-weight: 700;
}

.result-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
}

/* Table cells */
.student-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #eef2ff, #c7d2fe);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-text {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

/* Empty states */
.empty-wrap {
  padding: 40px 0;
}
</style>
