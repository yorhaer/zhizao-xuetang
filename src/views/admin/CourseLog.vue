<template>
  <div class="page-container fade-in-up">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>课程记录</h2>
        <p>汇总所有导师提交的课程记录台账，支持归档管理与备注补充</p>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">📋</div>
        <div class="stat-content">
          <div class="stat-label">本月记录数</div>
          <div class="stat-value">{{ monthlyCount }}<sup>条</sup></div>
          <div class="stat-note">{{ currentMonth }} 月份</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber">⏳</div>
        <div class="stat-content">
          <div class="stat-label">待归档</div>
          <div class="stat-value">{{ pendingArchiveCount }}<sup>条</sup></div>
          <div class="stat-note">需管理员处理</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">📁</div>
        <div class="stat-content">
          <div class="stat-label">已归档</div>
          <div class="stat-value">{{ archivedCount }}<sup>条</sup></div>
          <div class="stat-note">流程已完结</div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <el-select v-model="filters.tutor" placeholder="筛选导师" clearable style="width:150px">
        <el-option v-for="t in tutorOptions" :key="t" :label="t" :value="t" />
      </el-select>
      <el-input v-model="filters.courseName" clearable placeholder="课程名称关键字" style="width:200px" />
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width:280px"
      />
      <el-select v-model="filters.archiveStatus" placeholder="归档状态" clearable style="width:130px">
        <el-option label="待归档" value="pending" />
        <el-option label="已归档" value="archived" />
      </el-select>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <!-- Grouped Record List -->
    <div v-if="groupedRecords.length" class="record-list">
      <div v-for="group in groupedRecords" :key="group.courseName" class="record-card">

        <!-- Card Header -->
        <div class="record-header">
          <div class="record-meta-left">
            <div class="record-course">{{ group.courseName }}</div>
            <div class="record-meta">
              <span class="meta-tutor">👤 师傅：{{ group.tutors.join('、') }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-count">共 {{ group.logs.length }} 次授课记录</span>
            </div>
          </div>
          <div class="record-meta-right">
            <span :class="['archive-badge', group.archiveStatus === 'archived' ? 'badge-archived' : 'badge-pending']">
              {{ group.archiveStatus === 'archived' ? '全部已归档' : '有未归档' }}
            </span>
            <el-button
              size="small"
              text
              :icon="expandedGroups[group.courseName] ? ArrowUp : ArrowDown"
              @click="toggleGroupExpand(group.courseName)"
            >{{ expandedGroups[group.courseName] ? '收起记录' : '查看记录' }}</el-button>
          </div>
        </div>

        <!-- Expanded Logs List -->
        <div v-if="expandedGroups[group.courseName]" class="theme-logs-list">
          <div v-for="log in group.logs" :key="log.id" class="sub-log-item">
            <div class="sub-log-header">
              <div class="sub-log-date">
                📅 上课日期：{{ log.date }} 
                <span style="margin-left: 12px; color: var(--text-secondary); font-weight: normal;">
                  授课老师：{{ log.tutor }}
                </span>
              </div>
              <div class="sub-log-actions">
                <span :class="['archive-badge', log.archiveStatus === 'archived' ? 'badge-archived' : 'badge-pending']" style="padding: 1px 8px; font-size: 11px;">
                  {{ log.archiveStatus === 'archived' ? '已归档' : '待归档' }}
                </span>
              </div>
            </div>
            
            <div class="sub-log-content">
              <!-- Text Content -->
              <div v-if="log.hasText" class="expand-section" style="padding: 0 0 10px 0; border-bottom: none;">
                <div class="expand-label" style="margin-bottom: 6px;">📝 课程记录内容</div>
                <div class="expand-text">{{ log.textContent }}</div>
              </div>
              
              <!-- Image Content -->
              <div v-if="log.hasImage" class="expand-section" style="padding: 0 0 10px 0; border-bottom: none;">
                <div class="expand-label" style="margin-bottom: 6px;">🖼️ 课程照片（{{ log.imageCount }} 张）</div>
                <div class="img-thumbs">
                  <div v-if="log.photos && log.photos.length > 0" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <img v-for="(img, idx) in log.photos" :key="idx" :src="img" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-light);" />
                  </div>
                  <div v-else style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <div v-for="i in log.imageCount" :key="i" class="img-thumb">
                      <span style="font-size:28px">📷</span>
                      <span class="img-thumb-label">图片{{ i }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Admin Section -->
              <div class="expand-section admin-section" style="padding: 12px; border-radius: var(--radius-md); border-bottom: none;">
                <div class="expand-label" style="margin-bottom: 6px;">🗒️ 管理员备注</div>
                <el-input
                  v-model="log._remarkDraft"
                  type="textarea"
                  :rows="2"
                  placeholder="在此添加备注，例如：已核实、需补充说明等"
                />
                <div class="admin-actions" style="margin-top: 8px;">
                  <el-button size="small" @click="saveRemark(log)">保存备注</el-button>
                  <el-button
                    size="small"
                    :type="log.archiveStatus === 'archived' ? 'warning' : 'success'"
                    @click="toggleArchive(log)"
                  >
                    {{ log.archiveStatus === 'archived' ? '取消归档' : '标记归档' }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Empty State -->
    <el-card v-else shadow="never" class="empty-card">
      <el-empty description="暂无匹配的课程记录" :image-size="100">
        <el-button @click="resetFilters">清除筛选条件</el-button>
      </el-empty>
    </el-card>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

// ─── Dynamic Data Loader ────────────────────────────────────────
const tutorOptions = computed(() => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return ['张明华', '李建国', '王芳芳', '陈志远', '赵丽娟', '宋师傅', '黄师傅', '施师傅']
  const list = JSON.parse(listStr)
  const trainers = list.map(g => g.trainer).filter(Boolean)
  return Array.from(new Set(trainers))
})

const rawRecords = ref([])

const loadRecords = () => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) {
    rawRecords.value = [
      {
        id: 'mock-1',
        courseName: '电子元器件识别、电子器件原理分类使用场合',
        tutor: '宋师傅',
        date: '2026-06-10',
        trainee: '张三（鑫泰）',
        hasText: true,
        hasImage: false,
        imageCount: 0,
        photos: [],
        textContent: '今日学习了基础电容和电阻的识读，师傅带我们查看了样品库，掌握了极性判断方法。',
        adminRemark: '',
        archiveStatus: 'archived',
        _expanded: false,
        _remarkDraft: ''
      }
    ]
    return
  }

  const list = JSON.parse(listStr)
  const result = []
  list.forEach(group => {
    group.rows.forEach((row, rowIndex) => {
      if (row.completedText === '√') {
        const hasText = row.remark && row.remark.trim().length > 0
        const hasImg = row.photos && row.photos.length > 0
        result.push({
          id: `${group.id}-${rowIndex}`,
          groupKey: group.id,
          rowIndex: rowIndex,
          courseName: group.trainingTopic,
          tutor: group.trainer,
          date: row.trainingDate || '2026-06-15',
          trainee: row.trainee,
          hasText,
          hasImage: hasImg,
          imageCount: row.photos ? row.photos.length : 0,
          photos: row.photos || [],
          textContent: row.remark || '',
          adminRemark: row.adminRemark || '',
          archiveStatus: row.archiveStatus || 'pending',
          _expanded: false,
          _remarkDraft: row.adminRemark || ''
        })
      }
    })
  })
  rawRecords.value = result
}

