import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const currentStudio = ref(localStorage.getItem('currentStudio') || 'studio_a')

  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => userInfo.value.role || '')
  const userName = computed(() => userInfo.value.name || '')
  const studioName = computed(() =>
    currentStudio.value === 'studio_a' ? '一号工作室' : '二号工作室'
  )

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  function setStudio(studio) {
    currentStudio.value = studio
    localStorage.setItem('currentStudio', studio)
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    currentStudio.value = 'studio_a'
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('currentStudio')
  }

  return {
    token,
    userInfo,
    currentStudio,
    isLoggedIn,
    userRole,
    userName,
    studioName,
    setToken,
    setUserInfo,
    setStudio,
    logout
  }
})
