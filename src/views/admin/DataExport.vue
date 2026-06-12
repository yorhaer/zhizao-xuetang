<template>
  <div class="page-container fade-in-up">
    <div class="page-header">
      <div>
        <h2>看板导出</h2>
        <p>先确认台账完整，再导出给外部流转</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <el-select v-model="exportForm.studio" style="width:160px">
          <el-option label="全部工作室" value="all" />
          <el-option label="一号工作室" value="studio_a" />
          <el-option label="二号工作室" value="studio_b" />
        </el-select>
        <el-button>🖼️ 导出图片</el-button>
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="stats-grid four-col">
      <div class="stat-card">
        <div class="stat-icon blue">📋</div>
        <div class="stat-content">
          <div class="stat-label">培训场次</div>
          <div class="stat-value">{{ stats.totalTraining }}<sup>场</sup></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div class="stat-content">
          <div class="stat-label">闭环率</div>
          <div class="stat-value">{{ stats.completionRate }}<sup>%</sup></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon indigo">🏆</div>
        <div class="stat-content">
          <div class="stat-label">考核通过</div>
          <div class="stat-value">{{ stats.passCount }}<sup>人次</sup></div>
        </div>
      </div>
      <div class="stat-card stat-card--alert">
        <div class="stat-icon amber">⚠️</div>
        <div class="stat-content">
          <div class="stat-label">待补数据</div>
          <div class="stat-value">{{ todoItems.length }}<sup>项</sup></div>
          <div class="stat-note" v-if="todoItems.length">导出前请先处理</div>
        </div>
      </div>
    </div>

    <div class="board-grid">
      <!-- 待补清单 -->
      <div class="section-card">
        <div class="section-card-header">
          <h3>⚠️ 待补清单</h3>
          <span class="section-hint">导出前先看这里</span>
        </div>
        <el-table :data="todoItems" stripe height="320" size="small">
          <el-table-column label="缺口" width="110">
            <template #default="{ row }">
              <el-tag type="warning" size="small">{{ row.title }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="courseName" label="培训主题" min-width="160" show-overflow-tooltip />
          <el-table-column prop="studioName" label="工作室" width="110" />
          <el-table-column prop="owner" label="处理人" width="80" />
          <el-table-column prop="date" label="日期" width="100" />
        </el-table>
        <el-empty v-if="todoItems.length === 0" description="台账已完整，可以导出 🎉" />
      </div>

      <!-- 工作室概览 -->
      <div class="section-card">
        <div class="section-card-header">
          <h3>🏭 工作室概览</h3>
          <span class="section-hint">结果和缺口放一起看</span>
        </div>
        <div class="studio-overview">
          <div v-for="studio in visibleStudioStats" :key="studio.id" class="studio-overview-item">
            <div class="studio-title-row">
              <strong>{{ studio.name }}</strong>
              <span class="studio-progress-label">{{ studio.completedTraining }}/{{ studio.totalTraining }} 场</span>
            </div>
            <el-progress :percentage="studio.completionRate" :stroke-width="10" />
            <div class="studio-meta-row">
              <span>均分 {{ studio.avgScore.toFixed(1) }} 分</span>
              <span>待补 <strong>{{ studio.todoCount }}</strong> 项</span>
            </div>
          </div>
        </div>

        <!-- 缺口分布 -->
        <div class="gap-bars">
          <div class="gap-title">缺口类型分布</div>
          <div v-for="item in gapBars" :key="item.label" class="gap-bar-row">
            <span class="gap-bar-label">{{ item.label }}</span>
            <div class="gap-bar-track">
              <div class="gap-bar-fill" :style="{ width: item.percent + '%' }"></div>
            </div>
            <strong class="gap-bar-val">{{ item.value }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出面板 -->
    <div class="section-card export-section">
      <div class="section-card-header">
        <h3>📥 Excel 导出</h3>
        <span class="section-hint">字段顺序保持现有台账格式</span>
      </div>
      <div class="export-body">
        <el-checkbox-group v-model="exportForm.dataTypes" class="export-checkboxes">
          <el-checkbox label="training">排班计划</el-checkbox>
          <el-checkbox label="execution">执行记录</el-checkbox>
          <el-checkbox label="assessment">考核记录</el-checkbox>
          <el-checkbox label="evaluation">评价记录</el-checkbox>
          <el-checkbox label="photos">照片清单</el-checkbox>
        </el-checkbox-group>
        <el-button type="primary" @click="handleExport" :loading="exporting" class="export-btn">
          📤 导出 Excel
        </el-button>
      </div>
      <div class="export-meta">
        <span>培训 {{ estimated.training }} 条</span>
        <span>考核 {{ estimated.assessment }} 条</span>
        <span>评价 {{ estimated.evaluation }} 条</span>
        <span>照片 {{ estimated.photos }} 张</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import { getDashboardStats, getStudioStats, getTodoItems, getTrainingGaps, trainingPlans } from '../../api/mockData'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const exporting = ref(false)
const exportForm = reactive({
  dateRange: [],
  dataTypes: ['training', 'execution', 'assessment', 'evaluation'],
  studio: 'all'
})

const scopedPlans = computed(() => {
  if (exportForm.studio === 'all') return trainingPlans
  return trainingPlans.filter(plan => plan.studio === exportForm.studio)
})

const stats = computed(() => getDashboardStats(scopedPlans.value))
const todoItems = computed(() => getTodoItems(scopedPlans.value))
const studioStats = computed(() => getStudioStats())
const visibleStudioStats = computed(() => {
  if (exportForm.studio === 'all') return studioStats.value
  return studioStats.value.filter(studio => studio.id === exportForm.studio)
})

const gapCounts = computed(() => {
  const gaps = scopedPlans.value.flatMap(plan => getTrainingGaps(plan))
  return {
    assessment: gaps.filter(gap => gap.includes('考核')).length,
    photo: gaps.filter(gap => gap.includes('执行资料')).length,
    evaluation: gaps.filter(gap => gap.includes('评价')).length
  }
})

const gapBars = computed(() => {
  const max = Math.max(...Object.values(gapCounts.value), 1)
  return [
    { label: '待录考核', value: gapCounts.value.assessment },
    { label: '缺执行资料', value: gapCounts.value.photo },
    { label: '缺评价', value: gapCounts.value.evaluation }
  ].map(item => ({ ...item, percent: Math.round((item.value / max) * 100) }))
})

const estimated = computed(() => ({
  training: scopedPlans.value.length,
  assessment: scopedPlans.value.reduce((sum, plan) => sum + plan.assessments.length, 0),
  evaluation: scopedPlans.value.reduce((sum, plan) => sum + plan.evaluations.length, 0),
  photos: scopedPlans.value.reduce((sum, plan) => sum + plan.photos.length, 0)
}))

const getStudioLabel = (studio) => {
  if (studio === 'all') return '全部工作室'
  return studio === 'studio_a' ? '一号工作室' : '二号工作室'
}

const handleExport = () => {
  if (exportForm.dataTypes.length === 0) {
    ElMessage.warning('请至少选择一种导出内容')
    return
  }
  exporting.value = true
  setTimeout(() => {
    const fileName = `培训台账_${getStudioLabel(exportForm.studio)}_${dayjs().format('YYYY-MM-DD_HHmmss')}.xlsx`
    ElMessage.success(`导出成功：${fileName}`)
    exporting.value = false
  }, 700)
}

onMounted(() => {
  const end = dayjs()
  const start = dayjs().subtract(30, 'day')
  exportForm.dateRange = [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
})
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

.board-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.section-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-card-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.section-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.studio-overview { display: flex; flex-direction: column; gap: 16px; }

.studio-overview-item { display: flex; flex-direction: column; gap: 6px; }

.studio-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.studio-title-row strong { font-size: 14px; color: var(--text-primary); }
.studio-progress-label { font-size: 12px; color: var(--text-muted); }

.studio-meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
}

.gap-bars { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-light); }
.gap-title { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }

.gap-bar-row {
  display: grid;
  grid-template-columns: 90px 1fr 36px;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.gap-bar-label { font-size: 12px; color: var(--text-secondary); }

.gap-bar-track {
  height: 8px;
  background: var(--bg-surface-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.gap-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  border-radius: var(--radius-full);
  transition: width 0.6s ease;
}

.gap-bar-val { font-size: 13px; font-weight: 700; color: var(--text-primary); text-align: right; }

/* 导出区 */
.export-section { margin-bottom: 16px; }

.export-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
}

.export-checkboxes { display: flex; gap: 20px; flex-wrap: wrap; }

.export-btn { min-width: 130px; }

.export-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: var(--text-muted);
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}
</style>
