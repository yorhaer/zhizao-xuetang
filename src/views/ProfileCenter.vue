<template>
  <div class="profile-page">
    <div class="profile-shell">
      <el-card shadow="never" class="profile-card">
        <div class="hero-row">
          <div class="avatar" :class="{ 'avatar--tutor': isTutor }">
            {{ profile.name?.slice(-1) || '我' }}
          </div>
          <div class="hero-main">
            <div class="title-row">
              <h2>我的资料</h2>
              <el-tag>{{ roleLabel }}</el-tag>
              <el-tag v-if="positionText" type="info">{{ positionText }}</el-tag>
              <el-tag v-if="profile.level" type="success">{{ profile.level }}</el-tag>
            </div>
            <div class="meta-line">
              {{ profile.company || '未填写公司' }} · {{ profile.phone || '未填写电话' }} · {{ studioText }}
            </div>
            <div class="tag-row">
              <el-tag v-for="tag in tagList" :key="tag" size="small" effect="plain">
                {{ tag }}
              </el-tag>
              <span v-if="!tagList.length" class="muted">暂无标签</span>
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
              <span>{{ isTutor ? '履历与资质' : '简历与能力' }}</span>
              <el-tag size="small" type="info">{{ isTutor ? '导师资料' : '学员资料' }}</el-tag>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="isTutor ? '履历摘要' : '简历摘要'">
              {{ summaryText }}
            </el-descriptions-item>
            <el-descriptions-item v-if="isTutor" label="教学年限">
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
        </el-card>

        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ isTutor ? '授课记录' : '培训与成绩' }}</span>
              <span class="muted">按日期倒序</span>
            </div>
          </template>
          <el-table :data="trainingRows" stripe size="small" height="330">
            <el-table-column prop="courseName" label="课程" min-width="170" show-overflow-tooltip />
            <el-table-column prop="startDate" label="日期" width="110" />
            <el-table-column v-if="isStudent" prop="tutor" label="导师" width="90" />
            <el-table-column v-else label="学员" min-width="130" show-overflow-tooltip>
              <template #default="{ row }">{{ row.students.join('、') }}</template>
            </el-table-column>
            <el-table-column label="结果" width="110">
              <template #default="{ row }">
                <template v-if="isStudent">
                  <span v-if="row.assessment" :class="['score-text', getScoreClass(row.assessment.score)]">
                    {{ row.assessment.score }}分
                  </span>
                  <span v-else class="muted">未录入</span>
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
        <el-form-item :label="isTutor ? '导师方向' : '岗位'">
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
        <el-form-item v-if="isTutor" label="等级">
          <el-input v-model="form.level" />
        </el-form-item>
        <el-form-item v-if="isTutor" label="教学年限">
          <el-input-number v-model="form.years" :min="0" :max="50" />
        </el-form-item>
        <el-form-item :label="isTutor ? '履历摘要' : '简历摘要'">
          <el-input v-model="form.summary" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item :label="isTutor ? '专长标签' : '技能标签'">
          <el-input v-model="form.tags" placeholder="多个标签用顿号或逗号分隔" />
        </el-form-item>
        <el-form-item label="证书">
          <el-input v-model="form.certificates" placeholder="多个证书用顿号或逗号分隔" />
        </el-form-item>
        <el-form-item label="照片材料">
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
  getTutorProfileSummary
} from '../api/mockData'

const userStore = useUserStore()
const editVisible = ref(false)
const form = reactive({
  name: '',
  title: '',
  phone: '',
  company: '',
  studio: 'studio_a',
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
  if (matched) return matched
  return {
    id: userStore.userInfo.id || 999,
    name: userStore.userName || '演示用户',
    studio: userStore.currentStudio,
    company: '',
    phone: '',
    roleTitle: '岗位待补充',
    title: '方向待补充',
    resumeSummary: '',
    profileSummary: '',
    skillTags: [],
    specialtyTags: [],
    certificates: []
  }
})

const profile = computed(() => ({ ...baseProfile.value, ...overrides.value }))
const summary = computed(() => isTutor.value
  ? getTutorProfileSummary(profile.value.id)
  : getStudentProfileSummary(profile.value.id)
)
const trainingRows = computed(() => summary.value.trainings || [])
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
  return [
    { label: '培训场次', value: summary.value.trainingCount || 0 },
    { label: '闭环场次', value: summary.value.closedCount || 0 },
    { label: '平均成绩', value: summary.value.avgScore ? `${summary.value.avgScore}分` : '暂无' },
    { label: '通过次数', value: summary.value.passCount || 0 }
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
    certificates: splitList(form.certificates),
    photoMaterial: form.photoMaterial
  }
  if (isTutor.value) {
    Object.assign(payload, {
      title: form.title,
      level: form.level,
      years: form.years,
      profileSummary: form.summary,
      specialtyTags: splitList(form.tags)
    })
  } else {
    Object.assign(payload, {
      roleTitle: form.title,
      resumeSummary: form.summary,
      skillTags: splitList(form.tags)
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
  grid-template-columns: minmax(320px, 0.85fr) minmax(480px, 1.15fr);
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
