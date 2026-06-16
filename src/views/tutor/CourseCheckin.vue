<template>
  <div class="page-container fade-in-up">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>提交课程记录</h2>
        <p>每次授课结束后提交记录，支持文字笔记或图片，两者均可</p>
      </div>
    </div>

    <div class="checkin-layout">
      <!-- Left: Form -->
      <div class="form-area">
        <div class="form-card">

          <!-- Step 1: Select Course & Trainee -->
          <div class="form-step">
            <div class="step-label">
              <span class="step-num">1</span>
              <span>选择课程与参训学员</span>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <el-select
                v-model="form.courseName"
                placeholder="请选择本次授课的课程"
                size="large"
                style="flex: 1; min-width: 200px;"
                @change="form.trainee = ''"
              >
                <el-option
                  v-for="course in courseOptions"
                  :key="course"
                  :label="course"
                  :value="course"
                />
              </el-select>
              <el-select
                v-model="form.trainee"
                placeholder="请选择参训学员"
                size="large"
                style="flex: 1; min-width: 200px;"
                :disabled="!form.courseName"
              >
                <el-option
                  v-for="trainee in traineeOptions"
                  :key="trainee"
                  :label="trainee"
                  :value="trainee"
                />
              </el-select>
            </div>
          </div>

          <!-- Step 2: Content -->
          <div class="form-step">
            <div class="step-label">
              <span class="step-num">2</span>
              <span>记录与评价内容</span>
              <span class="step-hint">文字或图片，至少填写一项（对学员评价与课程截图在此合并提交）</span>
            </div>

            <!-- Tab Toggle -->
            <div class="content-tabs">
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'text' }"
                @click="activeTab = 'text'"
              >
                ✏️ 文字评价/记录
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'image' }"
                @click="activeTab = 'image'"
              >
                🖼️ 上传课程截图
              </button>
            </div>

            <!-- Text Tab -->
            <div v-show="activeTab === 'text'" class="tab-body">
              <el-input
                v-model="form.textContent"
                type="textarea"
                :rows="8"
                placeholder="记录本次课程的重点内容，并写下对学员表现的综合评价和改进建议（系统将自动同步至学员档案中）..."
                maxlength="2000"
                show-word-limit
                resize="none"
                class="text-area"
              />
              <!-- Quick fill hint -->
              <div class="quick-tags">
                <span class="quick-tags-label">快速添加：</span>
                <button
                  v-for="tag in quickTags"
                  :key="tag"
                  class="quick-tag-btn"
                  @click="appendTag(tag)"
                >{{ tag }}</button>
              </div>
            </div>

            <!-- Image Tab -->
            <div v-show="activeTab === 'image'" class="tab-body">
              <div
                class="upload-zone"
                :class="{ 'upload-zone--dragging': isDragging, 'upload-zone--has-files': previewImages.length > 0 }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  multiple
                  style="display: none"
                  @change="handleFileSelect"
                />
                <div v-if="previewImages.length === 0" class="upload-placeholder">
                  <div class="upload-icon">📷</div>
                  <div class="upload-text">拖拽图片到此处，或 <em>点击选择</em></div>
                  <div class="upload-hint">支持 JPG、PNG、GIF，单张最大 10MB</div>
                </div>
              </div>

              <!-- Image Previews -->
              <div v-if="previewImages.length > 0" class="preview-grid">
                <div
                  v-for="(img, idx) in previewImages"
                  :key="idx"
                  class="preview-item"
                >
                  <img :src="img.url" :alt="img.name" class="preview-img" />
                  <div class="preview-overlay">
                    <button class="preview-remove" @click.stop="removeImage(idx)">✕</button>
                  </div>
                  <div class="preview-name">{{ img.name }}</div>
                </div>
                <button class="preview-add-more" @click="triggerFileInput">
                  <span>＋</span>
                  <span>继续添加</span>
                </button>
              </div>
            </div>

            <!-- Both filled indicator -->
            <div v-if="form.textContent && previewImages.length > 0" class="both-filled-notice">
              <span>✓</span> 已填写评价文字 + {{ previewImages.length }} 张课程截图，内容更丰富！
            </div>
          </div>

          <!-- Step 3: Star Rating -->
          <div class="form-step">
            <div class="step-label">
              <span class="step-num">3</span>
              <span>学员表现评分</span>
              <span class="step-hint">对学员在本次授课中的整体表现打分</span>
            </div>
            <div style="display: flex; align-items: center; padding: 4px 0;">
              <el-rate v-model="form.rating" size="large" show-score score-template="{value} 星" />
            </div>
          </div>

          <!-- Step 4: Date -->
          <div class="form-step">
            <div class="step-label">
              <span class="step-num">4</span>
              <span>授课日期</span>
              <span class="step-hint">默认为今天</span>
            </div>
            <el-date-picker
              v-model="form.date"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择授课日期"
              size="large"
              style="width: 100%"
              :disabled-date="disableFuture"
            />
          </div>

          <!-- Submit -->
          <div class="form-actions">
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              :disabled="!canSubmit"
              class="submit-btn"
              @click="handleSubmit"
            >
              <span v-if="!submitting">📝 提交记录与评价</span>
              <span v-else>提交中...</span>
            </el-button>
            <el-button size="large" @click="resetForm">重置</el-button>
          </div>

          <!-- Validation hint -->
          <div v-if="!canSubmit && (form.courseName && form.trainee)" class="validation-hint">
            ⚠️ 请至少填写评价文字或上传一张课程截图
          </div>
        </div>
      </div>

      <!-- Right: History -->
      <div class="history-area">
        <!-- Upcoming Schedule Card -->
        <div class="schedule-card">
          <div class="history-header">
            <h3 style="display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700;">📅 最近课程安排 ({{ currentUserName }})</h3>
          </div>
          
          <div v-if="tutorSchedule.length === 0" class="history-empty">
            <div class="empty-icon">📅</div>
            <div>该导师暂无课程安排</div>
          </div>
          
          <div v-else class="schedule-list">
            <div
              v-for="item in tutorSchedule"
              :key="item.rowKey"
              class="schedule-item"
              :class="{ 'status-done': item.completedText === '√' }"
              @click="fillFromSchedule(item)"
            >
              <div class="schedule-item-top">
                <span class="schedule-topic">{{ item.trainingTopic }}</span>
                <span :class="['schedule-badge', item.completedText === '√' ? 'done' : 'pending']">
                  {{ item.completedText === '√' ? '已完成' : '待上课' }}
                </span>
              </div>
              <div class="schedule-item-meta">
                <span>学员：{{ item.trainee }}</span>
                <span class="meta-sep">·</span>
                <span>日期：{{ item.trainingDate }}</span>
              </div>
              <div class="schedule-item-time" v-if="item.startTime">
                ⏰ {{ item.startTime }}–{{ item.endTime }} ({{ item.durationHours }}H)
              </div>
              <div class="click-to-fill-hint">点击：一键填入上方记录表</div>
            </div>
          </div>
        </div>

        <div class="history-card">
          <div class="history-header">
            <h3>最近提交记录</h3>
            <span class="history-count">{{ history.length }} 条</span>
          </div>

          <div v-if="history.length === 0" class="history-empty">
            <div class="empty-icon">📭</div>
            <div>暂无记录</div>
          </div>

          <div v-else class="history-list">
            <div
              v-for="record in history"
              :key="record.id"
              class="history-item"
            >
              <div class="history-item-left">
                <div class="history-type-icon">{{ getTypeIcon(record.type) }}</div>
              </div>
              <div class="history-item-body">
                <div class="history-course">{{ record.courseName }}</div>
                <div class="history-meta">
                  <span class="history-date">{{ record.date }}</span>
                  <span class="history-type-badge" :class="`type-${record.type}`">
                    {{ getTypeLabel(record.type) }}
                  </span>
                </div>
                <div v-if="record.preview" class="history-preview">{{ record.preview }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick tips -->
        <div class="tips-card">
          <div class="tips-title">💡 记录小贴士</div>
          <ul class="tips-list">
            <li>文字记录一般包含课程重点、学员表现、待改进点</li>
            <li>图片可以是板书、实操照片、学员作品</li>
            <li>两者都填写效果最佳，有助于管理员全面了解课程</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Success Toast (custom) -->
    <transition name="toast-slide">
      <div v-if="showToast" class="success-toast">
        <span class="toast-icon">✅</span>
        <span>课程记录已成功提交！</span>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'

// ── State ──────────────────────────────────────────
const activeTab = ref('text')
const isDragging = ref(false)
const submitting = ref(false)
const showToast = ref(false)
const fileInputRef = ref(null)
const previewImages = ref([])

const today = new Date().toISOString().slice(0, 10)

const form = reactive({
  courseName: '',
  trainee: '',
  textContent: '',
  rating: 5,
  date: today
})

const traineeOptions = computed(() => {
  if (!form.courseName) return []
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return ['张三（鑫泰）', '李四（鑫悦）', '王五（盛泰）', '学员A', '学员B', '学员C']
  const list = JSON.parse(listStr)
  const result = []
  list.forEach(group => {
    if (group.trainingTopic === form.courseName && group.trainer === selectedTutor.value) {
      group.rows.forEach(r => {
        if (r.trainee) result.push(r.trainee)
      })
    }
  })
  if (result.length === 0) {
    list.forEach(group => {
      if (group.trainingTopic === form.courseName) {
        group.rows.forEach(r => {
          if (r.trainee) result.push(r.trainee)
        })
      }
    })
  }
  return Array.from(new Set(result.length > 0 ? result : ['张三（鑫泰）', '李四（鑫悦）', '王五（盛泰）', '学员A', '学员B']))
})

// User Store Setup
const userStore = useUserStore()
const currentUserName = computed(() => userStore.userName || '宋师傅')
// Dynamic tutor options from schedule list
const tutorOptionsList = computed(() => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return ['宋师傅', '黄师傅', '施师傅', '余师傅', '励师傅', '陈师傅']
  const list = JSON.parse(listStr)
  const trainers = list.map(g => g.trainer).filter(Boolean)
  return Array.from(new Set(trainers))
})

