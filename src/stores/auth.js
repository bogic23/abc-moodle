import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const profile = ref(null)
  const loading = ref(true)
  const authError = ref('')
  let initializePromise
  let profileWriteInProgress = false

  const validRoles = ['teacher', 'student', 'admin']
  const selfAssignableRoles = ['teacher', 'student']
  const role = computed(() => profile.value?.role || null)
  const teacherApproval = computed(() => profile.value?.teacherApproval || (role.value === 'teacher' ? 'pending' : 'not-required'))
  const userName = computed(() => profile.value?.displayName || currentUser.value?.email || '')
  let firebaseModulesPromise

  function getTeacherApproval(userProfile) {
    if (userProfile.teacherApproval) return userProfile.teacherApproval
    if (userProfile.role === 'teacher') return 'pending'
    if (userProfile.role === 'student') return 'not-required'
    return undefined
  }

  function getFirebaseModules() {
    if (!firebaseModulesPromise) {
      firebaseModulesPromise = Promise.all([
        import('../../firebase.js'),
        import('firebase/auth'),
        import('firebase/firestore/lite'),
      ]).then(([firebase, authSdk, firestoreSdk]) => ({
        ...authSdk,
        ...firestoreSdk,
        auth: firebase.auth,
        db: firebase.db,
      }))
    }
    return firebaseModulesPromise
  }

  function getErrorMessage(error) {
    const messages = {
      'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
      'auth/invalid-credential': 'Email or password is incorrect. Please try again.',
      'auth/invalid-login-credentials': 'Email or password is incorrect. Please try again.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/popup-blocked': 'The sign-in popup was blocked. Allow popups for this site and try again.',
      'auth/popup-closed-by-user': 'The sign-in popup was closed before sign-in completed.',
      'auth/cancelled-popup-request': 'Another sign-in popup is already open.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
      'auth/network-request-failed': 'Unable to connect. Check your internet connection and try again.',
      'auth/operation-not-allowed': 'Email and password sign-in is not enabled in Firebase Authentication.',
      'auth/too-many-requests': 'Too many attempts. Wait a little and try again.',
      'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled. Contact your administrator.',
      'permission-denied': 'Firestore denied access. Check that the app’s Firestore security rules are deployed.',
      'unavailable': 'Firestore is temporarily unavailable. Please try again.',
    }

    return messages[error?.code] || error?.message || 'Something went wrong. Please try again.'
  }

  async function readProfile(user) {
    const { db, doc, getDoc } = await getFirebaseModules()
    const snapshot = await getDoc(doc(db, 'users', user.uid))
    if (!snapshot.exists()) {
      throw new Error('This account does not have a saved profile. Please contact your administrator.')
    }

    const data = snapshot.data()
    if (!validRoles.includes(data.role) || !data.displayName) {
      throw new Error('This account profile is incomplete or invalid. Please contact your administrator.')
    }

    return {
      uid: user.uid,
      displayName: data.displayName,
      email: data.email,
      role: data.role,
      teacherApproval: getTeacherApproval(data),
    }
  }

  function initialize() {
    if (initializePromise) return initializePromise

    initializePromise = (async () => {
      try {
        const { auth: firebaseAuth, onAuthStateChanged } = await getFirebaseModules()
        await new Promise(resolve => {
          let initialStateResolved = false

          onAuthStateChanged(firebaseAuth, async user => {
            if (profileWriteInProgress) return

            authError.value = ''
            try {
              if (user) {
                const userProfile = await readProfile(user)
                currentUser.value = user
                profile.value = userProfile
              } else {
                currentUser.value = null
                profile.value = null
              }
            } catch (error) {
              currentUser.value = null
              profile.value = null
              authError.value = getErrorMessage(error)
            } finally {
              loading.value = false
              if (!initialStateResolved) {
                initialStateResolved = true
                resolve()
              }
            }
          }, error => {
            authError.value = getErrorMessage(error)
            loading.value = false
            if (!initialStateResolved) {
              initialStateResolved = true
              resolve()
            }
          })
        })
      } catch (error) {
        authError.value = getErrorMessage(error)
        loading.value = false
      }
    })()

    return initializePromise
  }

  async function register({ displayName, email, password, role }) {
    authError.value = ''
    if (!selfAssignableRoles.includes(role)) throw new Error('Choose a valid account role.')

    profileWriteInProgress = true
    let userCredential
    let firebaseModules
    try {
      firebaseModules = await getFirebaseModules()
      userCredential = await firebaseModules.createUserWithEmailAndPassword(firebaseModules.auth, email, password)
      await firebaseModules.updateProfile(userCredential.user, { displayName })
      const userProfile = {
        uid: userCredential.user.uid,
        displayName,
        email: userCredential.user.email,
        role,
        teacherApproval: role === 'teacher' ? 'pending' : 'not-required',
        createdAt: firebaseModules.serverTimestamp(),
        updatedAt: firebaseModules.serverTimestamp(),
        lastLoginAt: firebaseModules.serverTimestamp(),
      }
      await firebaseModules.setDoc(firebaseModules.doc(firebaseModules.db, 'users', userCredential.user.uid), userProfile)
      currentUser.value = userCredential.user
      profile.value = {
        uid: userProfile.uid,
        displayName: userProfile.displayName,
        email: userProfile.email,
        role: userProfile.role,
        teacherApproval: userProfile.teacherApproval,
      }
    } catch (error) {
      if (userCredential) {
        let signOutError
        try {
          await firebaseModules.signOut(firebaseModules.auth)
        } catch (cleanupError) {
          signOutError = cleanupError
        }
        profileWriteInProgress = false
        const cleanupMessage = signOutError ? ` Sign-out also failed: ${getErrorMessage(signOutError)}` : ''
        throw new Error(
          `Your account was created, but the profile could not be saved. ${getErrorMessage(error)}${cleanupMessage}`,
          { cause: error },
        )
      }
      throw new Error(getErrorMessage(error), { cause: error })
    } finally {
      profileWriteInProgress = false
      loading.value = false
    }
  }

  async function login({ email, password }) {
    authError.value = ''
    try {
      const { auth: firebaseAuth, signInWithEmailAndPassword, db, doc, serverTimestamp, setDoc } = await getFirebaseModules()
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      const userProfile = await readProfile(userCredential.user)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(userProfile.teacherApproval ? { teacherApproval: userProfile.teacherApproval } : {}),
      }, { merge: true })
      currentUser.value = userCredential.user
      profile.value = userProfile
    } catch (error) {
      throw new Error(getErrorMessage(error), { cause: error })
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle(selectedRole) {
    authError.value = ''
    if (!selfAssignableRoles.includes(selectedRole)) throw new Error('Choose a valid account role.')

    profileWriteInProgress = true
    let firebaseModules
    let userCredential
    try {
      firebaseModules = await getFirebaseModules()
      const provider = new firebaseModules.GoogleAuthProvider()
      userCredential = await firebaseModules.signInWithPopup(firebaseModules.auth, provider)

      const userRef = firebaseModules.doc(firebaseModules.db, 'users', userCredential.user.uid)
      const snapshot = await firebaseModules.getDoc(userRef)
      let userProfile

      if (snapshot.exists()) {
        userProfile = snapshot.data()
        if (!validRoles.includes(userProfile.role) || !userProfile.displayName) {
          throw new Error('This account profile is incomplete or invalid. Please contact your administrator.')
        }
        const approval = getTeacherApproval(userProfile)
        await firebaseModules.setDoc(userRef, {
          lastLoginAt: firebaseModules.serverTimestamp(),
          updatedAt: firebaseModules.serverTimestamp(),
          ...(approval ? { teacherApproval: approval } : {}),
        }, { merge: true })
      } else {
        const name = userCredential.user.displayName?.trim() || userCredential.user.email?.split('@')[0] || 'Google user'
        userProfile = {
          uid: userCredential.user.uid,
          displayName: name.slice(0, 80),
          email: userCredential.user.email,
          role: selectedRole,
          teacherApproval: selectedRole === 'teacher' ? 'pending' : 'not-required',
          createdAt: firebaseModules.serverTimestamp(),
          updatedAt: firebaseModules.serverTimestamp(),
          lastLoginAt: firebaseModules.serverTimestamp(),
        }
        await firebaseModules.setDoc(userRef, userProfile)
      }

      currentUser.value = userCredential.user
      profile.value = {
        uid: userCredential.user.uid,
        displayName: userProfile.displayName,
        email: userProfile.email,
        role: userProfile.role,
        teacherApproval: getTeacherApproval(userProfile),
      }
    } catch (error) {
      if (userCredential) {
        let signOutError
        try {
          await firebaseModules.signOut(firebaseModules.auth)
        } catch (cleanupError) {
          signOutError = cleanupError
        }
        const cleanupMessage = signOutError ? ` Sign-out also failed: ${getErrorMessage(signOutError)}` : ''
        throw new Error(`${getErrorMessage(error)}${cleanupMessage}`, { cause: error })
      }
      throw new Error(getErrorMessage(error), { cause: error })
    } finally {
      profileWriteInProgress = false
      loading.value = false
    }
  }

  async function resetPassword(email) {
    const { auth: firebaseAuth, sendPasswordResetEmail } = await getFirebaseModules()
    await sendPasswordResetEmail(firebaseAuth, email)
  }

  async function logout() {
    const { auth: firebaseAuth, signOut } = await getFirebaseModules()
    await signOut(firebaseAuth)
    currentUser.value = null
    profile.value = null
    authError.value = ''
  }

  return {
    currentUser,
    profile,
    loading,
    authError,
    role,
    teacherApproval,
    userName,
    initialize,
    register,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
  }
})