<template>
  <div class="page-container fade-in-up">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>成绩归档</h2>
        <p>管理学员考试成绩，支持 Excel 批量导入与成绩明细导出</p>
      </div>
      <div class="header-actions">
        <a class="template-link" href="#" @click.prevent="downloadTemplate">
          <el-icon><Download /></el-icon> 下载导入模板
        </a>
        <el-button :icon="Upload" @click="importVisible = true">导入成绩</el-button>
        <el-button type="primary" :icon="Plus" @click="openAddDialog">新增成绩</el-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">👥</div>
        <div class="stat-content">
          <div class="stat-label">参与人数</div>
          <div class="stat-value">{{ scoreStats.count }}<sup>人</sup></div>
          <div class="stat-note">{{ filteredRows.length }} 条成绩记录</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">🏆</div>
        <div class="stat-content">
          <div class="stat-label">最高分</div>
          <div class="stat-value">{{ scoreStats.max }}<sup>分</sup></div>
          <div class="stat-note">单科最高成绩</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon indigo">📊</div>
        <div class="stat-content">
          <div class="stat-label">平均分</div>
          <div class="stat-value">{{ scoreStats.avg }}<sup>分</sup></div>
          <div class="stat-note">全部记录加权均值</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rose">⚠️</div>
        <div class="stat-content">
          <div class="stat-label">不及格</div>
          <div class="stat-value">{{ scoreStats.failCount }}<sup>人次</sup></div>
          <div class="stat-note">60分以下</div>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header-bar">
          <div>
            <h3 style="display:inline; font-size:15px; font-weight:600; color:var(--text-primary)">成绩明细</h3>
            <span class="subtitle">共 {{ filteredRows.length }} 条</span>
          </div>
          <div class="toolbar-right">
            <el-select v-model="filterCourse" placeholder="筛选考核科目" clearable style="width:180px">
              <el-option v-for="c in courseOptions" :key="c" :label="c" :value="c" />
            </el-select>
            <el-select v-model="filterType" placeholder="考试类型" clearable style="width:140px">
              <el-option label="笔试" value="written" />
              <el-option label="实操" value="practical" />
            </el-select>
            <el-button :icon="Download" @click="exportExcel">导出 Excel</el-button>
          </div>
        </div>
      </template>

      <el-table :data="pagedRows" stripe style="width:100%">
        <el-table-column prop="studentName" label="学员姓名" width="110" />
        <el-table-column prop="courseName" label="考核科目" min-width="180">
          <template #default="{ row }">
            <span class="phase-tag">{{ row.courseName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="考试类型" width="110">
          <template #default="{ row }">
            <el-tag :type="row.examType === 'written' ? 'info' : 'warning'" size="small">
              {{ row.examType === 'written' ? '笔试' : '实操' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="examDate" label="考试日期" width="130" />
        <el-table-column label="成绩" width="100">
          <template #default="{ row }">
            <span :class="['score-val', scoreClass(row.score)]">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结论" width="100">
          <template #default="{ row }">
            <span :class="['result-badge', row.score >= 60 ? 'badge-pass' : 'badge-fail']">
              {{ row.score >= 60 ? '通过' : '不及格' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="200">
          <template #default="{ row }">
            <div v-if="row._editing" class="remark-edit">
              <el-input v-model="row._remarkDraft" size="small" placeholder="备注内容" />
              <el-button size="small" type="primary" @click="saveRemark(row)">保存</el-button>
              <el-button size="small" @click="cancelEditRemark(row)">取消</el-button>
            </div>
            <div v-else class="remark-view" @click="startEditRemark(row)">
              <span v-if="row.remark" class="remark-text">{{ row.remark }}</span>
              <span v-else class="remark-placeholder">点击添加备注…</span>
              <el-icon class="edit-icon"><Edit /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editRow(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="deleteRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <span class="pagination-info">共 {{ filteredRows.length }} 条记录</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredRows.length"
          layout="sizes, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <!-- Import Dialog -->
    <el-dialog v-model="importVisible" title="导入成绩 Excel" width="500px" align-center>
      <div class="import-body">
        <div class="import-hint">
          <el-icon><InfoFilled /></el-icon>
          请先下载模板，按格式填写后上传，系统将自动解析并写入台账
        </div>
        <div
          class="drop-zone"
          :class="{ 'drop-zone--active': importDragging }"
          @dragover.prevent="importDragging = true"
          @dragleave.prevent="importDragging = false"
          @drop.prevent="handleImportDrop"
        >
          <span style="font-size:48px">{{ importDragging ? '📂' : '📊' }}</span>
          <div style="font-size:14px; color:var(--text-secondary)">拖入 Excel 文件，或</div>
          <label class="upload-btn excel-btn">
            <input type="file" accept=".xlsx,.xls" hidden @change="handleImportFileSelect" />
            选择文件上传
          </label>
          <div style="font-size:12px; color:var(--text-muted)">仅支持 .xlsx / .xls，最大 10MB</div>
        </div>
        <div v-if="importFile" class="import-file-info">
          <span style="font-size:20px">📊</span>
          <span>{{ importFile.name }}</span>
          <el-button size="small" text @click="importFile = null">✕ 移除</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!importFile" :loading="importing" @click="submitImport">
          确认导入
        </el-button>
      </template>
    </el-dialog>

    <!-- Add / Edit Dialog -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑成绩' : '新增成绩'" width="520px" align-center>
      <el-form :model="scoreForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="学员姓名" prop="studentName">
          <el-select v-model="scoreForm.studentName" placeholder="选择学员" filterable style="width:100%">
            <el-option v-for="s in studentOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="考核科目" prop="courseName">
          <el-select v-model="scoreForm.courseName" placeholder="选择考核科目" style="width:100%">
            <el-option v-for="c in courseOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-radio-group v-model="scoreForm.examType">
            <el-radio value="written">笔试</el-radio>
            <el-radio value="practical">实操</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker v-model="scoreForm.examDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="成绩（分）" prop="score">
          <el-input-number v-model="scoreForm.score" :min="0" :max="100" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="scoreForm.remark" placeholder="例如：实操待补、缓考" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          {{ isEdit ? '保存修改' : '新增成绩' }}
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Edit, InfoFilled } from '@element-plus/icons-vue'

// ─── Mock Options ─────────────────────────────────────────────
const courseOptions = ['液压系统基础原理', '电气控制箱标准规范配线要求', '智能PN通讯', '3D打印', '威纶通触摸屏与西门子SMART200PLC的简单应用', '三相两平衡电炉控制', '博图1500基础知识']
const studentOptions = ['刘伟', '陈燕', '张磊', '李娜', '王强', '赵霞', '孙浩', '吴婷', '周杰', '林晓']

// ─── Mock Score Data ──────────────────────────────────────────
const scoreRows = ref([
  { id: 1, studentName: '刘伟', courseName: '液压系统基础原理', examType: 'written', examDate: '2026-06-10', score: 88, remark: '', _editing: false, _remarkDraft: '' },
  { id: 2, studentName: '陈燕', courseName: '液压系统基础原理', examType: 'written', examDate: '2026-06-10', score: 76, remark: '', _editing: false, _remarkDraft: '' },
  { id: 3, studentName: '张磊', courseName: '液压系统基础原理', examType: 'written', examDate: '2026-06-10', score: 92, remark: '', _editing: false, _remarkDraft: '' },
  { id: 4, studentName: '李娜', courseName: '电气控制箱标准规范配线要求', examType: 'practical', examDate: '2026-06-11', score: 85, remark: '', _editing: false, _remarkDraft: '' },
  { id: 5, studentName: '王强', courseName: '电气控制箱标准规范配线要求', examType: 'practical', examDate: '2026-06-11', score: 58, remark: '实操待补，需复考', _editing: false, _remarkDraft: '实操待补，需复考' },
  { id: 6, studentName: '赵霞', courseName: '电气控制箱标准规范配线要求', examType: 'practical', examDate: '2026-06-11', score: 79, remark: '', _editing: false, _remarkDraft: '' },
  { id: 7, studentName: '孙浩', courseName: '威纶通触摸屏与西门子SMART200PLC的简单应用', examType: 'written', examDate: '2026-03-15', score: 91, remark: '优秀', _editing: false, _remarkDraft: '优秀' },
  { id: 8, studentName: '吴婷', courseName: '威纶通触摸屏与西门子SMART200PLC的简单应用', examType: 'written', examDate: '2026-03-15', score: 67, remark: '', _editing: false, _remarkDraft: '' },
  { id: 9, studentName: '周杰', courseName: '威纶通触摸屏与西门子SMART200PLC的简单应用', examType: 'practical', examDate: '2026-03-16', score: 54, remark: '缺考补考中', _editing: false, _remarkDraft: '缺考补考中' },
  { id: 10, studentName: '林晓', courseName: '威纶通触摸屏与西门子SMART200PLC的简单应用', examType: 'practical', examDate: '2026-03-16', score: 83, remark: '', _editing: false, _remarkDraft: '' }
])

// ─── Filters ───────────────────────────────────────────────────
const filterCourse = ref('')
const filterType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredRows = computed(() =>
  scoreRows.value.filter(r => {
    if (filterCourse.value && r.courseName !== filterCourse.value) return false
    if (filterType.value && r.examType !== filterType.value) return false
    return true
  })
)

const pagedRows = computed(() => {
  const s = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(s, s + pageSize.value)
})

// ─── Stats ─────────────────────────────────────────────────────
const scoreStats = computed(() => {
  const scores = filteredRows.value.map(r => r.score)
  const uniqueStudents = new Set(filteredRows.value.map(r => r.studentName))
  return {
    count: uniqueStudents.size,
    max: scores.length ? Math.max(...scores) : 0,
    avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    failCount: scores.filter(s => s < 60).length
  }
})

// ─── Score Helpers ─────────────────────────────────────────────
const scoreClass = score => {
  if (score >= 90) return 'score-excellent'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// ─── Inline Remark Edit ───────────────────────────────────────
const startEditRemark = row => { row._remarkDraft = row.remark; row._editing = true }
const cancelEditRemark = row => { row._editing = false }
const saveRemark = row => {
  row.remark = row._remarkDraft
  row._editing = false
  ElMessage.success('备注已保存')
}

// ─── Row Actions ──────────────────────────────────────────────
const deleteRow = row => {
  ElMessageBox.confirm(`确认删除 ${row.studentName} 的 ${row.examType === 'written' ? '笔试' : '实操'} 成绩？`, '删除确认', {
    confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    const i = scoreRows.value.findIndex(r => r.id === row.id)
    if (i > -1) scoreRows.value.splice(i, 1)
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ─── Add / Edit Form ──────────────────────────────────────────
const formVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const scoreForm = reactive({
  id: null, studentName: '', courseName: '液压系统基础原理',
  examType: 'written', examDate: '', score: 80, remark: ''
})

const formRules = {
  studentName: [{ required: true, message: '请选择学员', trigger: 'change' }],
  courseName: [{ required: true, message: '请选择考核科目', trigger: 'change' }],
  examDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  score: [{ required: true, message: '请输入成绩', trigger: 'blur' }]
}

const resetForm = () => {
  Object.assign(scoreForm, { id: null, studentName: '', courseName: '液压系统基础原理', examType: 'written', examDate: '', score: 80, remark: '' })
  formRef.value?.clearValidate()
}

const openAddDialog = () => { isEdit.value = false; resetForm(); formVisible.value = true }

const editRow = row => {
  isEdit.value = true
  Object.assign(scoreForm, { id: row.id, studentName: row.studentName, courseName: row.courseName, examType: row.examType, examDate: row.examDate, score: row.score, remark: row.remark })
  formVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (!valid) return
    submitting.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const i = scoreRows.value.findIndex(r => r.id === scoreForm.id)
        if (i > -1) {
          const row = scoreRows.value[i]
          Object.assign(row, { studentName: scoreForm.studentName, courseName: scoreForm.courseName, examType: scoreForm.examType, examDate: scoreForm.examDate, score: scoreForm.score, remark: scoreForm.remark, _remarkDraft: scoreForm.remark })
        }
        ElMessage.success('成绩已更新')
      } else {
        scoreRows.value.push({
          id: Date.now(), studentName: scoreForm.studentName, courseName: scoreForm.courseName,
          examType: scoreForm.examType, examDate: scoreForm.examDate,
          score: scoreForm.score, remark: scoreForm.remark,
          _editing: false, _remarkDraft: scoreForm.remark
        })
        ElMessage.success('成绩已新增')
      }
      submitting.value = false
      formVisible.value = false
    }, 600)
  })
}

// ─── Import ────────────────────────────────────────────────────
const importVisible = ref(false)
const importDragging = ref(false)
const importFile = ref(null)
const importing = ref(false)

const handleImportDrop = e => {
  importDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) importFile.value = file
  else ElMessage.warning('请上传 Excel 文件')
}

const handleImportFileSelect = e => {
  importFile.value = e.target.files[0] || null
  e.target.value = ''
}

const submitImport = () => {
  importing.value = true
  setTimeout(() => {
    importing.value = false
    importFile.value = null
    importVisible.value = false
    ElMessage.success('成绩已导入成功（原型模拟）')
  }, 900)
}

const downloadTemplate = () => {
  ElMessage.info('原型模式：模板下载功能待后端对接')
}

const exportExcel = () => {
  ElMessage.success('原型模式：导出功能待后端对接')
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
.header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.template-link {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; color: var(--color-primary); text-decoration: none; font-weight: 500;
  padding: 7px 12px; border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}
.template-link:hover { background: var(--color-primary-light); }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
.stat-icon.indigo { background: linear-gradient(135deg, #eef2ff, #e0e7ff); }
.stat-icon.rose   { background: linear-gradient(135deg, #fff1f2, #ffe4e6); }
.stat-content { flex: 1; min-width: 0; }
.stat-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
.stat-value { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1; margin-bottom: 2px; }
.stat-value sup { font-size: 14px; font-weight: 500; color: var(--text-secondary); vertical-align: super; }
.stat-note { font-size: 12px; color: var(--text-muted); }

/* Card Header */
.card-header-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.subtitle { font-size: 12px; color: var(--text-muted); margin-left: 8px; }
.toolbar-right { display: flex; gap: 10px; align-items: center; }

/* Table */
.phase-tag {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: var(--radius-full);
  background: var(--bg-surface-subtle); border: 1px solid var(--border-light);
  font-size: 12px; color: var(--text-secondary);
}

.score-val {
  font-size: 16px;
  font-weight: 700;
}
.score-excellent { color: var(--color-success); }
.score-pass      { color: var(--color-primary); }
.score-fail      { color: var(--color-danger); }

.result-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: var(--radius-full);
  font-size: 12px; font-weight: 600;
}
.badge-pass { background: var(--color-success-bg); color: #059669; }
.badge-fail { background: var(--color-danger-bg); color: #e11d48; }

/* Remark inline edit */
.remark-view {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  min-height: 30px;
}
.remark-view:hover { background: var(--bg-surface-subtle); }
.remark-text { font-size: 13px; color: var(--text-secondary); flex: 1; }
.remark-placeholder { font-size: 13px; color: var(--text-muted); font-style: italic; flex: 1; }
.edit-icon { font-size: 13px; color: var(--text-muted); flex-shrink: 0; }
.remark-edit { display: flex; align-items: center; gap: 6px; }

/* Pagination */
.pagination-row {
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px; margin-top: 16px;
}
.pagination-info { font-size: 12px; color: var(--text-muted); }

/* Import dialog */
.import-body { display: flex; flex-direction: column; gap: 16px; }
.import-hint {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; border-radius: var(--radius-md);
  background: var(--color-info-bg); color: var(--color-info); font-size: 13px;
}
.drop-zone {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  min-height: 180px; padding: 24px;
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-subtle);
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.drop-zone--active { border-color: var(--color-primary); background: var(--color-primary-subtle); }
.upload-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all var(--transition-fast);
}
.excel-btn { background: var(--color-success-bg); color: #059669; border: 1px solid rgba(16,185,129,.2); }
.excel-btn:hover { background: rgba(16,185,129,.15); }
.import-file-info {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  font-size: 13px; color: var(--text-primary);
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