const selectedTutor = computed(() => {
  const options = tutorOptionsList.value
  const loginName = currentUserName.value
  if (options.includes(loginName)) return loginName
  return options.includes('宋师傅') ? '宋师傅' : (options[0] || '宋师傅')
})

// Dynamic tutor schedule
const tutorSchedule = computed(() => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return []
  
  const list = JSON.parse(listStr)
  const result = []
  list.forEach(group => {
    if (group.trainer === selectedTutor.value) {
      group.rows.forEach((row, rowIndex) => {
        result.push({
          rowKey: `${group.id}-${rowIndex}`,
          group,
          trainingTopic: group.trainingTopic,
          trainee: row.trainee,
          trainingDate: row.trainingDate,
          startTime: row.startTime,
          endTime: row.endTime,
          durationHours: row.durationHours,
          completedText: row.completedText
        })
      })
    }
  })
  
  // Sort schedule: pending first, then sort by date desc
  return result.sort((a, b) => {
    const aDone = a.completedText === '√' ? 1 : 0
    const bDone = b.completedText === '√' ? 1 : 0
    if (aDone !== bDone) return aDone - bDone
    return String(b.trainingDate).localeCompare(String(a.trainingDate))
  })
})

const fillFromSchedule = (item) => {
  form.courseName = item.trainingTopic
  form.trainee = item.trainee
  let parsedDate = today
  if (item.trainingDate) {
    const parts = item.trainingDate.split('.')
    if (parts.length === 2) {
      const month = parts[0].padStart(2, '0')
      const day = parts[1].padStart(2, '0')
      parsedDate = `2026-${month}-${day}`
    } else if (item.trainingDate.includes('-')) {
      parsedDate = item.trainingDate
    }
  }
  form.date = parsedDate
  ElMessage.success(`已自动填入「${item.trainingTopic}」学员「${item.trainee}」排班信息`)
}

