<template>
  <div class="profile-page">
    <div class="profile-shell">
      <el-card shadow="never" class="profile-card">
        <div class="hero-row">
          <div class="profile-avatar-container">
            <img v-if="profile.photo" :src="profile.photo" class="profile-avatar-img" />
            <div v-else class="avatar" :class="{ 'avatar--tutor': isTutor }">
              {{ profile.name?.slice(-1) || '我' }}
            </div>
          </div>
          <div class="hero-main">
            <div class="title-row">
              <h2>{{ profile.name }}</h2>
              <el-tag>{{ roleLabel }}</el-tag>
              <el-tag v-if="positionText" type="info">{{ positionText }}</el-tag>
              <el-tag v-if="profile.level" type="success">{{ profile.level }}</el-tag>
            </div>
            <div class="meta-line">
              {{ profile.company || '未填写公司' }} · {{ profile.phone || '未填写电话' }} · {{ studioText }}
            </div>
            <div class="tag-row" v-if="isTutor">
              <el-tag v-for="tag in tagList" :key="tag" size="small" effect="plain">
                {{ tag }}
              </el-tag>
              <span v-if="!tagList.length" class="muted">暂无标签</span>
            </div>
            <div class="tag-row" v-else>
              <el-tag type="info" size="small" effect="plain">入职时间：{{ profile.entryDate || '2025-09-01' }}</el-tag>
            </div>
          </div>
          <el-button type="primary" @click="startEdit">编辑资料</el-button>
        </div>
      </el-card>

      <el-row :gutter="14" class="stat-row">
        <el-col :span="6" v-for="stat in stats" :key="stat.label">
          <el-card shadow="never" class="stat-card">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </el-card>
        </el-col>
      </el-row>

      <div class="content-grid">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ isTutor ? '履历与资质' : '个人基本档案' }}</span>
              <el-tag size="small" type="info">{{ isTutor ? '导师资料' : '学员资料' }}</el-tag>
            </div>
          </template>

          <template v-if="isStudent">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="姓名">{{ profile.name }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ profile.phone || '未填写' }}</el-descriptions-item>
              <el-descriptions-item label="所属公司">{{ profile.company || '未填写' }}</el-descriptions-item>
              <el-descriptions-item label="所属工作室">{{ studioText }}</el-descriptions-item>
              <el-descriptions-item label="入职时间">{{ profile.entryDate || '2025-09-01' }}</el-descriptions-item>
            </el-descriptions>

            <!-- Personal Photo Section -->
            <div class="photo-section">
              <div class="section-label">个人照片</div>
              <div class="photo-upload-zone" @click="triggerPhotoUpload">
                <input ref="photoInputRef" type="file" accept="image/*" style="display:none" @change="handlePhotoSelect" />
                <div v-if="profile.photo" class="photo-preview-wrap">
                  <img :src="profile.photo" class="uploaded-photo" />
                  <div class="photo-hover-overlay">更换照片</div>
                </div>
                <div v-else class="photo-placeholder">
                  <span class="upload-icon">📷</span>
                  <span>上传照片</span>
                </div>
              </div>
            </div>

            <!-- Attachment Section -->
            <div class="attachments-section">
              <div class="attachments-header">
                <span class="section-label">附件资料</span>
                <el-button size="small" type="primary" plain @click="triggerAttachmentUpload">上传附件</el-button>
                <input ref="attachmentInputRef" type="file" multiple style="display:none" @change="handleAttachmentSelect" />
              </div>
              <div v-if="!profile.attachments || profile.attachments.length === 0" class="attachments-empty">
                暂无附件资料，点击上方按钮上传个人简历、证书附件等。
              </div>
              <div v-else class="attachments-list">
                <div v-for="(file, idx) in profile.attachments" :key="idx" class="attachment-item">
                  <div class="file-info">
                    <span class="file-icon">📄</span>
                    <div class="file-meta">
                      <span class="file-name" :title="file.name">{{ file.name }}</span>
                      <span class="file-size">{{ file.size }} · {{ file.date }}</span>
                    </div>
                  </div>
                  <div class="file-actions">
                    <el-button size="small" text type="primary" @click="downloadAttachment(file)">下载</el-button>
                    <el-button size="small" text type="danger" @click="deleteAttachment(idx)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="履历摘要">
                {{ summaryText }}
              </el-descriptions-item>
              <el-descriptions-item label="教学年限">
                {{ profile.years || 0 }} 年
              </el-descriptions-item>
              <el-descriptions-item label="证书">
                <el-tag v-for="cert in certificateList" :key="cert" size="small" class="inline-tag">
                  {{ cert }}
                </el-tag>
                <span v-if="!certificateList.length" class="muted">暂无证书</span>
              </el-descriptions-item>
              <el-descriptions-item label="照片材料">
                {{ profile.photoMaterial || '头像/照片待上传' }}
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ isTutor ? '授课记录' : '培训与平时评价' }}</span>
              <span class="muted">按日期倒序</span>
            </div>
          </template>
          <el-table :data="trainingRows" stripe size="small" height="420">
            <el-table-column prop="courseName" label="课程" min-width="170" show-overflow-tooltip />
            <el-table-column prop="startDate" label="日期" width="110" />
            <el-table-column v-if="isStudent" prop="tutor" label="导师" width="90" />
            <el-table-column v-else label="学员" min-width="130" show-overflow-tooltip>
              <template #default="{ row }">{{ row.students.join('、') }}</template>
            </el-table-column>
            <el-table-column label="结果" width="110">
              <template #default="{ row }">
                <template v-if="isStudent">
                  <span v-if="row.dailyEvaluation" :class="['score-text', getScoreClass(ratingToScore(row.dailyEvaluation.rating))]">
                    {{ ratingToScore(row.dailyEvaluation.rating) }}分
                  </span>
                  <span v-else class="muted">暂无</span>
                </template>
                <template v-else>
                  <span v-if="row.avgScore" :class="['score-text', getScoreClass(row.avgScore)]">
                    {{ row.avgScore }}分
                  </span>
                  <span v-else class="muted">未录入</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="闭环" width="90">
              <template #default="{ row }">
                <el-tag :type="row.closed ? 'success' : 'warning'" size="small">
                  {{ row.closed ? '已闭环' : '待补' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>

    <el-dialog v-model="editVisible" title="编辑我的资料" width="620px">
      <el-form :model="form" label-width="92px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="isTutor ? '导师方向' : '岗位'" v-if="isTutor">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="公司">
          <el-input v-model="form.company" />
        </el-form-item>
        <el-form-item label="工作室">
          <el-select v-model="form.studio" style="width: 100%">
            <el-option label="一号工作室" value="studio_a" />
            <el-option label="二号工作室" value="studio_b" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职时间" v-if="isStudent">
          <el-date-picker v-model="form.entryDate" type="date" value-format="YYYY-MM-DD" placeholder="选择入职时间" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="isTutor" label="等级">
          <el-input v-model="form.level" />
        </el-form-item>
        <el-form-item v-if="isTutor" label="教学年限">
          <el-input-number v-model="form.years" :min="0" :max="50" />
        </el-form-item>
        <el-form-item :label="isTutor ? '履历摘要' : '简历摘要'" v-if="isTutor">
          <el-input v-model="form.summary" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item :label="isTutor ? '专长标签' : '技能标签'" v-if="isTutor">
          <el-input v-model="form.tags" placeholder="多个标签用顿号或逗号分隔" />
        </el-form-item>
        <el-form-item label="证书" v-if="isTutor">
          <el-input v-model="form.certificates" placeholder="多个证书用顿号或逗号分隔" />
        </el-form-item>
        <el-form-item label="照片材料" v-if="isTutor">
          <el-input v-model="form.photoMaterial" placeholder="填写照片或头像材料名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import {
  students,
  tutors,
  getStudentProfileSummary,
  getTutorProfileSummary,
  ratingToScore
} from '../api/mockData'

const userStore = useUserStore()
const editVisible = ref(false)
const photoInputRef = ref(null)
const attachmentInputRef = ref(null)

const form = reactive({
  name: '',
  title: '',
  phone: '',
  company: '',
  studio: 'studio_a',
  entryDate: '',
  level: '',
  years: 0,
  summary: '',
  tags: '',
  certificates: '',
  photoMaterial: ''
})

const role = computed(() => userStore.userRole || 'student')
const isStudent = computed(() => role.value === 'student')
const isTutor = computed(() => role.value === 'tutor')
const roleLabel = computed(() => isTutor.value ? '导师' : '学员')

const overrideVersion = ref(0)
const profileKey = computed(() => `profile:${role.value}:${userStore.userInfo.id || 'current'}`)

const overrides = computed(() => {
  overrideVersion.value
  try {
    return JSON.parse(localStorage.getItem(profileKey.value) || '{}')
  } catch {
    return {}
  }
})

const baseProfile = computed(() => {
  const source = isTutor.value ? tutors : students
  const matched = source.find(item => item.id === userStore.userInfo.id || item.name === userStore.userName)
  if (matched) {
    const defaultDates = {
      '学员A': '2025-09-01',
      '学员B': '2025-10-01',
      '学员C': '2025-11-01',
      '学员D': '2025-12-01',
      '学员E': '2026-01-01',
      '学员F': '2026-02-01',
      '张三（鑫泰）': '2025-09-15',
      '李四（鑫悦）': '2025-10-15',
      '王五（盛泰）': '2025-11-15'
    }
    return {
      entryDate: defaultDates[matched.name] || '2025-09-01',
      photo: '',
      attachments: [],
      ...matched
    }
  }
  return {
    id: userStore.userInfo.id || 999,
    name: userStore.userName || '演示用户',
    studio: userStore.currentStudio,
    company: '',
    phone: '',
    roleTitle: '岗位待补充',
    entryDate: '2025-09-01',
    title: '方向待补充',
    resumeSummary: '',
    profileSummary: '',
    skillTags: [],
    specialtyTags: [],
    certificates: [],
    photo: '',
    attachments: []
  }
})

const profile = computed(() => ({ ...baseProfile.value, ...overrides.value }))
const summary = computed(() => isTutor.value
  ? getTutorProfileSummary(profile.value.id)
  : getStudentProfileSummary(profile.value.id)
)

// DYNAMIC TRAINING ROWS - fetch completed from zhizao_excel_groups for trainee, or fallback to mock summary.trainings
const trainingRows = computed(() => {
  if (isTutor.value) {
    return summary.value.trainings || []
  }
  
  // For student, extract completed rows dynamically
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return summary.value.trainings || []
  
  const list = JSON.parse(listStr)
  const result = []
  list.forEach(group => {
    group.rows.forEach((row, rowIndex) => {
      if (row.trainee === profile.value.name && row.completedText === '√') {
        result.push({
          id: `${group.id}-${rowIndex}`,
          courseName: group.trainingTopic,
          startDate: row.trainingDate || '2026-06-15',
          tutor: group.trainer,
          dailyEvaluation: row.rating ? { rating: row.rating, comment: row.remark } : null,
          closed: row.completedText === '√'
        })
      }
    })
  })
  
  // Sort by date desc
  result.sort((a, b) => b.startDate.localeCompare(a.startDate))
  return result.length > 0 ? result : (summary.value.trainings || [])
})

const studioText = computed(() => profile.value.studio === 'studio_b' ? '二号工作室' : '一号工作室')
const positionText = computed(() => isTutor.value ? profile.value.title : profile.value.roleTitle)
const summaryText = computed(() => profile.value.profileSummary || profile.value.resumeSummary || '暂无摘要')
const tagList = computed(() => profile.value.specialtyTags || profile.value.skillTags || [])
const certificateList = computed(() => profile.value.certificates || [])

const stats = computed(() => {
  if (isTutor.value) {
    return [
      { label: '授课场次', value: summary.value.trainingCount || 0 },
      { label: '覆盖学员', value: summary.value.studentCount || 0 },
      { label: '平均评价', value: summary.value.avgRating ? `${summary.value.avgRating}分` : '暂无' },
      { label: '闭环课程', value: summary.value.closedCount || 0 }
    ]
  }
  
  const completedCount = trainingRows.value.length
  return [
    { label: '培训场次', value: completedCount || summary.value.trainingCount || 0 },
    { label: '闭环场次', value: completedCount || summary.value.closedCount || 0 },
    { label: '最终得分', value: summary.value.stageFinalScore ? `${summary.value.stageFinalScore}分` : '暂无' },
    { label: '平时评价', value: summary.value.classroomScore ? `${summary.value.classroomScore}分` : '暂无' }
  ]
})

const splitList = (value) => value
  .split(/[、,，]/)
  .map(item => item.trim())
  .filter(Boolean)

const startEdit = () => {
  form.name = profile.value.name || ''
  form.title = isTutor.value ? (profile.value.title || '') : (profile.value.roleTitle || '')
  form.phone = profile.value.phone || ''
  form.company = profile.value.company || ''
  form.studio = profile.value.studio || userStore.currentStudio
  form.entryDate = profile.value.entryDate || ''
  form.level = profile.value.level || ''
  form.years = profile.value.years || 0
  form.summary = summaryText.value
  form.tags = tagList.value.join('、')
  form.certificates = certificateList.value.join('、')
  form.photoMaterial = profile.value.photoMaterial || ''
  editVisible.value = true
}

const saveProfile = () => {
  const payload = {
    name: form.name,
    phone: form.phone,
    company: form.company,
    studio: form.studio,
    entryDate: form.entryDate,
    photo: profile.value.photo || '',
    attachments: profile.value.attachments || []
  }
  if (isTutor.value) {
    Object.assign(payload, {
      title: form.title,
      level: form.level,
      years: form.years,
      profileSummary: form.summary,
      specialtyTags: splitList(form.tags),
      certificates: splitList(form.certificates),
      photoMaterial: form.photoMaterial
    })
  } else {
    Object.assign(payload, {
      roleTitle: form.title
    })
  }

  localStorage.setItem(profileKey.value, JSON.stringify(payload))
  overrideVersion.value += 1
  userStore.setUserInfo({ ...userStore.userInfo, name: form.name })
  userStore.setStudio(form.studio)
  editVisible.value = false
  ElMessage.success('资料已更新')
}

const getScoreClass = (score) => {
  if (!score) return 'score-empty'
  if (score >= 90) return 'score-excellent'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// ── File Management Methods ─────────────────────────
const updateProfileField = (key, value) => {
  const currentOverrides = JSON.parse(localStorage.getItem(profileKey.value) || '{}')
  currentOverrides[key] = value
  localStorage.setItem(profileKey.value, JSON.stringify(currentOverrides))
  overrideVersion.value += 1
}

const triggerPhotoUpload = () => {
  photoInputRef.value?.click()
}

const handlePhotoSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    updateProfileField('photo', event.target.result)
    ElMessage.success('照片上传成功')
  }
  reader.readAsDataURL(file)
}

