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

          <el-table :data="currentStudents" stripe style="width: 100%">
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="company" label="所属公司" width="140" />
            <el-table-column prop="phone" label="联系电话" width="150" />
            <el-table-column label="关联培训" width="100">
              <template #default="{ row }">
                {{ getStudentTrainingCount(row.id) }}场
              </template>
            </el-table-column>
            <el-table-column label="工作室" width="150">
              <template #default="{ row }">
                {{ row.studio === 'studio_a' ? '一号工作室' : '二号工作室' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { tutors, students, trainingPlans } from '../../api/mockData'
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

const getTutorTrainingCount = (tutorId) => {
  return trainingPlans.filter(plan => plan.tutorId === tutorId).length
}

const getStudentTrainingCount = (studentId) => {
  return trainingPlans.filter(plan => plan.studentIds.includes(studentId)).length
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
</style>