// ── Mock Data ──────────────────────────────────────
const courseOptions = computed(() => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) {
    return [
      '数控车床基础',
      '工艺图纸识读',
      '质量检验实操',
      '液压系统维护',
      '安全生产规程',
      '机械加工工艺',
      '精密测量技术'
    ]
  }
  const list = JSON.parse(listStr)
  const topics = list.map(g => g.trainingTopic).filter(Boolean)
  return Array.from(new Set(topics))
})

const quickTags = [
  '学员积极性高',
  '完成实操练习',
  '需要加强练习',
  '理论掌握较好',
  '课堂纪律良好',
  '有疑问待解答'
]

const history = ref([
  {
    id: 1,
    courseName: '数控车床基础',
    date: '2026-06-13',
    type: 'both',
    preview: '今日重点讲解了车床刀具的选用原则，学员整体表现不错，李明操作较为熟练...'
  },
  {
    id: 2,
    courseName: '工艺图纸识读',
    date: '2026-06-11',
    type: 'text',
    preview: '本节课聚焦于公差标注的解读方法，强调了IT精度等级的记忆要点...'
  },
  {
    id: 3,
    courseName: '质量检验实操',
    date: '2026-06-10',
    type: 'image',
    preview: null
  },
  {
    id: 4,
    courseName: '液压系统维护',
    date: '2026-06-08',
    type: 'text',
    preview: '讲解了液压油路的常见故障排查步骤，学员反应良好...'
  },
  {
    id: 5,
    courseName: '数控车床基础',
    date: '2026-06-06',
    type: 'both',
    preview: '完成了G代码基础编程练习，拍摄了学员实操照片存档...'
  }
])

