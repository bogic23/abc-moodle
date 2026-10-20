import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

let firestoreModulesPromise

async function getFirestoreModules() {
  if (!firestoreModulesPromise) {
    firestoreModulesPromise = Promise.all([
      import('../../firebase.js'),
      import('firebase/firestore/lite'),
    ]).then(([firebase, firestore]) => ({ ...firestore, db: firebase.db }))
  }
  return firestoreModulesPromise
}

export const useAdminStore = defineStore('admin', () => {
  const auth = useAuthStore()
  const users = ref([])
  const loading = ref(false)
  const error = ref('')
  const savingUserId = ref(null)

  async function loadUsers() {
    if (auth.role !== 'admin') throw new Error('Only admins can view user management.')
    loading.value = true
    error.value = ''
    try {
      const { db, collection, getDocs } = await getFirestoreModules()
      const snapshot = await getDocs(collection(db, 'users'))
      users.value = snapshot.docs
        .map(userSnapshot => ({ uid: userSnapshot.id, ...userSnapshot.data() }))
        .sort((left, right) => (left.displayName || '').localeCompare(right.displayName || ''))
    } catch (cause) {
      error.value = cause.message || 'Unable to load user accounts.'
      throw cause
    } finally {
      loading.value = false
    }
  }

  async function setTeacherApproval(uid, status) {
    if (auth.role !== 'admin') throw new Error('Only admins can manage teacher approvals.')
    if (!['pending', 'approved', 'rejected'].includes(status)) throw new Error('Choose a valid teacher approval status.')

    savingUserId.value = uid
    error.value = ''
    try {
      const { db, doc, serverTimestamp, updateDoc } = await getFirestoreModules()
      await updateDoc(doc(db, 'users', uid), {
        teacherApproval: status,
        updatedAt: serverTimestamp(),
      })
      const user = users.value.find(item => item.uid === uid)
      if (user) user.teacherApproval = status
    } catch (cause) {
      error.value = cause.message || 'Unable to update teacher approval.'
      throw cause
    } finally {
      savingUserId.value = null
    }
  }

  return { users, loading, error, savingUserId, loadUsers, setTeacherApproval }
})
