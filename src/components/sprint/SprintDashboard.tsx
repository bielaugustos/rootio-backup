'use client'
import { useState, useEffect, useRef, use, Suspense } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useSprintStore, Sprint, SprintTask, SprintStatus } from '@/store/sprint/sprintStore'
import { storage } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useSearchParams } from 'next/navigation'
import {
  Plus, Trash, PencilSimple, Play, Pause, CheckCircle, XCircle, WarningCircle,
  Kanban, List, ChatCircle, Clock, ArrowLeft,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<SprintStatus, { label: string; color: string; bg: string }> = {
  IDLE: { label: 'Pausado', color: 'text-slate-500', bg: 'bg-slate-500/20' },
  PLANNING: { label: 'Planejando', color: 'text-blue-500', bg: 'bg-blue-500/20' },
  SPRINT_ACTIVE: { label: 'Em Andamento', color: 'text-green-500', bg: 'bg-green-500/20' },
  REVIEW_RETRO: { label: 'Review/Retro', color: 'text-purple-500', bg: 'bg-purple-500/20' },
  DONE: { label: 'Concluído', color: 'text-amber-500', bg: 'bg-amber-500/20' },
}

const STATUS_ORDER: SprintStatus[] = ['IDLE', 'PLANNING', 'SPRINT_ACTIVE', 'REVIEW_RETRO', 'DONE']

interface TaskCardProps {
  task: SprintTask
  sprintId: number
  onToggle: () => void
  onBlock: () => void
  onUnblock: () => void
  onDelete: () => void
  onEdit: () => void
  isBlocked: boolean
}

function TaskCard({ task, sprintId, onToggle, onBlock, onUnblock, onDelete, onEdit, isBlocked }: TaskCardProps) {
  return (
    <div className={cn(
      'p-3 rounded-lg border-2 transition-all',
      task.completed 
        ? 'bg-green-500/10 border-green-500/30' 
        : isBlocked 
          ? 'bg-red-500/10 border-red-500/30' 
          : 'bg-background border-border hover:border-amber-500/50'
    )}>
      <div className="flex items-start gap-2">
        <button
          onClick={onToggle}
          disabled={isBlocked}
          className={cn(
            'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            task.completed 
              ? 'bg-green-500 border-green-500' 
              : 'border-muted-foreground hover:border-green-500'
          )}
        >
          {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium',
            task.completed && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-[10px]">
              {task.estimatedHours}h
            </Badge>
            {isBlocked && (
              <Badge variant="destructive" className="text-[10px] animate-pulse">
                <WarningCircle className="h-3 w-3 mr-1" />
                Bloqueado
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          {isBlocked ? (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onUnblock}>
              <Play className="h-3 w-3 text-green-500" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onBlock}>
              <Pause className="h-3 w-3 text-red-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
            <PencilSimple className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ImpedimentOverlayProps {
  isVisible: boolean
  count: number
}

function ImpedimentOverlay({ isVisible, count }: ImpedimentOverlayProps) {
  if (!isVisible || count === 0) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <Card className="bg-red-500 border-red-600 shadow-lg">
        <CardContent className="p-3 flex items-center gap-2">
          <WarningCircle className="h-5 w-5 text-white animate-pulse" />
          <div>
            <p className="text-sm font-bold text-white">{count} impedimentos</p>
            <p className="text-xs text-white/80">requerem atenção</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface FeedbackLoopProps {
  notes: { id: number; content: string; type: string; createdAt: string }[]
  onAddNote: (type: 'daily' | 'retro' | 'general') => void
}

function FeedbackLoop({ notes, onAddNote }: FeedbackLoopProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className={cn(
      'fixed right-0 top-1/2 -translate-y-1/2 z-40 transition-all',
      isOpen ? 'w-72' : 'w-12'
    )}>
      <div className="flex">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'h-12 w-12 rounded-l-lg flex items-center justify-center',
            'bg-stone-800 border-l border-t border-b border-stone-700',
            'hover:bg-stone-700 transition-colors'
          )}
        >
          <ChatCircle className="h-5 w-5 text-amber-500" />
        </button>
        
        {isOpen && (
          <Card className="w-64 ml-1 bg-stone-800 border-stone-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">Feedback Loop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onAddNote('daily')}>
                  Daily
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onAddNote('retro')}>
                  Retro
                </Button>
              </div>
              <div className="h-48 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma nota ainda</p>
                ) : (
                  notes.slice(0, 10).map((note) => (
                    <div key={note.id} className="mb-2 p-2 rounded bg-stone-700/50">
                      <p className="text-xs text-white/80">{note.content}</p>
                      <p className="text-[10px] text-white/40 mt-1">
                        {note.type} • {new Date(note.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

interface BurndownChartProps {
  progress: number
  totalTasks: number
  completedTasks: number
}

function BurndownChart({ progress, totalTasks, completedTasks }: BurndownChartProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Burndown</span>
        <span className="font-mono">{completedTasks}/{totalTasks}</span>
      </div>
      <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0%</span>
        <span>{progress}%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

function SprintDashboardContent() {
  const { isLoggedIn, userId } = useAppStore()
  const { sprints, currentSprint, activeImpediments, setSprints, loadSprints, addSprint, updateSprint, deleteSprint, addTask, updateTask, deleteTask, setTaskStatus, moveTask, setTaskBlock, clearTaskBlock, addNote, clearNotes, clearSprints, setSprintStatus, setCurrentSprint, createSprint, getSprintProgress, blockTask, updateSprintName, transitionStatus, removeTask, unblockTask } = useSprintStore()
  
  const [showSprintForm, setShowSprintForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newSprintName, setNewSprintName] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskHours, setNewTaskHours] = useState('1')
  const [blockReason, setBlockReason] = useState('')
  const [blockingTaskId, setBlockingTaskId] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<SprintTask | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [noteType, setNoteType] = useState<'daily' | 'retro' | 'general'>('general')
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('projectId')
  const projectId = projectIdParam ? parseInt(projectIdParam) : null
  const projects = storage<{ id: number; title: string; category: string }[]>('io_projects', [])
  const projectTitle = projectId 
    ? projects.find(p => p.id === projectId)?.title 
    : null
  const projectCategory = projectId 
    ? projects.find(p => p.id === projectId)?.category 
    : null

  const sprintInitialized = useRef(false)

  useEffect(() => {
    if (!projectId || sprintInitialized.current) return
    sprintInitialized.current = true
    
    const projectSprints = sprints.filter(s => s.projectId === projectId || s.name === `Projeto #${projectId}`)
    
    if (projectSprints.length > 0) {
      setCurrentSprint(projectSprints[0])
    } else {
      createSprint(projectTitle || `Projeto #${projectId}`, projectId)
    }
  }, [projectId, projectTitle])

  const projectSprints = projectId 
    ? sprints.filter(s => s.projectId === projectId || s.name === `Projeto #${projectId}`)
    : sprints

  const progress = currentSprint ? getSprintProgress(currentSprint) : 0
  const blockedTasks = currentSprint?.tasks.filter((t) => t.blocked).length || 0

  function handleCreateSprint() {
    if (!newSprintName.trim()) return
    createSprint(newSprintName, projectId || undefined)
    setNewSprintName('')
    setShowSprintForm(false)
  }

  function handleAddTask() {
    if (!newTaskTitle.trim() || !currentSprint) return
    addTask(currentSprint.id, {
      title: newTaskTitle,
      description: newTaskDesc,
      completed: false,
      blocked: false,
      estimatedHours: parseInt(newTaskHours) || 1,
      completedHours: 0,
    })
    setNewTaskTitle('')
    setNewTaskDesc('')
    setNewTaskHours('1')
    setShowTaskForm(false)
  }

  function handleBlockTask() {
    if (!blockReason.trim() || !blockingTaskId || !currentSprint) return
    blockTask(currentSprint.id, blockingTaskId, blockReason)
    setBlockReason('')
    setBlockingTaskId(null)
  }

  function handleAddNote() {
    if (!noteInput.trim() || !currentSprint) return
    addNote(currentSprint.id, { content: noteInput, type: noteType })
    setNoteInput('')
  }

  const [showDeleteSprint, setShowDeleteSprint] = useState(false)
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null)
  const [sprintToEdit, setSprintToEdit] = useState<number | null>(null)
  const [editingSprintName, setEditingSprintName] = useState('')

  const currentStatusIndex = currentSprint ? STATUS_ORDER.indexOf(currentSprint.status) : 0
  const nextStatus = currentSprint && currentStatusIndex < STATUS_ORDER.length - 1 
    ? STATUS_ORDER[currentStatusIndex + 1] 
    : null

  function handleDeleteSprint() {
    if (!sprintToDelete) return
    deleteSprint(sprintToDelete.id)
    setSprintToDelete(null)
    setShowDeleteSprint(false)
  }

  function handleUpdateSprintName() {
    if (!editingSprintName.trim() || !sprintToEdit) return
    updateSprintName(sprintToEdit, editingSprintName)
    setSprintToEdit(null)
    setEditingSprintName('')
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      <ImpedimentOverlay isVisible={activeImpediments > 0} count={activeImpediments} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{currentSprint?.name || 'Sprint Dashboard'}</h1>
            <p className="text-sm text-muted-foreground">
              {projectSprints.length} sprint(s)
            </p>
          </div>
        </div>
        <Button onClick={() => setShowSprintForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Sprint
        </Button>
      </div>

      {/* Sprint Selector */}
      {projectSprints.length > 0 && (
        <Card className="mx-3 mt-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Sprints do Projeto</h3>
              <Badge variant="secondary">{projectSprints.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {projectSprints.map((s) => (
              <div
                key={s.id}
                className={cn(
                  'relative p-3 rounded-lg border-2 transition-all',
                  currentSprint?.id === s.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-border hover:border-amber-500/50'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => setCurrentSprint(s)}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium">{s.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {STATUS_CONFIG[s.status].label}
                      </Badge>
                      {projectCategory && (
                        <Badge variant="outline" className="text-[10px]">
                          {projectCategory}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {s.tasks.length} tarefa(s)
                      </span>
                    </div>
                  </button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingSprintName(s.name)
                        setSprintToEdit(s.id)
                      }}
                    >
                      <PencilSimple className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setSprintToDelete(s)
                        setShowDeleteSprint(true)
                      }}
                    >
                      <Trash className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {sprintToEdit && (
        <Card className="mx-3 mt-3 border-amber-500">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <Label>Editar Nome do Sprint</Label>
              <Input
                value={editingSprintName}
                onChange={(e) => setEditingSprintName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateSprintName} className="flex-1">Salvar</Button>
              <Button variant="outline" onClick={() => { setSprintToEdit(null); setEditingSprintName('') }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sprint Form */}
      {showSprintForm && (
        <Card className="mx-3 mt-3">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <Label>Nome do Sprint</Label>
              <Input
                placeholder="Sprint 1"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateSprint} className="flex-1">Criar</Button>
              <Button variant="outline" onClick={() => setShowSprintForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Sprint Selected */}
      {!currentSprint && projectSprints.length > 0 && (
        <Card className="mx-3 mt-3">
          <CardContent className="p-8 text-center">
            <Kanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Selecione um sprint acima</p>
          </CardContent>
        </Card>
      )}

      {/* No Sprints */}
      {!currentSprint && projectSprints.length === 0 && (
        <Card className="mx-3 mt-3">
          <CardContent className="p-8 text-center">
            <Kanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum sprint ainda</p>
            <Button onClick={() => setShowSprintForm(true)}>
              Criar primeiro sprint
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Sprint Dashboard */}
      {currentSprint && (
        <>
          {/* Status Bar */}
          <Card className="mx-3 mt-3 nb-card-dark">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-white">{currentSprint.name}</h2>
                  <Badge className={cn('mt-1', STATUS_CONFIG[currentSprint.status].bg, STATUS_CONFIG[currentSprint.status].color)}>
                    {STATUS_CONFIG[currentSprint.status].label}
                  </Badge>
                </div>
                {nextStatus && (
                  <Button 
                    size="sm" 
                    onClick={() => transitionStatus(currentSprint.id, nextStatus)}
                    className="gap-1"
                  >
                    <Play className="h-3 w-3" />
                    {STATUS_CONFIG[nextStatus].label}
                  </Button>
                )}
              </div>
              
              {/* Progress & Burndown */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/60">Progresso</span>
                    <span className="font-mono text-white">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <BurndownChart 
                  progress={progress} 
                  totalTasks={currentSprint.tasks.length}
                  completedTasks={currentSprint.tasks.filter(t => t.completed).length}
                />
              </div>

              {/* Stats Row */}
              <div className="flex gap-4 mt-4 pt-4 border-t border-stone-700">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-white/60" />
                  <span className="text-xs text-white/60">Tarefas:</span>
                  <span className="text-xs font-mono text-white">{currentSprint.tasks.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-white/60">Feitas:</span>
                  <span className="text-xs font-mono text-green-400">
                    {currentSprint.tasks.filter(t => t.completed).length}
                  </span>
                </div>
                {blockedTasks > 0 && (
                  <div className="flex items-center gap-2">
                    <WarningCircle className="h-4 w-4 text-red-500 animate-pulse" />
                    <span className="text-xs text-white/60">Bloqueadas:</span>
                    <span className="text-xs font-mono text-red-400">{blockedTasks}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Task Form */}
          {showTaskForm && (
            <Card className="mx-3 mt-3">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <Label>Tarefa</Label>
                  <Input
                    placeholder="Descrição da tarefa"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Notas (opcional)</Label>
                  <Input
                    placeholder="Detalhes adicionais"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="space-y-1 flex-1">
                    <Label>Horas estimadas</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newTaskHours}
                      onChange={(e) => setNewTaskHours(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTask} className="flex-1">Adicionar</Button>
                  <Button variant="outline" onClick={() => setShowTaskForm(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Block Task Modal */}
          {blockingTaskId && (
            <Card className="mx-3 mt-3 border-red-500">
              <CardContent className="p-4 space-y-3">
                <Label>Motivo do bloqueio</Label>
                <Input
                  placeholder="Por que esta tarefa está bloqueada?"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleBlockTask} variant="destructive" className="flex-1">
                    Bloquear
                  </Button>
                  <Button variant="outline" onClick={() => setBlockingTaskId(null)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks List */}
          <div className="mx-3 mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Tarefas</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
            
            {currentSprint.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma tarefa ainda. Adicione uma para começar.
              </p>
            ) : (
              currentSprint.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  sprintId={currentSprint.id}
                  isBlocked={task.blocked}
                  onToggle={() => updateTask(currentSprint.id, task.id, { completed: !task.completed })}
                  onBlock={() => setBlockingTaskId(task.id)}
                  onUnblock={() => unblockTask(currentSprint.id, task.id)}
                  onDelete={() => removeTask(currentSprint.id, task.id)}
                  onEdit={() => setEditingTask(task)}
                />
              ))
            )}
          </div>

          {/* Notes Section */}
          {currentSprint.notes.length > 0 && (
            <Card className="mx-3 mt-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Notas ({currentSprint.notes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 overflow-y-auto">
                  {currentSprint.notes.map((note) => (
                    <div key={note.id} className="mb-2 p-2 rounded bg-muted">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {note.type} • {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Note Input */}
          <Card className="mx-3 mt-3">
            <CardContent className="p-3 space-y-2">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={noteType === 'daily' ? 'default' : 'outline'} 
                  onClick={() => setNoteType('daily')}
                >
                  Daily
                </Button>
                <Button 
                  size="sm" 
                  variant={noteType === 'retro' ? 'default' : 'outline'} 
                  onClick={() => setNoteType('retro')}
                >
                  Retro
                </Button>
                <Button 
                  size="sm" 
                  variant={noteType === 'general' ? 'default' : 'outline'} 
                  onClick={() => setNoteType('general')}
                >
                  Geral
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar uma nota..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button onClick={handleAddNote}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Sprint Confirmation */}
      <AlertDialog open={showDeleteSprint} onOpenChange={setShowDeleteSprint}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Sprint</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o sprint "{sprintToDelete?.name}"? 
              Esta ação não pode ser desfeita e todas as tarefas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteSprint(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSprint} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feedback Loop Sidebar */}
      {currentSprint && (
        <FeedbackLoop 
          notes={currentSprint.notes}
          onAddNote={(type) => setNoteType(type)}
        />
      )}
    </div>
  )
}

export default function SprintDashboard() {
  return (
    <Suspense fallback={null}>
      <SprintDashboardContent />
    </Suspense>
  )
}
