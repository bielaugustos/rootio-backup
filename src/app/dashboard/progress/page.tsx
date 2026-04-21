'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getNivel, getProgresso, NIVEIS, IO_RULES } from '@/lib/io-system'
import { storage, saveStorage, todayISO } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Trophy, Lightning, Fire, Star, Lock,
  CheckCircle, Target, Calendar, ChartLineUp,
  Medal, Crown, Shield, Rocket, ArrowRight,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const KEY_CHALLENGES = 'io_challenges'
const KEY_HISTORY = 'io_io_history'

interface Challenge {
  id: string
  title: string
  desc: string
  icon: string
  reward: number
  progress: number
  total: number
  done: boolean
  type: 'semanal' | 'mensal'
  expiresAt: string
}

interface IOEvent {
  id: number
  tipo: keyof typeof IO_RULES
  descricao: string
  valor: number
  data: string
  hora: string
}

function getWeeklyExpiry(): string {
  const d = new Date()
  d.setDate(d.getDate() + (7 - d.getDay()))
  return d.toISOString().split('T')[0]
}

function getMonthlyExpiry(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  return d.toISOString().split('T')[0]
}

const DESAFIOS_BASE: Omit<Challenge, 'id' | 'progress' | 'done' | 'expiresAt'>[] = [
  {
    title: '20 hábitos esta semana',
    desc: 'Conclua 20 hábitos de segunda a domingo',
    icon: '🔥',
    reward: 100,
    total: 20,
    type: 'semanal',
  },
  {
    title: '3 dias perfeitos',
    desc: '100% dos hábitos em 3 dias diferentes',
    icon: '💧',
    reward: 150,
    total: 3,
    type: 'semanal',
  },
  {
    title: 'Streak de 3 dias',
    desc: 'Mantenha 3 dias ativos seguidos',
    icon: '⚡',
    reward: 20,
    total: 3,
    type: 'semanal',
  },
  {
    title: 'Registrar 3 aprendizados',
    desc: 'Adicione 3 conteúdos na aba Carreira',
    icon: '📚',
    reward: 200,
    total: 3,
    type: 'mensal',
  },
  {
    title: 'Primeiro projeto criado',
    desc: 'Crie seu primeiro projeto de vida',
    icon: '🚀',
    reward: 150,
    total: 1,
    type: 'mensal',
  },
]

const TIPO_CONFIG: Record<string, {
  label: string
  icon: string
  color: string
  bg: string
}> = {
  conclusao: { label: 'Hábito concluído', icon: '✓', color: 'text-green-600', bg: 'bg-green-50' },
  ciclo_completo: { label: 'Ciclo completo', icon: '🔥', color: 'text-orange-600', bg: 'bg-orange-50' },
  combo_streak: { label: 'Combo diário', icon: '⚡', color: 'text-purple-600', bg: 'bg-purple-50' },
  input_registro: { label: 'Dado registrado', icon: '+', color: 'text-blue-600', bg: 'bg-blue-50' },
  max_io_por_dia: { label: 'Limite diário', icon: '🛍', color: 'text-red-600', bg: 'bg-red-50' },
}

const DESBLOQUEIOS = [
  { nivel: 1, items: ['Registro básico', 'Tela de Progresso', 'Loja básica'] },
  { nivel: 2, items: ['Widget de estatísticas', 'Automação de inputs', 'Temas intermediários'] },
  { nivel: 3, items: ['Previsão de tendências', 'Temas dinâmicos', 'Exportação avançada'] },
]

