<template>
  <div class="page-container fade-in-up">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>资料中心</h2>
        <p>查看培训课件、部门视频，以及管理您的个人资料</p>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-nav-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- ── Tab 1: 培训课件 ── -->
    <div v-if="activeTab === 'courseware'" class="tab-content fade-in-up">
      <div class="section-toolbar">
        <el-input
          v-model="coursewareSearch"
          placeholder="搜索课件名称、导师..."
          clearable
          class="search-input"
        >
          <template #prefix>🔍</template>
        </el-input>
        <div class="filter-chips">
          <button
            v-for="type in ['全部', 'PDF', 'PPT', '视频', '图片']"
            :key="type"
            class="chip"
            :class="{ active: coursewareTypeFilter === type }"
            @click="coursewareTypeFilter = type"
          >{{ type }}</button>
        </div>
      </div>

      <div class="courseware-list">
        <div
          v-for="file in filteredCourseware"
          :key="file.id"
          class="courseware-item"
        >
          <div class="file-type-icon" :class="`icon-${file.type.toLowerCase()}`">
            {{ getFileEmoji(file.type) }}
          </div>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">
              <span class="meta-tutor">{{ file.tutor }}</span>
              <span class="meta-sep">·</span>
              <span>{{ file.uploadDate }}</span>
              <span class="meta-sep">·</span>
              <span>{{ file.size }}</span>
              <el-tag :type="getFileTagType(file.type)" size="small" class="file-type-tag">
                {{ file.type }}
              </el-tag>
            </div>
            <div class="file-desc" v-if="file.description">{{ file.description }}</div>
          </div>
          <div class="file-actions">
            <el-button size="small" type="primary" plain @click="downloadFile(file)">
              ⬇️ 下载
            </el-button>
            <el-button size="small" @click="previewFile(file)">预览</el-button>
          </div>
        </div>

        <div v-if="filteredCourseware.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <div>没有找到相关课件</div>
        </div>
      </div>
    </div>

    <!-- ── Tab 2: 部门培训视频 ── -->
    <div v-if="activeTab === 'videos'" class="tab-content fade-in-up">
      <div class="video-grid">
        <div
          v-for="video in trainingVideos"
          :key="video.id"
          class="video-card"
          @click="playVideo(video)"
        >
          <!-- Thumbnail -->
          <div class="video-thumbnail" :class="`thumb-${video.color}`">
            <div class="thumb-inner">
              <div class="thumb-emoji">{{ video.emoji }}</div>
              <button class="play-btn">▶</button>
            </div>
            <div class="video-duration">{{ video.duration }}</div>
          </div>
          <div class="video-body">
            <div class="video-title">{{ video.title }}</div>
            <div class="video-meta">
              <span>{{ video.uploader }}</span>
              <span class="meta-sep">·</span>
              <span>{{ video.uploadDate }}</span>
            </div>
            <div class="video-tags">
              <span v-for="tag in video.tags" :key="tag" class="video-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tab 3: 我的资料 ── -->
    <div v-if="activeTab === 'mine'" class="tab-content fade-in-up">

      <!-- Upload Zone -->
      <div
        class="my-upload-zone"
        :class="{ dragging: myFileDragging }"
        @dragover.prevent="myFileDragging = true"
        @dragleave.prevent="myFileDragging = false"
        @drop.prevent="handleMyFileDrop"
        @click="triggerMyUpload"
      >
        <input
          ref="myFileInputRef"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          multiple
          style="display: none"
          @change="handleMyFileSelect"
        />
        <div class="upload-zone-inner">
          <div class="upload-zone-icon">📎</div>
          <div class="upload-zone-text">
            <strong>上传资料 / 简历</strong>
            <span>拖拽文件到此处，或点击选择</span>
          </div>
          <div class="upload-zone-types">支持 PDF、Word、JPG、PNG</div>
        </div>
      </div>

      <!-- My Files List -->
      <div class="my-files-header">
        <h3>我的文件</h3>
        <span class="my-files-count">{{ myFiles.length }} 个文件</span>
      </div>

      <div v-if="myFiles.length > 0" class="my-files-list">
        <div
          v-for="file in myFiles"
          :key="file.id"
          class="my-file-item"
        >
          <div class="my-file-icon" :class="`icon-${file.type.toLowerCase()}`">
            {{ getFileEmoji(file.type) }}
          </div>
          <div class="my-file-info">
            <div class="my-file-name">{{ file.name }}</div>
            <div class="my-file-meta">
              <span>{{ file.uploadDate }}</span>
              <span class="meta-sep">·</span>
              <span>{{ file.size }}</span>
            </div>
          </div>
          <div class="my-file-actions">
            <el-button size="small" plain @click="downloadFile(file)">⬇️ 下载</el-button>
            <el-button size="small" type="danger" plain @click="deleteMyFile(file)">🗑️ 删除</el-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🗂️</div>
        <div>还没有上传任何个人资料</div>
        <div class="empty-hint">上传简历、技能证书等资料，便于管理员查阅</div>
      </div>
    </div>

    <!-- Video Preview Dialog -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="currentVideo?.title"
      width="640px"
      destroy-on-close
    >
      <div v-if="currentVideo" class="video-preview-modal">
        <div class="video-player-mock" :class="`thumb-${currentVideo.color}`">
          <div class="player-center">
            <div class="player-emoji">{{ currentVideo.emoji }}</div>
            <div class="player-note">原型模式 · 视频播放器占位</div>
          </div>
        </div>
        <div class="video-detail">
          <div class="video-detail-title">{{ currentVideo.title }}</div>
          <div class="video-detail-meta">
            {{ currentVideo.uploader }} · {{ currentVideo.uploadDate }} · {{ currentVideo.duration }}
          </div>
          <p class="video-detail-desc">{{ currentVideo.description }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="videoDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ── State ──────────────────────────────────────────
const activeTab = ref('courseware')
const coursewareSearch = ref('')
const coursewareTypeFilter = ref('全部')
const myFileDragging = ref(false)
const myFileInputRef = ref(null)
const videoDialogVisible = ref(false)
const currentVideo = ref(null)

// ── Mock Data ──────────────────────────────────────
const coursewareFiles = ref([
  {
    id: 1,
    name: '数控车床G代码编程基础.pdf',
    type: 'PDF',
    tutor: '王教授',
    uploadDate: '2026-05-20',
    size: '2.4 MB',
    description: '涵盖G00-G03基本指令、刀补设置及典型零件编程示例，适合初学者参考'
  },
  {
    id: 2,
    name: '工艺图纸识读方法论.pptx',
    type: 'PPT',
    tutor: '李导师',
    uploadDate: '2026-05-15',
    size: '8.1 MB',
    description: '系统讲解尺寸标注、公差配合、表面粗糙度的判读方法，含大量工程实例'
  },
  {
    id: 3,
    name: '精密测量仪器操作规范.pdf',
    type: 'PDF',
    tutor: '张工',
    uploadDate: '2026-05-08',
    size: '1.8 MB',
    description: '包含游标卡尺、千分尺、三坐标测量机的标准操作步骤及注意事项'
  },
  {
    id: 4,
    name: '液压系统故障排查指南.pdf',
    type: 'PDF',
    tutor: '陈高工',
    uploadDate: '2026-04-28',
    size: '3.6 MB',
    description: '常见液压故障现象、原因分析与处置流程，附故障代码对照表'
  },
  {
    id: 5,
    name: '车间安全操作要点培训.pptx',
    type: 'PPT',
    tutor: '王教授',
    uploadDate: '2026-04-10',
    size: '5.3 MB',
    description: '安全生产法规摘要、个人防护装备使用方法、应急处理流程讲解'
  }
])

const trainingVideos = ref([
  {
    id: 1,
    title: '数控车床开机与安全检查规程',
    uploader: '王教授',
    uploadDate: '2026-05-18',
    duration: '18:42',
    emoji: '🔧',
    color: 'blue',
    tags: ['数控', '安全', '实操'],
    description: '详细演示数控车床开机前的安全检查、回零操作及试切步骤，是所有学员上机前必须观看的入门视频。'
  },
  {
    id: 2,
    title: '卧式加工中心换刀系统讲解',
    uploader: '张工',
    uploadDate: '2026-04-25',
    duration: '24:10',
    emoji: '⚙️',
    color: 'green',
    tags: ['加工中心', '换刀', '原理'],
    description: '从机械结构到控制逻辑，全面解析刀库、机械手及换刀指令M06的工作原理与故障处理。'
  },
  {
    id: 3,
    title: '精密测量：三坐标测量机操作全流程',
    uploader: '李导师',
    uploadDate: '2026-03-30',
    duration: '31:05',
    emoji: '📐',
    color: 'purple',
    tags: ['测量', '三坐标', '精密'],
    description: '从零件装夹、坐标系建立到测量程序编写，完整演示CMM操作全流程，含测量报告解读。'
  }
])

const myFiles = ref([
  {
    id: 1,
    name: '个人简历_李明_2026.pdf',
    type: 'PDF',
    uploadDate: '2026-03-10',
    size: '320 KB'
  },
  {
    id: 2,
    name: '数控操作工中级证书.jpg',
    type: '图片',
    uploadDate: '2026-04-05',
    size: '1.1 MB'
  },
  {
    id: 3,
    name: '学习心得_第一阶段.docx',
    type: 'Word',
    uploadDate: '2026-05-28',
    size: '48 KB'
  }
])

// ── Tabs config ────────────────────────────────────
const tabs = computed(() => [
  { key: 'courseware', icon: '📚', label: '培训课件', count: coursewareFiles.value.length },
  { key: 'videos', icon: '🎬', label: '部门培训视频', count: trainingVideos.value.length },
  { key: 'mine', icon: '🗂️', label: '我的资料', count: myFiles.value.length }
])

// ── Computed ────────────────────────────────────────
const filteredCourseware = computed(() => {
  return coursewareFiles.value.filter(f => {
    const matchSearch = !coursewareSearch.value ||
      f.name.includes(coursewareSearch.value) ||
      f.tutor.includes(coursewareSearch.value)
    const matchType = coursewareTypeFilter.value === '全部' ||
      f.type === coursewareTypeFilter.value
    return matchSearch && matchType
  })
})

// ── Methods ─────────────────────────────────────────
const getFileEmoji = (type) => {
  const map = { PDF: '📄', PPT: '📊', '视频': '🎬', '图片': '🖼️', Word: '📝' }
  return map[type] || '📁'
}

const getFileTagType = (type) => {
  const map = { PDF: 'danger', PPT: 'warning', '视频': 'info', '图片': 'success' }
  return map[type] || ''
}

const downloadFile = (file) => {
  ElMessage.success(`开始下载：${file.name}（原型模式，未实际下载）`)
}

const previewFile = (file) => {
  ElMessage.info(`预览：${file.name}（原型模式，文件预览器占位）`)
}

const playVideo = (video) => {
  currentVideo.value = video
  videoDialogVisible.value = true
}

const triggerMyUpload = () => {
  myFileInputRef.value?.click()
}

const processMyFiles = (files) => {
  Array.from(files).forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase()
    const typeMap = { pdf: 'PDF', doc: 'Word', docx: 'Word', jpg: '图片', jpeg: '图片', png: '图片' }
    const type = typeMap[ext] || '文件'
    const sizeMB = file.size / (1024 * 1024)
    const sizeStr = sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`
    myFiles.value.unshift({
      id: Date.now() + Math.random(),
      name: file.name,
      type,
      uploadDate: new Date().toISOString().slice(0, 10),
      size: sizeStr
    })
    ElMessage.success(`已添加：${file.name}`)
  })
}

const handleMyFileSelect = (event) => {
  processMyFiles(event.target.files)
  event.target.value = ''
}

const handleMyFileDrop = (event) => {
  myFileDragging.value = false
  processMyFiles(event.dataTransfer.files)
}

const deleteMyFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除「${file.name}」吗？删除后无法恢复。`,
      '删除确认',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    myFiles.value = myFiles.value.filter(f => f.id !== file.id)
    ElMessage.success('文件已删除')
  } catch {
    // cancelled
  }
}
</script>

