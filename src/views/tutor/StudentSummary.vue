<template>
  <div class="page-container fade-in-up">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>学员档案</h2>
        <p>查看名下学员的个人照片、附件资料、阶段考试成绩和学习评价历史</p>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索学员姓名/企业/岗位..."
          clearable
          style="width: 260px"
        />
      </div>
    </div>

    <!-- Student Table -->
    <div v-if="filteredStudents.length === 0" class="empty-state-card">
      <div class="empty-icon">📭</div>
      <div>暂无匹配的学员档案</div>
    </div>

    <div v-else class="students-table-card">
      <el-table
        :data="filteredStudents"
        style="width: 100%"
        stripe
        border
        size="default"
        @row-click="openStudentProfile"
      >
        <el-table-column
          label="姓名"
          min-width="120"
          sortable
          prop="name"
        >
          <template #default="{ row }">
            <div class="student-name-cell">
              <el-avatar
                size="small"
                :src="row.photo"
                class="student-table-avatar"
              >
                {{ row.name.charAt(0) }}
              </el-avatar>
              <span class="student-table-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="company"
          label="所属公司"
          min-width="140"
          sortable
        />
        
        <el-table-column
          prop="phone"
          label="联系电话"
          width="130"
        />
        
        <el-table-column
          prop="scoresText"
          label="考核成绩"
          min-width="220"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="scores-tags-container">
              <span v-if="row.scoresText === '暂无成绩'" style="color: var(--text-muted); font-style: italic;">暂无成绩</span>
              <template v-else>
                <el-tag
                  v-for="(scoreItem, idx) in row.scoresText.split('; ')"
                  :key="idx"
                  size="small"
                  type="success"
                  class="score-tag-item"
                >
                  {{ scoreItem }}
                </el-tag>
              </template>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="evaluatedRatio"
          label="课时评分进度"
          width="160"
          sortable
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getRatioTagType(row.evaluatedRatio)" size="default" effect="plain">
              {{ row.evaluatedRatio }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          width="110"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="openStudentProfile(row)">
              查看档案 →
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Student Details Drawer -->
    <el-drawer
      v-model="drawerVisible"
      :title="`学员档案详情 · ${selectedStudent?.name}`"
      size="640px"
      destroy-on-close
    >
      <div v-if="selectedStudent" class="drawer-content">
        <!-- Header info -->
        <div class="profile-drawer-header">
          <div class="drawer-photo-container">
            <img v-if="selectedStudent.photo" :src="selectedStudent.photo" class="drawer-photo-img" />
            <div v-else class="drawer-photo-fallback">{{ selectedStudent.name.charAt(0) }}</div>
          </div>
          <div class="drawer-header-main">
            <h3>{{ selectedStudent.name }}</h3>
            <div class="header-tags">
              <el-tag size="small">{{ selectedStudent.roleTitle || '技术工' }}</el-tag>
              <el-tag size="small" type="info">{{ selectedStudent.company }}</el-tag>
            </div>
            <div class="header-meta">
              电话：{{ selectedStudent.phone }} · 入职日期：{{ selectedStudent.entryDate }}
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <el-tabs v-model="activeTab" style="margin-top: 20px;">
          <!-- Tab 1: Personal Files -->
          <el-tab-pane label="基本档案与材料" name="files">
            <div class="tab-pane-card">
              <div class="pane-title">附件资料清单</div>
              <div v-if="!selectedStudent.attachments || selectedStudent.attachments.length === 0" class="files-empty">
                学员暂未上传任何简历或证书附件。
              </div>
              <div v-else class="files-list">
                <div v-for="(file, idx) in selectedStudent.attachments" :key="idx" class="file-row">
                  <div class="file-left">
                    <span class="file-icon">📄</span>
                    <div class="file-details">
                      <span class="file-name" :title="file.name">{{ file.name }}</span>
                      <span class="file-size">{{ file.size }} · 上传于 {{ file.date }}</span>
                    </div>
                  </div>
                  <el-button type="primary" size="small" plain @click="downloadAttachment(file)">下载</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- Tab 2: Exam Scores -->
          <el-tab-pane label="科目考核成绩" name="scores">
            <div class="tab-pane-card">
              <div class="pane-title">阶段考试成绩</div>
              <div v-if="studentScores.length === 0" class="scores-empty">
                暂无归档的科目成绩记录。
              </div>
              <div v-else class="scores-list">
                <el-table :data="studentScores" stripe size="small" border>
                  <el-table-column prop="scheme.name" label="考核方案" min-width="160" show-overflow-tooltip />
                  <el-table-column prop="scheme.skillName" label="考核科目" min-width="140" show-overflow-tooltip />
                  <el-table-column prop="finalScore" label="综合得分" width="80">
                    <template #default="{ row }">
                      <span :class="['score-text', getScoreClass(row.finalScore)]">
                        {{ row.finalScore ? `${row.finalScore}分` : '待出分' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="result" label="考核结论" width="90">
                    <template #default="{ row }">
                      <el-tag :type="getResultType(row.result)" size="small">
                        {{ row.result }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <!-- Tab 3: Course History -->
          <el-tab-pane label="课程学习历史" name="courses">
            <div class="tab-pane-card">
              <div class="pane-title">已完成课程与平时评价</div>
              <div v-if="completedCourses.length === 0" class="courses-empty">
                暂无已完成的排班授课及评价记录。
              </div>
              <div v-else class="courses-timeline">
                <div v-for="course in completedCourses" :key="course.id" class="timeline-item">
                  <div class="timeline-meta">
                    <span class="timeline-date">{{ course.date }}</span>
                    <span class="timeline-tutor">带教：{{ course.tutor }}</span>
                  </div>
                  <div class="timeline-body">
                    <div class="timeline-course-title">{{ course.courseName }}</div>
                    
                    <!-- rating -->
                    <div class="timeline-rating" v-if="course.rating">
                      <span class="rating-label">学员表现评分：</span>
                      <el-rate v-model="course.rating" disabled size="small" />
                    </div>

                    <!-- remark/evaluation text -->
                    <div class="timeline-remark" v-if="course.remark">
                      {{ course.remark }}
                    </div>

                    <!-- photos -->
                    <div class="timeline-photos" v-if="course.photos && course.photos.length > 0">
                      <div class="photo-grid">
                        <img v-for="(img, idx) in course.photos" :key="idx" :src="img" class="timeline-photo-thumbnail" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import {
  students,
  getStudentProfileSummary
} from '../../api/mockData'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const searchQuery = ref('')
const drawerVisible = ref(false)
const selectedStudent = ref(null)
const activeTab = ref('files')

const getStudentProfileInfo = (studentId) => {
  try {
    return JSON.parse(localStorage.getItem(`profile:student:${studentId}`) || '{}')
  } catch {
    return {}
  }
}

// Completed courses count
const getCompletedCount = (name) => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return 0
  const list = JSON.parse(listStr)
  let count = 0
  list.forEach(group => {
    group.rows.forEach(row => {
      if (row.trainee === name && row.completedText === '√') {
        count++
      }
    })
  })
  return count
}

// Evaluated ratio
const getEvaluatedRatio = (name) => {
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return '0/0 (0%)'
  const list = JSON.parse(listStr)
  let completed = 0
  let evaluated = 0
  list.forEach(group => {
    group.rows.forEach(row => {
      if (row.trainee === name && row.completedText === '√') {
        completed++
        if (row.rating && row.rating > 0) {
          evaluated++
        }
      }
    })
  })
  if (completed === 0) return '0/0 (0%)'
  const pct = Math.round((evaluated / completed) * 100)
  return `${evaluated}/${completed} (${pct}%)`
}

// Stage scores text summary
const getStudentScoresText = (studentId) => {
  const summary = getStudentProfileSummary(studentId)
  if (!summary.stageAssessments || summary.stageAssessments.length === 0) return '暂无成绩'
  return summary.stageAssessments.map(sa => `${sa.scheme.skillName || sa.scheme.name}: ${sa.finalScore}分 (${sa.result})`).join('; ')
}

// Get badge type for evaluated ratio
const getRatioTagType = (ratioStr) => {
  if (ratioStr.includes('100%')) return 'success'
  if (ratioStr.includes('0%') && !ratioStr.startsWith('0/0')) return 'danger'
  if (ratioStr.startsWith('0/0')) return 'info'
  return 'warning'
}

// Combined student list
const studentList = computed(() => {
  const baseStudents = students.map(s => {
    const override = getStudentProfileInfo(s.id)
    return {
      id: s.id,
      name: s.name,
      company: s.company,
      phone: s.phone,
      studio: s.studio,
      roleTitle: s.roleTitle,
      entryDate: override.entryDate || '2025-09-01',
      photo: override.photo || '',
      attachments: override.attachments || [],
      completedCount: getCompletedCount(s.name),
      evaluatedRatio: getEvaluatedRatio(s.name),
      scoresText: getStudentScoresText(s.id)
    }
  })

  // Append other trainees from zhizao_excel_groups
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (listStr) {
    const list = JSON.parse(listStr)
    list.forEach(group => {
      group.rows.forEach(r => {
        if (r.trainee && !baseStudents.some(s => s.name === r.trainee)) {
          const override = getStudentProfileInfo(r.trainee)
          baseStudents.push({
            id: r.trainee,
            name: r.trainee,
            company: r.trainee.includes('鑫泰') ? '鑫泰企业' : (r.trainee.includes('鑫悦') ? '鑫悦企业' : '盛泰企业'),
            phone: '13812345678',
            studio: group.trainer === '宋师傅' ? 'studio_a' : 'studio_b',
            roleTitle: '技术工人',
            entryDate: override.entryDate || '2025-09-01',
            photo: override.photo || '',
            attachments: override.attachments || [],
            completedCount: getCompletedCount(r.trainee),
            evaluatedRatio: getEvaluatedRatio(r.trainee),
            scoresText: getStudentScoresText(r.trainee)
          })
        }
      })
    })
  }

  // Filter for tutor's studio
  return baseStudents.filter(s => s.studio === userStore.currentStudio)
})

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return studentList.value
  return studentList.value.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.company.toLowerCase().includes(query) ||
    s.roleTitle.toLowerCase().includes(query)
  )
})

