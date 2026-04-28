export type Plan     = 'free' | 'pro'
export type Priority = 'alta' | 'media' | 'baixa'
export type Status   = 'planejando' | 'em andamento' | 'concluido'

// ─── Finanças ──────────────────────────────────────────────────────────
export interface Transaction {
  id:          number
  user_id?:    string
  type:        'income' | 'expense'
  amount:      number
  description: string
  category:    string
  date:        string
  created_at?: string
}

export interface FinancialGoal {
  id:       number
  user_id?: string
  name:     string
  target:   number
  saved:    number
  deadline?: string
  aportes:  { id: number; amount: number; date: string }[]
}

// ─── Carreira ──────────────────────────────────────────────────────────
export interface CareerLearn {
  id:        number
  user_id?:  string
  title:     string
  type:      'Curso' | 'Livro' | 'Artigo' | 'Documentário'
  area:      string
  status:    'Quero' | 'Em andamento' | 'Concluído' | 'quero' | 'em andamento' | 'concluído'
  link?:     string
  showOnHome?: boolean
  createdAt: string
}

export interface CareerSkill {
  id:       number
  user_id?: string
  name:     string
  level:    number    // 0–100
  createdAt: string
}

export interface CareerOnboarding {
  momento:    string | null
  area:       string | null
  cargo:      string | null
  objetivo:   string | null
  cv: {
    exp:   string
    edu:   string
    extra: string
  }
  extraGoals: string[]
  pct:        number
}

// ─── Projetos ──────────────────────────────────────────────────────────
export interface Project {
  id:          number
  user_id?:    string
  title:       string
  description?: string
  category:    string
  priority:    Priority
  status:      Status
  progress:    number   // 0–100
  milestones:  { id: number; text: string; done: boolean }[]
  deadline?:   string
  createdAt:   string
}

// ─── Diário ────────────────────────────────────────────────────────────
export interface JournalEntry {
  id:       number
  user_id?: string
  text:     string
  mood?:    'sad' | 'neutral' | 'good' | 'great' | 'amazing'
  tags:     string[]
  date:     string
  prompt?:  string
  createdAt: string
}

// ─── Feed Social ───────────────────────────────────────────────────────
export interface FeedPost {
  id:        string
  user_id:   string
  username:  string
  avatar:    string
  content:   string
  tags:      string[]
  pillar?:   string
  likes:     number
  comments:  number
  liked:     boolean
  created_at: string
}

// ─── Loja ──────────────────────────────────────────────────────────────
export interface ShopItem {
  id:        string
  cat:       'avatar' | 'utilidade' | 'tema' | 'elite' | 'bgcolor'
  name:      string
  icon:      string
  desc:      string
  cost:      number
  nivel_min: number
  tag:       string
  pillar:    string
  barColor:  string
  raro?:     boolean
  consumivel?: boolean
  preview?:  string[]
  grupo?:    string
  toggle?:   boolean
  conquista?: boolean
  itemColor?: string
  hasMode?:  boolean
}
