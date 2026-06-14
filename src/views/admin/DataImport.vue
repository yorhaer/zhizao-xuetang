<template>
  <div class="page-container fade-in-up">
    <div class="page-header">
      <div>
        <h2>Excel 导入</h2>
        <p>前端原型展示结构识别、字段校验和合并单元格预览，真实解析逻辑后续接入后端。</p>
      </div>
    </div>

    <div class="import-layout">
      <section class="section-panel">
        <div class="section-header">
          <h3>上传原始台账</h3>
          <el-button size="small" :icon="Download">下载原表模板</el-button>
        </div>
        <div
          class="upload-zone"
          :class="{ 'upload-zone--drag': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display:none" @change="handleFileChange" />
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-title">{{ uploadedFile ? uploadedFile.name : '选择或拖入 Excel 文件' }}</div>
          <div class="upload-hint">支持工匠室员工培训计划表，保留合并单元格和原始字段顺序</div>
        </div>

        <div v-if="uploadedFile" class="uploaded-row">
          <div>
            <strong>{{ uploadedFile.name }}</strong>
            <span>{{ formatFileSize(uploadedFile.size) }}</span>
          </div>
          <el-button type="primary" :loading="parsing" @click="parseFile">开始识别</el-button>
        </div>
      </section>

      <section class="section-panel">
        <div class="section-header">
          <h3>结构识别结果</h3>
          <el-tag :type="parsed ? 'success' : 'info'" size="small">{{ parsed ? '已识别' : '待上传' }}</el-tag>
        </div>
        <div class="recognition-grid">
          <div class="recognition-item">
            <span>工作表</span>
            <strong>{{ excelMergeSummary.sheetName }}</strong>
          </div>
          <div class="recognition-item">
            <span>培训主题</span>
            <strong>{{ excelMergeSummary.groupCount }} 项</strong>
          </div>
          <div class="recognition-item">
            <span>人员记录</span>
            <strong>{{ excelMergeSummary.personRowCount }} 条</strong>
          </div>
          <div class="recognition-item">
            <span>合并单元格</span>
            <strong>{{ excelMergeSummary.mergeCount }} 个</strong>
          </div>
        </div>
      </section>
    </div>

    <section class="section-panel">
      <div class="section-header">
        <h3>字段完整性校验</h3>
        <span class="section-hint">原型中固定按 C:O 原字段识别</span>
      </div>
      <div class="check-grid">
        <div v-for="check in checks" :key="check.label" class="check-item">
          <el-tag :type="check.status === 'ok' ? 'success' : 'warning'" size="small">
            {{ check.status === 'ok' ? '通过' : '待确认' }}
          </el-tag>
          <div>
            <strong>{{ check.label }}</strong>
            <p>{{ check.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-panel">
      <div class="section-header">
        <h3>原样字段预览</h3>
        <div class="preview-actions">
          <el-button @click="resetPreview">取消</el-button>
          <el-button type="primary" :loading="importing" @click="commitImport">确认导入到前端台账</el-button>
        </div>
      </div>
      <el-table :data="previewRows" border height="420" size="small" :span-method="spanMethod" row-key="rowKey">
        <el-table-column prop="sequenceNo" label="序号" width="70" fixed />
        <el-table-column prop="trainingTopic" label="培训主题" min-width="220" fixed show-overflow-tooltip />
        <el-table-column prop="trainingContent" label="培训内容" min-width="280" show-overflow-tooltip />
        <el-table-column prop="trainer" label="培训师傅" width="110" />
        <el-table-column prop="trainee" label="培训人员" width="130" />
        <el-table-column prop="trainingDate" label="培训日期" width="100" />
        <el-table-column prop="startTime" label="培训开始时间" width="120" />
        <el-table-column prop="endTime" label="培训结束时间" width="120" />
        <el-table-column prop="durationHours" label="培训时长（H）" width="120" />
        <el-table-column prop="completedText" label="是否完成" width="100" />
        <el-table-column prop="purpose" label="达成目的" min-width="180" show-overflow-tooltip />
        <el-table-column prop="resultCheck" label="成果检验" width="110" />
        <el-table-column prop="remark" label="备注" width="140" />
      </el-table>
    </section>

    <section class="section-panel">
      <div class="section-header">
        <h3>原始字段清单</h3>
        <span class="section-hint">闭环字段只追加，不覆盖这些字段</span>
      </div>
      <div class="field-list">
        <el-tag v-for="column in originalExcelColumns" :key="column.key" effect="plain">
          {{ column.label }}
        </el-tag>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, UploadFilled } from '@element-plus/icons-vue'
import {
  cloneLedgerGroups,
  excelMergeSummary,
  flattenLedgerGroups,
  originalExcelColumns
} from '../../api/excelLedgerMock'

const fileInput = ref(null)
const uploadedFile = ref(null)
const isDragging = ref(false)
const parsing = ref(false)
const importing = ref(false)
const parsed = ref(true)
const previewGroups = ref(cloneLedgerGroups())

const previewRows = computed(() => flattenLedgerGroups(previewGroups.value).map(row => ({
  ...row,
  sequenceNo: row.group.sequenceNo,
  trainingTopic: row.group.trainingTopic,
  trainingContent: row.personRow.trainingContent ?? row.group.trainingContent,
  trainer: row.group.trainer,
  purpose: row.group.purpose,
  resultCheck: row.group.resultCheck,
  trainee: row.personRow.trainee,
  trainingDate: row.personRow.trainingDate,
  startTime: row.personRow.startTime,
  endTime: row.personRow.endTime,
  durationHours: row.personRow.durationHours,
  completedText: row.personRow.completedText,
  remark: row.personRow.remark
})))

const checks = computed(() => [
  { label: '原始字段完整', status: 'ok', desc: `已识别 ${originalExcelColumns.length} 个原始字段，字段顺序保持不变。` },
  { label: '合并结构符合规则', status: 'ok', desc: `${excelMergeSummary.mergeCount} 个合并单元格均为 ${excelMergeSummary.mergeShape}。` },
  { label: '备注列已保留', status: 'ok', desc: '即使当前备注列为空，导入后仍作为原始字段保留。' },
  { label: '闭环字段隔离', status: 'ok', desc: '闭环状态、考核、评价和课件字段进入抽屉与闭环台账导出，不插入原字段中间。' }
])

const triggerFileInput = () => fileInput.value?.click()

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) uploadedFile.value = file
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) uploadedFile.value = file
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const parseFile = () => {
  parsing.value = true
  setTimeout(() => {
    parsed.value = true
    parsing.value = false
    ElMessage.success('已按原 Excel 结构完成前端识别预览')
  }, 700)
}