const openStudentProfile = (student) => {
  selectedStudent.value = student
  activeTab.value = 'files'
  drawerVisible.value = true
}

const downloadAttachment = (file) => {
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success(`正在下载「${file.name}」`)
}

// Student Score history
const studentScores = computed(() => {
  if (!selectedStudent.value) return []
  const summary = getStudentProfileSummary(selectedStudent.value.id)
  return summary.stageAssessments || []
})

// Completed courses timeline
const completedCourses = computed(() => {
  if (!selectedStudent.value) return []
  const listStr = localStorage.getItem('zhizao_excel_groups')
  if (!listStr) return []
  const list = JSON.parse(listStr)
  const result = []
  list.forEach(group => {
    group.rows.forEach((row, rowIndex) => {
      if (row.trainee === selectedStudent.value.name && row.completedText === '√') {
        result.push({
          id: `${group.id}-${rowIndex}`,
          courseName: group.trainingTopic,
          tutor: group.trainer,
          date: row.trainingDate || '2026-06-15',
          remark: row.remark || '',
          rating: row.rating || 0,
          photos: row.photos || []
        })
      }
    })
  })
  
  result.sort((a, b) => b.date.localeCompare(a.date))
  return result
})

const getScoreClass = (score) => {
  if (!score) return 'score-empty'
  if (score >= 90) return 'score-excellent'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

const getResultType = (result) => {
  if (result === '通过') return 'success'
  if (result === '实操待补') return 'warning'
  if (result === '未通过') return 'danger'
  return 'info'
}
</script>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-header p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 4px 0 0;
}

