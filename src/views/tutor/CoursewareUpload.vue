<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">课件上传</h1>
        <p class="page-subtitle">管理您的教学课件，可设置是否对学员公开</p>
      </div>
      <button class="btn-primary" @click="showUpload = true">+ 上传课件</button>
    </div>

    <!-- 上传模态框 -->
    <div v-if="showUpload" class="modal-overlay" @click.self="showUpload = false">
      <div class="modal">
        <div class="modal-header">
          <h3>上传课件</h3>
          <button class="modal-close" @click="showUpload = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">关联课程</label>
            <select class="select">
              <option value="">请选择课程</option>
              <option>数控车床基础</option>
              <option>工艺图纸识读</option>
              <option>质量检验实操</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">课件名称</label>
            <input class="input" type="text" placeholder="请输入课件名称" />
          </div>
          <div
            class="upload-zone"
            :class="{ dragover: isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
          >
            <input ref="fileInput" type="file" hidden accept=".pdf,.ppt,.pptx,.mp4,.docx" @change="handleFile" />
            <div class="upload-icon">📎</div>
            <p class="upload-text">拖放文件至此，或 <span class="upload-link">点击选择</span></p>
            <p class="upload-hint">支持 PDF、PPT、Word、MP4，最大 200MB</p>
            <div v-if="uploadFile" class="upload-preview">
              <span class="file-icon">{{ fileIcon(uploadFile.name) }}</span>
              <span class="file-name">{{ uploadFile.name }}</span>
              <span class="file-size">{{ formatSize(uploadFile.size) }}</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">公开设置</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="newItem.isPublic" :value="true" />
                <span class="radio-label">
                  <span class="radio-icon">🌐</span> 对所有学员公开
                </span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="newItem.isPublic" :value="false" />
                <span class="radio-label">
                  <span class="radio-icon">🔒</span> 仅自己可见
                </span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showUpload = false">取消</button>
          <button class="btn-primary" @click="handleUpload">确认上传</button>
        </div>
      </div>
    </div>

    <!-- 课件列表 -->
    <div class="section-card">
      <div class="card-header">
        <span class="card-count">共 {{ items.length }} 份课件</span>
        <div class="filter-row">
          <select class="select-sm" v-model="filterCourse">
            <option value="">全部课程</option>
            <option>数控车床基础</option>
            <option>工艺图纸识读</option>
            <option>质量检验实操</option>
          </select>
        </div>
      </div>

      <div class="items-list">
        <div v-for="item in filteredItems" :key="item.id" class="item-row">
          <div class="item-icon">{{ fileIcon(item.name) }}</div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-meta">
              <span>{{ item.course }}</span>
              <span class="dot">·</span>
              <span>{{ item.size }}</span>
              <span class="dot">·</span>
              <span>{{ item.date }}</span>
            </div>
          </div>
          <div class="item-actions">
            <span class="badge" :class="item.isPublic ? 'badge-green' : 'badge-gray'">
              {{ item.isPublic ? '公开' : '私有' }}
            </span>
            <button class="icon-btn" @click="togglePublic(item)" :title="item.isPublic ? '设为私有' : '设为公开'">
              {{ item.isPublic ? '🔒' : '🌐' }}
            </button>
            <button class="icon-btn danger" @click="deleteItem(item.id)" title="删除">🗑</button>
          </div>
        </div>

        <div v-if="filteredItems.length === 0" class="empty-state">
          <span>暂无课件，点击右上角上传</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showUpload = ref(false)
const isDragging = ref(false)
const uploadFile = ref(null)
const filterCourse = ref('')
const newItem = ref({ isPublic: true })

const items = ref([
  { id: 1, name: '数控车床基础操作.pdf', course: '数控车床基础', size: '3.2 MB', date: '2025-11-10', isPublic: true },
  { id: 2, name: '工艺图纸识读技巧.pptx', course: '工艺图纸识读', size: '8.6 MB', date: '2025-11-08', isPublic: true },
  { id: 3, name: '质量检验标准手册.pdf', course: '质量检验实操', size: '1.8 MB', date: '2025-10-25', isPublic: false },
  { id: 4, name: '数控编程示例.docx', course: '数控车床基础', size: '520 KB', date: '2025-10-18', isPublic: true },
])

const filteredItems = computed(() =>
  filterCourse.value ? items.value.filter(i => i.course === filterCourse.value) : items.value
)

const fileIcon = (name) => {
  if (!name) return '📄'
  if (name.endsWith('.pdf')) return '📕'
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return '📊'
  if (name.endsWith('.mp4') || name.endsWith('.mov')) return '🎬'
  if (name.endsWith('.docx') || name.endsWith('.doc')) return '📝'
  return '📄'
}

