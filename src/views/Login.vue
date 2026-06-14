<template>
  <div class="login-page">
    <!-- 左侧品牌面板 -->
    <div class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo">
          <span class="logo-icon">🎓</span>
        </div>
        <h1 class="brand-title">智造学堂</h1>
        <p class="brand-desc">面向工匠工作室的<br>一体化培训管理平台</p>

        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">📋</span>
            <span>台账管理，全程追踪培训闭环</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>数据看板，实时掌握进度与质量</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🤝</span>
            <span>双向评价，导师学员共同成长</span>
          </div>
        </div>
      </div>

      <!-- 装饰圆圈 -->
      <div class="deco-circle deco-c1"></div>
      <div class="deco-circle deco-c2"></div>
      <div class="deco-circle deco-c3"></div>
    </div>

    <!-- 右侧表单面板 -->
    <div class="form-panel">
      <div class="form-card">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>请登录您的账号</p>
        </div>

        <div class="form-body">
          <div class="field-group">
            <label>用户名</label>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
              clearable
            />
          </div>

          <div class="field-group">
            <label>密码</label>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码（任意输入）"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </div>

          <div class="field-group">
            <label>角色</label>
            <el-select v-model="loginForm.role" placeholder="请选择您的角色" size="large" style="width:100%">
              <el-option label="👨‍🎓  学员" value="student" />
              <el-option label="👨‍🏫  导师" value="tutor" />
              <el-option label="🛠️  管理者" value="admin" />
            </el-select>
          </div>

          <el-button
            type="primary"
            size="large"
            class="login-btn"
            @click="handleLogin"
            :loading="loading"
          >
            {{ loading ? '登录中…' : '登 录' }}
          </el-button>
        </div>

        <!-- 演示账号 -->
        <div class="demo-section">
          <div class="demo-title">
            <span class="demo-line"></span>
            <span>演示账号（点击快速填充）</span>
            <span class="demo-line"></span>
          </div>
          <div class="demo-chips">
            <button class="demo-chip" @click="fillDemo('student')">
              <span>👨‍🎓</span> 学员 · 学员A
            </button>
            <button class="demo-chip" @click="fillDemo('tutor')">
              <span>👨‍🏫</span> 导师 · 导师A
            </button>
            <button class="demo-chip" @click="fillDemo('admin')">
              <span>🛠️</span> 管理者
            </button>
          </div>
        </div>

        <!-- 快速跳转 -->
        <div class="quick-nav">
          <p class="quick-title">快速导航</p>
          <div class="quick-links">
            <button class="quick-link" @click="router.push('/student/training')">学员端 →</button>
            <button class="quick-link" @click="router.push('/tutor/courseware')">导师端 →</button>
            <button class="quick-link" @click="router.push('/admin/ledger')">管理后台 →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const loginForm = reactive({ username: '', password: '', role: '' })

const demoUsers = {
  student: { id: 1, name: '学员A', role: 'student' },
  tutor:   { id: 1, name: '导师A', role: 'tutor' },
  admin:   { id: 1, name: '管理者', role: 'admin' }
}

const fillDemo = (role) => {
  const user = demoUsers[role]
  loginForm.username = user.name
  loginForm.password = '123456'
  loginForm.role = role
}

const handleLogin = () => {
  if (!loginForm.username || !loginForm.role) {
    ElMessage.warning('请填写用户名并选择角色')
    return
  }
  loading.value = true
  setTimeout(() => {
    const user = Object.values(demoUsers).find(u => u.name === loginForm.username && u.role === loginForm.role)
    const userInfo = user || { id: 999, name: loginForm.username, role: loginForm.role }
    userStore.setToken('mock-token-' + Date.now())
    userStore.setUserInfo(userInfo)
    ElMessage.success('登录成功')
    const routeMap = { student: '/student', tutor: '/tutor', admin: '/admin' }
    router.push(routeMap[loginForm.role] || '/student')
    loading.value = false
  }, 800)
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}

/* === 左侧品牌面板 === */
.brand-panel {
  width: 46%;
  background: linear-gradient(135deg, #0f172a 0%, #1a2642 45%, #1e3a5f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 56px;
  position: relative;
  overflow: hidden;
}

.brand-content {
  position: relative;
  z-index: 2;
}

.brand-logo {
  width: 72px;
  height: 72px;
  background: rgba(79, 110, 242, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(79, 110, 242, 0.3);
  margin-bottom: 28px;
  backdrop-filter: blur(8px);
}

.logo-icon { font-size: 38px; line-height: 1; }

.brand-title {
  font-size: 36px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
}

.brand-desc {
  font-size: 17px;
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 48px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 400;
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(79, 110, 242, 0.15);
  border: 1px solid rgba(79, 110, 242, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

/* 装饰圆圈 */
.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
  background: radial-gradient(circle, #4f6ef2, transparent 70%);
  pointer-events: none;
}
.deco-c1 { width: 400px; height: 400px; top: -120px; right: -80px; }
.deco-c2 { width: 280px; height: 280px; bottom: -60px; left: -60px; opacity: 0.04; }
.deco-c3 { width: 200px; height: 200px; top: 40%; right: 10%; opacity: 0.05; }

/* === 右侧表单面板 === */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: var(--bg-page);
}

.form-card {
  width: 100%;
  max-width: 440px;
}

.form-header {
  margin-bottom: 36px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.form-header p {
  font-size: 15px;
  color: var(--text-muted);
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.01em;
}

.login-btn {
  width: 100%;
  height: 48px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  letter-spacing: 0.05em;
  border-radius: var(--radius-md) !important;
  background: linear-gradient(135deg, var(--color-primary), #818cf8) !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(79, 110, 242, 0.3) !important;
  transition: all var(--transition-base) !important;
  margin-top: 4px;
}

.login-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 20px rgba(79, 110, 242, 0.4) !important;
}

/* 演示账号 */
.demo-section {
  margin-top: 32px;
}

.demo-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 14px;
}

.demo-line {
  flex: 1;
  height: 1px;
  background: var(--border-light);
}

.demo-chips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.demo-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.demo-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* 快速跳转 */
.quick-nav {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed var(--border-light);
}

.quick-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-link {
  padding: 5px 12px;
  border: none;
  background: var(--bg-surface-subtle);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-light);
}

.quick-link:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
