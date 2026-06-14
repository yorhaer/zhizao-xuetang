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
          当前显示 <strong>{{ filteredFeedbackGroups.length }}</strong> 门课 / <strong>{{ filteredFeedbacks.length }}</strong> 条
        </div>
      </div>

      <!-- Empty State (no data at all) -->
      <div v-if="feedbacks.length === 0" class="empty-wrap">
        <el-empty description="暂无学员评价" />
      </div>

      <!-- Feedback Groups -->
      <div v-else-if="filteredFeedbackGroups.length" class="feedback-group-list">
        <div v-for="group in filteredFeedbackGroups" :key="group.groupKey" class="feedback-group">
          <div class="feedback-group-header">
            <div>
              <div class="feedback-course-title">{{ group.courseName }}</div>
              <div class="muted">
                {{ group.dateRange }} · {{ group.feedbacks.length }} 条反馈 · {{ group.studentNames.join('、') }}
              </div>
            </div>
            <div class="feedback-score">
              <el-rate
                v-model="group.avgRating"
                disabled
                show-score
                text-color="#f59e0b"
                score-template="{value}"
              />
            </div>
          </div>

          <div class="feedback-list">
            <div v-for="item in group.feedbacks" :key="item.rowKey" class="feedback-row">
              <div class="student-cell">
                <span class="student-avatar">{{ (item.studentName || '？').charAt(0) }}</span>
                <div>
                  <div>{{ item.studentName }}</div>
                  <div class="muted">{{ item.date }}</div>
                </div>
              </div>
              <el-rate
                v-model="item.rating"
                disabled
                show-score
                text-color="#f59e0b"
                score-template="{value}"
              />
              <div class="comment-text">{{ item.comment }}</div>
              <el-tag
                :type="item.source === '企微导入' ? 'success' : 'info'"
                size="small"
              >
                {{ item.source }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter no-match state -->
      <div v-if="feedbacks.length > 0 && filteredFeedbacks.length === 0" class="empty-wrap">
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
        rowKey: `${training.id}-${evalItem.studentId}`,
        studentName: studentName || '未知学员',
        courseName: training.courseName,
        trainingContent: training.trainingContent,
        rating: evalItem.rating,
        comment: evalItem.comment,
        source: evalItem.source || '系统录入',
        date: training.endDate
      })
    })
  })

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

const filteredFeedbackGroups = computed(() => {
  const grouped = new Map()

  filteredFeedbacks.value.forEach(item => {
    const groupKey = `${item.courseName}::${item.trainingContent}`
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        groupKey,
        courseName: item.courseName,
        trainingContent: item.trainingContent,
        dates: [],
        studentNames: new Set(),
        feedbacks: []
      })
    }

    const group = grouped.get(groupKey)
    group.dates.push(item.date)
    group.studentNames.add(item.studentName)
    group.feedbacks.push(item)
  })

  return Array.from(grouped.values()).map(group => {
    const sortedDates = [...new Set(group.dates)].sort()
    const avgRating = group.feedbacks.reduce((sum, item) => sum + item.rating, 0) / group.feedbacks.length
    return {
      ...group,
      avgRating,
      dateRange: sortedDates.length > 1 ? `${sortedDates[0]} 至 ${sortedDates[sortedDates.length - 1]}` : sortedDates[0],
      studentNames: Array.from(group.studentNames),
      feedbacks: group.feedbacks.sort((a, b) => a.date.localeCompare(b.date))
    }
  }).sort((a, b) => `${a.courseName} ${a.dateRange}`.localeCompare(`${b.courseName} ${b.dateRange}`))
})

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

.feedback-group-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feedback-group {
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: #fff;
}

.feedback-group-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-surface-subtle);
}

.feedback-course-title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.feedback-score {
  flex-shrink: 0;
}

.feedback-list {
  display: flex;
  flex-direction: column;
}

.feedback-row {
  display: grid;
  grid-template-columns: 150px 180px minmax(0, 1fr) 92px;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.feedback-row:last-child {
  border-bottom: none;
}

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

.muted {
  color: var(--text-muted);
  font-size: 12px;
}

/* Empty states */
.empty-wrap {
  padding: 40px 0;
}

@media (max-width: 900px) {
  .toolbar,
  .feedback-group-header,
  .feedback-row {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar,
  .feedback-group-header {
    display: flex;
  }

  .feedback-row {
    display: flex;
  }
}
</style>
