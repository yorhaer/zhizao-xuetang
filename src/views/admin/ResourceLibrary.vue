<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">资料库</h1>
        <p class="page-subtitle">管理部门培训视频、公开课件及学员/导师个人资料</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.icon }} {{ tab.label }}
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- 培训视频 -->
    <div v-if="activeTab === 'videos'" class="tab-content">
      <div class="tab-toolbar">
        <span class="tab-total">共 {{ videos.length }} 个视频</span>
        <button class="btn-primary" @click="showVideoUpload = true">+ 上传视频</button>
      </div>
      <div class="video-grid">
        <div v-for="v in videos" :key="v.id" class="video-card">
          <div class="video-thumb">
            <div class="thumb-placeholder">🎬</div>
            <span class="video-duration">{{ v.duration }}</span>
          </div>
          <div class="video-info">
            <div class="video-title">{{ v.title }}</div>
            <div class="video-meta">{{ v.date }} · {{ v.size }}</div>
          </div>
          <div class="video-actions">
            <button class="icon-btn danger" @click="deleteVideo(v.id)">🗑</button>
          </div>
        </div>
      </div>
      <div v-if="videos.length === 0" class="empty-state">暂无培训视频</div>
    </div>

    <!-- 课件管理 -->
    <div v-if="activeTab === 'courseware'" class="tab-content">
      <div class="tab-toolbar">
        <span class="tab-total">共 {{ courseware.length }} 份课件</span>
        <div class="filter-row">
          <select class="select-sm" v-model="filterTutor">
            <option value="">全部导师</option>
            <option>王师傅</option>
            <option>李师傅</option>
          </select>
          <select class="select-sm" v-model="filterVisible">
            <option value="">全部可见性</option>
            <option value="true">公开</option>
            <option value="false">私有</option>
          </select>
        </div>
      </div>
      <div class="items-table">
        <div class="table-header">
          <span class="col-name">课件名称</span>
          <span class="col-tutor">导师</span>
          <span class="col-course">课程</span>
          <span class="col-status">可见性</span>
          <span class="col-date">上传时间</span>
          <span class="col-actions">操作</span>
        </div>
        <div v-for="item in filteredCourseware" :key="item.id" class="table-row">
          <span class="col-name">
            <span class="file-icon">{{ fileIcon(item.name) }}</span>
            {{ item.name }}
          </span>
          <span class="col-tutor">{{ item.tutor }}</span>
          <span class="col-course">{{ item.course }}</span>
          <span class="col-status">
            <span class="badge" :class="item.isPublic ? 'badge-green' : 'badge-gray'">
              {{ item.isPublic ? '公开' : '私有' }}
            </span>
          </span>
          <span class="col-date">{{ item.date }}</span>
          <span class="col-actions">
            <button class="text-btn" @click="item.isPublic = !item.isPublic">
              {{ item.isPublic ? '设为私有' : '设为公开' }}
            </button>
          </span>
        </div>
        <div v-if="filteredCourseware.length === 0" class="empty-state">暂无课件</div>
      </div>
    </div>

    <!-- 人员资料 -->
    <div v-if="activeTab === 'profiles'" class="tab-content">
      <div class="tab-toolbar">
        <span class="tab-total">共 {{ profiles.length }} 份资料</span>
        <div class="filter-row">
          <select class="select-sm" v-model="filterRole">
            <option value="">全部角色</option>
            <option value="student">学员</option>
            <option value="tutor">导师</option>
          </select>
        </div>
      </div>
      <div class="profiles-list">
        <div v-for="p in filteredProfiles" :key="p.id" class="profile-row">
          <div class="profile-avatar" :class="p.role === 'tutor' ? 'avatar-tutor' : 'avatar-student'">
            {{ p.name.charAt(0) }}
          </div>
          <div class="profile-info">
            <div class="profile-name">{{ p.name }}</div>
            <div class="profile-meta">{{ p.role === 'tutor' ? '导师' : '学员' }} · {{ p.fileName }}</div>
          </div>
          <div class="profile-meta-right">
            <span class="profile-date">{{ p.date }}</span>
          </div>
          <div class="profile-actions">
            <button class="text-btn">下载</button>
          </div>
        </div>
        <div v-if="filteredProfiles.length === 0" class="empty-state">暂无资料</div>
      </div>
    </div>

    <!-- 上传视频 Modal -->
    <div v-if="showVideoUpload" class="modal-overlay" @click.self="showVideoUpload = false">
      <div class="modal">
        <div class="modal-header">
          <h3>上传培训视频</h3>
          <button class="modal-close" @click="showVideoUpload = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">视频标题</label>
            <input class="input" type="text" placeholder="请输入视频标题" />
          </div>
          <div class="upload-zone" @click="() => {}">
            <div class="upload-icon">🎬</div>
            <p class="upload-text">点击或拖放视频文件</p>
            <p class="upload-hint">支持 MP4、MOV，最大 2GB</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showVideoUpload = false">取消</button>
          <button class="btn-primary" @click="showVideoUpload = false">确认上传</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('videos')
