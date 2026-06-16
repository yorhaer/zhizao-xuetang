<template>
  <div class="page-container fade-in-up">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>排班管理</h2>
        <p>维护与 Excel 导入/导出格式完全一致的排班表台账，支持单元格合并与双向流转</p>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button :icon="Download" @click="handleExport">导出 Excel (CSV)</el-button>
          <el-button type="success" :icon="Upload" @click="importDrawerVisible = true">导入排班表</el-button>
        </el-button-group>
        <el-button type="primary" :icon="Plus" @click="openCreateDrawer">新建排班</el-button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">📅</div>
        <div class="stat-content">
          <div class="stat-label">排班总科目</div>
          <div class="stat-value">{{ groups.length }}<sup>个</sup></div>
          <div class="stat-note">包含独立培训主题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div class="stat-content">
          <div class="stat-label">总完成人次</div>
          <div class="stat-value">{{ totalCompletedCount }}<sup>人次</sup></div>
          <div class="stat-note">完成率 {{ totalCompletionRate }}%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber">⏳</div>
        <div class="stat-content">
          <div class="stat-label">总计划人次</div>
          <div class="stat-value">{{ totalTraineeCount }}<sup>人次</sup></div>
          <div class="stat-note">学员参训总量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon indigo">👨‍🏫</div>
        <div class="stat-content">
          <div class="stat-label">参训师傅/导师</div>
          <div class="stat-value">{{ uniqueTrainersCount }}<sup>人</sup></div>
          <div class="stat-note">工作室带教骨干</div>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <el-card shadow="never" style="margin-bottom: 16px;">
      <div class="toolbar-bar">
        <div class="toolbar-left">
          <span class="table-title">排班总表 (Excel 格式)</span>
          <el-tag type="info" size="small" class="tip-tag">提示：表格展示已实现 Excel 单元格合并，左右滑动查看完整列</el-tag>
        </div>
        <div class="toolbar-right">
          <el-date-picker
            v-model="filterDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px; margin-right: 2px;"
          />
          <el-select v-model="filterTrainer" placeholder="筛选师傅" clearable style="width: 140px">
            <el-option v-for="t in allTrainers" :key="t" :label="t" :value="t" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="完成状态" clearable style="width: 120px">
            <el-option label="已完成" value="completed" />
            <el-option label="未完成" value="pending" />
          </el-select>
          <el-input v-model="filterKeyword" clearable placeholder="搜索主题/学员/内容" style="width: 220px" />
        </div>
      </div>
    </el-card>

    <!-- Excel-like Table Card -->
    <el-card shadow="never" class="table-card">
      <div class="table-scroll-wrapper">
        <el-table
          :data="flatScheduleList"
          :span-method="arraySpanMethod"
          stripe
          border
          style="width: 100%"
          class="excel-like-table"
          :row-class-name="getRowClassName"
        >
          <!-- Excel Columns mapping -->
          <el-table-column prop="sequenceNo" label="序号" width="65" align="center" />
          <el-table-column prop="trainingTopic" label="培训主题" min-width="200" />
          <el-table-column prop="trainingContent" label="培训内容" min-width="200" show-overflow-tooltip />
          <el-table-column prop="trainer" label="培训师傅" width="100" align="center">
            <template #default="{ row }">
              <span class="trainer-name">👤 {{ row.trainer }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="trainee" label="培训人员" width="110" align="center">
            <template #default="{ row }">
              <span class="trainee-badge">{{ row.trainee }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="trainingDate" label="培训日期" width="105" align="center" />
          <el-table-column prop="startTime" label="培训开始时间" width="115" align="center" />
          <el-table-column prop="endTime" label="培训结束时间" width="115" align="center" />
          <el-table-column prop="durationHours" label="培训时长（H）" width="115" align="center" />
          <el-table-column prop="completedText" label="是否完成" width="95" align="center">
            <template #default="{ row }">
              <span :class="['excel-status', row.completedText === '√' ? 'done' : 'pending']">
                {{ row.completedText === '√' ? '√ 已完成' : '待上课' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="purpose" label="达成目的" min-width="180" show-overflow-tooltip />
          <el-table-column prop="resultCheck" label="成果检验" width="100" align="center" />
          <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
          
          <!-- Actions -->
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" type="primary" link @click="editRow(row)">编辑个人</el-button>
                <el-divider direction="vertical" />
                <el-button size="small" type="primary" link @click="editGroup(row.group)">编辑整组</el-button>
                <el-divider direction="vertical" />
                <el-dropdown trigger="click" @command="(cmd) => handleRowCommand(cmd, row)">
                  <span class="more-actions-btn">更多</span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="addRow">追加人员</el-dropdown-item>
                      <el-dropdown-item command="deleteRow" divided style="color:var(--color-danger)">删除此行</el-dropdown-item>
                      <el-dropdown-item command="deleteGroup" style="color:var(--color-danger)">删除整组</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- Import Drawer -->
    <el-drawer v-model="importDrawerVisible" title="导入排班表" size="500px">
      <div class="import-section">
        <div class="import-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>导入与导出格式完全一致。请使用导出的 CSV 文件修改后在此导入，系统将自动按照合并列规则进行行分组。</span>
        </div>

        <div
          class="drop-zone"
          :class="{ 'drop-zone--active': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <div style="font-size:48px; line-height:1">📤</div>
          <div style="font-size:14px; font-weight:600; color:var(--text-secondary)">拖拽 CSV 文件到此处，或</div>
          <div class="drop-actions">
            <label class="upload-btn excel-btn">
              <input type="file" accept=".csv" hidden @change="handleFileChange" />
              📊 选择 CSV 格式排班表
            </label>
          </div>
          <div style="font-size:12px; color:var(--text-muted)">提示：为保证单元格合并正确，请使用本系统导出的排班模板。</div>
        </div>

        <!-- Download Template -->
        <div class="template-download-card">
          <div style="font-size: 20px">⬇️</div>
          <div>
            <div style="font-size: 13px; font-weight: 600;">没有排班表模板？</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">点击一键导出当前排班表作为模板进行修改。</div>
          </div>
          <el-button size="small" @click="handleExport">导出模板</el-button>
        </div>

        <div v-if="pendingFile" class="pending-file-info">
          <div class="file-icon">📊</div>
          <div class="file-detail">
            <div class="file-name">{{ pendingFile.name }}</div>
            <div class="file-size">{{ pendingFile.size }}</div>
          </div>
          <button class="file-remove" @click="pendingFile = null">✕</button>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDrawerVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!pendingFile"
          :loading="importing"
          @click="submitImport"
        >确认导入</el-button>
      </template>
    </el-drawer>

    <!-- Edit Trainee Row Dialog -->
    <el-dialog v-model="rowDialogVisible" title="编辑人员排班详情" width="500px" align-center>
      <el-form :model="rowForm" :rules="rowRules" ref="rowFormRef" label-width="100px" label-position="right">
        <el-form-item label="培训人员" prop="trainee">
          <el-select v-model="rowForm.trainee" filterable allow-create style="width: 100%" placeholder="请选择或输入学员姓名">
            <el-option v-for="name in studentOptions" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="培训日期" prop="trainingDate">
          <el-input v-model="rowForm.trainingDate" placeholder="例如: 6.15 或 2026-06-15" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-input v-model="rowForm.startTime" placeholder="例如: 09:30:00 或 09:30" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-input v-model="rowForm.endTime" placeholder="例如: 11:30:00 或 11:30" />
        </el-form-item>
        <el-form-item label="培训时长(H)" prop="durationHours">
          <el-input-number v-model="rowForm.durationHours" :precision="1" :step="0.5" :min="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否完成" prop="completedText">
          <el-radio-group v-model="rowForm.completedText">
            <el-radio label="√">已完成 (√)</el-radio>
            <el-radio label="">待上课 / 未完成 (留空)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="rowForm.remark" type="textarea" :rows="2" placeholder="请输入备注内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rowDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRowForm">确认保存</el-button>
      </template>
    </el-dialog>

    <!-- Edit Course Group Drawer -->
    <el-drawer v-model="groupDrawerVisible" :title="isEditGroup ? '编辑培训项目(整组)' : '新建培训项目'" size="640px">
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef" label-width="100px" style="padding-right: 12px;">
        <el-form-item label="序号" prop="sequenceNo">
          <el-input-number v-model="groupForm.sequenceNo" :min="1" style="width: 150px" />
        </el-form-item>
        <el-form-item label="培训主题" prop="trainingTopic">
          <el-input v-model="groupForm.trainingTopic" placeholder="请输入培训主题" />
        </el-form-item>
        <el-form-item label="培训师傅" prop="trainer">
          <el-select v-model="groupForm.trainer" filterable allow-create style="width: 100%" placeholder="请选择或输入培训师傅/导师">
            <el-option v-for="name in tutorOptions" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="培训内容" prop="trainingContent">
          <el-input v-model="groupForm.trainingContent" type="textarea" :rows="3" placeholder="请输入具体培训内容" />
        </el-form-item>
        <el-form-item label="达成目的" prop="purpose">
          <el-input v-model="groupForm.purpose" type="textarea" :rows="2" placeholder="请输入培训需达成的目的" />
        </el-form-item>
        <el-form-item label="成果检验" prop="resultCheck">
          <el-input v-model="groupForm.resultCheck" placeholder="例如: 考核 / 问答 / 实操等" />
        </el-form-item>

        <!-- Trainees list in group -->
        <div class="group-trainees-header">
          <span class="subtitle-bold">参训学员明细 ({{ groupForm.rows.length }}人)</span>
          <el-button type="primary" size="small" :icon="Plus" plain @click="addTraineeRowToForm">追加学员</el-button>
        </div>

        <div class="group-trainees-list">
          <el-card
            v-for="(tRow, idx) in groupForm.rows"
            :key="idx"
            shadow="never"
            class="trainee-item-card"
          >
            <div class="trainee-card-header">
              <span>学员 #{{ idx + 1 }}</span>
              <el-button type="danger" size="small" link @click="removeTraineeRowFromForm(idx)">删除行</el-button>
            </div>
            <div class="trainee-card-grid">
              <el-form-item
                label="学员姓名"
                :prop="'rows.' + idx + '.trainee'"
                :rules="{ required: true, message: '请输入学员姓名', trigger: 'blur' }"
                label-width="70px"
              >
                <el-select v-model="tRow.trainee" filterable allow-create style="width: 100%">
                  <el-option v-for="name in studentOptions" :key="name" :label="name" :value="name" />
                </el-select>
              </el-form-item>

              <el-form-item label="培训日期" label-width="70px">
                <el-input v-model="tRow.trainingDate" placeholder="如 6.15" />
              </el-form-item>

              <el-form-item label="开始时间" label-width="70px">
                <el-input v-model="tRow.startTime" placeholder="如 13:30" />
              </el-form-item>

              <el-form-item label="结束时间" label-width="70px">
                <el-input v-model="tRow.endTime" placeholder="如 15:30" />
              </el-form-item>

              <el-form-item label="时长(H)" label-width="70px">
                <el-input-number v-model="tRow.durationHours" :precision="1" :step="0.5" :min="0.5" style="width: 100%" />
              </el-form-item>

              <el-form-item label="已完成" label-width="70px">
                <el-checkbox v-model="tRow.completed" />
              </el-form-item>
            </div>
            <el-form-item label="备注" label-width="70px" style="margin-top: 8px; margin-bottom: 0;">
              <el-input v-model="tRow.remark" placeholder="本行单独备注信息" />
            </el-form-item>
          </el-card>

          <el-empty v-if="groupForm.rows.length === 0" description="暂无学员，请点击右上方按钮追加学员" :image-size="60" />
        </div>
      </el-form>
      <template #footer>
        <el-button @click="groupDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGroupForm">确认保存</el-button>
      </template>
    </el-drawer>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, InfoFilled } from '@element-plus/icons-vue'
import { cloneLedgerGroups, flattenLedgerGroups } from '../../api/excelLedgerMock.js'

// ─── Options list for autocomplete ───
const tutorOptions = ['宋师傅', '黄师傅', '施师傅', '余师傅', '励师傅', '陈师傅', '陆师傅', '导师A', '导师B', '导师C', '导师D']
const studentOptions = ['张三（鑫泰）', '李四（鑫悦）', '王五（盛泰）', '学员A', '学员B', '学员C', '学员D', '学员E', '学员F']

// ─── Data store ───
const groups = ref([])

onMounted(() => {
  // Check if we already have it in localStorage, otherwise load mock data
  const localData = localStorage.getItem('zhizao_excel_groups')
  if (localData) {
    groups.value = JSON.parse(localData)
  } else {
    groups.value = cloneLedgerGroups()
    syncToLocalStorage()
  }
})

const syncToLocalStorage = () => {
  localStorage.setItem('zhizao_excel_groups', JSON.stringify(groups.value))
}

// ─── Flatten Table Data for Rendering ───
const flatScheduleList = computed(() => {
  const allFlattened = flattenLedgerGroups(groups.value)
  
  // Apply filtering
  return allFlattened.filter(item => {
    // 1. Trainer filter
    if (filterTrainer.value && item.trainer !== filterTrainer.value) return false
    
    // 2. Status filter
    if (filterStatus.value) {
      const isDone = item.completedText === '√'
      if (filterStatus.value === 'completed' && !isDone) return false
      if (filterStatus.value === 'pending' && isDone) return false
    }
    
    // 3. Date range filter
    if (filterDateRange.value && filterDateRange.value.length === 2) {
      const [s, e] = filterDateRange.value
      let compDate = item.trainingDate
      if (compDate && compDate.split('.').length === 2) {
        const parts = compDate.split('.')
        compDate = `2026-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
      }
      if (compDate < s || compDate > e) return false
    }
    
    // 4. Keyword filter (trainingTopic, trainee, trainingContent)
    if (filterKeyword.value.trim()) {
      const kw = filterKeyword.value.trim().toLowerCase()
      const matchTopic = item.trainingTopic.toLowerCase().includes(kw)
      const matchTrainee = item.trainee.toLowerCase().includes(kw)
      const matchContent = (item.trainingContent || '').toLowerCase().includes(kw)
      if (!matchTopic && !matchTrainee && !matchContent) return false
    }
    
    return true
  })
})

// ─── Filters State ───
const filterTrainer = ref('')
const filterStatus = ref('')
const filterKeyword = ref('')
const filterDateRange = ref([])

// Computed stats
const totalTraineeCount = computed(() => {
  return groups.value.reduce((sum, g) => sum + g.rows.length, 0)
})

const totalCompletedCount = computed(() => {
  return groups.value.reduce((sum, g) => sum + g.rows.filter(r => r.completedText === '√').length, 0)
})

const totalCompletionRate = computed(() => {
  if (!totalTraineeCount.value) return 0
  return Math.round((totalCompletedCount.value / totalTraineeCount.value) * 100)
})

const uniqueTrainersCount = computed(() => {
  const trainers = groups.value.map(g => g.trainer).filter(Boolean)
  return new Set(trainers).size
})

const allTrainers = computed(() => {
  const trainers = groups.value.map(g => g.trainer).filter(Boolean)
  return Array.from(new Set(trainers))
})

// ─── Table Merging Logic (:span-method) ───
const arraySpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // Merged columns (Excel style):
  // Column 0: 序号 (sequenceNo)
  // Column 1: 培训主题 (trainingTopic)
  // Column 2: 培训内容 (trainingContent)
  // Column 3: 培训师傅 (trainer)
  // Column 10: 达成目的 (purpose)
  // Column 11: 成果检验 (resultCheck)
  const mergedColumnIndexes = [0, 1, 2, 3, 10, 11]
  
  if (mergedColumnIndexes.includes(columnIndex)) {
    if (row.rowIndex === 0) {
      // Find visible rows for this group
      const visibleRowsInGroup = flatScheduleList.value.filter(item => item.group.id === row.group.id)
      
      // Find the first visible item
      const firstVisibleItem = visibleRowsInGroup[0]
      if (firstVisibleItem && firstVisibleItem.rowKey === row.rowKey) {
        return {
          rowspan: visibleRowsInGroup.length,
          colspan: 1
        }
      } else {
        return {
          rowspan: 0,
          colspan: 0
        }
      }
    } else {
      const visibleRowsInGroup = flatScheduleList.value.filter(item => item.group.id === row.group.id)
      const firstVisibleItem = visibleRowsInGroup[0]
      if (firstVisibleItem && firstVisibleItem.rowKey !== row.rowKey) {
        return {
          rowspan: 0,
          colspan: 0
        }
      }
    }
  }
}

// Hover state styling by group
const getRowClassName = ({ row }) => {
  return `excel-row-group-${row.group.id}`
}

// ─── Actions & Handlers ───
const handleRowCommand = (cmd, row) => {
  if (cmd === 'addRow') {
    openAddTrainee(row.group)
  } else if (cmd === 'deleteRow') {
    deleteRow(cmd, row)
  } else if (cmd === 'deleteGroup') {
    deleteGroup(row.group)
  }
}

const deleteRow = (cmd, row) => {
  ElMessageBox.confirm(`确认从该科目中删除学员「${row.trainee}」？`, '删除人员', {
    confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    const group = groups.value.find(g => g.id === row.group.id)
    if (group) {
      const idx = group.rows.findIndex(r => r.id === row.id)
      if (idx > -1) {
        group.rows.splice(idx, 1)
        // If group has no rows left, delete the group too
        if (group.rows.length === 0) {
          const gIdx = groups.value.findIndex(g => g.id === group.id)
          if (gIdx > -1) groups.value.splice(gIdx, 1)
        }
        syncToLocalStorage()
        ElMessage.success('人员已删除')
      }
    }
  }).catch(() => {})
}

const deleteGroup = (group) => {
  ElMessageBox.confirm(`确认彻底删除培训项目「${group.trainingTopic}」？将删除整组人员。`, '删除整组排班', {
    confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'danger'
  }).then(() => {
    const idx = groups.value.findIndex(g => g.id === group.id)
    if (idx > -1) {
      groups.value.splice(idx, 1)
      syncToLocalStorage()
      ElMessage.success('整组排班已删除')
    }
  }).catch(() => {})
}

// ─── Edit Trainee Row Dialog ───
const rowDialogVisible = ref(false)
const rowFormRef = ref(null)
const editingGroupRef = ref(null)
const editingRowRef = ref(null)

const rowForm = reactive({
  trainee: '',
  trainingDate: '',
  startTime: '',
  endTime: '',
  durationHours: 2,
  completedText: '',
  remark: ''
})

const rowRules = {
  trainee: [{ required: true, message: '请选择或输入学员姓名', trigger: 'change' }],
  trainingDate: [{ required: true, message: '请输入培训日期', trigger: 'blur' }]
}

const editRow = (row) => {
  editingGroupRef.value = groups.value.find(g => g.id === row.group.id)
  editingRowRef.value = row
  
  Object.assign(rowForm, {
    trainee: row.trainee,
    trainingDate: row.trainingDate || '',
    startTime: row.startTime || '',
    endTime: row.endTime || '',
    durationHours: row.durationHours || 2,
    completedText: row.completedText || '',
    remark: row.remark || ''
  })
  
  rowDialogVisible.value = true
}

const submitRowForm = () => {
  rowFormRef.value?.validate(valid => {
    if (!valid) return
    
    const targetRow = editingGroupRef.value.rows.find(r => r.id === editingRowRef.value.id)
    if (targetRow) {
      Object.assign(targetRow, {
        trainee: rowForm.trainee,
        trainingDate: rowForm.trainingDate,
        startTime: rowForm.startTime,
        endTime: rowForm.endTime,
        durationHours: rowForm.durationHours,
        completedText: rowForm.completedText,
        remark: rowForm.remark
      })
      
      syncToLocalStorage()
      rowDialogVisible.value = false
      ElMessage.success('人员信息已保存')
    }
  })
}

// ─── Edit Course Group Drawer ───
const groupDrawerVisible = ref(false)
const groupFormRef = ref(null)
const isEditGroup = ref(false)
const targetGroupId = ref(null)

const groupForm = reactive({
  sequenceNo: 1,
  trainingTopic: '',
  trainingContent: '',
  trainer: '',
  purpose: '',
  resultCheck: '考核',
  rows: []
})

const groupRules = {
  trainingTopic: [{ required: true, message: '请输入培训主题', trigger: 'blur' }],
  trainer: [{ required: true, message: '请输入或选择带教师傅', trigger: 'change' }]
}

const openCreateDrawer = () => {
  isEditGroup.value = false
  targetGroupId.value = null
  
  const maxSeq = groups.value.length ? Math.max(...groups.value.map(g => g.sequenceNo || 0)) : 0
  
  Object.assign(groupForm, {
    sequenceNo: maxSeq + 1,
    trainingTopic: '',
    trainingContent: '',
    trainer: '',
    purpose: '',
    resultCheck: '考核',
    rows: [
      { trainee: '', trainingDate: '', startTime: '13:30:00', endTime: '15:30:00', durationHours: 2, completed: false, remark: '' }
    ]
  })
  
  groupDrawerVisible.value = true
}

const editGroup = (group) => {
  isEditGroup.value = true
  targetGroupId.value = group.id
  
  Object.assign(groupForm, {
    sequenceNo: group.sequenceNo,
    trainingTopic: group.trainingTopic,
    trainingContent: group.trainingContent || '',
    trainer: group.trainer,
    purpose: group.purpose || '',
    resultCheck: group.resultCheck || '考核',
    rows: group.rows.map(r => ({
      id: r.id,
      trainee: r.trainee,
      trainingDate: r.trainingDate || '',
      startTime: r.startTime || '',
      endTime: r.endTime || '',
      durationHours: r.durationHours || 2,
      completed: r.completedText === '√',
      remark: r.remark || ''
    }))
  })
  
  groupDrawerVisible.value = true
}

const openAddTrainee = (group) => {
  editGroup(group)
  addTraineeRowToForm()
}

const addTraineeRowToForm = () => {
  const lastRow = groupForm.rows[groupForm.rows.length - 1]
  groupForm.rows.push({
    trainee: '',
    trainingDate: lastRow?.trainingDate || '',
    startTime: lastRow?.startTime || '13:30:00',
    endTime: lastRow?.endTime || '15:30:00',
    durationHours: lastRow?.durationHours || 2,
    completed: false,
    remark: ''
  })
}

const removeTraineeRowFromForm = (idx) => {
  groupForm.rows.splice(idx, 1)
}

const submitGroupForm = () => {
  groupFormRef.value?.validate(valid => {
    if (!valid) return
    
    if (groupForm.rows.length === 0) {
      ElMessage.warning('请至少添加一名参训学员')
      return
    }
    
    const mappedRows = groupForm.rows.map((r, i) => ({
      id: r.id || `row-${Date.now()}-${i}`,
      trainee: r.trainee,
      trainingDate: r.trainingDate,
      startTime: r.startTime,
      endTime: r.endTime,
      durationHours: r.durationHours,
      completedText: r.completed ? '√' : '',
      remark: r.remark
    }))
    
    if (isEditGroup.value) {
      const group = groups.value.find(g => g.id === targetGroupId.value)
      if (group) {
        Object.assign(group, {
          sequenceNo: groupForm.sequenceNo,
          trainingTopic: groupForm.trainingTopic,
          trainingContent: groupForm.trainingContent,
          trainer: groupForm.trainer,
          purpose: groupForm.purpose,
          resultCheck: groupForm.resultCheck,
          rows: mappedRows
        })
        ElMessage.success('排班已成功更新')
      }
    } else {
      groups.value.push({
        id: `group-${Date.now()}`,
        sequenceNo: groupForm.sequenceNo,
        trainingTopic: groupForm.trainingTopic,
        trainingContent: groupForm.trainingContent,
        trainer: groupForm.trainer,
        purpose: groupForm.purpose,
        resultCheck: groupForm.resultCheck,
        rows: mappedRows
      })
      ElMessage.success('排班项目已创建')
    }
    
    syncToLocalStorage()
    groupDrawerVisible.value = false
  })
}

// ─── Export to Excel-compatible CSV ───
const handleExport = () => {
  const columns = [
    { label: '序号', key: 'sequenceNo' },
    { label: '培训主题', key: 'trainingTopic' },
    { label: '培训内容', key: 'trainingContent' },
    { label: '培训师傅', key: 'trainer' },
    { label: '培训人员', key: 'trainee' },
    { label: '培训日期', key: 'trainingDate' },
    { label: '培训开始时间', key: 'startTime' },
    { label: '培训结束时间', key: 'endTime' },
    { label: '培训时长（H）', key: 'durationHours' },
    { label: '是否完成', key: 'completedText' },
    { label: '达成目的', key: 'purpose' },
    { label: '成果检验', key: 'resultCheck' },
    { label: '备注', key: 'remark' }
  ]
  
  const csvData = []
  
  groups.value.forEach(group => {
    group.rows.forEach((row, rIdx) => {
      const csvRow = {
        sequenceNo: rIdx === 0 ? group.sequenceNo : '',
        trainingTopic: rIdx === 0 ? group.trainingTopic : '',
        trainingContent: rIdx === 0 ? group.trainingContent : '',
        trainer: rIdx === 0 ? group.trainer : '',
        trainee: row.trainee || '',
        trainingDate: row.trainingDate || '',
        startTime: row.startTime || '',
        endTime: row.endTime || '',
        durationHours: row.durationHours || '',
        completedText: row.completedText || '',
        purpose: rIdx === 0 ? group.purpose : '',
        resultCheck: rIdx === 0 ? group.resultCheck : '',
        remark: row.remark || ''
      }
      csvData.push(csvRow)
    })
  })
  
  const BOM = '\uFEFF'
  const headers = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',')
  const rows = csvData.map(row => 
    columns.map(c => {
      const val = row[c.key] ?? ''
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  )
  
  const csvContent = BOM + [headers, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `数字化工匠排班表_${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('排班表已成功导出为 CSV (Excel 直接兼容)')
}

// ─── Import Schedule CSV ───
const importDrawerVisible = ref(false)
const isDragging = ref(false)
const pendingFile = ref(null)
const importing = ref(false)

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  setPendingFile(file)
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  setPendingFile(file)
  e.target.value = ''
}

const setPendingFile = (file) => {
  if (!file) return
  if (!file.name.endsWith('.csv')) {
    ElMessage.error('仅支持导入 .csv 格式的文件')
    return
  }
  
  const sizeStr = file.size < 1048576 
    ? (file.size / 1024).toFixed(1) + ' KB' 
    : (file.size / 1048576).toFixed(1) + ' MB'
    
  pendingFile.value = {
    file,
    name: file.name,
    size: sizeStr
  }
}

const submitImport = () => {
  if (!pendingFile.value) return
  
  importing.value = true
  const reader = new FileReader()
  
  reader.onload = (e) => {
    const text = e.target.result
    try {
      const lines = parseCSV(text)
      if (lines.length < 2) {
        throw new Error('行数过少，未包含数据行')
      }
      
      const headers = lines[0].map(h => h.trim().replace(/^\uFEFF/, '')) // remove BOM mark if present
      const getIndex = (label) => headers.indexOf(label)
      
      const idxSeq = getIndex('序号')
      const idxTopic = getIndex('培训主题')
      const idxContent = getIndex('培训内容')
      const idxTrainer = getIndex('培训师傅')
      const idxTrainee = getIndex('培训人员')
      const idxDate = getIndex('培训日期')
      const idxStart = getIndex('培训开始时间')
      const idxEnd = getIndex('培训结束时间')
      const idxDuration = getIndex('培训时长（H）')
      const idxCompleted = getIndex('是否完成')
      const idxPurpose = getIndex('达成目的')
      const idxResult = getIndex('成果检验')
      const idxRemark = getIndex('备注')
      
      if (idxTopic === -1 || idxTrainer === -1 || idxTrainee === -1) {
        throw new Error('文件列结构不符，必须包含：培训主题、培训师傅、培训人员')
      }
      
      const newGroups = []
      let currentGroup = null
      
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i]
        if (row.length < 3 || row.every(cell => cell.trim() === '')) continue
        
        const seqStr = idxSeq !== -1 ? row[idxSeq]?.trim() : ''
        const topic = idxTopic !== -1 ? row[idxTopic]?.trim() : ''
        const content = idxContent !== -1 ? row[idxContent]?.trim() : ''
        const trainer = idxTrainer !== -1 ? row[idxTrainer]?.trim() : ''
        const purpose = idxPurpose !== -1 ? row[idxPurpose]?.trim() : ''
        const resultCheck = idxResult !== -1 ? row[idxResult]?.trim() : ''
        
        const isNewGroup = seqStr !== '' || (topic !== '' && trainer !== '')
        
        if (isNewGroup || !currentGroup) {
          const nextSeq = seqStr ? parseInt(seqStr, 10) || (newGroups.length + 1) : (newGroups.length + 1)
          currentGroup = {
            id: `group-${Date.now()}-${newGroups.length}`,
            sequenceNo: nextSeq,
            trainingTopic: topic || (currentGroup ? currentGroup.trainingTopic : '未定义主题'),
            trainingContent: content || (currentGroup ? currentGroup.trainingContent : ''),
            trainer: trainer || (currentGroup ? currentGroup.trainer : '未分配'),
            purpose: purpose || (currentGroup ? currentGroup.purpose : ''),
            resultCheck: resultCheck || (currentGroup ? currentGroup.resultCheck : '考核'),
            rows: []
          }
          newGroups.push(currentGroup)
        }
        
        const traineeName = idxTrainee !== -1 ? row[idxTrainee]?.trim() : ''
        if (traineeName) {
          currentGroup.rows.push({
            id: `row-${Date.now()}-${newGroups.length}-${currentGroup.rows.length}`,
            trainee: traineeName,
            trainingDate: idxDate !== -1 ? row[idxDate]?.trim() : '',
            startTime: idxStart !== -1 ? row[idxStart]?.trim() : '',
            endTime: idxEnd !== -1 ? row[idxEnd]?.trim() : '',
            durationHours: idxDuration !== -1 ? parseFloat(row[idxDuration]) || 2 : 2,
            completedText: idxCompleted !== -1 ? row[idxCompleted]?.trim() : '',
            remark: idxRemark !== -1 ? row[idxRemark]?.trim() : ''
          })
        }
      }
      
      const filtered = newGroups.filter(g => g.rows.length > 0)
      if (filtered.length === 0) {
        throw new Error('未解析到有效的排班数据')
      }
      
      groups.value = filtered
      syncToLocalStorage()
      
      ElMessage.success(`导入成功，共读取 ${filtered.length} 组培训项目，合计 ${filtered.flatMap(g => g.rows).length} 个学员排班`)
      importDrawerVisible.value = false
      pendingFile.value = null
    } catch (err) {
      ElMessage.error(`导入失败：${err.message}`)
    } finally {
      importing.value = false
    }
  }
  
  reader.readAsText(pendingFile.value.file, 'UTF-8')
}

// Helper: compliant CSV parser handling quotes and commas
const parseCSV = (text) => {
  const lines = []
  let row = ['']
  let inQuotes = false
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      row.push('')
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++
      }
      lines.push(row)
      row = ['']
    } else {
      row[row.length - 1] += char
    }
  }
  
  if (row.length > 1 || row[0] !== '') {
    lines.push(row)
  }
  
  return lines
}
</script>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}
.page-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -.01em;
}
.page-header p {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-muted);
}
.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* Stats Row */
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
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}
.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.stat-icon.blue   { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
.stat-icon.green  { background: linear-gradient(135deg, #ecfdf5, #d1fae5); }
.stat-icon.amber  { background: linear-gradient(135deg, #fffbeb, #fef3c7); }
.stat-icon.indigo { background: linear-gradient(135deg, #eef2ff, #e0e7ff); }
.stat-content {
  flex: 1;
  min-width: 0;
}
.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 2px;
}
.stat-value sup {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  vertical-align: super;
  margin-left: 2px;
}
.stat-note {
  font-size: 11px;
  color: var(--text-muted);
}

/* Toolbar */
.toolbar-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.table-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}
.tip-tag {
  font-weight: normal;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Table Card */
.table-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.table-scroll-wrapper {
  overflow-x: auto;
}

.excel-like-table :deep(.el-table__row) {
  height: 52px;
}
.excel-like-table :deep(td.el-table__cell) {
  padding: 6px 0;
  border-color: #e2e8f0;
}
.excel-like-table :deep(th.el-table__cell) {
  background: var(--bg-surface-subtle);
  color: var(--text-secondary);
  font-weight: 700;
  border-color: #cbd5e1;
  font-size: 13px;
}

.trainer-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 13px;
}
.trainee-badge {
  display: inline-block;
  padding: 3px 8px;
  background-color: var(--bg-surface-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 12px;
}

.excel-status {
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.excel-status.done {
  background-color: var(--color-success-bg);
  color: #059669;
}
.excel-status.pending {
  background-color: var(--color-warning-bg);
  color: #d97706;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
}
.more-actions-btn {
  font-size: 12px;
  color: var(--color-primary);
  cursor: pointer;
  user-select: none;
}
.more-actions-btn:hover {
  text-decoration: underline;
}

/* Import Drawer */
.import-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.import-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-info-bg);
  color: var(--color-info);
  font-size: 13px;
  line-height: 1.5;
}
.import-tip .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}
.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 200px;
  padding: 24px;
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-subtle);
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.drop-zone--active {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}
.drop-actions {
  display: flex;
  gap: 10px;
}
.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.excel-btn {
  background: var(--color-success-bg);
  color: #059669;
  border: 1px solid rgba(16,185,129,.2);
}
.excel-btn:hover {
  background: rgba(16,185,129,.15);
}

.template-download-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
}
.template-download-card :deep(.el-button) {
  margin-left: auto;
}

.pending-file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
}
.file-icon {
  font-size: 20px;
}
.file-detail {
  flex: 1;
  min-width: 0;
}
.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-size {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
}
.file-remove {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 13px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.file-remove:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

/* Group trainees styling */
.group-trainees-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}
.subtitle-bold {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}
.group-trainees-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}
.trainee-item-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-surface-subtle);
}
.trainee-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}
.trainee-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 12px;
}
.trainee-card-grid :deep(.el-form-item) {
  margin-bottom: 0px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
