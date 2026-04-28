import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type SprintStatus = 'IDLE' | 'PLANNING' | 'SPRINT_ACTIVE' | 'REVIEW_RETRO' | 'DONE'

export interface SprintTask {
  id: number
  title: string
  description?: string
  completed: boolean
  blocked: boolean
  blockedReason?: string
  blockedAt?: string
  estimatedHours: number
  completedHours: number
  order: number
}

export interface SprintNote {
  id: number
  content: string
  type: 'daily' | 'retro' | 'general'
  createdAt: string
}

export interface Sprint {
  id: number
  name: string
  projectId: number
  status: SprintStatus
  tasks: SprintTask[]
  notes: SprintNote[]
  startDate?: string
  endDate?: string
  createdAt: string
  velocity: number
}

export interface ImpedimentLog {
  id: number
  taskId: number
  reason: string
  blockedAt: string
  resolvedAt?: string
  duration?: number
}

interface SprintStore {
  sprints: Sprint[]
  currentSprint: Sprint | null
  impedimentLogs: ImpedimentLog[]
  activeImpediments: number
  
  // Actions
  createSprint: (name: string, projectId?: number) => void
  setCurrentSprint: (sprint: Sprint | null) => void
  addTask: (sprintId: number, task: Omit<SprintTask, 'id' | 'order'>) => void
  updateTask: (sprintId: number, taskId: number, updates: Partial<SprintTask>) => void
  removeTask: (sprintId: number, taskId: number) => void
  reorderTasks: (sprintId: number, tasks: SprintTask[]) => void
  
  // State Machine Transitions
  transitionStatus: (sprintId: number, newStatus: SprintStatus) => void
  
  // Impediment Management
  blockTask: (sprintId: number, taskId: number, reason: string) => void
  unblockTask: (sprintId: number, taskId: number) => void
  
  // Notes
  addNote: (sprintId: number, note: Omit<SprintNote, 'id' | 'createdAt'>) => void
  
    // Calculations
    getSprintProgress: (sprint: Sprint) => number
    getBlockedTasksCount: (sprintId: number) => number
    getBurndownData: (sprint: Sprint) => { day: number; remaining: number }[]
    updateSprintName: (sprintId: number, name: string) => void
    deleteSprint: (sprintId: number) => void
  }

  const KEY_SPRINTS = 'io_sprints'

