import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const role = ref('teacher') // 'teacher' | 'student'
  const userName = ref('Ms. Sarah Chen')

  function switchRole(newRole) {
    role.value = newRole
    userName.value = newRole === 'teacher' ? 'Ms. Sarah Chen' : 'Alex Johnson'
  }

  return { role, userName, switchRole }
})