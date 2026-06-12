<template>
  <div class="page-container">
    <el-tabs v-model="activeTab">
      <!-- 导师管理 -->
      <el-tab-pane label="导师管理" name="tutors">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>导师列表</span>
              <el-button type="primary" @click="openTutorDialog">
                <el-icon><Plus /></el-icon>
                新增导师
              </el-button>
            </div>
          </template>

          <el-table :data="currentTutors" stripe style="width: 100%">
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="company" label="所属公司" width="140" />
            <el-table-column prop="phone" label="联系电话" width="150" />
            <el-table-column label="关联培训" width="100">
              <template #default="{ row }">
                {{ getTutorTrainingCount(row.id) }}场
              </template>
            </el-table-column>
            <el-table-column label="工作室" width="150">
              <template #default="{ row }">
                {{ row.studio === 'studio_a' ? '一号工作室' : '二号工作室' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="editTutor(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteTutor(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 学员管理 -->
      <el-tab-pane label="学员管理" name="students">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>学员列表</span>
              <el-button type="primary" @click="openStudentDialog">
                <el-icon><Plus /></el-icon>
                新增学员
              </el-button>
            </div>
          </template>

          <el-table :data="studentRows" stripe style="width: 100%">
            <el-table-column label="学员" min-width="180">
              <template #default="{ row }">
                <div class="student-cell">
                  <div class="student-photo">{{ row.name.slice(-1) }}</div>
                  <div>
                    <div class="student-name">{{ row.name }}</div>
                    <div class="muted">{{ row.roleTitle }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="company" label="所属公司" width="120" />
            <el-table-column prop="phone" label="联系电话" width="140" />
            <el-table-column label="培训情况" width="150">
              <template #default="{ row }">
                <div>{{ row.trainingCount }} 场</div>
                <div class="muted">闭环 {{ row.closedCount }} 场</div>
              </template>
            </el-table-column>
            <el-table-column label="平均成绩" width="110">
              <template #default="{ row }">
                <span :class="['score-text', getScoreClass(row.avgScore)]">
                  {{ row.avgScore ? `${row.avgScore}分` : '暂无' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="最近培训" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.latestTraining?.courseName || '暂无培训' }}
              </template>
            </el-table-column>
            <el-table-column label="工作室" width="150">
              <template #default="{ row }">
                {{ row.studio === 'studio_a' ? '一号工作室' : '二号工作室' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="210" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain @click="viewStudentProfile(row)">查看档案</el-button>
                <el-button size="small" @click="editStudent(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteStudent(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 导师对话框 -->
    <el-dialog
      v-model="tutorDialogVisible"
      :title="isEditTutor ? '编辑导师' : '新增导师'"
      width="500px"
    >
      <el-form :model="tutorForm" :rules="tutorRules" ref="tutorFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="tutorForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="tutorForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="公司" prop="company">
          <el-input v-model="tutorForm.company" placeholder="请输入所属公司" />
        </el-form-item>
        <el-form-item label="工作室" prop="studio">
          <el-select v-model="tutorForm.studio" placeholder="请选择工作室" style="width: 100%">
            <el-option label="一号工作室" value="studio_a" />
            <el-option label="二号工作室" value="studio_b" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="tutorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTutor" :loading="submitting">
          确认{{ isEditTutor ? '修改' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 学员对话框 -->
    <el-dialog
      v-model="studentDialogVisible"
      :title="isEditStudent ? '编辑学员' : '新增学员'"
      width="500px"
    >
      <el-form :model="studentForm" :rules="studentRules" ref="studentFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="公司" prop="company">
          <el-input v-model="studentForm.company" placeholder="请输入所属公司" />
        </el-form-item>
        <el-form-item label="工作室" prop="studio">
          <el-select v-model="studentForm.studio" placeholder="请选择工作室" style="width: 100%">
            <el-option label="一号工作室" value="studio_a" />
            <el-option label="二号工作室" value="studio_b" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="studentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStudent" :loading="submitting">
          确认{{ isEditStudent ? '修改' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="studentProfileVisible"
      :title="selectedStudent ? `${selectedStudent.name} · 学员档案` : '学员档案'"
      size="720px"
    >
      <template v-if="selectedStudent">
        <div class="profile-header">
          <div class="profile-photo">{{ selectedStudent.name.slice(-1) }}</div>
          <div class="profile-main">
            <div class="profile-name-row">
              <h3>{{ selectedStudent.name }}</h3>
              <el-tag>{{ selectedStudent.roleTitle }}</el-tag>
            </div>
            <div class="profile-meta">
              {{ selectedStudent.company }} · {{ selectedStudent.phone }} · {{ selectedStudent.studio === 'studio_a' ? '一号工作室' : '二号工作室' }}
            </div>
            <div class="tag-row">
              <el-tag v-for="tag in selectedStudent.skillTags" :key="tag" size="small" effect="plain">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-row :gutter="12" class="profile-stats">
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="培训场次" :value="studentProfile.trainingCount" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="闭环场次" :value="studentProfile.closedCount" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="平均成绩" :value="studentProfile.avgScore || 0">
                <template #suffix>分</template>
              </el-statistic>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <el-statistic title="通过次数" :value="studentProfile.passCount" />
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="profile-section">
          <template #header>
            <div class="card-header">
              <span>照片与简历</span>
              <el-tag size="small" type="info">原型占位</el-tag>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="简历摘要">{{ selectedStudent.resumeSummary }}</el-descriptions-item>
            <el-descriptions-item label="证书">
              <el-tag v-for="cert in selectedStudent.certificates" :key="cert" size="small" class="inline-tag">
                {{ cert }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="照片材料">
              <span v-if="studentProfile.photos.length">{{ studentProfile.photos.join('、') }}</span>
              <span v-else class="muted">暂无培训照片归档</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" class="profile-section">
          <template #header>
            <div class="card-header">
              <span>培训与成绩</span>
              <span class="muted">按日期倒序</span>
            </div>
          </template>
          <el-table :data="studentProfile.trainings" stripe size="small" style="width: 100%">
            <el-table-column prop="courseName" label="培训主题" min-width="180" show-overflow-tooltip />
            <el-table-column prop="startDate" label="日期" width="110" />
            <el-table-column prop="tutor" label="导师" width="90" />
            <el-table-column label="成绩" width="100">
              <template #default="{ row }">
                <span v-if="row.assessment" :class="['score-text', getScoreClass(row.assessment.score)]">
                  {{ row.assessment.score }}分
                </span>
                <span v-else class="muted">未录入</span>
              </template>
            </el-table-column>
            <el-table-column label="结果" width="90">
              <template #default="{ row }">
                <el-tag v-if="row.assessment" :type="row.assessment.score >= 60 ? 'success' : 'danger'" size="small">
                  {{ row.assessment.result }}
                </el-tag>
                <span v-else class="muted">-</span>
              </template>
            </el-table-column>
            <el-table-column label="闭环" width="90">
              <template #default="{ row }">
                <el-tag :type="row.closed ? 'success' : 'warning'" size="small">
                  {{ row.closed ? '已闭环' : '待补' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assessment.remark" label="备注" min-width="160" show-overflow-tooltip />
          </el-table>
        </el-card>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { tutors, students, trainingPlans, isTrainingClosed } from '../../api/mockData'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const activeTab = ref('tutors')
const tutorDialogVisible = ref(false)
const studentDialogVisible = ref(false)
const isEditTutor = ref(false)
const isEditStudent = ref(false)
const submitting = ref(false)
const tutorFormRef = ref(null)
const studentFormRef = ref(null)
const studentProfileVisible = ref(false)
const selectedStudent = ref(null)

const tutorForm = reactive({
  id: null,
  name: '',
  phone: '',
  company: '',
  studio: 'studio_a'
})

const studentForm = reactive({
  id: null,
  name: '',
  phone: '',
  company: '',
  studio: 'studio_a'
})

const tutorRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  company: [{ required: true, message: '请输入所属公司', trigger: 'blur' }],
  studio: [{ required: true, message: '请选择工作室', trigger: 'change' }]
}

const studentRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  company: [{ required: true, message: '请输入所属公司', trigger: 'blur' }],
  studio: [{ required: true, message: '请选择工作室', trigger: 'change' }]
}

const currentTutors = computed(() => {
  return tutors.filter(t => t.studio === userStore.currentStudio)
})

const currentStudents = computed(() => {
  return students.filter(s => s.studio === userStore.currentStudio)
})

const studentRows = computed(() => currentStudents.value.map(student => ({
  ...student,
  ...getStudentSummary(student.id)
})))

const studentProfile = computed(() => selectedStudent.value ? getStudentSummary(selectedStudent.value.id) : {
  trainingCount: 0,
  closedCount: 0,
  avgScore: 0,
  passCount: 0,
  photos: [],
  trainings: []
})

const getTutorTrainingCount = (tutorId) => {
  return trainingPlans.filter(plan => plan.tutorId === tutorId).length
}

const getStudentTrainingCount = (studentId) => {
  return trainingPlans.filter(plan => plan.studentIds.includes(studentId)).length
}

const getStudentSummary = (studentId) => {
  const relatedTrainings = trainingPlans
    .filter(plan => plan.studentIds.includes(studentId))
    .map(plan => ({
      ...plan,
      assessment: plan.assessments.find(item => item.studentId === studentId),
      closed: isTrainingClosed(plan)
    }))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
  const scores = relatedTrainings
    .map(plan => plan.assessment?.score)
    .filter(score => typeof score === 'number')
  return {
    trainings: relatedTrainings,
    latestTraining: relatedTrainings[0],
    trainingCount: relatedTrainings.length,
    closedCount: relatedTrainings.filter(plan => plan.closed).length,
    avgScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    passCount: scores.filter(score => score >= 60).length,
    photos: [...new Set(relatedTrainings.flatMap(plan => plan.photos))]
  }
}

const getScoreClass = (score) => {
  if (!score) return 'score-empty'
  if (score >= 90) return 'score-excellent'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 导师操作
const openTutorDialog = () => {
  isEditTutor.value = false
  resetTutorForm()
  tutorDialogVisible.value = true
}

const editTutor = (row) => {
  isEditTutor.value = true
  tutorForm.id = row.id
  tutorForm.name = row.name
  tutorForm.phone = row.phone
  tutorForm.company = row.company
  tutorForm.studio = row.studio
  tutorDialogVisible.value = true
}

const resetTutorForm = () => {
  tutorForm.id = null
  tutorForm.name = ''
  tutorForm.phone = ''
  tutorForm.company = ''
  tutorForm.studio = userStore.currentStudio
  if (tutorFormRef.value) {
    tutorFormRef.value.clearValidate()
  }
}

const submitTutor = async () => {
  if (!tutorFormRef.value) return
  await tutorFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        ElMessage.success(isEditTutor.value ? '修改成功' : '添加成功')
        tutorDialogVisible.value = false
        submitting.value = false
      }, 1000)
    }
  })
}

const deleteTutor = (row) => {
  const count = getTutorTrainingCount(row.id)
  ElMessageBox.confirm(`导师"${row.name}"已关联${count}场培训。原型中只提示风险，不直接删除历史姓名。`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 学员操作
const openStudentDialog = () => {
  isEditStudent.value = false
  resetStudentForm()
  studentDialogVisible.value = true
}

const editStudent = (row) => {
  isEditStudent.value = true
  studentForm.id = row.id
  studentForm.name = row.name
  studentForm.phone = row.phone
  studentForm.company = row.company
  studentForm.studio = row.studio
  studentDialogVisible.value = true
}

const viewStudentProfile = (row) => {
  selectedStudent.value = row
  studentProfileVisible.value = true
}

const resetStudentForm = () => {
  studentForm.id = null
  studentForm.name = ''
  studentForm.phone = ''
  studentForm.company = ''
  studentForm.studio = userStore.currentStudio
  if (studentFormRef.value) {
    studentFormRef.value.clearValidate()
  }
}

const submitStudent = async () => {
  if (!studentFormRef.value) return
  await studentFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        ElMessage.success(isEditStudent.value ? '修改成功' : '添加成功')
        studentDialogVisible.value = false
        submitting.value = false
      }, 1000)
    }
  })
}

const deleteStudent = (row) => {
  const count = getStudentTrainingCount(row.id)
  ElMessageBox.confirm(`学员"${row.name}"已关联${count}场培训。原型中只提示风险，不直接删除历史姓名。`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-cell,
.profile-header,
.profile-name-row,
.tag-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-photo,
.profile-photo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, #409eff, #10b981);
}

.student-photo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 14px;
}

.profile-photo {
  width: 82px;
  height: 82px;
  border-radius: 10px;
  font-size: 28px;
}

.student-name {
  color: #303133;
  font-weight: 700;
}

.muted {
  color: #909399;
  font-size: 12px;
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

.profile-header {
  align-items: flex-start;
  margin-bottom: 18px;
}

.profile-main {
  flex: 1;
}

.profile-name-row h3 {
  margin: 0;
  color: #303133;
}

.profile-meta {
  margin-top: 6px;
  color: #606266;
  font-size: 13px;
}

.tag-row {
  flex-wrap: wrap;
  margin-top: 10px;
}

.profile-stats,
.profile-section {
  margin-top: 14px;
}

.inline-tag {
  margin-right: 6px;
}
</style>
