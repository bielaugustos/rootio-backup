'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ECONOMY_DEFAULT, ganharIO, UserEconomy, IO_RULES } from '@/lib/io-system'

// ─── Tipos ─────────────────────────────────────────────────────────────
export interface Habit {
  id:        number
  name:      string
  done:      boolean
  pts:       number
  icon:      string
  priority:  'alta' | 'media' | 'baixa'
  freq:      'diario' | 'semanal' | 'personalizado'
  days:      number[]    // 0=Dom … 6=Sab
  tags:      string[]
  notes?:    string
  streak?:   number
  createdAt: string
}

export interface DayHistory {
  date:  string
  done:  number
  total: number
}

// ─── Store ─────────────────────────────────────────────────────────────
  interface AppStore {
    // Auth
    userId:     string | null
    isLoggedIn: boolean
    plan:       'free' | 'pro'
    avatar:     string
    username:   string

    // Economy
    economy: UserEconomy

  // Habits
  habits:  Habit[]
  history: Record<string, DayHistory>

  // Settings
  theme:     string
  themeMode: 'light' | 'dark'
  soundOn:   boolean
  bgColor:   string
  bgImage:   string | null

  // Actions — Auth
  setUser:      (id: string | null, plan?: 'free' | 'pro') => void
  setAvatar:    (avatar: string) => void
  setBgColor:   (color: string) => void
  setBgImage:   (url: string | null) => void
  setUsername:  (username: string) => void

  // Actions — Habits
  setHabits:   (habits: Habit[]) => void
  addHabit:    (habit: Habit) => void
  updateHabit: (habit: Habit) => void
  deleteHabit: (id: number) => void
  toggleHabit: (id: number) => void
  resetHabits: () => void

  // Actions — Economy
  earnIO:  (tipo: keyof typeof IO_RULES) => { ganhou: number; subiuNivel: boolean }
  spendIO: (amount: number) => boolean
  deductIO: (amount: number) => void

  // Actions — Settings
  setTheme:    (theme: string) => void
  setThemeMode: (mode: 'light' | 'dark') => void
  setSoundOn: (on: boolean) => void

  // Reset
  reset: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      userId:     null,
      isLoggedIn: false,
      plan:       'free',
      avatar:     '👤',
      username:   'Usuario',
      economy:    ECONOMY_DEFAULT,
      habits:     [],
      history:    {},
      theme:      'light',
      themeMode:  'light',
      soundOn:    true,
      bgColor:   '#fef3c7',
      bgImage:   null,

      setAvatar: (avatar) => set({ avatar }),
      setBgColor: (color) => set({ bgColor: color }),
      setBgImage: (url) => set({ bgImage: url }),

      setUsername: (username) => set({ username }),

      // ── Auth ────────────────────────────────
      setUser: (id, plan = 'free') =>
        set({ userId: id, isLoggedIn: !!id, plan }),

      // ── Habits ──────────────────────────────
      setHabits: (habits) => set({ habits }),

      addHabit: (habit) =>
        set(s => ({ habits: [...s.habits, habit] })),

      updateHabit: (habit) =>
        set(s => ({ habits: s.habits.map(h => h.id === habit.id ? habit : h) })),

      deleteHabit: (id) =>
        set(s => {
          const habit = s.habits.find(h => h.id === id)
          const habits = s.habits.filter(h => h.id !== id)
          let economy = s.economy

          // Deduzir os IOs ganhos ao criar o hábito (input_registro)
          // Se o hábito estava concluído, também deduzir os IOs de conclusão
          const inputIO = IO_RULES.input_registro
          const conclusaoIO = habit?.done ? IO_RULES.conclusao : 0
          const totalIO = inputIO + conclusaoIO

          economy = {
            ...economy,
            saldo_io: Math.max(0, economy.saldo_io - totalIO),
            io_hoje: Math.max(0, economy.io_hoje - totalIO),
          }

          // Atualizar histórico do dia
          const today = new Date().toISOString().split('T')[0]
          const done = habits.filter(h => h.done).length
          const history = {
            ...s.history,
            [today]: { date: today, done, total: habits.length },
          }

          return { habits, economy, history }
        }),

      toggleHabit: (id) =>
        set(s => {
          const habits = s.habits.map(h =>
            h.id === id ? { ...h, done: !h.done } : h
          )
          // Registrar histórico do dia
          const today = new Date().toISOString().split('T')[0]
          const done  = habits.filter(h => h.done).length
          const total = habits.length
          const history = { ...s.history, [today]: { date: today, done, total } }

          // Ganhar IO ao concluir
          let { economy } = s
          const habit = habits.find(h => h.id === id)
          if (habit?.done) {
            const r1 = ganharIO(economy, 'conclusao')
            economy = r1.economy
            // Ciclo completo?
            if (done >= 5 && done > Object.values(s.history).find(h => h.date === today)?.done!) {
              const r2 = ganharIO(economy, 'ciclo_completo')
              economy = r2.economy
            }
          }

          return { habits, history, economy }
        }),

      resetHabits: () => {
        const today = new Date().toISOString().split('T')[0]
        set(s => ({
          habits: s.habits.map(h => ({ ...h, done: false })),
          history: {
            ...s.history,
            [today]: { date: today, done: 0, total: s.habits.length },
          },
        }))
      },

      // ── Economy ─────────────────────────────
      earnIO: (tipo) => {
        let result = { ganhou: 0, subiuNivel: false }
        set(s => {
          const r = ganharIO(s.economy, tipo)
          result = { ganhou: r.ganhou, subiuNivel: r.subiuNivel }
          return { economy: r.economy }
        })
        return result
      },

      spendIO: (amount) => {
        const { economy } = get()
        if (economy.saldo_io < amount) return false
        set(s => ({
          economy: { ...s.economy, saldo_io: s.economy.saldo_io - amount },
        }))
        return true
      },

      deductIO: (amount) => {
        set(s => ({
          economy: {
            ...s.economy,
            saldo_io: Math.max(0, s.economy.saldo_io - amount),
            io_hoje: Math.max(0, s.economy.io_hoje - amount),
          },
        }))
      },

      // ── Settings ────────────────────────────
      setTheme:    (theme)   => set({ theme }),
      setThemeMode: (mode)   => set({ themeMode: mode }),
      setSoundOn: (soundOn) => set({ soundOn }),

      // ── Reset ───────────────────────────────
      reset: () =>
        set({
          userId: null, isLoggedIn: false, plan: 'free',
          economy: ECONOMY_DEFAULT, habits: [], history: {},
        }),
    }),
    {
      name: 'io-app-store',
      partialize: s => ({
        economy: s.economy,
        habits:  s.habits,
        history: s.history,
        theme:    s.theme,
        themeMode: s.themeMode,
        soundOn: s.soundOn,
        plan:    s.plan,
        avatar:  s.avatar,
        username:s.username,
        bgColor: s.bgColor,
        bgImage: s.bgImage,
      }),
    }
  )
)