const triggerAttachmentUpload = () => {
  attachmentInputRef.value?.click()
}

const handleAttachmentSelect = (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const newAttachment = {
        name: file.name,
        url: event.target.result,
        size: formatFileSize(file.size),
        date: new Date().toLocaleDateString('zh-CN')
      }
      const currentAttachments = [...(profile.value.attachments || [])]
      currentAttachments.push(newAttachment)
      updateProfileField('attachments', currentAttachments)
      ElMessage.success(`附件「${file.name}」上传成功`)
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

const deleteAttachment = (index) => {
  const currentAttachments = [...(profile.value.attachments || [])]
  currentAttachments.splice(index, 1)
  updateProfileField('attachments', currentAttachments)
  ElMessage.success('附件已删除')
}

const downloadAttachment = (file) => {
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.profile-page {
  padding: 20px;
}

.profile-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-card,
.stat-card {
  border-radius: 10px;
}

.hero-row,
.title-row,
.tag-row,
.card-header {
  display: flex;
  align-items: center;
}

.hero-row {
  gap: 16px;
}

.avatar {
  width: 76px;
  height: 76px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-primary), #10b981);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  flex-shrink: 0;
}

.avatar--tutor {
  background: linear-gradient(135deg, #059669, #10b981);
}

.hero-main {
  flex: 1;
  min-width: 0;
}

.title-row {
  gap: 8px;
  flex-wrap: wrap;
}

.title-row h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 22px;
}

.meta-line {
  margin-top: 8px;
  color: var(--text-secondary);
}

.tag-row {
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.stat-row {
  margin-top: 0;
}

.stat-card {
  min-height: 86px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-label,
.muted {
  color: var(--text-muted);
  font-size: 12px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(480px, 1.1fr);
  gap: 14px;
}

.card-header {
  justify-content: space-between;
}

.inline-tag {
  margin-right: 6px;
}

.score-text {
  font-weight: 700;
}

.score-excellent {
  color: #67c23a;
}

.score-pass {
  color: #409eff;
}

.score-fail {
  color: #f56c6c;
}

.score-empty {
  color: #909399;
}

/* Custom Photo Upload & Attachments */
.photo-section {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}

.photo-upload-zone {
  width: 120px;
  height: 150px;
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-fast);
  background: var(--bg-surface-subtle);
}

.photo-upload-zone:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}

.photo-preview-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.uploaded-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.photo-preview-wrap:hover .photo-hover-overlay {
  opacity: 1;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 12px;
}

.upload-icon {
  font-size: 20px;
}

.attachments-section {
  margin-top: 20px;
  border-top: 1px dashed var(--border-light);
  padding-top: 16px;
}

.attachments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.attachments-empty {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 16px;
  background: var(--bg-surface-subtle);
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-md);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.attachment-item:hover {
  border-color: var(--border-medium);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.file-icon {
  font-size: 18px;
}

.file-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: var(--text-muted);
}

.file-actions {
  display: flex;
  gap: 4px;
}

.profile-avatar-container {
  width: 76px;
  height: 76px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--border-light);
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
