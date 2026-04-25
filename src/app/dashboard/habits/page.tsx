'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore, Habit } from '@/store/useAppStore'
import { toast } from 'sonner'
import { Plus, MagnifyingGlass, Trash, PencilSimple, CaretDown, CaretUp, Moon, Flag, Check, X, Info } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Stepper } from '@/components/ui/stepper'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { PageSkeleton } from '@/components/PageSkeleton'

const PRIORITY_COLORS = {
  alta: {
    bar: 'bg-red-500',
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  media: {
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  baixa: {
    bar: 'bg-green-500',
    dot: 'bg-green-500',
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
} as const

const FREE_LIMIT = 10

export default function HabitsPage() {
  const router = useRouter()
  const { habits, toggleHabit, addHabit, updateHabit, deleteHabit, plan, earnIO } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Habit | null>(null)
  const [name, setName] = useState('')
  const [priority, setPriority] = useState<'alta' | 'media' | 'baixa'>('media')
  const [freq, setFreq] = useState<'diario' | 'semanal' | 'personalizado'>('diario')
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6])
  const [notes, setNotes] = useState('')
  const [pts, setPts] = useState(0)
  const [ptsPage, setPtsPage] = useState(1)
  const [editMode, setEditMode] = useState<'simples' | 'avancado'>('simples')
  const [showAllPending, setShowAllPending] = useState(false)
  const [showAllCompleted, setShowAllCompleted] = useState(false)
  const [quickAdd, setQuickAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const HABIT_LIMIT = 5

  const IO_VALUES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
  const IO_PER_PAGE = 5
  const totalPtsPages = Math.ceil(IO_VALUES.length / IO_PER_PAGE)
  const quickInputRef = useRef<HTMLInputElement>(null)
  const formInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(false)
  }, [])

  const canAdd = plan === 'pro' || habits.length < FREE_LIMIT
  const today = new Date().getDay()
  const filtered = habits.filter(h => !search || h.name.toLowerCase().includes(search.toLowerCase()))
  const paraHoje = filtered.filter(h => h.days?.includes(today) ?? true)
  const amanha = filtered.filter(h => !(h.days?.includes(today) ?? true))
  const pendentes = paraHoje.filter(h => !h.done)
  const concluidos = paraHoje.filter(h => h.done)
  const visiblePending = showAllPending ? pendentes : pendentes.slice(0, HABIT_LIMIT)
  const visibleCompleted = showAllCompleted ? concluidos : concluidos.slice(0, HABIT_LIMIT)
  const done = paraHoje.filter(h => h.done).length
  const total = paraHoje.length
  const pct = total ? Math.round((done / total) * 100) : 0

  function openNew() {
    setEditing(null)
    setName('')
    setPriority('media')
    setFreq('diario')
    setDays([0, 1, 2, 3, 4, 5, 6])
    setNotes('')
    setPts(0)
    setShowForm(true)
    setTimeout(() => {
      formInputRef.current?.focus()
      formInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  function focusQuickAdd() {
    openNew()
  }

  function handleQuickSubmit() {
    if (!name.trim()) {
      toast.error('Digite o nome do hábito.')
      return
    }
    if (!canAdd) {
      toast.error(`Limite de ${FREE_LIMIT} hábitos no plano Free.`)
      return
    }
    addHabit({
      id: Date.now(),
      name,
      priority,
      freq,
      days,
      notes,
      pts,
      done: false,
      icon: '⭐',
      tags: [],
      streak: 0,
      createdAt: new Date().toISOString(),
    })
    earnIO('input_registro')
    toast.success('+10 IO — hábito criado!')
    setName('')
    setQuickAdd(false)
  }

  function openEdit(h: Habit) {
    setEditing(h)
    setName(h.name)
    setPriority(h.priority)
    setFreq(h.freq)
    setDays(h.days)
    setNotes(h.notes ?? '')
    setPts(0)
    setShowForm(true)
  }

  function save() {
    if (!name.trim()) {
      toast.error('Digite o nome do hábito.')
      return
    }
    if (editing) {
      updateHabit({ ...editing, name, priority, freq, days, notes, pts })
      toast.success('Hábito atualizado!')
    } else {
      if (!canAdd) {
        toast.error(`Limite de ${FREE_LIMIT} hábitos no plano Free.`)
        return
      }
      addHabit({
        id: Date.now(),
        name,
        priority,
        freq,
        days,
        notes,
        pts,
        done: false,
        icon: '⭐',
        tags: [],
        streak: 0,
        createdAt: new Date().toISOString(),
      })
      earnIO('input_registro')
      toast.success('+10 IO — hábito criado!')
    }
    setShowForm(false)
  }

  return loading ? <PageSkeleton /> : (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      {/* Header */}
      <div className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-base font-bold tracking-tight text-foreground">Hábitos</h1>
          <p className="text-[10px] text-muted-foreground">
              {done} de {total} neste momento
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-9 text-foreground"
              onClick={() => setShowSearch(!showSearch)}
            >
              <MagnifyingGlass className="h-4 w-4 text-foreground" />
            </Button>
            <Button
              onClick={openNew}
              disabled={!canAdd}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="animate-in slide-in-from-top-2 duration-300 mx-4">
          <Input
            placeholder="Buscar hábito..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* Progress Overview */}
      {total > 0 && !showForm && (
        <Card className="mx-3 mt-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Progresso de Hoje</CardTitle>
              <Badge variant="secondary" className="font-base">
                {pct}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-1.5">
            {(Object.keys(PRIORITY_COLORS) as Array<keyof typeof PRIORITY_COLORS>).map(p => {
                const tot = paraHoje.filter(h => h.priority === p).length
                const don = paraHoje.filter(h => h.priority === p && h.done).length
                const pP = tot ? Math.round((don / tot) * 100) : 0
                return (
                  <div key={p} className="flex-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full transition-all duration-500', PRIORITY_COLORS[p].bar)}
                        style={{ width: `${pP}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 text-xs">
              {(Object.keys(PRIORITY_COLORS) as Array<keyof typeof PRIORITY_COLORS>).map(p => (
                <div key={p} className="flex items-center gap-1.5">
                  <div className={cn('h-2 w-2 rounded-full border', PRIORITY_COLORS[p].bar)} />
                  <span className="capitalize text-muted-foreground">{p}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card className="mx-3 mt-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between px-6 pt-6">
            <p className="text-sm font-semibold">
              {editing ? 'Editar hábito' : 'Novo hábito'}
            </p>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setEditMode('simples')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  editMode === 'simples'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Simples
              </button>
              <button
                onClick={() => setEditMode('avancado')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  editMode === 'avancado'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Avançado
              </button>
            </div>
          </div>
          <CardContent className="space-y-4 px-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                ref={formInputRef}
                placeholder="Ex: Beber água"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PRIORITY_COLORS) as Array<keyof typeof PRIORITY_COLORS>).map(p => {
                  const colors = PRIORITY_COLORS[p]
                  return (
                    <Button
                      key={p}
                      variant={priority === p ? 'default' : 'outline'}
                      onClick={() => setPriority(p)}
                      className={cn(
                        'capitalize',
                        priority === p && colors.bar
                      )}
                    >
                      {p}
                    </Button>
                  )
                })}
              </div>
            </div>

            {editMode === 'avancado' && (
              <>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'diario' as const, label: 'Diário' },
                      { id: 'semanal' as const, label: 'Semanal' },
                      { id: 'personalizado' as const, label: 'Personalizado' },
                    ].map(f => (
                      <Button
                        key={f.id}
                        variant={freq === f.id ? 'default' : 'outline'}
                        onClick={() => setFreq(f.id)}
                        className="text-sm"
                      >
                        {f.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {freq === 'personalizado' && (
                  <div className="space-y-2">
                    <Label>Dias</Label>
                    <div className="grid grid-cols-7 gap-1">
                      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                        <Button
                          key={i}
                          variant={days.includes(i) ? 'default' : 'outline'}
                          onClick={() => setDays(prev => (prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]))}
                          className="h-8 p-0 text-xs"
                        >
                          {d}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Nota (opcional)</Label>
                  <Input
                    id="notes"
                    placeholder="Por que esse hábito importa?"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="pts">IO por conclusão</Label>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sobre pontos IO</AlertDialogTitle>
                            <AlertDialogDescription>
                              <p className="text-sm">Cada vez que você conclude este hábito, ganha {pts} IO.</p>
                              <p className="text-sm mt-2">Pontos IO podem ser usados no Shop e criar Dashboards de Estatisticas para acompanhamento - também são uma métrica para estimular na caminhada.</p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogAction>Entendi</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {pts} IO
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setPtsPage(p => Math.max(1, p - 1))}
                      disabled={ptsPage <= 1}
                      className="w-9 h-9 rounded-lg flex items-center justify-center
                                 border border-input bg-background flex-shrink-0
                                 hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-colors text-base leading-none"
                    >
                      ‹
                    </button>
                    <div className="flex items-center justify-center gap-2 flex-1">
                      {IO_VALUES.slice((ptsPage - 1) * IO_PER_PAGE, ptsPage * IO_PER_PAGE).map(val => (
                        <button
                          key={val}
                          onClick={() => setPts(val)}
                          className={cn(
                            'w-9 h-9 rounded-lg text-sm font-semibold transition-all flex-shrink-0',
                            pts === val
                              ? 'bg-amber-500 text-white shadow-sm scale-105'
                              : 'bg-muted hover:bg-amber-50 dark:hover:bg-amber-950 text-foreground'
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPtsPage(p => Math.min(totalPtsPages, p + 1))}
                      disabled={ptsPage >= totalPtsPages}
                      className="w-9 h-9 rounded-lg flex items-center justify-center
                                 border border-input bg-background flex-shrink-0
                                 hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-colors text-base leading-none"
                    >
                      ›
                    </button>
                  </div>
                  {totalPtsPages > 1 && (
                    <p className="text-center text-[10px] text-muted-foreground">
                      página {ptsPage} de {totalPtsPages}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={save} className="w-full">
              {editing ? 'Salvar alterações' : '+ Adicionar hábito'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Pending Habits */}
      {pendentes.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pendentes ({pendentes.length})
              </p>
            </div>
          </div>
          {visiblePending.map(h => (
            <HabitCard key={h.id} habit={h} onToggle={toggleHabit} onDelete={deleteHabit} onEdit={openEdit} />
          ))}
          {pendentes.length > HABIT_LIMIT && (
            <button
              onClick={() => setShowAllPending(v => !v)}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground
                         flex items-center justify-center gap-1.5 transition-colors mt-1"
            >
              {showAllPending ? (
                <><CaretUp size={12} /> Ocultar {pendentes.length - HABIT_LIMIT} hábitos</>
              ) : (
                <><CaretDown size={12} /> Ver mais {pendentes.length - HABIT_LIMIT} hábitos</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Separator */}
      {pendentes.length > 0 && concluidos.length > 0 && <Separator className="my-3" />}

      {/* Completed Habits */}
      {concluidos.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Concluídos hoje ({concluidos.length})
              </p>
            </div>
          </div>
          {visibleCompleted.map(h => (
            <HabitCard
              key={h.id}
              habit={h}
              done
              onToggle={toggleHabit}
              onDelete={deleteHabit}
              onEdit={openEdit}
            />
          ))}
          {concluidos.length > HABIT_LIMIT && (
            <button
              onClick={() => setShowAllCompleted(v => !v)}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground
                         flex items-center justify-center gap-1.5 transition-colors mt-1"
            >
              {showAllCompleted ? (
                <><CaretUp size={12} /> Ocultar {concluidos.length - HABIT_LIMIT} concluídos</>
              ) : (
                <><CaretDown size={12} /> Ver {concluidos.length - HABIT_LIMIT} concluídos</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Tomorrow */}
      {amanha.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground">Amanhã · {amanha.length}</h2>
          </div>
          {amanha.map(h => (
            <Card key={h.id} className="mx-3 border-dashed opacity-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-md border-2 border-dashed border-muted" />
                  <span className="text-sm font-medium text-muted-foreground italic">{h.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {habits.length === 0 && !showForm && !quickAdd && (
        <Card className="mx-3 mt-3 flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">Nenhum hábito ainda</CardTitle>
          <CardDescription className="mb-6">
            Adicione seu primeiro hábito para começar a ganhar IO
          </CardDescription>
          <Button onClick={openNew} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Criar hábito
          </Button>
        </Card>
      )}

      {/* Quick Add Card */}
      {!showForm && (
        <Card className="mx-3 mt-3 animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                ref={quickInputRef}
                placeholder="Nome do hábito..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickSubmit()}
                className="flex-1"
              />
              <Button onClick={handleQuickSubmit} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Prioridade: {priority} • Frequência: {freq === 'diario' ? 'Diário' : freq}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Free Limit Warning */}
      {!canAdd && (
        <Card className="mx-3 mt-3 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Limite de {FREE_LIMIT} hábitos (Free)
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/profile#plano">Ver Pro →</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function HabitCard({
  habit,
  onToggle,
  onDelete,
  onEdit,
  done = false,
}: {
  habit: Habit
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onEdit: (h: Habit) => void
  done?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const c = PRIORITY_COLORS[habit.priority]

  return (
    <Card 
      className={cn('mx-3 transition-all hover:shadow-md', done && 'opacity-75')}
      style={{ 
        borderLeftWidth: '4px',
        borderLeftColor: habit.priority === 'alta' ? '#ef4444' : 
                         habit.priority === 'media' ? '#f59e0b' : 
                         '#22c55e',
        borderTopLeftRadius: 'calc(var(--radius) - 2px)',
        borderBottomLeftRadius: 'calc(var(--radius) - 2px)'
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(habit.id)}
            className={cn(
              'w-[22px] h-[22px] inline-flex items-center justify-center',
              'bg-white border-2 border-black shadow-[2px_2px_0_0_#000]',
              'cursor-pointer rounded-none flex-shrink-0',
              'hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px]',
              'active:shadow-none active:translate-x-[2px] active:translate-y-[2px]',
              'transition-all',
              done && 'bg-amber-500'
            )}
          >
            {done && <Check className="h-4 w-4 text-black" />}
          </button>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={cn('text-sm font-semibold leading-tight flex-1', done && 'line-through text-muted-foreground')}>
                {habit.name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full border',
                        i < (habit.streak ?? 0) ? c.dot : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <CaretUp className="h-4 w-4" /> : <CaretDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="secondary"
                className={cn('text-[10px]', c.bg, c.text, c.border)}
              >
                {habit.priority}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {habit.freq === 'diario' ? 'Diário' : habit.freq}
              </Badge>
              {done && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800 text-[10px]">
                  +{habit.pts} IO
                </Badge>
              )}
              {habit.notes && <Badge variant="outline" className="text-[10px]">nota</Badge>}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 animate-in slide-in-from-top-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(habit)
                  setExpanded(false)
                }}
                className="flex-1 gap-2"
              >
                <PencilSimple className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(habit.id)}
                className="flex-1 gap-2"
              >
                <Trash className="h-3.5 w-3.5" />
                Excluir
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}