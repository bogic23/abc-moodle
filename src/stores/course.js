import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let nextLessonId = 4
let nextTestId = 3

export const useCourseStore = defineStore('course', () => {
  const lessons = ref([
    {
      id: 1,
      title: 'Introduction to Algebra',
      description: 'Learn the basics of algebraic expressions, variables, and simple equations.',
      content: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In this lesson, you will learn about variables, constants, and basic equation solving.',
      duration: '15 min',
      completed: false,
    },
    {
      id: 2,
      title: 'Linear Equations',
      description: 'Master solving linear equations with one variable.',
      content: 'A linear equation is an equation that can be written in the form ax + b = 0. Learn to isolate variables and solve for unknowns using inverse operations.',
      duration: '20 min',
      completed: false,
    },
    {
      id: 3,
      title: 'Quadratic Functions',
      description: 'Explore parabolas and the quadratic formula.',
      content: 'Quadratic functions have the form f(x) = ax² + bx + c. The graph is a parabola. Learn to find roots using factoring and the quadratic formula.',
      duration: '25 min',
      completed: false,
    },
  ])

  const tests = ref([
    {
      id: 1,
      title: 'Algebra Basics Quiz',
      description: 'Test your understanding of variables and expressions.',
      questions: [
        {
          id: 1,
          text: 'What is the value of x in: 2x + 5 = 13?',
          options: ['3', '4', '5', '6'],
          correctIndex: 1,
        },
        {
          id: 2,
          text: 'Which of the following is a variable?',
          options: ['7', 'x', '12', '3.14'],
          correctIndex: 1,
        },
      ],
      duration: '10 min',
      completed: false,
      score: null,
    },
    {
      id: 2,
      title: 'Linear Equations Test',
      description: 'Assessment on solving linear equations.',
      questions: [
        {
          id: 1,
          text: 'Solve: 3x - 7 = 14',
          options: ['x = 5', 'x = 7', 'x = 9', 'x = 3'],
          correctIndex: 1,
        },
      ],
      duration: '15 min',
      completed: false,
      score: null,
    },
  ])

  // Getters
  const lessonCount = computed(() => lessons.value.length)
  const testCount = computed(() => tests.value.length)
  const completedLessons = computed(() => lessons.value.filter(l => l.completed).length)
  const averageScore = computed(() => {
    const scored = tests.value.filter(t => t.score !== null)
    if (!scored.length) return 0
    return Math.round(scored.reduce((sum, t) => sum + t.score, 0) / scored.length)
  })

  // Lesson CRUD
  function addLesson(lesson) {
    lessons.value.push({
      id: nextLessonId++,
      completed: false,
      duration: lesson.duration || '15 min',
      ...lesson,
    })
  }

  function updateLesson(id, updated) {
    const index = lessons.value.findIndex(l => l.id === id)
    if (index !== -1) {
      lessons.value[index] = { ...lessons.value[index], ...updated }
    }
  }

  function deleteLesson(id) {
    lessons.value = lessons.value.filter(l => l.id !== id)
  }

  // Test CRUD
  function addTest(test) {
    tests.value.push({
      id: nextTestId++,
      completed: false,
      score: null,
      duration: test.duration || '10 min',
      ...test,
    })
  }

  function updateTest(id, updated) {
    const index = tests.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tests.value[index] = { ...tests.value[index], ...updated }
    }
  }

  function deleteTest(id) {
    tests.value = tests.value.filter(t => t.id !== id)
  }

  // Student actions
  function markLessonComplete(id) {
    const lesson = lessons.value.find(l => l.id === id)
    if (lesson) lesson.completed = true
  }

  function submitTest(testId, answers) {
    const test = tests.value.find(t => t.id === testId)
    if (!test) return
    let correct = 0
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++
    })
    test.score = Math.round((correct / test.questions.length) * 100)
    test.completed = true
  }

  return {
    lessons, tests,
    lessonCount, testCount, completedLessons, averageScore,
    addLesson, updateLesson, deleteLesson,
    addTest, updateTest, deleteTest,
    markLessonComplete, submitTest,
  }
})