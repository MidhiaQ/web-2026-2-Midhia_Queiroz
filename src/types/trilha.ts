export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface StudyTopic {
  title: string
  content: string
  keyTakeaway?: string
  codeSnippet?: string
}

export interface Module {
  id: number
  order: number
  title: string
  shortTitle: string
  description: string
  duration: string
  unitNumber: number
  unitTitle: string
  icon: string
  completed: boolean
  unlocked: boolean
  score?: number
  studySummary: string
  studyTopics: StudyTopic[]
  resources: {
    label: string
    url?: string
    type: 'doc' | 'video' | 'article'
  }[]
  quizQuestions: Question[]
}

export interface StudentStats {
  streak: number
  gems: number
  xp: number
  hearts: number
}

export interface Trilha {
  id: string
  title: string
  description: string
  teacherName: string
  modules: Module[]
}

export type Role = 'DISCENTE' | 'DOCENTE'
