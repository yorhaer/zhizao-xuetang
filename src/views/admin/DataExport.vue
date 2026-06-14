<template>
  <div class="page-container fade-in-up">
    <div class="page-header">
      <div>
        <h2>Excel 导出</h2>
        <p>导出前确认原始字段、合并结构和闭环字段的范围；本页仅展示前端交互原型。</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">培训主题</div>
        <div class="stat-value">{{ stats.groupCount }}<sup>项</sup></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">人员记录</div>
        <div class="stat-value">{{ stats.personRowCount }}<sup>条</sup></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">原始字段</div>
        <div class="stat-value">{{ originalExcelColumns.length }}<sup>列</sup></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">合并单元格</div>
        <div class="stat-value">{{ stats.mergeCount }}<sup>个</sup></div>
      </div>
    </div>

    <div class="export-grid">
      <section
        class="export-card"
        :class="{ 'export-card--active': exportMode === 'original' }"
        @click="exportMode = 'original'"
      >
        <div class="export-card-header">
          <div>
            <h3>原样导出 Excel</h3>
            <p>只导出原 Excel 字段，字段顺序、3 行合并关系和备注列保持不变。</p>
          </div>
          <el-radio v-model="exportMode" label="original">选择</el-radio>
        </div>
        <div class="export-meta-list">
          <span>字段范围：C:O</span>
          <span>合并规则：{{ excelMergeSummary.mergeShape }}</span>
          <span>适用场景：业务侧回收原表</span>
        </div>
      </section>

      <section
        class="export-card"
        :class="{ 'export-card--active': exportMode === 'closure' }"
        @click="exportMode = 'closure'"
      >
        <div class="export-card-header">
          <div>
            <h3>闭环台账导出</h3>
            <p>原始字段仍在 C:O，右侧追加闭环状态、考核、评价和课件字段。</p>
          </div>
          <el-radio v-model="exportMode" label="closure">选择</el-radio>
        </div>
        <div class="export-meta-list">
          <span>闭环字段：{{ enabledClosureFields.length }} 个</span>
          <span>主题级字段：闭环状态、缺口说明、课件状态、课件清单</span>
          <span>人员级字段：考核、评价逐行展开</span>
        </div>
      </section>
    </div>

    <section class="section-panel">
      <div class="section-header">
        <h3>导出内容确认</h3>
        <span class="section-hint">系统修改后的数据会按原字段写回</span>
      </div>
      <el-table :data="exportChecks" border>
        <el-table-column prop="item" label="检查项" width="180" />
        <el-table-column prop="value" label="当前设置" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.ok ? 'success' : 'warning'" size="small">
              {{ row.ok ? '通过' : '待确认' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="section-panel">
      <div class="section-header">
        <h3>字段预览</h3>
        <span class="section-hint">原始字段始终排在前面</span>
      </div>
      <div class="field-section">
        <div class="field-title">原始 Excel 字段</div>
        <div class="field-list">
          <el-tag v-for="column in originalExcelColumns" :key="column.key" effect="plain">
            {{ column.label }}
          </el-tag>
        </div>
      </div>
      <div v-if="exportMode === 'closure'" class="field-section">
        <div class="field-title">追加闭环字段</div>
        <div class="field-list">
          <el-tag v-for="field in enabledClosureFields" :key="field.key" type="success" effect="plain">
            {{ field.label }}（{{ field.scope === 'group' ? '主题级' : '人员级' }}）
          </el-tag>
        </div>
      </div>
    </section>

    <section class="section-panel export-action-panel">
      <div>
        <h3>{{ exportMode === 'original' ? '准备原样导出' : '准备闭环台账导出' }}</h3>
        <p>
          {{ exportMode === 'original'
            ? '导出的 Excel 将只包含原始台账字段，适合交回业务侧继续使用。'
            : '导出的 Excel 会保留原始字段，并追加闭环状态、考核、评价和课件字段。' }}
        </p>
      </div>
      <el-button type="primary" size="large" :icon="Download" :loading="exporting" @click="handleExport">
        导出 Excel
      </el-button>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import {
  cloneLedgerGroups,
  closureFieldDefinitions,
  excelMergeSummary,
  getExcelLedgerStats,
  originalExcelColumns
} from '../../api/excelLedgerMock'

const groups = ref(cloneLedgerGroups())
const exportMode = ref('original')
const exporting = ref(false)

const stats = computed(() => getExcelLedgerStats(groups.value))
const enabledClosureFields = computed(() => closureFieldDefinitions.filter(field => field.enabled))
const exportChecks = computed(() => [
  { item: '原始字段顺序', value: originalExcelColumns.map(column => column.label).join(' / '), ok: true },
  { item: '合并单元格', value: `${excelMergeSummary.mergeCount} 个，${excelMergeSummary.mergeShape}`, ok: true },
  { item: '备注列', value: '保留在原字段末尾', ok: true },
  { item: '闭环字段', value: exportMode.value === 'original' ? '不导出' : `追加 ${enabledClosureFields.value.length} 个字段`, ok: true }
])

const handleExport = () => {
  exporting.value = true
  setTimeout(() => {
    const modeText = exportMode.value === 'original' ? '原样导出' : '闭环台账导出'
    ElMessage.success(`${modeText}已生成前端原型反馈`)
    exporting.value = false
  }, 700)
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2,
.section-header h3,
.export-card h3,
.export-action-panel h3 {
  margin: 0;
}

.page-header p,
.section-hint,
.export-card p,
.export-action-panel p {
  color: var(--text-muted);
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card,
.section-panel,
.export-card {
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.stat-card {
  padding: 16px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 12px;
}

.stat-value {
  margin-top: 8px;
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 700;
}

.stat-value sup {
  margin-left: 4px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
}

.export-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.export-card {
  cursor: pointer;
  padding: 18px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.export-card--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.export-card-header,
.section-header,
.export-action-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.export-card-header {
  align-items: flex-start;
}

.export-card p {
  margin: 6px 0 0;
  line-height: 1.6;
}

.export-meta-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

.section-panel {
  margin-bottom: 16px;
  padding: 18px;
}

.section-header {
  margin-bottom: 14px;
}

.field-section + .field-section {
  margin-top: 16px;
}

.field-title {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.export-action-panel {
  align-items: center;
}

@media (max-width: 900px) {
  .stats-grid,
  .export-grid {
    grid-template-columns: 1fr;
  }

  .export-action-panel {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
