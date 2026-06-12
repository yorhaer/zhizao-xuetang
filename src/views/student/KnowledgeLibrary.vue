<template>
  <div class="page-container fade-in-up">
    <div class="page-header">
      <div>
        <h2>知识库</h2>
        <p>导师公开的课件、图纸、视频和复盘资料</p>
      </div>
      <el-input v-model="keyword" clearable placeholder="搜索资料、课程、标签…" class="search-input" style="width:260px">
        <template #prefix><span>🔍</span></template>
      </el-input>
    </div>

    <!-- 课程分类筛选 -->
    <div class="filter-bar">
      <button
        v-for="opt in courseOptions"
        :key="opt"
        class="filter-btn"
        :class="{ 'filter-btn--active': courseFilter === opt }"
        @click="courseFilter = opt"
      >{{ opt }}</button>
    </div>

    <!-- 资料卡片网格 -->
    <div v-if="filteredResources.length" class="resource-grid">
      <div
        v-for="res in filteredResources"
        :key="res.id"
        class="resource-card"
        @click="openResource(res)"
      >
        <div class="resource-card-header">
          <div class="file-type-badge" :class="getTypeClass(res.type)">{{ res.type }}</div>
          <div class="visibility-dot" :title="res.visibility === 'public' ? '全公开' : '本课可见'">
            {{ res.visibility === 'public' ? '🌐' : '🔒' }}
          </div>
        </div>

        <div class="resource-icon">{{ getTypeIcon(res.type) }}</div>

        <div class="resource-name">{{ res.name }}</div>
        <div class="resource-meta">
          <span>{{ res.tutor }}</span>
          <span class="meta-dot">·</span>
          <span>{{ res.studioName }}</span>
        </div>

        <div class="resource-course">📌 {{ res.courseName }}</div>

        <div class="resource-summary" v-if="res.summary">{{ res.summary }}</div>

        <div class="resource-tags">
          <span v-for="tag in res.knowledgeTags" :key="tag" class="resource-tag">{{ tag }}</span>
        </div>

        <div class="resource-footer">
          <span class="resource-date">{{ res.startDate }}</span>
          <span class="resource-count">{{ res.studentCount }}人学习过</span>
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无匹配的公开资料" style="margin-top:40px" />

    <!-- 资料详情抽屉 -->
    <el-drawer v-model="drawerVisible" :title="currentResource.name" size="460px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="来源课程">{{ currentResource.courseName }}</el-descriptions-item>
        <el-descriptions-item label="导师">{{ currentResource.tutor }}</el-descriptions-item>
        <el-descriptions-item label="工作室">{{ currentResource.studioName }}</el-descriptions-item>
        <el-descriptions-item label="资料类型">{{ currentResource.type }}</el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <h4 style="margin-bottom:10px; font-size:14px; font-weight:600;">资料说明</h4>
      <p class="drawer-summary">{{ currentResource.summary || '导师暂未补充说明。' }}</p>
      <h4 style="margin:20px 0 10px; font-size:14px; font-weight:600;">知识标签</h4>
      <div class="drawer-tags">
        <span v-for="tag in currentResource.knowledgeTags" :key="tag" class="resource-tag">{{ tag }}</span>
      </div>
      <div class="drawer-actions">
        <el-button type="primary" style="flex:1">📖 打开资料</el-button>
        <el-button style="flex:1">🔖 收藏</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { getKnowledgeResources } from '../../api/mockData'

const keyword = ref('')
const courseFilter = ref('全部')
const drawerVisible = ref(false)
const resources = ref(getKnowledgeResources())
const currentResource = reactive({
  name: '', courseName: '', tutor: '', studioName: '', type: '', summary: '', knowledgeTags: []
})

const courseOptions = computed(() => [
  '全部',
  ...Array.from(new Set(resources.value.map(item => item.courseName)))
])

const filteredResources = computed(() => {
  const text = keyword.value.trim()
  return resources.value.filter(item => {
    const matchesCourse = courseFilter.value === '全部' || item.courseName === courseFilter.value
    const searchable = [item.name, item.courseName, item.trainingContent, item.tutor, item.summary, item.knowledgeTags.join(' ')].join(' ')
    const matchesKeyword = text ? searchable.includes(text) : true
    return matchesCourse && matchesKeyword
  })
})

const openResource = (row) => {
  Object.assign(currentResource, row)
  drawerVisible.value = true
}

const getTypeIcon = (type) => {
  const map = { 'PDF': '📄', 'Word': '📝', '图片': '🖼️', '视频': '🎬' }
  return map[type] || '📁'
}

const getTypeClass = (type) => {
  const map = { 'PDF': 'type-pdf', 'Word': 'type-word', '图片': 'type-img', '视频': 'type-video' }
  return map[type] || 'type-default'
}
</script>

<style scoped>
/* 筛选按钮组 */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(79,110,242,0.3);
}

/* 资料网格 */
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.resource-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 18px;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md), 0 0 0 2px var(--color-primary-subtle);
  transform: translateY(-2px);
}

.resource-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-type-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-xs);
  letter-spacing: 0.04em;
}

.type-pdf   { background: #fee2e2; color: #dc2626; }
.type-word  { background: #dbeafe; color: #1d4ed8; }
.type-img   { background: #d1fae5; color: #059669; }
.type-video { background: #ede9fe; color: #7c3aed; }
.type-default { background: var(--bg-surface-subtle); color: var(--text-secondary); }

.visibility-dot { font-size: 14px; }

.resource-icon {
  font-size: 32px;
  margin: 4px 0;
}

.resource-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}

.resource-meta {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  gap: 4px;
}

.meta-dot { color: var(--border-medium); }

.resource-course {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-surface-subtle);
  border-radius: var(--radius-xs);
  padding: 3px 8px;
  display: inline-block;
}

.resource-summary {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.resource-tag {
  padding: 2px 8px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
}

.resource-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  border-top: 1px solid var(--border-light);
  padding-top: 8px;
  margin-top: 4px;
}

/* 抽屉内容 */
.drawer-summary {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 14px;
}

.drawer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.drawer-actions {
  display: flex;
  gap: 10px;
  margin-top: 28px;
}
</style>
