<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">我的培训</h1>
        <p class="page-subtitle">查看本期培训课程记录与排班安排</p>
      </div>
      <div class="header-meta">
        <span class="period-badge">📅 数字化工匠带教计划</span>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="training-layout">
      <!-- Left Column: Stats & Course Records -->
      <div class="main-column">
        <!-- Stats Row -->
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-icon">🎓</div>
            <div class="stat-info">
              <div class="stat-val">{{ totalHours }}小时</div>
              <div class="stat-label">累计培训课时</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-val">{{ completedCount }}节</div>
              <div class="stat-label">已完成课程</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👨‍🏫</div>
            <div class="stat-info">
              <div class="stat-val">{{ currentTutorName }}</div>
              <div class="stat-label">带教师傅</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-info">
              <div class="stat-val">{{ subjectCount }}个</div>
              <div class="stat-label">学习科目</div>
            </div>
          </div>
        </div>

        <!-- Course Records Section -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title" style="margin-bottom:0">📋 课程学习记录</h2>
            <div class="filter-row">
              <!-- Date Range Selection -->
              <input type="date" class="input-date" v-model="filterStartDate" style="margin-right: 4px;" placeholder="开始日期">
              <span style="font-size: 12px; color: var(--text-muted); align-self: center; margin-right: 4px;">至</span>
              <input type="date" class="input-date" v-model="filterEndDate" style="margin-right: 8px;" placeholder="结束日期">
              
              <!-- Course selector -->
              <select class="select-sm" v-model="filterCourse">
                <option value="">全部课程</option>
                <option v-for="course in uniqueCourses" :key="course" :value="course">
                  {{ course }}
                </option>
              </select>
            </div>
          </div>

          <!-- Flat Records Table -->
          <div class="records-table-card">
            <el-table
              :data="filteredRecords"
              style="width: 100%"
              stripe
              border
              size="default"
              :default-sort="{ prop: 'date', order: 'descending' }"
            >
              <el-table-column
                prop="date"
                label="日期"
                width="120"
                sortable
              />
              <el-table-column
                prop="course"
                label="课程名称"
                min-width="180"
                show-overflow-tooltip
              />
              <el-table-column
                prop="tutor"
                label="带教师傅"
                width="110"
              />
              <el-table-column
                prop="rating"
                label="平时评分"
                width="140"
                sortable
              >
                <template #default="{ row }">
                  <el-rate
                    v-if="row.rating"
                    v-model="row.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value}"
                  />
                  <span v-else style="color: var(--text-muted); font-size: 12px; font-style: italic;">未评分</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="text"
                label="带教评语 / 课堂笔记"
                min-width="200"
              >
                <template #default="{ row }">
                  <span v-if="row.text">{{ row.text }}</span>
                  <span v-else style="color: var(--text-muted); font-style: italic;">暂无评语</span>
                </template>
              </el-table-column>
              <el-table-column
                label="课堂截图"
                width="110"
                align="center"
              >
                <template #default="{ row }">
                  <div v-if="row.photos && row.photos.length > 0" class="table-photos">
                    <el-popover
                      placement="top"
                      :width="280"
                      trigger="hover"
                    >
                      <template #reference>
                        <el-button type="primary" link size="small">
                          📷 查看 ({{ row.photos.length }})
                        </el-button>
                      </template>
                      <div class="popover-photo-grid">
                        <el-image
                          v-for="(img, idx) in row.photos"
                          :key="idx"
                          :src="img"
                          :preview-src-list="row.photos"
                          class="popover-photo"
                          fit="cover"
                        />
                      </div>
                    </el-popover>
                  </div>
                  <span v-else style="color: var(--text-muted); font-size: 12px;">无图片</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="note"
                label="管理备注"
                min-width="120"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <span v-if="row.note">{{ row.note }}</span>
                  <span v-else style="color: var(--text-muted); font-style: italic;">-</span>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="filteredRecords.length === 0" class="empty-state">暂无课程记录</div>
          </div>
        </div>
      </div>

      <!-- Right Column: Sidebar (Next Class & Recent Schedule) -->
      <div class="sidebar-column">
        <!-- Next Class High-contrast card -->
        <div v-if="nextClass" class="next-class-card">
          <div class="card-glow"></div>
          <div class="next-class-header">
            <span class="next-tag">🔔 下一堂课</span>
            <span class="next-status">待上课</span>
          </div>
          <div class="next-class-title">{{ nextClass.trainingTopic }}</div>
          <div class="next-class-detail">
            <div class="detail-item">📅 日期：{{ nextClass.trainingDate }}</div>
            <div class="detail-item" v-if="nextClass.startTime">⏰ 时间：{{ nextClass.startTime }} - {{ nextClass.endTime }}</div>
            <div class="detail-item">👤 师傅：{{ nextClass.trainer }}</div>
          </div>
          <div class="next-class-footer">
            请准时参加培训，如有变动请联系带教师傅。
          </div>
        </div>

        <div class="next-class-card empty" v-else>
          <div class="next-class-title" style="font-size: 14px; text-align: center; margin-bottom: 0;">🎉 本期所有排班均已上完！</div>
        </div>

        <!-- Schedule List Card -->
        <div class="schedule-sidebar-card">
          <div class="schedule-card-header">
            <h3 style="margin:0; font-size:14px; font-weight:700; color:var(--text-primary);">📅 最近排班计划 ({{ selectedStudent }})</h3>
          </div>

          <div v-if="studentSchedule.length === 0" class="schedule-empty">
            暂无排班安排
          </div>

          <div v-else class="schedule-list">
            <div
              v-for="s in studentSchedule"
              :key="s.rowKey"
              class="schedule-row-item"
              :class="{ done: s.completedText === '√' }"
            >
              <div class="schedule-dot" :class="{ done: s.completedText === '√' }"></div>
              <div class="schedule-row-info">
                <div class="schedule-row-course">{{ s.trainingTopic }}</div>
                <div class="schedule-row-meta">
                  <span>日期：{{ s.trainingDate }}</span>
                  <span v-if="s.startTime">· {{ s.startTime }}–{{ s.endTime }}</span>
                  <span>· 师傅：{{ s.trainer }}</span>
                </div>
              </div>
              <span :class="['status-badge-mini', s.completedText === '√' ? 'done' : 'pending']">
                {{ s.completedText === '√' ? '已完成' : '待上课' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'

const filterCourse = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')

// User store setup
const userStore = useUserStore()
const currentStudentName = computed(() => userStore.userName || '学员A')

// Dynamic student list from schedule (for fallback mapping)
const studentOptionsList = computed(() => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return ['张三（鑫泰）', '李四（鑫悦）', '王五（盛泰）', '学员A', '学员B']
  const list = JSON.parse(listStr)
  const trainees = list.flatMap(g => g.rows.map(r => r.trainee))
  return Array.from(new Set(trainees))
})

// Auto match selected student to logged-in user or first active trainee
const selectedStudent = computed(() => {
  const loginName = currentStudentName.value
  const options = studentOptionsList.value
  if (options.includes(loginName)) {
    return loginName
  }
  return options.includes('张三（鑫泰）') ? '张三（鑫泰）' : (options[0] || '张三（鑫泰）')
})

// Dynamic student schedule
const studentSchedule = computed(() => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return []
  
  const list = JSON.parse(listStr)
  const result = []
  list.forEach(group => {
    group.rows.forEach((row, rowIndex) => {
      if (row.trainee === selectedStudent.value) {
        result.push({
          rowKey: `${group.id}-${rowIndex}`,
          group,
          trainingTopic: group.trainingTopic,
          trainer: group.trainer,
          trainingDate: row.trainingDate,
          startTime: row.startTime,
          endTime: row.endTime,
          durationHours: row.durationHours,
          completedText: row.completedText
        })
      }
    })
  })
  
  // Sort schedule by date: completed last, upcoming first
  return result.sort((a, b) => {
    const aDone = a.completedText === '√' ? 1 : 0
    const bDone = b.completedText === '√' ? 1 : 0
    if (aDone !== bDone) return aDone - bDone
    return String(a.trainingDate).localeCompare(String(b.trainingDate))
  })
})