// ── Computed ────────────────────────────────────────
const canSubmit = computed(() => {
  if (!form.courseName || !form.trainee) return false
  return form.textContent.trim().length > 0 || previewImages.value.length > 0
})

// ── Methods ─────────────────────────────────────────
const appendTag = (tag) => {
  if (form.textContent && !form.textContent.endsWith('\n')) {
    form.textContent += '\n'
  }
  form.textContent += tag
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const processFiles = (files) => {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImages.value.push({
        name: file.name,
        url: e.target.result,
        file
      })
    }
    reader.readAsDataURL(file)
  })
}

const handleFileSelect = (event) => {
  processFiles(event.target.files)
  event.target.value = '' // reset so same file can be re-added
}

const handleDrop = (event) => {
  isDragging.value = false
  processFiles(event.dataTransfer.files)
}

const removeImage = (idx) => {
  previewImages.value.splice(idx, 1)
}

const disableFuture = (date) => date > new Date()

const getTypeIcon = (type) => {
  if (type === 'text') return '✏️'
  if (type === 'image') return '🖼️'
  return '📋'
}

const getTypeLabel = (type) => {
  if (type === 'text') return '文字'
  if (type === 'image') return '图片'
  return '文字+图片'
}

const determineType = () => {
  const hasText = form.textContent.trim().length > 0
  const hasImage = previewImages.value.length > 0
  if (hasText && hasImage) return 'both'
  if (hasText) return 'text'
  return 'image'
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  submitting.value = true

  setTimeout(() => {
    // 1. Update zhizao_excel_groups in localStorage
    const listStr = localStorage.getItem('zhizao_excel_groups')
    if (listStr) {
      const list = JSON.parse(listStr)
      let found = false
      for (let group of list) {
        if (group.trainingTopic === form.courseName && group.trainer === selectedTutor.value) {
          for (let row of group.rows) {
            if (row.trainee === form.trainee) {
              row.completedText = '√'
              row.remark = form.textContent.trim()
              row.rating = form.rating
              row.photos = previewImages.value.map(img => img.url)
              row.trainingDate = form.date
              row.adminRemark = ''
              row.archiveStatus = 'pending'
              found = true
              break
            }
          }
        }
        if (found) break
      }

      if (!found) {
        for (let group of list) {
          if (group.trainingTopic === form.courseName) {
            for (let row of group.rows) {
              if (row.trainee === form.trainee) {
                row.completedText = '√'
                row.remark = form.textContent.trim()
                row.rating = form.rating
                row.photos = previewImages.value.map(img => img.url)
                row.trainingDate = form.date
                row.adminRemark = ''
                row.archiveStatus = 'pending'
                found = true
                break
              }
            }
          }
          if (found) break
        }
      }
      localStorage.setItem('zhizao_excel_groups', JSON.stringify(list))
    }

    // 2. Add to history
    const type = determineType()
    const newRecord = {
      id: Date.now(),
      courseName: form.courseName,
      trainee: form.trainee,
      date: form.date,
      type,
      preview: form.textContent.trim().slice(0, 80) || null
    }
    history.value.unshift(newRecord)
    if (history.value.length > 5) history.value = history.value.slice(0, 5)

    submitting.value = false
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)

    resetForm()
  }, 900)
}

const resetForm = () => {
  form.courseName = ''
  form.trainee = ''
  form.textContent = ''
  form.rating = 5
  form.date = today
  previewImages.value = []
  activeTab.value = 'text'
}
</script>

