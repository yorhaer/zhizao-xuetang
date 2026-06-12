<template>
  <div class="page-container fade-in-up">
    <div class="page-header">
      <div>
        <h2>总览看板</h2>
        <p>培训完成、考核结果、评价缺口和工作室对比</p>
      </div>
      <el-button>🖼️ 导出图片</el-button>
    </div>

    <!-- 核心指标 -->
    <div class="stats-grid four-col">
      <div class="stat-card">
        <div class="stat-icon blue">📋</div>
        <div class="stat-content">
          <div class="stat-label">本月培训</div>
          <div class="stat-value">{{ stats.totalTraining }}<sup>场</sup></div>
          <div class="stat-note">覆盖两个工作室</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div class="stat-content">
          <div class="stat-label">已闭环</div>
          <div class="stat-value">{{ stats.completedTraining }}<sup>场</sup></div>
          <div class="stat-note">{{ stats.completionRate }}% 闭环率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon indigo">🏆</div>
        <div class="stat-content">
          <div class="stat-label">考核通过</div>
          <div class="stat-value">{{ stats.passCount }}<sup>人次</sup></div>
          <div class="stat-note">均分 {{ stats.avgScore.toFixed(1) }} 分</div>
        </div>
      </div>
      <div class="stat-card" :class="{ 'stat-card--alert': stats.todoCount > 0 }">
        <div class="stat-icon amber">⚠️</div>
        <div class="stat-content">
          <div class="stat-label">待办提醒</div>
          <div class="stat-value">{{ stats.todoCount }}<sup>项</sup></div>
          <div class="stat-note">影响台账闭环</div>
        </div>
      </div>
    </div>

    <!-- 第一行：工作室对比 + 趋势 -->
    <div class="dashboard-row two-col">
      <div class="section-card">
        <div class="section-card-header">
          <h3>🏭 工作室对比</h3>
        </div>
        <div class="studio-list">
          <div v-for="studio in studioStats" :key="studio.id" class="studio-item">
            <div class="studio-title-row">
              <strong>{{ studio.name }}</strong>
              <span class="studio-count">{{ studio.completedTraining }}/{{ studio.totalTraining }}场</span>
            </div>
            <el-progress :percentage="studio.completionRate" :stroke-width="12" />
            <div class="studio-meta-row">
              <span>平均成绩 {{ studio.avgScore.toFixed(1) }}分</span>
              <span>待办 {{ studio.todoCount }}项</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-card-header">
          <h3>📈 近3个月闭环率趋势</h3>
        </div>
        <div class="trend-bars">
          <div v-for="item in trend" :key="item.month" class="trend-row">
            <span class="trend-month">{{ item.month }}</span>
            <div class="trend-track">
              <div class="trend-fill" :style="{ width: item.rate + '%' }"></div>
            </div>
            <span class="trend-val">{{ item.rate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：导师排名 + 成绩分布 + 待办 -->
    <div class="dashboard-row three-col">
      <div class="section-card">
        <div class="section-card-header"><h3>🥇 导师评分排名</h3></div>
        <div class="rank-list">
          <div v-for="(tutor, index) in tutorRankings" :key="tutor.id" class="rank-item">
            <div class="rank-num" :class="['rank-1','rank-2','rank-3'][index] || ''">{{ index + 1 }}</div>
            <div class="rank-info">
              <div class="rank-name">{{ tutor.name }}</div>
              <div class="rank-meta">{{ tutor.trainingCount }}场 · {{ tutor.ratingCount }}条评价</div>
            </div>
            <div class="rank-score">{{ tutor.rating ? tutor.rating.toFixed(1) : '—' }}</div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-card-header"><h3>📊 成绩分布</h3></div>
        <div class="dist-bars">
          <div v-for="item in distribution" :key="item.label" class="dist-row">
            <span class="dist-label">{{ item.label }}</span>
            <div class="dist-track">
              <div class="dist-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
            </div>
            <strong class="dist-val">{{ item.percent }}%</strong>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-card-header"><h3>🔔 待办提醒</h3></div>
        <div v-if="todos.length" class="todo-list">
          <div v-for="todo in todos" :key="todo.id" class="todo-row">
            <el-tag size="small" type="warning">{{ todo.title }}</el-tag>
            <div class="todo-detail">
              <div class="todo-course">{{ todo.courseName }}</div>
              <div class="todo-meta">{{ todo.studioName }} · {{ todo.owner }} · {{ todo.date }}</div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无待办 🎉" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  getAssessmentDistribution, getDashboardStats, getMonthlyCompletionTrend,
  getStudioStats, getTodoItems, getTutorRankings
} from '../../api/mockData'

const stats = getDashboardStats()
const studioStats = getStudioStats()
const trend = getMonthlyCompletionTrend()
const tutorRankings = getTutorRankings()
const distribution = getAssessmentDistribution()
const todos = getTodoItems()
</script>

<style scoped>
.stats-grid.four-col {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card--alert {
  border-color: #fcd34d !important;
  background: linear-gradient(135deg, #fff, #fffbeb) !important;
}

.dashboard-row { margin-bottom: 16px; }

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.section-card-header {
  margin-bottom: 16px;
}

.section-card-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

/* 工作室 */
.studio-list { display: flex; flex-direction: column; gap: 18px; }
.studio-item { display: flex; flex-direction: column; gap: 6px; }
.studio-title-row { display: flex; justify-content: space-between; align-items: center; }
.studio-title-row strong { font-size: 14px; color: var(--text-primary); }
.studio-count { font-size: 12px; color: var(--text-muted); }
.studio-meta-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); }

/* 趋势 */
.trend-bars { display: flex; flex-direction: column; gap: 14px; }
.trend-row { display: grid; grid-template-columns: 36px 1fr 44px; align-items: center; gap: 10px; }
.trend-month { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
.trend-track { height: 10px; background: var(--bg-surface-subtle); border-radius: var(--radius-full); overflow: hidden; }
.trend-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), #818cf8); border-radius: var(--radius-full); transition: width 0.8s ease; }
.trend-val { font-size: 12px; font-weight: 700; color: var(--text-primary); text-align: right; }

/* 排名 */
.rank-list { display: flex; flex-direction: column; gap: 12px; }
.rank-item { display: flex; align-items: center; gap: 12px; }
.rank-num {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--bg-surface-subtle); color: var(--text-secondary);
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.rank-1 { background: linear-gradient(135deg, #fef3c7, #fbbf24); color: #92400e; }
.rank-2 { background: linear-gradient(135deg, #f1f5f9, #cbd5e1); color: #475569; }
.rank-3 { background: linear-gradient(135deg, #fff7ed, #fed7aa); color: #c2410c; }
.rank-info { flex: 1; }
.rank-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.rank-meta { font-size: 11px; color: var(--text-muted); }
.rank-score { font-size: 20px; font-weight: 800; color: #f59e0b; }

/* 成绩分布 */
.dist-bars { display: flex; flex-direction: column; gap: 12px; }
.dist-row { display: grid; grid-template-columns: 90px 1fr 40px; align-items: center; gap: 8px; }
.dist-label { font-size: 12px; color: var(--text-secondary); }
.dist-track { height: 10px; background: var(--bg-surface-subtle); border-radius: var(--radius-full); overflow: hidden; }
.dist-fill { height: 100%; border-radius: var(--radius-full); transition: width 0.8s ease; }
.dist-val { font-size: 12px; font-weight: 700; color: var(--text-primary); text-align: right; }

/* 待办 */
.todo-list { display: flex; flex-direction: column; gap: 10px; }
.todo-row { display: flex; align-items: flex-start; gap: 10px; }
.todo-detail { flex: 1; }
.todo-course { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.todo-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
</style>