const showVideoUpload = ref(false)
const filterTutor = ref('')
const filterVisible = ref('')
const filterRole = ref('')

const videos = ref([
  { id: 1, title: '数控机床安全操作规程', duration: '18:32', size: '420 MB', date: '2025-11-01' },
  { id: 2, title: '5S管理现场实操演示', duration: '12:45', size: '285 MB', date: '2025-10-20' },
  { id: 3, title: '质量检验标准培训', duration: '24:10', size: '610 MB', date: '2025-10-08' },
])

const courseware = ref([
  { id: 1, name: '数控车床基础操作.pdf', tutor: '王师傅', course: '数控车床基础', isPublic: true, date: '2025-11-10' },
  { id: 2, name: '工艺图纸识读技巧.pptx', tutor: '王师傅', course: '工艺图纸识读', isPublic: true, date: '2025-11-08' },
  { id: 3, name: '质量检验标准手册.pdf', tutor: '李师傅', course: '质量检验实操', isPublic: false, date: '2025-10-25' },
  { id: 4, name: '数控编程示例.docx', tutor: '李师傅', course: '数控车床基础', isPublic: true, date: '2025-10-18' },
])

const profiles = ref([
  { id: 1, name: '张小明', role: 'student', fileName: '个人简历.pdf', date: '2025-11-05' },
  { id: 2, name: '王师傅', role: 'tutor', fileName: '导师资质证书.pdf', date: '2025-10-30' },
  { id: 3, name: '李小红', role: 'student', fileName: '个人简历.docx', date: '2025-10-28' },
  { id: 4, name: '李师傅', role: 'tutor', fileName: '技能证书扫描件.pdf', date: '2025-10-15' },
])

const tabs = computed(() => [
  { key: 'videos', label: '培训视频', icon: '🎬', count: videos.value.length },
  { key: 'courseware', label: '公开课件', icon: '📁', count: courseware.value.length },
  { key: 'profiles', label: '人员资料', icon: '📄', count: profiles.value.length },
])

const filteredCourseware = computed(() => courseware.value.filter(i => {
  if (filterTutor.value && i.tutor !== filterTutor.value) return false
  if (filterVisible.value !== '' && String(i.isPublic) !== filterVisible.value) return false
  return true
}))

const filteredProfiles = computed(() =>
  filterRole.value ? profiles.value.filter(p => p.role === filterRole.value) : profiles.value
)

const fileIcon = (name) => {
  if (name?.endsWith('.pdf')) return '📕'
  if (name?.endsWith('.pptx') || name?.endsWith('.ppt')) return '📊'
  if (name?.endsWith('.docx')) return '📝'
  return '📄'
}

const deleteVideo = (id) => { videos.value = videos.value.filter(v => v.id !== id) }
</script>

<style scoped>
.page { padding: 28px 32px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: var(--text-muted); margin: 0; }

.tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--border-light); }
.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px; border: none; background: transparent;
  font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 600; }
.tab-count {
  background: var(--bg-surface-subtle); color: var(--text-muted);
  padding: 1px 6px; border-radius: var(--radius-full); font-size: 11px;
}
.tab-btn.active .tab-count { background: rgba(79,110,242,0.1); color: var(--color-primary); }

