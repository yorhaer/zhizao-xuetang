<template>
  <div class="page-container fade-in-up">
    <div class="page-header">
      <div>
        <h2>数据导入</h2>
        <p>从 Excel 批量导入培训记录，或从企业微信同步</p>
      </div>
    </div>

    <div class="import-grid">
      <!-- 上传区 -->
      <div class="section-card">
        <div class="section-card-header">
          <h3>📂 Excel 导入</h3>
          <el-button size="small">下载模板</el-button>
        </div>

        <div class="upload-zone"
          :class="{ 'upload-zone--drag': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display:none" @change="handleFileChange" />
          <div class="upload-icon">{{ isDragging ? '📬' : '📥' }}</div>
          <div class="upload-text">
            {{ isDragging ? '松开即上传' : '拖放文件到此处，或点击选择' }}
          </div>
          <div class="upload-hint">支持 .xlsx / .xls，最大 10MB</div>
        </div>

        <div v-if="uploadedFile" class="uploaded-file">
          <span class="uploaded-icon">✅</span>
          <div class="uploaded-info">
            <div class="uploaded-name">{{ uploadedFile.name }}</div>
            <div class="uploaded-size">{{ formatFileSize(uploadedFile.size) }}</div>
          </div>
          <el-button type="primary" @click="parseFile" :loading="parsing">
            {{ parsing ? '解析中…' : '开始解析' }}
          </el-button>
        </div>
      </div>

      <!-- 企业微信同步 -->
      <div class="section-card">
        <div class="section-card-header">
          <h3>💬 企业微信同步</h3>
          <el-tag type="success" size="small">已连接</el-tag>
        </div>
        <div class="weixin-config">
          <div class="weixin-status">
            <div class="weixin-dot connected"></div>
            <span>已连接工作台 API</span>
          </div>
          <el-button type="primary" @click="syncWeixin" :loading="syncing" style="width:100%">
            🔄 立即同步
          </el-button>
          <div class="last-sync" v-if="lastSyncTime">上次同步：{{ lastSyncTime }}</div>
        </div>
      </div>
    </div>

    <!-- 预览区 -->
    <div v-if="previewData.length" class="section-card">
      <div class="section-card-header">
        <h3>👁 解析预览 <span class="preview-count">{{ previewData.length }} 条</span></h3>
        <div style="display:flex;gap:8px">
          <el-button @click="previewData = []">取消</el-button>
          <el-button type="primary" :loading="importing" @click="commitImport">✅ 确认导入</el-button>
        </div>
      </div>
      <el-table :data="previewData" stripe max-height="400" size="small">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="courseName" label="培训主题" min-width="160" />
        <el-table-column prop="tutor" label="导师" width="80" />
        <el-table-column prop="startDate" label="日期" width="110" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row._valid ? 'success' : 'danger'" size="small">
              {{ row._valid ? '有效' : '有误' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 操作历史 -->
    <div class="section-card">
      <div class="section-card-header"><h3>🕐 操作历史</h3></div>
      <el-timeline>
        <el-timeline-item
          v-for="item in importHistory"
          :key="item.id"
          :type="item.success ? 'success' : 'danger'"
          :timestamp="item.time"
          placement="top"
        >
          <div class="history-item">
            <strong>{{ item.fileName }}</strong>
            <span class="history-count">导入 {{ item.count }} 条</span>
            <el-tag :type="item.success ? 'success' : 'danger'" size="small">
              {{ item.success ? '成功' : '部分失败' }}
            </el-tag>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-if="!importHistory.length" description="暂无导入记录" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const fileInput = ref(null)
const uploadedFile = ref(null)
const previewData = ref([])
const isDragging = ref(false)
const parsing = ref(false)
const importing = ref(false)
const syncing = ref(false)
const lastSyncTime = ref('2026-06-11 16:30')

const importHistory = ref([
  { id: 1, fileName: '培训台账_2026-06.xlsx', count: 12, success: true, time: '2026-06-11 16:00' },
  { id: 2, fileName: '排班导出_导师C.xlsx', count: 8, success: true, time: '2026-06-10 09:20' },
  { id: 3, fileName: '临时记录.xlsx', count: 3, success: false, time: '2026-06-09 14:55' }
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
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

const parseFile = () => {
  parsing.value = true
  setTimeout(() => {
    previewData.value = [
      { courseName: '安全操作培训', tutor: '导师A', startDate: '2026-06-13', _valid: true },
      { courseName: '质量管理规范', tutor: '导师B', startDate: '2026-06-14', _valid: true },
      { courseName: '设备维护基础', tutor: '', startDate: '2026-06-15', _valid: false }
    ]
    parsing.value = false
    ElMessage.success('解析完成，请确认后导入')
  }, 1000)
}

const commitImport = () => {
  importing.value = true
  setTimeout(() => {
    importHistory.value.unshift({
      id: Date.now(),
      fileName: uploadedFile.value?.name || '未知文件',
      count: previewData.value.filter(r => r._valid).length,
      success: true,
      time: new Date().toLocaleString('zh-CN')
    })
    previewData.value = []
    uploadedFile.value = null
    importing.value = false
    ElMessage.success('导入成功')
  }, 800)
}

const syncWeixin = () => {
  syncing.value = true
  setTimeout(() => {
    lastSyncTime.value = new Date().toLocaleString('zh-CN')
    ElMessage.success('企业微信同步完成')
    syncing.value = false
  }, 1200)
}
</script>

<style scoped>
.import-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
}

.section-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-card-header h3 { font-size: 15px; font-weight: 700; color: var(--text-primary); }

/* 上传区 */
.upload-zone {
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--bg-surface-subtle);
}

.upload-zone:hover,
.upload-zone--drag {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.upload-icon { font-size: 40px; margin-bottom: 12px; }
.upload-text { font-size: 15px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
.upload-hint { font-size: 12px; color: var(--text-muted); }

.uploaded-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-success-bg);
  border-radius: var(--radius-md);
  margin-top: 14px;
  border: 1px solid #d1fae5;
}

.uploaded-icon { font-size: 22px; }
.uploaded-info { flex: 1; }
.uploaded-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.uploaded-size { font-size: 12px; color: var(--text-muted); }

/* 企业微信 */
.weixin-config { display: flex; flex-direction: column; gap: 14px; }

.weixin-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--color-success-bg);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: #065f46;
  font-weight: 500;
}

.weixin-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.connected { background: var(--color-success); box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }

.last-sync { font-size: 12px; color: var(--text-muted); text-align: center; }

.preview-count {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 8px;
}

/* 时间线 */
.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
}

.history-count {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