// Next upcoming class
const nextClass = computed(() => {
  return studentSchedule.value.find(item => item.completedText !== '√')
})

// Stat computations
const completedCount = computed(() => {
  return studentSchedule.value.filter(s => s.completedText === '√').length
})

const totalHours = computed(() => {
  return studentSchedule.value
    .filter(s => s.completedText === '√')
    .reduce((sum, s) => sum + (parseFloat(s.durationHours) || 0), 0)
})

const subjectCount = computed(() => {
  const topics = studentSchedule.value.map(s => s.trainingTopic)
  return new Set(topics).size
})

const currentTutorName = computed(() => {
  if (studentSchedule.value.length > 0) {
    return studentSchedule.value[0].trainer
  }
  return '宋师傅'
})

// Learning records mockup and active mapping
const records = computed(() => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return [
    {
      id: 1,
      course: '电子元器件识别、电子器件原理分类使用场合',
      date: '2026-06-10',
      tutor: '宋师傅',
      type: 'both',
      text: '今日学习了基础电容和电阻的识读，师傅带我们查看了样品库，掌握了极性判断方法。',
      image: true,
      photos: [],
      rating: 5,
      note: '完成良好'
    },
    {
      id: 2,
      course: '电气控制箱标准规范配线要求',
      date: '2026-06-08',
      tutor: '黄师傅',
      type: 'text',
      text: '进行了控制箱配线基本规范的宣贯，练习了剥线和压接线鼻，符合工艺标准。',
      image: false,
      photos: [],
      rating: 4,
      note: null
    }
  ]

  const list = JSON.parse(listStr)
  const result = []
  list.forEach(group => {
    group.rows.forEach((row, rowIndex) => {
      if (row.trainee === selectedStudent.value && row.completedText === '√') {
        const hasText = row.remark && row.remark.trim().length > 0
        const hasImg = row.photos && row.photos.length > 0
        let type = 'text'
        if (hasText && hasImg) type = 'both'
        else if (hasImg) type = 'image'
        
        result.push({
          id: `${group.id}-${rowIndex}`,
          course: group.trainingTopic,
          date: row.trainingDate || '2026-06-15',
          tutor: group.trainer,
          type,
          text: row.remark || null,
          image: hasImg,
          photos: row.photos || [],
          rating: row.rating || 0,
          note: row.adminRemark || null
        })
      }
    })
  })
  return result
})

