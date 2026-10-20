import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const matchesId = (left, right) => String(left) === String(right)
const createId = () => crypto.randomUUID()

export const useCourseStore = defineStore('course', () => {
  const initialCourse = {
    title: 'Algebra Foundations',
    description: 'Build confidence with algebra, from expressions to quadratic functions.',
    instructor: 'ABC Scores Instructor',
    thumbnail: '',
    objectives: ['Understand algebraic expressions', 'Solve linear equations', 'Explore quadratic functions'],
    prerequisites: ['Basic arithmetic'],
    difficulty: 'Beginner',
    completionRule: 'all-lessons',
    certificateScore: 70,
  }

  const initialSections = [
    { id: 1, title: 'Getting Started', introduction: 'Meet the building blocks of algebra.', lessonIds: [1], activities: ['Identify variables in everyday formulas.'], testId: 1, requireAssessment: false },
    { id: 2, title: 'Linear Equations', introduction: 'Learn to solve equations one step at a time.', lessonIds: [2], activities: ['Practice balancing both sides of an equation.'], testId: 2, requireAssessment: false },
    { id: 3, title: 'Quadratic Functions', introduction: 'Explore parabolas and their roots.', lessonIds: [3], activities: ['Sketch a parabola from its equation.'], testId: null, requireAssessment: false },
  ]

  const initialLessons = [
    {
      id: 1, sectionId: 1, title: 'Introduction to Algebra',
      description: 'Learn the basics of algebraic expressions, variables, and simple equations.',
      content: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In this lesson, you will learn about variables, constants, and basic equation solving.',
      duration: '15 min', completed: false,
      objectives: ['Identify variables and constants', 'Read a simple algebraic expression'],
      imageUrl: '', audioUrl: '', videoUrl: '',
      examples: 'In 3x + 2, x is the variable, 3 is its coefficient, and 2 is a constant.',
      exercises: ['Identify the variable in 5y + 4.', 'Write an expression for 3 more than a number.'],
    },
    {
      id: 2, sectionId: 2, title: 'Linear Equations',
      description: 'Master solving linear equations with one variable.',
      content: 'A linear equation is an equation that can be written in the form ax + b = 0. Learn to isolate variables and solve for unknowns using inverse operations.',
      duration: '20 min', completed: false,
      objectives: ['Isolate a variable using inverse operations', 'Check a solution by substitution'],
      imageUrl: '', audioUrl: '', videoUrl: '',
      examples: 'For 2x + 5 = 13, subtract 5 from both sides, then divide by 2. The solution is x = 4.',
      exercises: ['Solve 3x = 18.', 'Solve x - 7 = 5 and check your answer.'],
    },
    {
      id: 3, sectionId: 3, title: 'Quadratic Functions',
      description: 'Explore parabolas and the quadratic formula.',
      content: 'Quadratic functions have the form f(x) = ax² + bx + c. The graph is a parabola. Learn to find roots using factoring and the quadratic formula.',
      duration: '25 min', completed: false,
      objectives: ['Recognize a quadratic function', 'Identify the shape of a quadratic graph'],
      imageUrl: '', audioUrl: '', videoUrl: '',
      examples: 'The graph of y = x² is a parabola opening upward with its vertex at (0, 0).',
      exercises: ['Identify a, b, and c in x² + 3x + 2.', 'Describe the graph of y = -x².'],
    },
  ]

  const initialTests = [
    {
      id: 1, sectionId: 1, title: 'Algebra Basics Quiz',
      description: 'Test your understanding of variables and expressions.',
      questions: [
        { id: 1, type: 'multiple-choice', text: 'What is the value of x in: 2x + 5 = 13?', options: ['3', '4', '5', '6'], correctIndex: 1, explanation: 'Subtract 5 from both sides and divide by 2, so x = 4.' },
        { id: 2, type: 'multiple-choice', text: 'Which of the following is a variable?', options: ['7', 'x', '12', '3.14'], correctIndex: 1, explanation: 'A variable is a symbol, such as x, that represents an unknown value.' },
      ],
      duration: '10 min', timeLimit: 10, passScore: 70, maxAttempts: 3, attempts: [], completed: false, score: null,
    },
    {
      id: 2, sectionId: 2, title: 'Linear Equations Test',
      description: 'Assessment on solving linear equations.',
      questions: [
        { id: 1, type: 'multiple-choice', text: 'Solve: 3x - 7 = 14', options: ['x = 5', 'x = 7', 'x = 9', 'x = 3'], correctIndex: 1, explanation: 'Add 7 to get 3x = 21, then divide by 3.' },
      ],
      duration: '15 min', timeLimit: 15, passScore: 70, maxAttempts: 3, attempts: [], completed: false, score: null,
    },
  ]

  const courses = ref([{
    id: 1,
    details: initialCourse,
    sections: initialSections,
    lessons: initialLessons,
    tests: initialTests,
  }])
  const activeCourseId = ref(1)
  const activeCourseRecord = computed(() => courses.value.find(item => matchesId(item.id, activeCourseId.value)))
  const currentUserId = ref(null)
  const currentRole = ref(null)
  const currentTeacherApproval = ref('pending')
  const persistenceReady = ref(false)
  const persistenceLoading = ref(false)
  const persistenceStatus = ref('idle')
  const persistenceError = ref('')
  let persistenceModulesPromise
  let activeSave = Promise.resolve()
  let initializePromise
  let saveTimer
  let initializedUserId = null
  const courseList = computed(() => courses.value.map(item => ({
    id: item.id,
    ...item.details,
    ownerUid: item.ownerUid,
    lessonCount: item.lessons.length,
    sectionCount: item.sections.length,
    progress: item.lessons.length ? Math.round(item.lessons.filter(lesson => lesson.completed).length / item.lessons.length * 100) : 0,
  })))
  const course = computed({
    get: () => activeCourseRecord.value?.details || {},
    set: value => { activeCourseRecord.value.details = value },
  })
  const sections = computed({
    get: () => activeCourseRecord.value?.sections || [],
    set: value => { activeCourseRecord.value.sections = value },
  })
  const lessons = computed({
    get: () => activeCourseRecord.value?.lessons || [],
    set: value => { activeCourseRecord.value.lessons = value },
  })
  const tests = computed({
    get: () => activeCourseRecord.value?.tests || [],
    set: value => { activeCourseRecord.value.tests = value },
  })
  const isTeacherApproved = computed(() => currentRole.value === 'teacher' && currentTeacherApproval.value === 'approved')
  const canManageActiveCourse = computed(() => isTeacherApproved.value && !!activeCourseRecord.value && activeCourseRecord.value.ownerUid === currentUserId.value)
  const hasCourses = computed(() => courses.value.length > 0)

  const lessonCount = computed(() => lessons.value.length)
  const testCount = computed(() => tests.value.length)
  const completedLessons = computed(() => lessons.value.filter(lesson => lesson.completed).length)
  const courseProgress = computed(() => lessonCount.value ? Math.round(completedLessons.value / lessonCount.value * 100) : 0)
  const averageScore = computed(() => {
    const scored = tests.value.filter(test => test.score !== null)
    if (!scored.length) return 0
    return Math.round(scored.reduce((sum, test) => {
      const bestScore = test.attempts.length ? Math.max(...test.attempts.map(attempt => attempt.score)) : test.score
      return sum + bestScore
    }, 0) / scored.length)
  })
  const courseCompleted = computed(() => {
    if (!lessonCount.value || completedLessons.value !== lessonCount.value) return false
    const allAssessmentsRequired = course.value.completionRule === 'lessons-and-assessments'
    const missingRequiredAssessment = sections.value.some(section =>
      section.requireAssessment && !tests.value.some(test => matchesId(test.id, section.testId)),
    )
    const requiredTests = tests.value.filter(test =>
      allAssessmentsRequired || sections.value.some(section => matchesId(section.id, test.sectionId) && section.requireAssessment),
    )
    return !missingRequiredAssessment && requiredTests.every(test => test.attempts.some(attempt => attempt.passed))
  })
  const certificateEligible = computed(() => {
    if (!courseCompleted.value) return false
    const allAssessmentsRequired = course.value.completionRule === 'lessons-and-assessments'
    const requiredTests = tests.value.filter(test =>
      allAssessmentsRequired || sections.value.some(section => matchesId(section.id, test.sectionId) && section.requireAssessment),
    )
    return requiredTests.every(test => test.attempts.some(attempt => attempt.score >= course.value.certificateScore))
  })

  function updateCourse(updated) {
    if (!canManageActiveCourse.value) return
    course.value = { ...course.value, ...updated }
  }

  function setActiveCourse(id) {
    const selected = courses.value.find(item => matchesId(item.id, id))
    if (!selected || (currentRole.value === 'teacher' && selected.ownerUid !== currentUserId.value)) return false
    activeCourseId.value = selected.id
    return true
  }

  function addCourse(details, sectionData = []) {
    if (!currentUserId.value) throw new Error('Sign in before creating a course.')
    if (!isTeacherApproved.value) throw new Error('An admin must approve your teacher account before you can create courses.')
    const id = createId()
    const newSections = sectionData.map(section => ({
      id: createId(),
      lessonIds: [],
      activities: [],
      testId: null,
      requireAssessment: false,
      ...section,
    }))
    courses.value.push({
      id,
      ownerUid: currentUserId.value,
      details: {
        description: '',
        instructor: '',
        thumbnail: '',
        objectives: [],
        prerequisites: [],
        difficulty: 'Beginner',
        completionRule: 'all-lessons',
        certificateScore: 70,
        ...details,
      },
      sections: newSections,
      lessons: [],
      tests: [],
    })
    activeCourseId.value = id
    return id
  }

  function addSection(section) {
    if (!canManageActiveCourse.value) return
    const created = { id: createId(), lessonIds: [], activities: [], testId: null, requireAssessment: false, ...section }
    sections.value.push(created)
    const test = tests.value.find(item => matchesId(item.id, created.testId))
    if (test) {
      const previousSection = sections.value.find(item => matchesId(item.id, test.sectionId))
      if (previousSection && !matchesId(previousSection.id, created.id) && matchesId(previousSection.testId, test.id)) previousSection.testId = null
      test.sectionId = created.id
    }
    return created.id
  }

  function updateSection(id, updated) {
    if (!canManageActiveCourse.value) return
    const index = sections.value.findIndex(section => matchesId(section.id, id))
    if (index === -1) return
    const previousTestId = sections.value[index].testId
    sections.value[index] = { ...sections.value[index], ...updated }
    const previousTest = tests.value.find(test => matchesId(test.id, previousTestId))
    const selectedTest = tests.value.find(test => matchesId(test.id, updated.testId))
    if (previousTest && !matchesId(previousTestId, updated.testId) && matchesId(previousTest.sectionId, id)) previousTest.sectionId = null
    if (selectedTest) {
      const previousSection = sections.value.find(section => matchesId(section.id, selectedTest.sectionId))
      if (previousSection && !matchesId(previousSection.id, id) && matchesId(previousSection.testId, selectedTest.id)) previousSection.testId = null
      selectedTest.sectionId = id
    }
  }

  function moveLesson(id, direction) {
    if (!canManageActiveCourse.value) return
    const lesson = lessons.value.find(item => matchesId(item.id, id))
    const section = sections.value.find(item => matchesId(item.id, lesson?.sectionId))
    if (!section) return
    const index = section.lessonIds.indexOf(id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= section.lessonIds.length) return
    const orderedIds = [...section.lessonIds]
    const movedId = orderedIds[index]
    orderedIds[index] = orderedIds[target]
    orderedIds[target] = movedId
    section.lessonIds = orderedIds
  }

  function deleteSection(id) {
    if (!canManageActiveCourse.value) return
    sections.value = sections.value.filter(section => !matchesId(section.id, id))
    lessons.value = lessons.value.filter(lesson => !matchesId(lesson.sectionId, id))
    tests.value = tests.value.filter(test => !matchesId(test.sectionId, id))
  }

  function addLesson(lesson) {
    if (!canManageActiveCourse.value) return
    const id = createId()
    lessons.value.push({ id, completed: false, duration: '15 min', objectives: [], exercises: [], examples: '', imageUrl: '', audioUrl: '', videoUrl: '', ...lesson })
    const section = sections.value.find(item => matchesId(item.id, lesson.sectionId))
    if (section && !section.lessonIds.some(lessonId => matchesId(lessonId, id))) section.lessonIds.push(id)
  }

  function updateLesson(id, updated) {
    if (!canManageActiveCourse.value) return
    const index = lessons.value.findIndex(lesson => matchesId(lesson.id, id))
    if (index === -1) return
    const oldSectionId = lessons.value[index].sectionId
    lessons.value[index] = { ...lessons.value[index], ...updated }
    if (!matchesId(oldSectionId, updated.sectionId)) {
      const oldSection = sections.value.find(section => matchesId(section.id, oldSectionId))
      const newSection = sections.value.find(section => matchesId(section.id, updated.sectionId))
      if (oldSection) oldSection.lessonIds = oldSection.lessonIds.filter(lessonId => !matchesId(lessonId, id))
      if (newSection && !newSection.lessonIds.some(lessonId => matchesId(lessonId, id))) newSection.lessonIds.push(id)
    }
  }

  function deleteLesson(id) {
    if (!canManageActiveCourse.value) return
    lessons.value = lessons.value.filter(lesson => !matchesId(lesson.id, id))
    sections.value.forEach(section => {
      section.lessonIds = section.lessonIds.filter(lessonId => !matchesId(lessonId, id))
    })
  }

  function addTest(test) {
    if (!canManageActiveCourse.value) return
    const id = createId()
    tests.value.push({ id, completed: false, score: null, duration: '10 min', timeLimit: 10, passScore: 70, maxAttempts: 3, attempts: [], ...test })
    const section = sections.value.find(item => matchesId(item.id, test.sectionId))
    if (section) {
      const previousTest = tests.value.find(item => matchesId(item.id, section.testId))
      if (previousTest) previousTest.sectionId = null
      section.testId = id
    }
  }

  function updateTest(id, updated) {
    if (!canManageActiveCourse.value) return
    const index = tests.value.findIndex(test => matchesId(test.id, id))
    if (index === -1) return
    const oldSectionId = tests.value[index].sectionId
    tests.value[index] = { ...tests.value[index], ...updated }
    if (!matchesId(oldSectionId, updated.sectionId)) {
      const oldSection = sections.value.find(section => matchesId(section.id, oldSectionId))
      const newSection = sections.value.find(section => matchesId(section.id, updated.sectionId))
      if (matchesId(oldSection?.testId, id)) oldSection.testId = null
      if (newSection) {
        const previousTest = tests.value.find(test => matchesId(test.id, newSection.testId))
        if (previousTest && !matchesId(previousTest.id, id)) previousTest.sectionId = null
        newSection.testId = id
      }
    }
  }

  function deleteTest(id) {
    if (!canManageActiveCourse.value) return
    tests.value = tests.value.filter(test => !matchesId(test.id, id))
    sections.value.forEach(section => {
      if (matchesId(section.testId, id)) section.testId = null
    })
  }

  function markLessonComplete(id) {
    const lesson = lessons.value.find(item => matchesId(item.id, id))
    if (lesson) lesson.completed = true
  }

  function evaluateQuestion(question, answer) {
    if (question.type === 'true-false') return answer === question.correctAnswer
    if (question.type === 'fill-blank') return String(answer ?? '').trim().toLocaleLowerCase() === String(question.correctAnswer ?? '').trim().toLocaleLowerCase()
    if (question.type === 'matching') {
      return Array.isArray(answer) && answer.length === question.pairs.length &&
        question.pairs.every((pair, index) => String(answer[index] ?? '').trim().toLocaleLowerCase() === pair.right.trim().toLocaleLowerCase())
    }
    return answer === question.correctIndex
  }

  function submitTest(testId, answers, timedOut = false) {
    const test = tests.value.find(item => matchesId(item.id, testId))
    if (!test || test.attempts.length >= test.maxAttempts) return null
    const reviewedAnswers = test.questions.map((question, index) => ({
      answer: answers[index],
      correct: evaluateQuestion(question, answers[index]),
    }))
    const correct = reviewedAnswers.filter(answer => answer.correct).length
    const attempt = {
      number: test.attempts.length + 1,
      questions: JSON.parse(JSON.stringify(test.questions)),
      answers: reviewedAnswers,
      correct,
      score: test.questions.length ? Math.round(correct / test.questions.length * 100) : 0,
      passed: test.questions.length > 0 && Math.round(correct / test.questions.length * 100) >= test.passScore,
      completedAt: new Date().toISOString(),
      timedOut,
    }
    test.attempts.push(attempt)
    test.score = attempt.score
    test.completed = true
    return attempt
  }

  function retakeTest(testId) {
    const test = tests.value.find(item => matchesId(item.id, testId))
    if (!test || test.attempts.length >= test.maxAttempts) return false
    test.completed = false
    return true
  }

  function normalizeCourse(id, data) {
    const lessons = (data.lessons || []).map(lesson => ({
      ...lesson,
      id: String(lesson.id),
      sectionId: String(lesson.sectionId),
      completed: false,
    }))
    const tests = (data.tests || []).map(test => ({
      ...test,
      id: String(test.id),
      sectionId: test.sectionId == null ? null : String(test.sectionId),
      attempts: [],
      completed: false,
      score: null,
    }))
    const sections = (data.sections || []).map(section => ({
      ...section,
      id: String(section.id),
      lessonIds: (section.lessonIds || []).map(String),
      testId: section.testId == null ? null : String(section.testId),
      activities: section.activities || [],
    }))

    return {
      id,
      ownerUid: data.ownerUid,
      details: data.details || {},
      sections,
      lessons,
      tests,
    }
  }

  function mergeProgress(record, progress = {}) {
    const completedLessonsById = new Map((progress.lessons || []).map(item => [String(item.id), item.completed === true]))
    const testProgressById = new Map((progress.tests || []).map(item => [String(item.id), item]))
    record.lessons.forEach(lesson => {
      lesson.completed = completedLessonsById.get(lesson.id) || false
    })
    record.tests.forEach(test => {
      const testProgress = testProgressById.get(test.id)
      test.attempts = testProgress?.attempts || []
      test.completed = testProgress?.completed || false
      test.score = testProgress?.score ?? null
    })
    return record
  }

  async function getPersistenceModules() {
    if (!persistenceModulesPromise) {
      persistenceModulesPromise = Promise.all([
        import('../../firebase.js'),
        import('firebase/firestore/lite'),
      ]).then(([firebase, firestore]) => ({ ...firestore, db: firebase.db }))
    }
    return persistenceModulesPromise
  }

  function toCourseDocument(record, serverTimestamp) {
    return {
      ownerUid: record.ownerUid,
      details: record.details,
      sections: record.sections,
      lessons: record.lessons.map(({ completed, ...lesson }) => lesson),
      tests: record.tests.map(({ attempts, completed, score, ...test }) => test),
      updatedAt: serverTimestamp(),
    }
  }

  function toProgressDocument(record) {
    return {
      lessons: record.lessons.map(lesson => ({ id: String(lesson.id), completed: lesson.completed === true })),
      tests: record.tests.map(test => ({
        id: String(test.id),
        attempts: (test.attempts || []).map(attempt => ({
          ...attempt,
          answers: (attempt.answers || []).map(answer => ({
            ...answer,
            answer: answer.answer ?? null,
          })),
        })),
        completed: test.completed === true,
        score: test.score ?? null,
      })),
    }
  }

  async function saveAllCourses() {
    if (!persistenceReady.value || !currentUserId.value) return
    const userId = currentUserId.value
    const { db, doc, serverTimestamp, setDoc } = await getPersistenceModules()
    for (const record of courses.value) {
      if (record.ownerUid === userId) {
        await setDoc(doc(db, 'courses', String(record.id)), toCourseDocument(record, serverTimestamp))
      }
      await setDoc(
        doc(db, 'users', userId, 'courseProgress', String(record.id)),
        toProgressDocument(record),
      )
    }
    persistenceStatus.value = 'saved'
    persistenceError.value = ''
  }

  function scheduleSave() {
    if (!persistenceReady.value) return
    persistenceStatus.value = 'saving'
    persistenceError.value = ''
    globalThis.clearTimeout(saveTimer)
    saveTimer = globalThis.setTimeout(() => {
      activeSave = activeSave
        .then(saveAllCourses)
        .catch(error => {
          persistenceStatus.value = 'error'
          persistenceError.value = error.message || 'Course data could not be saved to Firestore.'
        })
    }, 500)
  }

  async function flushPersistence() {
    globalThis.clearTimeout(saveTimer)
    if (!persistenceReady.value) return false
    persistenceStatus.value = 'saving'
    try {
      activeSave = activeSave.then(saveAllCourses).catch(error => {
        persistenceStatus.value = 'error'
        persistenceError.value = error.message || 'Course data could not be saved to Firestore.'
        return false
      })
      return await activeSave !== false
    } catch (error) {
      persistenceStatus.value = 'error'
      persistenceError.value = error.message || 'Course data could not be saved to Firestore.'
      return false
    }
  }

  watch(courses, scheduleSave, { deep: true })

  async function initialize(userId, role, teacherApproval = 'pending') {
    if (initializedUserId === userId && persistenceReady.value) return
    if (initializePromise) return initializePromise
    initializePromise = loadCourses(userId, role, teacherApproval)
    try {
      await initializePromise
    } finally {
      initializePromise = null
    }
  }

  async function loadCourses(userId, role, teacherApproval) {
    persistenceLoading.value = true
    persistenceError.value = ''
    persistenceReady.value = false
    currentUserId.value = userId
    currentRole.value = role
    currentTeacherApproval.value = teacherApproval

    try {
      const { db, collection, doc, getDoc, getDocs, setDoc, serverTimestamp } = await getPersistenceModules()
      const courseSnapshots = await getDocs(collection(db, 'courses'))
      let records = await Promise.all(courseSnapshots.docs.map(async snapshot => {
        const progressSnapshot = await getDoc(doc(db, 'users', userId, 'courseProgress', snapshot.id))
        const record = normalizeCourse(snapshot.id, snapshot.data())
        return mergeProgress(record, progressSnapshot.exists() ? progressSnapshot.data() : {})
      }))

      if (!records.length && role === 'teacher' && teacherApproval === 'approved') {
        const seed = courses.value[0]
        const seededRecord = normalizeCourse('algebra-foundations', {
          ownerUid: userId,
          details: seed.details,
          sections: seed.sections,
          lessons: seed.lessons,
          tests: seed.tests,
        })
        records = [seededRecord]
        await setDoc(doc(db, 'courses', seededRecord.id), toCourseDocument(seededRecord, serverTimestamp))
      }

      courses.value = records
      const firstAvailable = role === 'teacher'
        ? records.find(record => record.ownerUid === userId)
        : records[0]
      activeCourseId.value = records.some(record => matchesId(record.id, activeCourseId.value))
        ? records.find(record => matchesId(record.id, activeCourseId.value)).id
        : firstAvailable?.id ?? null
      initializedUserId = userId
      persistenceReady.value = true
      persistenceStatus.value = 'saved'
    } catch (error) {
      courses.value = []
      activeCourseId.value = null
      persistenceReady.value = false
      persistenceStatus.value = 'error'
      persistenceError.value = error.message || 'Course data could not be loaded from Firestore.'
    } finally {
      persistenceLoading.value = false
    }
  }

  return {
    courses: courseList, activeCourseId, currentUserId, isTeacherApproved, canManageActiveCourse, hasCourses, persistenceLoading, persistenceReady, persistenceStatus, persistenceError,
    course, sections, lessons, tests, lessonCount, testCount, completedLessons, courseProgress, courseCompleted, averageScore, certificateEligible,
    initialize, flushPersistence, setActiveCourse, addCourse, updateCourse, addSection, updateSection, deleteSection,
    addLesson, updateLesson, moveLesson, deleteLesson,
    addTest, updateTest, deleteTest,
    markLessonComplete, submitTest, retakeTest,
  }
})