.empty-state-card {
  text-align: center;
  padding: 48px;
  background: var(--bg-surface);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.students-table-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.student-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-table-avatar {
  background: linear-gradient(135deg, var(--color-primary), #10b981);
  color: white;
  font-weight: 700;
}

.student-table-name {
  font-weight: 600;
  color: var(--text-primary);
}

.scores-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.score-tag-item {
  margin-right: 4px;
}

/* Drawer styles */
.drawer-content {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
}

.profile-drawer-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.drawer-photo-container {
  width: 80px;
  height: 100px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid var(--border-light);
  flex-shrink: 0;
}

.drawer-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drawer-photo-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-primary), #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
}

.drawer-header-main {
  flex: 1;
}

.drawer-header-main h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
  color: var(--text-primary);
}

.header-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.header-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.tab-pane-card {
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 16px;
}

.pane-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.files-empty,
.scores-empty,
.courses-empty {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 24px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
}

.file-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.file-icon {
  font-size: 18px;
}

.file-details {
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

/* Timeline */
.courses-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  border-left: 2px solid var(--color-primary-light);
  padding-left: 14px;
  position: relative;
}

.timeline-item::after {
  content: '';
  position: absolute;
  left: -6px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid white;
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.timeline-date {
  font-weight: 600;
}

.timeline-body {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 12px;
}

.timeline-course-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.timeline-rating {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.rating-label {
  font-size: 11px;
  color: var(--text-muted);
}

.timeline-remark {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  background: var(--bg-surface-subtle);
  padding: 8px 10px;
  border-radius: var(--radius-xs);
  margin-bottom: 6px;
}

.timeline-photos {
  margin-top: 8px;
}

.photo-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.timeline-photo-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-xs);
  object-fit: cover;
  border: 1px solid var(--border-light);
}
</style>
