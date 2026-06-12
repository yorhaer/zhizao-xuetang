<template>
  <div class="page-container fade-in-up">
    <div class="page-header">
      <div>
        <h2>工作室对比</h2>
        <p>同口径指标横向对比，找出差距与优势</p>
      </div>
      <el-radio-group v-model="comparePeriod" size="small">
        <el-radio-button label="month">本月</el-radio-button>
        <el-radio-button label="quarter">本季度</el-radio-button>
        <el-radio-button label="year">本年度</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 工作室主卡并排 -->
    <div class="studio-cards-row">
      <div v-for="(studio, idx) in [studio_aStats, studio_bStats]" :key="studio.id" class="studio-main-card">
        <div class="studio-card-header">
          <div class="studio-avatar" :class="idx === 0 ? 'avatar-blue' : 'avatar-green'">
            {{ idx === 0 ? '一' : '二' }}
          </div>
          <div class="studio-card-info">
            <div class="studio-card-name">{{ studio.name }}</div>
            <el-progress :percentage="studio.completionRate" :stroke-width="6" style="width:160px" />
          </div>
          <div class="studio-rate-badge">
            <span class="rate-big">{{ studio.avgRating.toFixed(1) }}</span>
            <span class="rate-unit">/ 5</span>
          </div>
        </div>
        <div class="studio-metrics">
          <div class="metric-block">
            <div class="metric-num primary">{{ studio.totalTraining }}</div>
            <div class="metric-desc">培训场次</div>
          </div>
          <div class="metric-block">
            <div class="metric-num success">{{ studio.completedTraining }}</div>
            <div class="metric-desc">已闭环</div>
          </div>
          <div class="metric-block">
            <div class="metric-num warning">{{ studio.avgScore.toFixed(1) }}</div>
            <div class="metric-desc">平均成绩</div>
          </div>
          <div class="metric-block">
            <div class="metric-num muted">{{ studio.todoCount }}</div>
            <div class="metric-desc">待办项</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细对比表 -->
    <div class="section-card">
      <div class="section-card-header">
        <h3>📊 详细指标对比</h3>
      </div>
      <el-table :data="comparisonData" stripe style="width:100%">
        <el-table-column prop="metric" label="指标" width="180" />
        <el-table-column label="一号工作室" width="180">
          <template #default="{ row }">
            <span class="compare-val studio_a-val">{{ row.studio_a }}</span>
          </template>
        </el-table-column>
        <el-table-column label="二号工作室" width="180">
          <template #default="{ row }">
            <span class="compare-val sgp-val">{{ row.studio_b }}</span>
          </template>
        </el-table-column>
        <el-table-column label="差值" width="120">
          <template #default="{ row }">
            <span :class="['diff-tag', row.difference > 0 ? 'diff-positive' : row.difference < 0 ? 'diff-negative' : 'diff-zero']">
              {{ row.difference > 0 ? '+' : '' }}{{ row.difference }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="优势方" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.difference > 0" type="success" size="small">一号工作室</el-tag>
            <el-tag v-else-if="row.difference < 0" type="warning" size="small">二号工作室</el-tag>
            <el-tag v-else size="small">持平</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可视化" min-width="160">
          <template #default="{ row }">
            <div class="compare-bar-row">
              <div class="compare-bar studio_a-bar" :style="{ width: getBarWidth(row.studio_a, row) + '%' }"></div>
              <div class="compare-bar sgp-bar" :style="{ width: getBarWidth(row.studio_b, row) + '%' }"></div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 人员对比 -->
    <div class="people-compare-row">
      <div v-for="(studio, idx) in ['studio_a', 'studio_b']" :key="studio" class="people-card">
        <div class="people-card-title">{{ idx === 0 ? '一号工作室' : '二号工作室' }}</div>
        <div class="people-stats">
          <div class="people-block">
            <span class="people-num">{{ peopleStats[studio].students }}</span>
            <span class="people-desc">学员</span>
          </div>
          <div class="people-divider"></div>
          <div class="people-block">
            <span class="people-num">{{ peopleStats[studio].tutors }}</span>
            <span class="people-desc">导师</span>
          </div>
          <div class="people-divider"></div>
          <div class="people-block">
            <span class="people-num">{{ Math.round(peopleStats[studio].students / Math.max(peopleStats[studio].tutors, 1)) }}</span>
            <span class="people-desc">师生比</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getStudioStats, tutors, students } from '../../api/mockData'

const comparePeriod = ref('month')
const studioStats = getStudioStats()