.tab-content { background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); overflow: hidden; }
.tab-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid var(--border-light);
}
.tab-total { font-size: 13px; color: var(--text-muted); }
.filter-row { display: flex; gap: 8px; }
.select-sm { padding: 6px 10px; border-radius: var(--radius-md); border: 1px solid var(--border-light); background: var(--bg-surface-subtle); color: var(--text-secondary); font-size: 12px; }

.btn-primary {
  padding: 8px 18px; border-radius: var(--radius-md); border: none;
  background: var(--color-primary); color: white; font-size: 13px; font-weight: 600; cursor: pointer;
}
.btn-primary:hover { filter: brightness(1.1); }
.btn-cancel {
  padding: 8px 18px; border-radius: var(--radius-md);
  border: 1px solid var(--border-medium); background: transparent;
  color: var(--text-secondary); font-size: 13px; cursor: pointer;
}

/* Videos */
.video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; padding: 20px; }
.video-card { border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden; transition: box-shadow 0.15s; }
.video-card:hover { box-shadow: var(--shadow-md); }
.video-thumb { position: relative; background: #1e293b; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; }
.thumb-placeholder { font-size: 40px; opacity: 0.6; }
.video-duration { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: white; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
.video-info { padding: 12px 14px 8px; }
.video-title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.video-meta { font-size: 12px; color: var(--text-muted); }
.video-actions { display: flex; justify-content: flex-end; padding: 0 10px 10px; }

/* Table */
.items-table { overflow-x: auto; }
.table-header, .table-row {
  display: grid; grid-template-columns: 2fr 1fr 1fr 80px 100px 80px;
  padding: 10px 20px; gap: 12px; align-items: center;
}
.table-header { font-size: 12px; color: var(--text-muted); font-weight: 600; background: var(--bg-surface-subtle); }
.table-row { font-size: 13px; color: var(--text-primary); border-top: 1px solid var(--border-light); }
.table-row:hover { background: var(--bg-surface-subtle); }
.file-icon { margin-right: 6px; }
.badge { padding: 3px 8px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600; }
.badge-green { background: rgba(16,185,129,0.12); color: #10b981; }
.badge-gray { background: rgba(100,116,139,0.12); color: #64748b; }
.text-btn { background: none; border: none; color: var(--color-primary); font-size: 12px; cursor: pointer; padding: 0; }
.text-btn:hover { text-decoration: underline; }

/* Profiles */
.profiles-list { display: flex; flex-direction: column; }
.profile-row { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-top: 1px solid var(--border-light); }
.profile-row:hover { background: var(--bg-surface-subtle); }
.profile-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: white; flex-shrink: 0; }
.avatar-tutor { background: linear-gradient(135deg, #059669, #10b981); }
.avatar-student { background: linear-gradient(135deg, var(--color-primary), #818cf8); }
.profile-info { flex: 1; }
.profile-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.profile-meta { font-size: 12px; color: var(--text-muted); }
.profile-meta-right { font-size: 12px; color: var(--text-muted); }
.profile-date { font-size: 12px; color: var(--text-muted); }
.profile-actions { flex-shrink: 0; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--bg-surface); border-radius: var(--radius-xl); width: 480px; max-width: 95vw; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-light); }
.modal-header h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
.modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid var(--border-light); }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.input { padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light); background: var(--bg-surface-subtle); color: var(--text-primary); font-size: 13px; }
.upload-zone { border: 2px dashed var(--border-medium); border-radius: var(--radius-lg); padding: 32px; text-align: center; cursor: pointer; }
.upload-icon { font-size: 36px; margin-bottom: 10px; }
.upload-text { font-size: 14px; color: var(--text-secondary); margin: 0 0 4px; }
.upload-hint { font-size: 12px; color: var(--text-muted); margin: 0; }

.icon-btn { width: 30px; height: 30px; border-radius: var(--radius-sm); border: none; background: transparent; cursor: pointer; font-size: 15px; }
.icon-btn.danger:hover { background: rgba(239,68,68,0.1); }
.empty-state { padding: 40px; text-align: center; color: var(--text-muted); font-size: 14px; }
</style>