const updateRowInLocalStorage = (record, key, value) => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return
  const list = JSON.parse(listStr)
  let found = false
  for (let group of list) {
    if (group.id === record.groupKey) {
      const row = group.rows[record.rowIndex]
      if (row) {
        row[key] = value
        found = true
        break
      }
    }
  }
  
  if (!found) {
    for (let group of list) {
      if (group.trainingTopic === record.courseName) {
        for (let row of group.rows) {
          if (row.trainee === record.trainee && row.trainingDate === record.date) {
            row[key] = value
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

onMounted(() => {
  loadRecords()
})

// ─── Filters ───────────────────────────────────────────────────
const filters = reactive({ tutor: '', courseName: '', dateRange: [], archiveStatus: '' })

const resetFilters = () => {
  filters.tutor = ''
  filters.courseName = ''
  filters.dateRange = []
  filters.archiveStatus = ''
}

const filteredRecords = computed(() =>
  rawRecords.value.filter(r => {
    if (filters.tutor && r.tutor !== filters.tutor) return false
    if (filters.courseName && !r.courseName.includes(filters.courseName)) return false
    if (filters.archiveStatus && r.archiveStatus !== filters.archiveStatus) return false
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [s, e] = filters.dateRange
      if (r.date < s || r.date > e) return false
    }
    return true
  })
)

// Grouped records state
const expandedGroups = ref({})

const toggleGroupExpand = (courseName) => {
  expandedGroups.value[courseName] = !expandedGroups.value[courseName]
}

const groupedRecords = computed(() => {
  const map = {}
  filteredRecords.value.forEach(record => {
    const key = record.courseName
    if (!map[key]) {
      map[key] = {
        courseName: key,
        tutors: new Set(),
        logs: []
      }
    }
    map[key].tutors.add(record.tutor)
    map[key].logs.push(record)
  })
  
  return Object.values(map).map(group => {
    group.tutors = Array.from(group.tutors)
    const allArchived = group.logs.every(log => log.archiveStatus === 'archived')
    group.archiveStatus = allArchived ? 'archived' : 'pending'
    group.logs.sort((a, b) => b.date.localeCompare(a.date))
    return group
  })
})

// ─── Stats ─────────────────────────────────────────────────────
const currentMonth = new Date().getMonth() + 1
const monthlyCount = computed(() =>
  rawRecords.value.filter(r => r.date.startsWith(`2026-${String(currentMonth).padStart(2, '0')}`)).length
)
const pendingArchiveCount = computed(() => rawRecords.value.filter(r => r.archiveStatus === 'pending').length)
const archivedCount = computed(() => rawRecords.value.filter(r => r.archiveStatus === 'archived').length)

// ─── Actions ───────────────────────────────────────────────────
const saveRemark = record => {
  record.adminRemark = record._remarkDraft
  updateRowInLocalStorage(record, 'adminRemark', record.adminRemark)
  ElMessage.success('备注已保存')
}

const toggleArchive = record => {
  record.archiveStatus = record.archiveStatus === 'archived' ? 'pending' : 'archived'
  updateRowInLocalStorage(record, 'archiveStatus', record.archiveStatus)
  ElMessage.success(record.archiveStatus === 'archived' ? '已标记为归档' : '已取消归档')
}
</script>

<style scoped>
.page-container { padding: 24px; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}
.page-header h2 { font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -.01em; }
.page-header p { margin-top: 4px; font-size: 13px; color: var(--text-muted); }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}
.stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.stat-icon {
  width: 48px; height: 48px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.stat-icon.blue   { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
.stat-icon.green  { background: linear-gradient(135deg, #ecfdf5, #d1fae5); }
.stat-icon.amber  { background: linear-gradient(135deg, #fffbeb, #fef3c7); }
.stat-content { flex: 1; min-width: 0; }
.stat-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
.stat-value { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1; margin-bottom: 2px; }
.stat-value sup { font-size: 14px; font-weight: 500; color: var(--text-secondary); vertical-align: super; }
.stat-note { font-size: 12px; color: var(--text-muted); }

/* Filter Bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

/* Record List */
.record-list { display: flex; flex-direction: column; gap: 12px; }

.record-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}
.record-card:hover { box-shadow: var(--shadow-md); }

.record-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
}

.record-meta-left { flex: 1; min-width: 0; }

.record-course {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.record-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.meta-sep { color: var(--border-medium); }

.content-type-chips { display: flex; gap: 4px; }
.chip {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 8px; border-radius: var(--radius-full);
  font-size: 11px; font-weight: 600;
}
.chip-text { background: var(--color-primary-light); color: var(--color-primary); }
.chip-img  { background: var(--color-warning-bg); color: #d97706; }

.record-meta-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.archive-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: var(--radius-full);
  font-size: 12px; font-weight: 600;
}
.badge-archived { background: var(--color-success-bg); color: #059669; }
.badge-pending  { background: var(--color-warning-bg); color: #d97706; }

/* Summary */
.record-summary {
  padding: 0 20px 14px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
  margin: 0 20px 0;
  border-top: 1px solid var(--bg-surface-subtle);
}
.summary-img-hint { color: var(--text-muted); font-style: italic; }

/* Expanded */
.record-expanded {
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.expand-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--bg-surface-subtle);
}
.expand-section:last-child { border-bottom: none; }

.expand-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .04em;
  margin-bottom: 10px;
}

.expand-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  white-space: pre-wrap;
}

.img-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.img-thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-surface-subtle);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}
.img-thumb:hover { border-color: var(--color-primary); }
.img-thumb-label { font-size: 11px; color: var(--text-muted); }

.admin-section { background: var(--bg-surface-subtle); }

.admin-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

/* Theme Card styles */
.theme-logs-list {
  background: var(--bg-surface-subtle);
  border-top: 1px solid var(--border-light);
  padding: 12px 20px;
}
.sub-log-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
}
.sub-log-item:last-child {
  margin-bottom: 4px;
}
.sub-log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border-light);
  margin-bottom: 14px;
}
.sub-log-date {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}
.sub-log-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Empty */
.empty-card { margin-top: 0; }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: 1fr; }
  .filter-bar { flex-direction: column; align-items: stretch; }
}
</style>
