<template>
  <div class="page-container fade-in-up">
    <el-page-header @back="$router.back()" title="返回">
      <template #content>
        <span class="page-back-title">{{ training.courseName }} — 学习资料</span>
      </template>
    </el-page-header>

    <div class="detail-body">
      <!-- 课程信息 -->
      <div class="info-card">
        <div class="info-card-header">
          <h3>{{ training.courseName }}</h3>
          <el-tag type="success" v-if="training.status === 'evaluated'">已评价</el-tag>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-icon">👨‍🏫</span>
            <div><div class="info-label">导师</div><div class="info-val">{{ training.tutor }}</div></div>
          </div>
          <div class="info-item">
            <span class="info-icon">📅</span>
            <div><div class="info-label">培训时间</div><div class="info-val">{{ training.startDate }}</div></div>
          </div>
          <div class="info-item">
            <span class="info-icon">📍</span>
            <div><div class="info-label">地点</div><div class="info-val">{{ training.location }}</div></div>
          </div>
          <div class="info-item">
            <span class="info-icon">🏭</span>
            <div><div class="info-label">工作室</div><div class="info-val">{{ training.studioName }}</div></div>
          </div>
        </div>
      </div>

      <!-- 课卷文件 -->
      <div class="section-card" style="margin-top:16px">
        <div class="section-label">📂 课卷文件</div>
        <div v-if="training.coursewares?.length" class="file-list">
          <div v-for="file in training.coursewares" :key="file.id" class="file-row">
            <div class="file-icon-wrap" :class="getTypeClass(file.type)">
              {{ getTypeIcon(file.type) }}
            </div>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-type-chip">{{ file.type }}</span>
                <span v-if="file.summary" class="file-summary">{{ file.summary }}</span>
              </div>
            </div>
            <el-button type="primary" size="small" plain>下载</el-button>
          </div>
        </div>
        <el-empty v-else description="导师尚未上传课卷" />
      </div>

      <!-- 现场照片 -->
      <div class="section-card" style="margin-top:16px">
        <div class="section-label">📸 现场照片</div>
        <div v-if="training.photos?.length" class="photo-grid">
          <div
            v-for="(photo, index) in training.photos"
            :key="index"
            class="photo-placeholder"
          >
            <span class="photo-icon">🖼️</span>
            <span class="photo-name">{{ photo }}</span>
          </div>
        </div>
        <el-empty v-else description="暂无现场照片" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { trainingPlans } from '../../api/mockData'

const route = useRoute()
const training = ref({})

const getTypeIcon = (type) => {
  const m = { 'PDF': '📄', 'Word': '📝', '图片': '🖼️', '视频': '🎬' }
  return m[type] || '📁'
}
const getTypeClass = (type) => {
  const m = { 'PDF': 'type-pdf', 'Word': 'type-word', '图片': 'type-img', '视频': 'type-video' }
  return m[type] || 'type-default'
}

onMounted(() => {
  const id = parseInt(route.params.id)
  training.value = trainingPlans.find(p => p.id === id) || {}
})
</script>

<style scoped>
.page-back-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }

.detail-body { margin-top: 20px; }

/* 课程信息卡 */
.info-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-sm);
}

.info-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.info-card-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-surface-subtle);
  border-radius: var(--radius-md);
}

.info-icon { font-size: 20px; }
.info-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.info-val { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-top: 2px; }

/* 区块 */
.section-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.section-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

/* 文件列表 */
.file-list { display: flex; flex-direction: column; gap: 10px; }

.file-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.file-row:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.file-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.type-pdf   { background: #fee2e2; }
.type-word  { background: #dbeafe; }
.type-img   { background: #d1fae5; }
.type-video { background: #ede9fe; }
.type-default { background: var(--bg-surface-subtle); }

.file-info { flex: 1; min-width: 0; }
.file-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.file-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.file-type-chip {
  font-size: 11px; font-weight: 700; padding: 1px 6px;
  border-radius: var(--radius-xs); background: var(--bg-surface-subtle);
  color: var(--text-secondary);
}
.file-summary { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 照片网格 */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.photo-placeholder {
  aspect-ratio: 4/3;
  background: var(--bg-surface-subtle);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-muted);
}

.photo-icon { font-size: 28px; }
.photo-name { font-size: 11px; text-align: center; padding: 0 8px; word-break: break-all; }
</style>