const uniqueCourses = computed(() => {
  return Array.from(new Set(records.value.map(r => r.course)))
})

const filteredRecords = computed(() =>
  records.value.filter(r => {
    if (filterCourse.value && r.course !== filterCourse.value) return false
    
    // Date filter range
    if (filterStartDate.value && r.date < filterStartDate.value) return false
    if (filterEndDate.value && r.date > filterEndDate.value) return false
    
    return true
  })
)
</script>

<style scoped>
.page { padding: 24px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: var(--text-muted); margin: 0; }
.period-badge { background: rgba(79,110,242,0.1); color: var(--color-primary); font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: var(--radius-full); }

/* Layout Grid */
.training-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}
.main-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 24px;
}

.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
.stat-icon { font-size: 28px; }
.stat-val { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }

.section { margin-bottom: 8px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.section-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
.filter-row { display: flex; gap: 8px; }
.select-sm { padding: 6px 10px; border-radius: var(--radius-md); border: 1px solid var(--border-light); background: var(--bg-surface); color: var(--text-secondary); font-size: 12px; outline: none; }
.input-date {
  padding: 5px 8px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 12px;
  outline: none;
}

.records-list { display: flex; flex-direction: column; gap: 10px; }
.record-card {
  background: var(--bg-surface); border: 1px solid var(--border-light);
  border-radius: var(--radius-lg); overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.record-card.theme-group-card {
  cursor: default;
}

.record-top { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; cursor: pointer; }
.record-top:hover { background-color: var(--bg-surface-subtle); }
.record-course { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.record-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
.dot { opacity: 0.4; }
.type-badge { padding: 2px 8px; border-radius: var(--radius-full); font-size: 11px; font-weight: 500; }
.type-badge.text { background: rgba(79,110,242,0.1); color: var(--color-primary); }
.type-badge.image { background: rgba(16,185,129,0.1); color: #10b981; }
.type-badge.both { background: rgba(245,158,11,0.1); color: #f59e0b; }
.expand-icon { color: var(--text-muted); font-size: 11px; }

/* Nested logs styles */
.theme-logs-container {
  background: var(--bg-surface-subtle);
  border-top: 1px solid var(--border-light);
  padding: 8px 16px;
}
.sub-log-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin: 10px 0;
  padding: 14px;
}
.sub-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed var(--border-light);
  padding-bottom: 8px;
  margin-bottom: 10px;
}
.sub-log-date {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.sub-log-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-text { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin: 0; }
.record-img-wrap { margin-top: 6px; }
.img-placeholder { background: var(--bg-surface-subtle); border: 1px dashed var(--border-medium); border-radius: var(--radius-md); padding: 18px; text-align: center; font-size: 12px; color: var(--text-muted); }
.admin-note { font-size: 12px; color: var(--text-muted); background: var(--bg-surface-subtle); padding: 8px 12px; border-radius: var(--radius-md); margin-top: 8px; }
.note-label { font-weight: 600; color: var(--text-secondary); }

/* Next Class Card Styling */
.next-class-card {
  position: relative;
  background: linear-gradient(135deg, var(--color-primary), #3b5bdb);
  color: white;
  border-radius: var(--radius-lg);
  padding: 22px;
  overflow: hidden;
  box-shadow: 0 8px 20px -6px rgba(79, 110, 242, 0.3);
}
.next-class-card.empty {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px dashed var(--border-medium);
  box-shadow: none;
  padding: 24px;
}
.card-glow {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.15);
  filter: blur(40px);
  border-radius: 50%;
}
.next-class-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.next-tag {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 8px;
  border-radius: var(--radius-full);
}
.next-status {
  font-size: 11px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  color: #3b5bdb;
  padding: 2px 6px;
  border-radius: var(--radius-full);
}
.next-class-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 14px;
}
.next-class-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  opacity: 0.9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 12px;
  margin-bottom: 10px;
}
.next-class-footer {
  font-size: 11px;
  opacity: 0.7;
}

/* Schedule Sidebar Card */
.schedule-sidebar-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.schedule-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-surface-subtle);
}
.schedule-empty {
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}
.schedule-list {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow-y: auto;
}
.schedule-row-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-light);
}
.schedule-row-item:last-child {
  border-bottom: none;
}
.schedule-row-item.done {
  background-color: var(--bg-surface-subtle);
  opacity: 0.8;
}
.schedule-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f59e0b;
  flex-shrink: 0;
}
.schedule-dot.done {
  background: #94a3b8;
}
.schedule-row-info {
  flex: 1;
  min-width: 0;
}
.schedule-row-course {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.schedule-row-meta {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
.status-badge-mini {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-full);
}
.status-badge-mini.done {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}
.status-badge-mini.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.empty-state { padding: 40px; text-align: center; color: var(--text-muted); font-size: 14px; }

@media (max-width: 1024px) {
  .stat-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .training-layout {
    grid-template-columns: 1fr;
  }
  .sidebar-column {
    position: static;
  }
}

.records-table-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.popover-photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 4px;
}

.popover-photo {
  width: 76px;
  height: 76px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.popover-photo:hover {
  transform: scale(1.05);
}
</style>
