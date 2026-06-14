<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">🎓</div>
        <div class="brand-text">
          <span class="brand-name">智造学堂</span>
          <span class="brand-role">台账管理</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin/ledger" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">📊</span>
          <span class="nav-label">培训台账</span>
        </router-link>
        <router-link to="/admin/training-plan" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">📅</span>
          <span class="nav-label">排班计划</span>
        </router-link>
        <router-link to="/admin/execution" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">📸</span>
          <span class="nav-label">执行记录</span>
        </router-link>
        <router-link to="/admin/evaluations" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">⭐</span>
          <span class="nav-label">评价汇总</span>
        </router-link>

        <div class="nav-divider"></div>

        <router-link to="/admin/personnel" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">👥</span>
          <span class="nav-label">人员管理</span>
        </router-link>
        <router-link to="/admin/import" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">📥</span>
          <span class="nav-label">数据导入</span>
        </router-link>
        <router-link to="/admin/export" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">📤</span>
          <span class="nav-label">看板导出</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <!-- 工作室切换 -->
        <div class="studio-switcher" @click="toggleStudio">
          <span class="studio-dot"></span>
          <span class="studio-name">{{ userStore.studioName }}</span>
          <span class="switch-hint">切换</span>
        </div>
        <div class="user-card">
          <div class="user-avatar admin-avatar">{{ userStore.userName?.charAt(0) }}</div>
          <div class="user-info">
            <div class="user-name">{{ userStore.userName }}</div>
            <div class="user-role">台账管理员</div>
          </div>
          <button class="logout-btn" @click="handleLogout" title="退出">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <div class="main-wrapper">
      <header class="top-bar">
        <div class="top-bar-left">
          <span class="breadcrumb-studio">{{ userStore.studioName }}</span>
        </div>
        <div class="top-bar-right">
          <span class="current-time">{{ currentDate }}</span>
        </div>
      </header>
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const currentDate = ref('')
let timer = null

const updateDate = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

onMounted(() => { updateDate(); timer = setInterval(updateDate, 60000) })
onUnmounted(() => clearInterval(timer))

const toggleStudio = () => {
  const newStudio = userStore.currentStudio === 'studio_a' ? 'studio_b' : 'studio_a'
  userStore.setStudio(newStudio)
}

const handleLogout = () => { userStore.logout(); router.push('/login') }
</script>

<style scoped>
.app-layout { display: flex; height: 100vh; background: var(--bg-page); overflow: hidden; }

.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--sidebar-bg-from) 0%, var(--sidebar-bg-to) 100%);
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-sidebar); z-index: 100;
}

.sidebar-brand {
  display: flex; align-items: center; gap: 12px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid var(--sidebar-border);
}
.brand-icon { font-size: 26px; line-height: 1; }
.brand-text { display: flex; flex-direction: column; }
.brand-name { font-size: 15px; font-weight: 700; color: #f1f5f9; }
.brand-role { font-size: 11px; color: var(--sidebar-text); margin-top: 1px; }

.sidebar-nav {
  flex: 1; padding: 12px 12px;
  display: flex; flex-direction: column; gap: 2px; overflow-y: auto;
}

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--radius-md);
  color: var(--sidebar-text); text-decoration: none;
  font-size: 13px; font-weight: 500;
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
}
.nav-item:hover { background: rgba(255,255,255,0.06); color: var(--sidebar-text-hover); border-left-color: rgba(79,110,242,0.4); }
.nav-item--active { background: var(--sidebar-active-bg); color: var(--sidebar-active-text); border-left-color: var(--sidebar-active-border); font-weight: 600; }
.nav-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
.nav-divider { height: 1px; background: var(--sidebar-border); margin: 8px 4px; }

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--sidebar-border);
  display: flex; flex-direction: column; gap: 8px;
}

.studio-switcher {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px; border-radius: var(--radius-md);
  background: rgba(255,255,255,0.05);
  cursor: pointer; transition: background var(--transition-fast);
}
.studio-switcher:hover { background: rgba(255,255,255,0.1); }
.studio-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-success); box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
.studio-name { font-size: 12px; color: #cbd5e1; font-weight: 500; flex: 1; }
.switch-hint { font-size: 10px; color: var(--sidebar-text); background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: var(--radius-full); }

.user-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 8px; border-radius: var(--radius-md);
  background: rgba(255,255,255,0.05); transition: background var(--transition-fast);
}
.user-card:hover { background: rgba(255,255,255,0.08); }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  color: white; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.admin-avatar { background: linear-gradient(135deg, #d97706, #f59e0b); }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: var(--sidebar-text); }
.logout-btn {
  width: 28px; height: 28px; border-radius: var(--radius-sm); border: none;
  background: transparent; color: var(--sidebar-text); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); flex-shrink: 0;
}
.logout-btn:hover { background: rgba(244,63,94,0.15); color: #fb7185; }

.main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.top-bar {
  height: var(--header-height); background: var(--header-bg); border-bottom: 1px solid var(--header-border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 28px; flex-shrink: 0; backdrop-filter: blur(8px);
}
.breadcrumb-studio {
  font-size: 13px; font-weight: 600; color: var(--text-secondary);
  background: var(--bg-surface-subtle); border: 1px solid var(--border-light);
  border-radius: var(--radius-full); padding: 4px 12px;
}
.current-time { font-size: 12px; color: var(--text-muted); font-weight: 500; }
.main-content { flex: 1; overflow-y: auto; background: var(--bg-page); }
</style>