const CONQUISTAS = [
  { id: 'c1', titulo: 'Primeiro passo', desc: 'Criou seu primeiro hábito', icon: '🌱', gatilho: 'habit_1', raro: false, unlocked: false },
  { id: 'c2', titulo: 'Semana perfeita', desc: '7 dias de streak', icon: '🔥', gatilho: 'streak_7', raro: false, unlocked: false },
  { id: 'c3', titulo: '30 dias seguidos', desc: '30 dias de streak consecutivos', icon: '🏅', gatilho: 'streak_30', raro: true, unlocked: false },
  { id: 'c4', titulo: 'Pessoa Conectora', desc: 'Atingiu o Nível 2', icon: '🔗', gatilho: 'nivel_2', raro: false, unlocked: false },
  { id: 'c5', titulo: 'Visionária', desc: 'Atingiu o Nível 3', icon: '🔭', gatilho: 'nivel_3', raro: true, unlocked: false },
  { id: 'c6', titulo: '500 IO', desc: 'Acumulou 500 IO de XP total', icon: '⚡', gatilho: 'io_500', raro: false, unlocked: false },
  { id: 'c7', titulo: 'Milionário IO', desc: 'Acumulou 1500 IO de XP total', icon: '💎', gatilho: 'io_1500', raro: true, unlocked: false },
]

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export default function ProgressPage() {
  const { economy } = useAppStore()
  const nivel = getNivel(economy.xp_total)
  const pct = getProgresso(economy.xp_total)
  const prox = NIVEIS.find(n => n.nivel === nivel.nivel + 1)
  const faltam = prox ? prox.xp_min - economy.xp_total : 0

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [ioHistory, setIoHistory] = useState<IOEvent[]>([])

  useEffect(() => {
    const stored = storage<Challenge[]>(KEY_CHALLENGES, [])
    if (stored.length === 0) {
      const newChallenges = DESAFIOS_BASE.map((c, i) => ({
        ...c,
        id: `c${i}-${Date.now()}`,
        progress: 0,
        done: false,
        expiresAt: c.type === 'semanal' ? getWeeklyExpiry() : getMonthlyExpiry(),
      }))
      setChallenges(newChallenges)
      saveStorage(KEY_CHALLENGES, newChallenges)
    } else {
      setChallenges(stored)
    }
  }, [])

  useEffect(() => {
    const stored = storage<IOEvent[]>(KEY_HISTORY, [])
    setIoHistory(stored)
  }, [])

  const STATS = [
    { label: 'XP total', value: economy.xp_total, color: 'text-amber-600', icon: Star },
    { label: 'Saldo IO', value: economy.saldo_io, color: 'text-foreground', icon: Lightning },
    { label: 'Streak', value: `${economy.streak}d`, color: 'text-orange-500', icon: Fire },
    { label: 'IO hoje', value: `+${economy.io_hoje}`, color: 'text-foreground', icon: Target },
  ]

  const pctDia = Math.min(Math.round((economy.io_hoje / 200) * 100), 100)

  const grouped = ioHistory.reduce((acc, ev) => {
    if (!acc[ev.data]) acc[ev.data] = []
    acc[ev.data].push(ev)
    return acc
  }, {} as Record<string, IOEvent[]>)

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      <Tabs defaultValue="nivel" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="nivel">Nível</TabsTrigger>
          <TabsTrigger value="desafios">Desafios</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="nivel" className="space-y-4 mt-4">
          {/* Hero Card */}
          <Card className="bg-zinc-950 text-white border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500 bg-amber-500/10 flex flex-col items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="font-mono font-bold text-xl text-amber-400 leading-none">
                    {String(nivel.nivel).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider">nível</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Título atual</p>
                  <h2 className="text-lg font-bold text-white mb-2">{nivel.titulo}</h2>
                  <Progress value={pct} className="h-1.5 bg-zinc-800 mb-1" />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>{economy.xp_total} XP</span>
                    <span>{prox ? `→ ${prox.xp_min} XP` : 'Nível máximo'}</span>
                  </div>
                </div>
              </div>
              {prox && (
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-400">PRÓXIMO: {prox.titulo}</span>
                  <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[10px] font-mono">
                    {faltam} XP restantes
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(({ label, value, color, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={13} className="text-amber-500" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                      {label}
                    </span>
                  </div>
                  <p className={cn('text-2xl font-bold font-mono', color)}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* IO Today */}
          <Card className="border-amber-100 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Lightning size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">IO ganho hoje</span>
                </div>
                <span className="text-[10px] text-amber-600 font-mono">
                  {economy.io_hoje} / 200
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-amber-700 mb-2">
                +{economy.io_hoje}
              </div>
              <Progress value={pctDia} className="h-2 bg-amber-200" />
              <p className="text-[10px] text-amber-600 mt-1.5">
                {200 - economy.io_hoje} IO disponíveis até o limite diário
              </p>
            </CardContent>
          </Card>

          {/* Unlocks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Desbloqueios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {DESBLOQUEIOS.map(({ nivel: n, items }) => {
                const unlocked = nivel.nivel >= n
                return items.map(item => (
                  <div
                    key={item}
                    className={cn(
                      'flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors',
                      unlocked
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-dashed border-border bg-muted/40 text-muted-foreground opacity-60'
                    )}
                  >
                    {unlocked ? (
                      <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                    ) : (
                      <Lock size={15} className="flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium">{item}</span>
                    {!unlocked && (
                      <Badge variant="outline" className="ml-auto text-[9px]">
                        Nível {n}
                      </Badge>
                    )}
                  </div>
                ))
              })}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Medal size={15} className="text-amber-500" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {CONQUISTAS.map(c => {
                  let unlocked = c.unlocked
                  if (c.gatilho === 'nivel_2') unlocked = nivel.nivel >= 2
                  if (c.gatilho === 'nivel_3') unlocked = nivel.nivel >= 3
                  if (c.gatilho === 'io_500') unlocked = economy.xp_total >= 500
                  if (c.gatilho === 'io_1500') unlocked = economy.xp_total >= 1500
                  if (c.gatilho === 'streak_7') unlocked = economy.streak >= 7
                  if (c.gatilho === 'streak_30') unlocked = economy.streak >= 30

                  return (
                    <div
                      key={c.id}
                      className={cn(
                        'p-3 rounded-lg border flex items-start gap-2.5 transition-opacity',
                        unlocked ? '' : 'opacity-40 grayscale'
                      )}
                    >
                      <span className="text-2xl flex-shrink-0">{c.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <p className="text-xs font-semibold leading-tight">{c.titulo}</p>
                          {c.raro && (
                            <Badge className="text-[8px] bg-amber-500 text-white border-0 px-1 py-0">
                              raro
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="desafios" className="space-y-6 mt-4">
          {['semanal', 'mensal'].map(type => (
            <div key={type}>
              <p className="text-sm font-semibold mb-3">
                Desafios {type === 'semanal' ? 'da semana' : 'do mês'}
              </p>
              <div className="space-y-3">
                {challenges.filter(c => c.type === type).map(c => {
                  const pct = Math.min(Math.round((c.progress / c.total) * 100), 100)
                  return (
                    <Card key={c.id} className={c.done ? 'border-green-200 bg-green-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{c.icon}</span>
                            <div>
                              <p className={cn('text-sm font-semibold', c.done ? 'text-green-700' : '')}>
                                {c.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{c.desc}</p>
                            </div>
                          </div>
                          <Badge className={c.done ? 'bg-green-500 text-white border-0' : 'bg-amber-100 text-amber-700 border-0'}>
                            {c.done ? '✓ ' : ''}{c.reward} IO
                          </Badge>
                        </div>
                        {!c.done && (
                          <>
                            <Progress value={pct} className="h-1.5 mb-1" />
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>{c.progress} / {c.total}</span>
                              <span>expira {c.expiresAt}</span>
                            </div>
                          </>
                        )}
                        {c.done && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            Desafio concluído! +{c.reward} IO recebidos
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="historico" className="space-y-4 mt-4">
          {sortedDates.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center space-y-3">
                <ChartLineUp size={36} className="mx-auto text-muted-foreground" />
                <div>
                  <p className="font-semibold">Nenhuma ação ainda</p>
                  <p className="text-sm text-muted-foreground">
                    Complete hábitos para ver seu histórico de IO
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            sortedDates.map(date => {
              const evs = grouped[date]
              const total = evs.reduce((a, e) => a + e.valor, 0)
              const label = date === todayISO() ? 'Hoje' :
                           date === yesterdayISO() ? 'Ontem' :
                           new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })

              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{label}</span>
                    <Badge className="text-[10px] font-mono bg-amber-500">
                      {total >= 0 ? '+' : ''}{total} IO
                    </Badge>
                  </div>
                  <Card className="mb-4">
                    <CardContent className="p-0 divide-y">
                      {evs.map((ev) => {
                        const cfg = TIPO_CONFIG[ev.tipo] || { label: 'IO', icon: '⚡', color: 'text-foreground', bg: 'bg-muted' }
                        return (
                          <div key={ev.id} className="flex items-center gap-3 p-3">
                            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm', cfg.bg)}>
                              {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{ev.descricao}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {cfg.label} · {ev.hora}
                              </p>
                            </div>
                            <span className={cn('font-mono font-semibold text-sm flex-shrink-0', ev.valor >= 0 ? 'text-green-600' : 'text-red-600')}>
                              {ev.valor >= 0 ? '+' : ''}{ev.valor} IO
                            </span>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </div>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}