<style scoped>
/* ── Layout ── */
.checkin-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}

/* ── Form Card ── */
.form-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ── Step ── */
.form-step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-hint {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 4px;
}

/* ── Tabs ── */
.content-tabs {
  display: flex;
  gap: 0;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 9px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: var(--shadow-xs);
}

.tab-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Quick Tags ── */
.quick-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.quick-tags-label {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.quick-tag-btn {
  padding: 3px 10px;
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-tag-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-subtle);
}

/* ── Upload Zone ── */
.upload-zone {
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--bg-surface-subtle);
  text-align: center;
}

.upload-zone:hover,
.upload-zone--dragging {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}

.upload-zone--has-files {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 36px;
  line-height: 1;
}

.upload-text {
  font-size: 15px;
  color: var(--text-secondary);
}

.upload-text em {
  color: var(--color-primary);
  font-style: normal;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-style: dashed;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Preview Grid ── */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}

.preview-item {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-light);
  background: var(--bg-surface-subtle);
}

.preview-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
}

.preview-remove {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(15, 23, 42, 0.7);
  color: white;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}

.preview-remove:hover {
  background: var(--color-danger);
}

.preview-name {
  padding: 4px 6px;
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-add-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  aspect-ratio: 1;
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.preview-add-more span:first-child {
  font-size: 22px;
  line-height: 1;
}

.preview-add-more:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ── Both Filled ── */
.both-filled-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--color-success-bg);
  border: 1px solid #a7f3d0;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: #059669;
  font-weight: 500;
}

/* ── Actions ── */
.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 4px;
}

.submit-btn {
  flex: 1;
  font-size: 16px !important;
  font-weight: 600 !important;
}

.validation-hint {
  font-size: 12px;
  color: var(--color-warning);
  margin-top: -16px;
}

/* ── Right Area ── */
.history-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 24px;
}

/* ── History Card ── */
.history-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-surface-subtle);
}

.history-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.history-count {
  font-size: 12px;
  color: var(--text-muted);
}

.history-empty {
  padding: 36px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.empty-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-light);
  transition: background var(--transition-fast);
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: var(--bg-surface-subtle);
}

.history-type-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-subtle);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.history-item-body {
  flex: 1;
  min-width: 0;
}

.history-course {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.history-date {
  font-size: 12px;
  color: var(--text-muted);
}

.history-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: var(--radius-full);
}

.type-text {
  background: #eff6ff;
  color: #2563eb;
}

.type-image {
  background: #f0fdf4;
  color: #059669;
}

.type-both {
  background: #fdf4ff;
  color: #9333ea;
}

.history-preview {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Tips Card ── */
.tips-card {
  background: linear-gradient(135deg, #fef9ec, #fffbeb);
  border: 1px solid #fde68a;
  border-radius: var(--radius-lg);
  padding: 16px 18px;
}

.tips-title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 10px;
}

.tips-list {
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tips-list li {
  font-size: 12px;
  color: #78350f;
  line-height: 1.6;
}

/* ── Toast ── */
.success-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: #0f172a;
  color: white;
  border-radius: var(--radius-full);
  font-size: 15px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  z-index: 9999;
}

.toast-icon {
  font-size: 18px;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

/* ── Schedule Card ── */
.schedule-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 16px;
}
.schedule-list {
  display: flex;
  flex-direction: column;
  max-height: 280px;
  overflow-y: auto;
}
.schedule-item {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background var(--transition-fast);
  position: relative;
}
.schedule-item:last-child {
  border-bottom: none;
}
.schedule-item:hover {
  background: var(--bg-surface-subtle);
}
.schedule-item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.schedule-topic {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}
.schedule-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}
.schedule-badge.done {
  background: var(--color-success-bg);
  color: #059669;
}
.schedule-badge.pending {
  background: var(--color-warning-bg);
  color: #d97706;
}
.schedule-item-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.schedule-item-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
.click-to-fill-hint {
  font-size: 11px;
  color: var(--color-primary);
  margin-top: 6px;
  display: none;
  font-weight: 500;
}
.schedule-item:hover .click-to-fill-hint {
  display: block;
}

/* ── Responsive ── */
@media (max-width: 960px) {
  .checkin-layout {
    grid-template-columns: 1fr;
  }
  .history-area {
    position: static;
  }
}
</style>