const studio_aStats = computed(() => studioStats.find(item => item.id === 'studio_a'))
const studio_bStats = computed(() => studioStats.find(item => item.id === 'studio_b'))

const peopleStats = computed(() => ({
  studio_a: {
    students: students.filter(item => item.studio === 'studio_a').length,
    tutors: tutors.filter(item => item.studio === 'studio_a').length
  },
  studio_b: {
    students: students.filter(item => item.studio === 'studio_b').length,
    tutors: tutors.filter(item => item.studio === 'studio_b').length
  }
}))

const comparisonData = computed(() => [
  { metric: '培训总次数', studio_a: studio_aStats.value.totalTraining, studio_b: studio_bStats.value.totalTraining, difference: studio_aStats.value.totalTraining - studio_bStats.value.totalTraining },
  { metric: '已闭环培训', studio_a: studio_aStats.value.completedTraining, studio_b: studio_bStats.value.completedTraining, difference: studio_aStats.value.completedTraining - studio_bStats.value.completedTraining },
  { metric: '平均成绩', studio_a: studio_aStats.value.avgScore, studio_b: studio_bStats.value.avgScore, difference: parseFloat((studio_aStats.value.avgScore - studio_bStats.value.avgScore).toFixed(1)) },
  { metric: '平均评分', studio_a: studio_aStats.value.avgRating, studio_b: studio_bStats.value.avgRating, difference: parseFloat((studio_aStats.value.avgRating - studio_bStats.value.avgRating).toFixed(1)) },
  { metric: '学员总数', studio_a: peopleStats.value.studio_a.students, studio_b: peopleStats.value.studio_b.students, difference: peopleStats.value.studio_a.students - peopleStats.value.studio_b.students },
  { metric: '导师总数', studio_a: peopleStats.value.studio_a.tutors, studio_b: peopleStats.value.studio_b.tutors, difference: peopleStats.value.studio_a.tutors - peopleStats.value.studio_b.tutors }
])

const getBarWidth = (val, row) => {
  const maxVal = Math.max(row.studio_a, row.studio_b, 1)
  return Math.round((val / maxVal) * 100)
}
</script>

<style scoped>
.studio-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.studio-main-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}

.studio-main-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.studio-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.studio-avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.avatar-blue { background: linear-gradient(135deg, var(--color-primary), #818cf8); }
.avatar-green { background: linear-gradient(135deg, #059669, #10b981); }

.studio-card-info {
  flex: 1;
  min-width: 0;
}

.studio-card-name { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }

.studio-rate-badge {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.rate-big { font-size: 26px; font-weight: 800; color: #f59e0b; }
.rate-unit { font-size: 13px; color: var(--text-muted); }

.studio-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.metric-block {
  text-align: center;
  padding: 12px 8px;
  background: var(--bg-surface-subtle);
  border-radius: var(--radius-md);
}

.metric-num {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.primary { color: var(--color-primary); }
.success { color: var(--color-success); }
.warning { color: var(--color-warning); }
.muted { color: var(--text-muted); }

.metric-desc { font-size: 11px; color: var(--text-muted); font-weight: 500; }

/* 对比表 */
.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
}

.section-card-header { margin-bottom: 14px; }
.section-card-header h3 { font-size: 14px; font-weight: 700; color: var(--text-primary); }

.compare-val { font-size: 15px; font-weight: 700; }
.studio_a-val { color: var(--color-primary); }
.sgp-val { color: var(--color-success); }

.diff-tag { display: inline-block; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); font-size: 13px; }
.diff-positive { background: var(--color-success-bg); color: var(--color-success); }
.diff-negative { background: var(--color-danger-bg); color: var(--color-danger); }
.diff-zero { background: var(--bg-surface-subtle); color: var(--text-muted); }

.compare-bar-row { display: flex; flex-direction: column; gap: 3px; }
.compare-bar { height: 6px; border-radius: var(--radius-full); transition: width 0.6s ease; min-width: 2px; }
.studio_a-bar { background: linear-gradient(90deg, var(--color-primary), #818cf8); }
.sgp-bar { background: linear-gradient(90deg, #059669, #34d399); }

/* 人员 */
.people-compare-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.people-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.people-card-title { font-size: 13px; font-weight: 700; color: var(--text-secondary); margin-bottom: 14px; }

.people-stats { display: flex; align-items: center; gap: 0; }
.people-block { flex: 1; text-align: center; }
.people-num { display: block; font-size: 28px; font-weight: 800; color: var(--text-primary); }
.people-desc { font-size: 12px; color: var(--text-muted); }
.people-divider { width: 1px; height: 36px; background: var(--border-light); }
</style>