<style scoped>
/* ── Tab Nav ── */
.tab-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 6px;
  box-shadow: var(--shadow-xs);
}

.tab-nav-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-nav-btn:hover {
  background: var(--bg-surface-subtle);
  color: var(--text-primary);
}

.tab-nav-btn.active {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.tab-icon { font-size: 16px; }

.tab-count {
  background: rgba(255,255,255,0.25);
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
}

.tab-nav-btn:not(.active) .tab-count {
  background: var(--bg-surface-subtle);
  color: var(--text-muted);
}

/* ── Tab Content ── */
.tab-content {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}

/* ── Toolbar ── */
.section-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input { width: 260px; }

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  padding: 5px 14px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  font-weight: 600;
}

.chip:hover:not(.active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ── Courseware List ── */
.courseware-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.courseware-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-surface);
  transition: background var(--transition-fast);
}

.courseware-item:hover {
  background: var(--color-primary-subtle);
}

/* ── File Type Icon ── */
.file-type-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.icon-pdf   { background: #fff1f2; }
.icon-ppt   { background: #fff7ed; }
.icon-视频  { background: #eff6ff; }
.icon-图片  { background: #f0fdf4; }
.icon-word  { background: #eff6ff; }

/* ── File Info ── */
.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.meta-tutor {
  color: var(--color-primary);
  font-weight: 600;
}

.meta-sep { color: var(--border-medium); }

.file-type-tag { margin-left: 4px; }

.file-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.file-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ── Video Grid ── */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.video-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--bg-surface);
}

.video-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* ── Video Thumbnail ── */
.video-thumbnail {
  position: relative;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-blue   { background: linear-gradient(135deg, #1e3a5f, #2563eb); }
.thumb-green  { background: linear-gradient(135deg, #064e3b, #059669); }
.thumb-purple { background: linear-gradient(135deg, #3b0764, #7c3aed); }

.thumb-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.thumb-emoji {
  font-size: 40px;
  opacity: 0.85;
}

.play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.15);
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 3px;
  transition: all var(--transition-fast);
  backdrop-filter: blur(4px);
}

.play-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 10px;
  background: rgba(0,0,0,0.65);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-xs);
}

.video-body {
  padding: 14px 16px;
}

.video-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.video-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.video-tag {
  padding: 2px 8px;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
}

/* ── My Upload Zone ── */
.my-upload-zone {
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--bg-surface-subtle);
  margin-bottom: 24px;
}

.my-upload-zone:hover,
.my-upload-zone.dragging {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}

.upload-zone-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-zone-icon {
  font-size: 32px;
  line-height: 1;
}

.upload-zone-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-zone-text strong {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.upload-zone-text span {
  font-size: 13px;
  color: var(--text-muted);
}

.upload-zone-types {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
}

/* ── My Files Header ── */
.my-files-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.my-files-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.my-files-count {
  font-size: 12px;
  color: var(--text-muted);
}

/* ── My Files List ── */
.my-files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.my-file-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.my-file-item:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-xs);
}

.my-file-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.my-file-info {
  flex: 1;
  min-width: 0;
}

.my-file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.my-file-meta {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.my-file-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ── Empty State ── */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-muted);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Video Player Modal ── */
.video-preview-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-player-mock {
  aspect-ratio: 16/9;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.player-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.player-emoji {
  font-size: 56px;
  opacity: 0.7;
}

.player-note {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  background: rgba(0,0,0,0.4);
  padding: 4px 14px;
  border-radius: var(--radius-full);
  backdrop-filter: blur(4px);
}

.video-detail-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.video-detail-meta {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.video-detail-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .tab-nav { flex-direction: column; }
  .video-grid { grid-template-columns: 1fr; }
  .section-toolbar { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .courseware-item { flex-wrap: wrap; }
  .file-actions { width: 100%; }
}
</style>