export const useSprintStore = create<SprintStore>()(
  subscribeWithSelector((set, get) => ({
    sprints: [],
    currentSprint: null,
    impedimentLogs: [],
    activeImpediments: 0,

    createSprint: (name, projectId) => {
      const newSprint: Sprint = {
        id: Date.now(),
        name,
        projectId: projectId || 0,
        status: 'IDLE',
        tasks: [],
        notes: [],
        createdAt: new Date().toISOString(),
        velocity: 0,
      }
      set((state) => {
        const sprints = [...state.sprints, newSprint]
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        return { sprints, currentSprint: newSprint }
      })
    },

    setCurrentSprint: (sprint) => set({ currentSprint: sprint }),

    addTask: (sprintId, task) => {
      set((state) => {
        const sprints = state.sprints.map((s) => {
          if (s.id !== sprintId) return s
          const newTask: SprintTask = {
            ...task,
            id: Date.now(),
            order: s.tasks.length,
          }
          return { ...s, tasks: [...s.tasks, newTask] }
        })
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        const currentSprint = sprints.find((s) => s.id === sprintId) || null
        return { sprints, currentSprint }
      })
    },

    updateTask: (sprintId, taskId, updates) => {
      set((state) => {
        const sprints = state.sprints.map((s) => {
          if (s.id !== sprintId) return s
          const tasks = s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
          return { ...s, tasks }
        })
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        const currentSprint = sprints.find((s) => s.id === sprintId) || null
        return { sprints, currentSprint }
      })
    },

    removeTask: (sprintId, taskId) => {
      set((state) => {
        const sprints = state.sprints.map((s) => {
          if (s.id !== sprintId) return s
          const tasks = s.tasks.filter((t) => t.id !== taskId)
          return { ...s, tasks }
        })
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        const currentSprint = sprints.find((s) => s.id === sprintId) || null
        return { sprints, currentSprint }
      })
    },

    reorderTasks: (sprintId, tasks) => {
      set((state) => {
        const sprints = state.sprints.map((s) => {
          if (s.id !== sprintId) return s
          return { ...s, tasks }
        })
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        const currentSprint = sprints.find((s) => s.id === sprintId) || null
        return { sprints, currentSprint }
      })
    },

    transitionStatus: (sprintId, newStatus) => {
      set((state) => {
        const sprints = state.sprints.map((s) => {
          if (s.id !== sprintId) return s
          
          const currentStatus = s.status
          
          const validTransitions: Record<SprintStatus, SprintStatus[]> = {
            'IDLE': ['PLANNING'],
            'PLANNING': ['SPRINT_ACTIVE', 'IDLE'],
            'SPRINT_ACTIVE': ['REVIEW_RETRO', 'IDLE'],
            'REVIEW_RETRO': ['DONE', 'SPRINT_ACTIVE'],
            'DONE': ['IDLE'],
          }
          
          if (!validTransitions[currentStatus]?.includes(newStatus)) {
            console.warn(`Invalid transition from ${currentStatus} to ${newStatus}`)
            return s
          }
          
          let updatedSprint = { ...s, status: newStatus }
          
          if (newStatus === 'SPRINT_ACTIVE' && !s.startDate) {
            updatedSprint.startDate = new Date().toISOString()
          }
          
          if (newStatus === 'DONE' && !s.endDate) {
            updatedSprint.endDate = new Date().toISOString()
          }
          
          return updatedSprint
        })
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        
        const currentSprint = sprints.find((s) => s.id === sprintId) || null
        return { sprints, currentSprint }
      })
    },

    blockTask: (sprintId, taskId, reason) => {
      const now = new Date().toISOString()
      
      const log: ImpedimentLog = {
        id: Date.now(),
        taskId,
        reason,
        blockedAt: now,
      }
      
      set((state) => {
        const sprints = state.sprints.map((s) => {
          if (s.id !== sprintId) return s
          const tasks = s.tasks.map((t) =>
            t.id === taskId ? { ...t, blocked: true, blockedReason: reason, blockedAt: now } : t
          )
          return { ...s, tasks }
        })
        
        const impedimentLogs = [...state.impedimentLogs, log]
        const activeImpediments = sprints.find((s) => s.id === sprintId)?.tasks.filter((t) => t.blocked).length || 0
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        
        const currentSprint = sprints.find((s) => s.id === sprintId) || null
        return { sprints, currentSprint, impedimentLogs, activeImpediments }
      })
    },

    unblockTask: (sprintId, taskId) => {
      const now = new Date().toISOString()
      
      set((state) => {
        const sprints = state.sprints.map((s) => {
          if (s.id !== sprintId) return s
          const tasks = s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, blocked: false, blockedReason: undefined, blockedAt: undefined }
              : t
          )
          return { ...s, tasks }
        })
        
        const impedimentLogs = state.impedimentLogs.map((log) => {
          if (log.taskId === taskId && !log.resolvedAt) {
            const blockedDuration = new Date(now).getTime() - new Date(log.blockedAt).getTime()
            return { ...log, resolvedAt: now, duration: blockedDuration }
          }
          return log
        })
        
        const activeImpediments = sprints.find((s) => s.id === sprintId)?.tasks.filter((t) => t.blocked).length || 0
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        
        const currentSprint = sprints.find((s) => s.id === sprintId) || null
        return { sprints, currentSprint, impedimentLogs, activeImpediments }
      })
    },

    addNote: (sprintId, note) => {
      set((state) => {
        const sprints = state.sprints.map((s) => {
          if (s.id !== sprintId) return s
          const newNote: SprintNote = {
            ...note,
            id: Date.now(),
            createdAt: new Date().toISOString(),
          }
          return { ...s, notes: [...s.notes, newNote] }
        })
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        const currentSprint = sprints.find((s) => s.id === sprintId) || null
        return { sprints, currentSprint }
      })
    },

    getSprintProgress: (sprint) => {
      if (sprint.tasks.length === 0) return 0
      const completed = sprint.tasks.filter((t) => t.completed).length
      return Math.round((completed / sprint.tasks.length) * 100)
    },

    getBlockedTasksCount: (sprintId) => {
      const sprint = get().sprints.find((s) => s.id === sprintId)
      return sprint?.tasks.filter((t) => t.blocked).length || 0
    },

    getBurndownData: (sprint) => {
      if (!sprint.startDate || !sprint.endDate) return []
      
      const start = new Date(sprint.startDate)
      const end = new Date(sprint.endDate)
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const totalHours = sprint.tasks.reduce((sum, t) => sum + t.estimatedHours, 0)
      
      const data: { day: number; remaining: number }[] = []
      
      for (let i = 0; i <= totalDays; i++) {
        const currentDate = new Date(start)
        currentDate.setDate(currentDate.getDate() + i)
        
        const completedByDay = sprint.tasks
          .filter((t) => t.completed && t.completedHours > 0)
          .reduce((sum, t) => sum + t.completedHours, 0)
        
        data.push({
          day: i,
          remaining: Math.max(0, totalHours - completedByDay),
        })
      }
      
      return data
    },

    updateSprintName: (sprintId, name) => {
      set((state) => {
        const sprints = state.sprints.map((s) => {
          if (s.id !== sprintId) return s
          return { ...s, name }
        })
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        const currentSprint = sprints.find((s) => s.id === sprintId) || null
        return { sprints, currentSprint }
      })
    },

    deleteSprint: (sprintId) => {
      set((state) => {
        const sprints = state.sprints.filter((s) => s.id !== sprintId)
        if (typeof window !== 'undefined') {
          localStorage.setItem(KEY_SPRINTS, JSON.stringify(sprints))
        }
        const currentSprint = state.currentSprint?.id === sprintId ? null : state.currentSprint
        return { sprints, currentSprint }
      })
    },
  }))
)