const formatSize = (bytes) => {
  if (!bytes) return ''
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

const handleFile = (e) => { uploadFile.value = e.target.files[0] }
const handleDrop = (e) => { isDragging.value = false; uploadFile.value = e.dataTransfer.files[0] }

const handleUpload = () => {
  items.value.unshift({
    id: Date.now(),
    name: uploadFile.value?.name || '新课件.pdf',
    course: '数控车床基础',
    size: uploadFile.value ? formatSize(uploadFile.value.size) : '—',
    date: new Date().toLocaleDateString('zh-CN').replace(/\//g, '-'),
    isPublic: newItem.value.isPublic
  })
  showUpload.value = false
  uploadFile.value = null
}

const togglePublic = (item) => { item.isPublic = !item.isPublic }
const deleteItem = (id) => { items.value = items.value.filter(i => i.id !== id) }
</script>

<style scoped>
.page { padding: 28px 32px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: var(--text-muted); margin: 0; }

.btn-primary {
  padding: 9px 20px; border-radius: var(--radius-md); border: none;
  background: var(--color-primary); color: white;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.btn-primary:hover { filter: brightness(1.1); }
.btn-cancel {
  padding: 9px 20px; border-radius: var(--radius-md);
  border: 1px solid var(--border-medium); background: transparent;
  color: var(--text-secondary); font-size: 13px; cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: var(--bg-surface); border-radius: var(--radius-xl);
  width: 520px; max-width: 95vw; box-shadow: var(--shadow-lg);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid var(--border-light);
}
.modal-header h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
.modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid var(--border-light); }

.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.select, .input {
  padding: 9px 12px; border-radius: var(--radius-md);
  border: 1px solid var(--border-light); background: var(--bg-surface-subtle);
  color: var(--text-primary); font-size: 13px;
}
.select:focus, .input:focus { outline: none; border-color: var(--color-primary); }

.upload-zone {
  border: 2px dashed var(--border-medium); border-radius: var(--radius-lg);
  padding: 28px; text-align: center; cursor: pointer; transition: all 0.15s;
  background: var(--bg-surface-subtle);
}
.upload-zone.dragover, .upload-zone:hover { border-color: var(--color-primary); background: rgba(79,110,242,0.04); }
.upload-icon { font-size: 32px; margin-bottom: 10px; }
.upload-text { font-size: 14px; color: var(--text-secondary); margin: 0 0 4px; }
.upload-link { color: var(--color-primary); font-weight: 600; }
.upload-hint { font-size: 12px; color: var(--text-muted); margin: 0; }
.upload-preview { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 12px; background: rgba(79,110,242,0.08); border-radius: var(--radius-md); }
.file-icon { font-size: 18px; }
.file-name { font-size: 13px; font-weight: 500; color: var(--text-primary); flex: 1; text-align: left; }
.file-size { font-size: 11px; color: var(--text-muted); }

.radio-group { display: flex; gap: 16px; }
.radio-item { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.radio-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); }
.radio-icon { font-size: 16px; }

/* List */
.section-card {
  background: var(--bg-surface); border: 1px solid var(--border-light);
  border-radius: var(--radius-lg); overflow: hidden;
}
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--border-light);
}
.card-count { font-size: 13px; color: var(--text-muted); }
.select-sm { padding: 6px 10px; border-radius: var(--radius-md); border: 1px solid var(--border-light); background: var(--bg-surface-subtle); color: var(--text-secondary); font-size: 12px; }

.items-list { display: flex; flex-direction: column; }
.item-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 20px; border-bottom: 1px solid var(--border-light);
  transition: background 0.1s;
}
.item-row:last-child { border-bottom: none; }
.item-row:hover { background: var(--bg-surface-subtle); }
.item-icon { font-size: 24px; flex-shrink: 0; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.item-meta { font-size: 12px; color: var(--text-muted); display: flex; gap: 6px; }
.dot { opacity: 0.5; }
.item-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.badge { padding: 3px 8px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600; }
.badge-green { background: rgba(16,185,129,0.12); color: #10b981; }
.badge-gray { background: rgba(100,116,139,0.12); color: #64748b; }

.icon-btn { width: 30px; height: 30px; border-radius: var(--radius-sm); border: none; background: transparent; cursor: pointer; font-size: 15px; transition: background 0.1s; }
.icon-btn:hover { background: var(--bg-surface-subtle); }
.icon-btn.danger:hover { background: rgba(239,68,68,0.1); }

.filter-row { display: flex; gap: 8px; }
.empty-state { padding: 40px; text-align: center; color: var(--text-muted); font-size: 14px; }
</style>