const resetPreview = () => {
  uploadedFile.value = null
  previewGroups.value = cloneLedgerGroups()
}

const commitImport = () => {
  importing.value = true
  setTimeout(() => {
    importing.value = false
    ElMessage.success('已导入到前端台账原型')
  }, 600)
}

const spanMethod = ({ row, column }) => {
  if (!column.property || !row.group.mergedColumns.includes(column.property)) return [1, 1]
  return row.rowIndex === 0 ? [row.group.rows.length, 1] : [0, 0]
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
}

.page-header p,
.section-hint,
.upload-hint,
.uploaded-row span,
.check-item p {
  color: var(--text-muted);
  font-size: 12px;
}

.import-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  gap: 16px;
}

.section-panel {
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.upload-zone {
  display: flex;
  min-height: 168px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-medium);
  border-radius: 8px;
  background: var(--bg-surface-subtle);
  text-align: center;
  transition: all var(--transition-base);
}

.upload-zone:hover,
.upload-zone--drag {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.upload-icon {
  margin-bottom: 12px;
  color: var(--color-primary);
  font-size: 36px;
}

.upload-title {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.uploaded-row,
.preview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.uploaded-row {
  justify-content: space-between;
  margin-top: 12px;
}

.uploaded-row > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recognition-grid,
.check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.recognition-item,
.check-item {
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 12px;
  background: var(--bg-surface-subtle);
}

.recognition-item span {
  display: block;
  margin-bottom: 6px;
  color: var(--text-muted);
  font-size: 12px;
}

.recognition-item strong {
  color: var(--text-primary);
  font-size: 20px;
}

.check-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.check-item p {
  margin: 4px 0 0;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 900px) {
  .import-layout,
  .recognition-grid,
  .check-grid {
    grid-template-columns: 1fr;
  }
}
</style>
