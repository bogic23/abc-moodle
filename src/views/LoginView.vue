<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const mode = ref('login')
const displayName = ref('')
const email = ref('')
const password = ref('')
const role = ref('student')
const submitting = ref(false)
const errorMessage = ref(auth.authError)
const notice = ref('')

const isRegistering = () => mode.value === 'register'

function destinationForRole(userRole) {
  if (userRole === 'admin') return { name: 'admin-users' }
  if (userRole === 'teacher') return { name: 'teacher-dashboard' }
  return { name: 'student-dashboard' }
}

function switchMode(nextMode) {
  mode.value = nextMode
  errorMessage.value = ''
  notice.value = ''
}

async function submit() {
  errorMessage.value = ''
  notice.value = ''
  submitting.value = true

  try {
    if (isRegistering()) {
      await auth.register({
        displayName: displayName.value.trim(),
        email: email.value.trim(),
        password: password.value,
        role: role.value,
      })
    } else {
      await auth.login({ email: email.value.trim(), password: password.value })
    }

    await router.replace(destinationForRole(auth.role))
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    submitting.value = false
  }
}

async function signInWithGoogle() {
  errorMessage.value = ''
  notice.value = ''
  submitting.value = true

  try {
    await auth.loginWithGoogle(role.value)
    await router.replace(destinationForRole(auth.role))
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    submitting.value = false
  }
}

async function resetPassword() {
  errorMessage.value = ''
  notice.value = ''
  if (!email.value.trim()) {
    errorMessage.value = 'Enter your email address first, then request a password reset.'
    return
  }

  try {
    await auth.resetPassword(email.value.trim())
    notice.value = 'Password reset instructions have been sent to your email.'
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <div class="flex min-h-[76vh] items-center justify-center py-6">
    <div class="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[0.9fr_1.1fr]">
      <aside class="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-brand-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div class="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/10 bg-white/5"></div>
        <div class="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-white/10"></div>
        <div class="relative">
          <div class="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold shadow-lg shadow-brand-500/30">A</div>
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">ABC Scores</p>
          <h1 class="mt-3 max-w-sm text-4xl font-bold leading-tight tracking-tight">A better way to learn together.</h1>
          <p class="mt-4 max-w-sm text-sm leading-6 text-slate-300">Your lessons, assessments, and progress—organized in one calm, focused space.</p>
        </div>
        <div class="relative flex items-center gap-3 text-sm text-slate-300">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-emerald-300">✓</span>
          Secure access for students and teachers
        </div>
      </aside>

      <section class="p-6 sm:p-9 lg:p-11">
        <div class="mb-7 lg:hidden">
          <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white shadow-lg shadow-brand-500/25">A</div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">ABC Scores</p>
        </div>

        <div class="mb-7">
          <h2 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {{ mode === 'register' ? 'Create your account' : 'Welcome back' }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ mode === 'register' ? 'Start learning or teaching with ABC Scores.' : 'Sign in to continue to your workspace.' }}
          </p>
        </div>

        <div class="mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            class="rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
            :class="mode === 'login' ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/70' : 'text-slate-500 hover:text-slate-800'"
            :aria-pressed="mode === 'login'"
            @click="switchMode('login')"
          >
            Sign in
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
            :class="mode === 'register' ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/70' : 'text-slate-500 hover:text-slate-800'"
            :aria-pressed="mode === 'register'"
            @click="switchMode('register')"
          >
            Create account
          </button>
        </div>

        <div class="mb-5">
          <label for="google-role" class="mb-1.5 block text-sm font-semibold text-slate-700">New accounts join as</label>
          <select
            id="google-role"
            v-model="role"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <button
          type="button"
          :disabled="submitting"
          class="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60"
          @click="signInWithGoogle"
        >
          <svg class="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.9 6-15Z" />
            <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z" />
            <path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18Z" />
            <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.5 19.5 0 0 0 24 4 20 20 0 0 0 5.9 15l6.9 5.2C14.4 15.5 18.8 12 24 12Z" />
          </svg>
          {{ submitting ? 'Connecting to Google…' : 'Continue with Google' }}
        </button>

        <div class="my-6 flex items-center gap-3">
          <span class="h-px flex-1 bg-slate-200"></span>
          <span class="text-xs font-medium uppercase tracking-wider text-slate-400">or use email</span>
          <span class="h-px flex-1 bg-slate-200"></span>
        </div>

        <div v-if="errorMessage || auth.authError" role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
          {{ errorMessage || auth.authError }}
        </div>
        <div v-if="notice" role="status" class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-800">
          {{ notice }}
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div v-if="mode === 'register'">
            <label for="display-name" class="mb-1.5 block text-sm font-semibold text-slate-700">Full name</label>
            <input
              id="display-name"
              v-model="displayName"
              autocomplete="name"
              required
              maxlength="80"
              type="text"
              placeholder="e.g. Alex Johnson"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <div>
            <label for="email" class="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label>
            <input
              id="email"
              v-model="email"
              autocomplete="email"
              required
              type="email"
              placeholder="you@example.com"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <div>
            <div class="mb-1.5 flex items-center justify-between gap-2">
              <label for="password" class="block text-sm font-semibold text-slate-700">Password</label>
              <button
                v-if="mode === 'login'"
                type="button"
                class="text-xs font-semibold text-brand-700 hover:text-brand-900"
                @click="resetPassword"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              v-model="password"
              :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
              required
              :minlength="mode === 'register' ? 6 : undefined"
              type="password"
              placeholder="At least 6 characters"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60"
          >
            <svg v-if="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ submitting ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-6 text-center text-xs leading-5 text-slate-400">
          By continuing, you agree to use your account responsibly and keep your sign-in details private.
        </p>
      </section>
    </div>
  </div>
</template>
