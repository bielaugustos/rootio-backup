'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { useSprintStore } from '@/store/sprint/sprintStore'
import { saveStorage, storage, todayISO } from '@/lib/utils'
import { Project } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Plus, Trash, PencilSimple, CaretDown, CaretUp,
  Flag, Rocket, Heart, Chat, Palette, Coins, CheckCircle,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const KEY_PROJECTS = 'io_projects'
const KEY_BANNER = 'io_proj_banner'
const KEY_CATEGORIES = 'io_proj_categories'

const DEFAULT_CATEGORIES = ['Saúde', 'Idioma', 'Arte', 'Finanças', 'Geral'] as const
const DEFAULT_CAT_COLORS: Record<string, string> = {
  'Saúde': '#16a34a',
  'Idioma': '#2563eb',
  'Arte': '#7c3aed',
  'Finanças': '#f59e0b',
  'Geral': '#78716c',
}

const CATEGORIES = DEFAULT_CATEGORIES

const CAT_COLORS: Record<string, string> = DEFAULT_CAT_COLORS

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Saúde': Heart,
  'Idioma': Chat,
  'Arte': Palette,
  'Finanças': Coins,
  'Geral': Flag,
}

interface ProjectFormData {
  title: string
  description: string
  category: string
  priority: 'alta' | 'media' | 'baixa'
  deadline: string
}

export default function ProjectsPage() {
  const { isLoggedIn, userId } = useAppStore()
  const { sprints } = useSprintStore()
  
  const [projects, setProjects] = useState<Project[]>(() => storage(KEY_PROJECTS, []))
  const [bannerOpen, setBannerOpen] = useState(() => storage(KEY_BANNER, true))
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<'em andamento' | 'planejando' | 'concluido'>('em andamento')
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [customCategories, setCustomCategories] = useState<string[]>(() => storage(KEY_CATEGORIES, []))
  const [newCategoryName, setNewCategoryName] = useState('')
  
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]
  const customColors = useMemo(() => {
    const colors: Record<string, string> = {}
    customCategories.forEach((cat, i) => {
      const hue = (i * 60) % 360
      colors[cat] = `hsl(${hue}, 70%, 50%)`
    })
    return colors
  }, [customCategories])
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: 'Geral',
    priority: 'media',
    deadline: '',
  })

  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.status === filter)
  }, [projects, filter])

  useEffect(() => {
    saveStorage(KEY_BANNER, bannerOpen)
  }, [bannerOpen])

  function openNewForm() {
    setEditingProject(null)
    setFormData({
      title: '',
      description: '',
      category: 'Geral',
      priority: 'media',
      deadline: '',
    })
    setShowForm(true)
  }

  function openEditForm(p: Project) {
    setEditingProject(p)
    setFormData({
      title: p.title,
      description: p.description || '',
      category: p.category,
      priority: p.priority,
      deadline: p.deadline || '',
    })
    setShowForm(true)
  }

  function saveProject() {
    if (!formData.title.trim()) return

    if (editingProject) {
      const lista = projects.map(p =>
        p.id === editingProject.id
          ? { ...p, ...formData, deadline: formData.deadline || undefined }
          : p
      )
      setProjects(lista)
      saveStorage(KEY_PROJECTS, lista)
    } else {
      const novo: Project = {
        id: Date.now(),
        ...formData,
        status: 'planejando',
        progress: 0,
        milestones: [],
        createdAt: todayISO(),
      }
      const lista = [novo, ...projects]
      setProjects(lista)
      saveStorage(KEY_PROJECTS, lista)
    }

    setShowForm(false)
    setEditingProject(null)
  }

  function deleteProject(id: number) {
    const lista = projects.filter(p => p.id !== id)
    setProjects(lista)
    saveStorage(KEY_PROJECTS, lista)
  }

  function createFromCategory(category: string) {
    setFormData({
      title: '',
      description: '',
      category,
      priority: 'media',
      deadline: '',
    })
    setShowForm(true)
  }

  function addCategory() {
    if (!newCategoryName.trim()) return
    if (allCategories.includes(newCategoryName.trim())) return
    const updated = [...customCategories, newCategoryName.trim()]
    setCustomCategories(updated)
    saveStorage(KEY_CATEGORIES, updated)
    setNewCategoryName('')
  }

  function removeCategory(cat: string) {
    if (!customCategories.includes(cat)) return
    const updated = customCategories.filter(c => c !== cat)
    setCustomCategories(updated)
    saveStorage(KEY_CATEGORIES, updated)
  }

  const filters: { id: typeof filter; label: string }[] = [
    { id: 'em andamento', label: 'Em andamento' },
    { id: 'planejando', label: 'Planejando' },
    { id: 'concluido', label: 'Concluídos' },
  ]

  function getCategoryColor(cat: string): string {
    return CAT_COLORS[cat] || customColors[cat] || CAT_COLORS['Geral']
  }

  function ColoredIcon({ category }: { category: string }) {
    const color = getCategoryColor(category)
    const iconMap: Record<string, React.ComponentType<{ className?: string; color?: string }>> = {
      'Saúde': Heart,
      'Idioma': Chat,
      'Arte': Palette,
      'Finanças': Coins,
      'Geral': Flag,
    }
    const Icon = iconMap[category] || Flag
    return <Icon className="h-4 w-4 flex-shrink-0" color={color} />
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      {/* Banner colapsável - sempre visível */}
      <Card className="mx-3 mt-3 overflow-hidden border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flag className="h-5 w-5 text-amber-600" />
              <h2 className="font-bold text-foreground">
                Projetos & metas de vida
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setBannerOpen(!bannerOpen)}>
              {bannerOpen ? <CaretUp className="h-4 w-4" /> : <CaretDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {bannerOpen && (
            <div className="space-y-4">
              {projects.length === 0 && !showForm ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Comece por um objetivo que importa para você agora
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.filter(c => c !== 'Geral').map(cat => {
                      const examples: Record<string, string> = {
                        'Saúde': 'Exercício, dieta, sono',
                        'Idioma': 'Inglês, espanhol...',
                        'Arte': 'Desenho, música, escrita',
                        'Finanças': 'Reserva, investimento',
                      }
                      return (
                        <button
                          key={cat}
                          onClick={() => createFromCategory(cat)}
                          className={cn(
                            'p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                            'flex flex-col gap-2'
                          )}
                          style={{ borderColor: getCategoryColor(cat) }}
                        >
                          <ColoredIcon category={cat} />
                          <div>
                            <p className="font-semibold text-sm">{cat}</p>
                            <p className="text-xs text-muted-foreground">{examples[cat]}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <Button
                    onClick={() => createFromCategory('Geral')}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" /> Criar projeto personalizado
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Adicione novos projetos em diferentes áreas para acompanhar seu progresso.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.filter(c => c !== 'Geral').map(cat => {
                      const examples: Record<string, string> = {
                        'Saúde': 'Exercício, dieta, sono',
                        'Idioma': 'Inglês, espanhol...',
                        'Arte': 'Desenho, música, escrita',
                        'Finanças': 'Reserva, investimento',
                      }
                      return (
                        <button
                          key={cat}
                          onClick={() => createFromCategory(cat)}
                          className={cn(
                            'p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                            'flex flex-col gap-2'
                          )}
                          style={{ borderColor: getCategoryColor(cat) }}
                        >
                          <ColoredIcon category={cat} />
                          <div>
                            <p className="font-semibold text-sm">{cat}</p>
                            <p className="text-xs text-muted-foreground">{examples[cat]}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header + Botão Novo */}
      <div className="flex items-center justify-between mx-3">
        <div>
          <h1 className="text-xl font-bold">Meus projetos</h1>
          <p className="text-sm text-muted-foreground">{projects.length} projeto(s)</p>
        </div>
        <Button onClick={openNewForm} className="gap-2 bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mx-3 overflow-x-auto pb-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-all',
              filter === f.id
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Formulário de projeto */}
      {showForm && (
        <Card className="mx-3 mt-3">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {editingProject ? 'Editar projeto' : 'Novo projeto'}
              </Label>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowForm(false)}>
                <Trash size={14} />
              </Button>
            </div>
            <div className="space-y-1">
              <Label>Título</Label>
              <Input
                placeholder="Ex: Aprender inglês"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label>Categoria</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowCategoryManager(true)} className="h-6 text-xs">
                  Gerenciar
                </Button>
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {allCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Prioridade</Label>
              <div className="flex gap-2">
                {(['alta', 'media', 'baixa'] as const).map(p => (
                  <Button
                    key={p}
                    variant={formData.priority === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={cn(
                      'capitalize',
                      p === 'alta' && formData.priority === p && 'bg-red-600 hover:bg-red-700',
                      p === 'media' && formData.priority === p && 'bg-amber-600 hover:bg-amber-700',
                      p === 'baixa' && formData.priority === p && 'bg-green-600 hover:bg-green-700',
                    )}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Prazo (opcional)</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveProject} className="flex-1 bg-amber-600 hover:bg-amber-700">Salvar</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <Card className="mx-3 mt-3">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Gerenciar Categorias</Label>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCategoryManager(false)}>
                <Trash size={14} />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Adicionar nova categoria</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da categoria"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                />
                <Button onClick={addCategory} size="sm">Add</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Categorias existentes</Label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(cat => (
                  <Badge 
                    key={cat} 
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {cat}
                    <button
                      onClick={() => removeCategory(cat)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Categorias padrão não podem ser removidas.</p>
              <p>Projetos existentes manterão a categoria ao removê-la.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {projects.length === 0 && !showForm && (
        <div className="mx-3 mt-3">
          {/* Conteúdo movido para o banner colapsável */}
        </div>
      )}

      {/* Cards de projeto */}
      {filteredProjects.length > 0 && (
        <div className="space-y-3 mx-3">
          {filteredProjects.map(p => {
            const color = getCategoryColor(p.category)
            const projectSprints = sprints.filter(s => s.projectId === p.id || s.name === `Projeto #${p.id}`)
            const totalSprints = projectSprints.length
            const completedSprints = projectSprints.filter(s => s.status === 'DONE').length
            const sprintProgress = totalSprints > 0 ? Math.round((completedSprints / totalSprints) * 100) : 0
            
            return (
              <Card key={p.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: color }}>
                <div style={{ height: 3, background: color, width: `${sprintProgress}%` }} />
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <ColoredIcon category={p.category} />
                      <p className="font-semibold text-sm truncate">{p.title}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditForm(p)}>
                        <PencilSimple size={12} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={`/dashboard/sprint?projectId=${p.id}`}>
                          <Rocket size={12} />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteProject(p.id)}>
                        <Trash size={12} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {p.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {p.priority}
                    </Badge>
                    {p.deadline && (
                      <Badge variant="outline" className="text-[10px]">
                        {new Date(p.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={sprintProgress} className="h-1.5 flex-1" />
                    <span className="text-xs font-mono text-muted-foreground">
                      {totalSprints > 0 ? `${completedSprints}/${totalSprints}` : '0/0'} ({sprintProgress}%)
                    </span>
                  </div>

                  {p.milestones && p.milestones.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      {p.milestones.map((m, idx) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            const lista = p.milestones?.map((milestone, i) => 
                              i === idx ? { ...milestone, done: !milestone.done } : milestone
                            ) || []
                            const updated = projects.map(proj => 
                              proj.id === p.id ? { ...proj, milestones: lista } : proj
                            )
                            setProjects(updated)
                            saveStorage(KEY_PROJECTS, updated)
                          }}
                          className={cn(
                            'h-3 w-3 rounded-full border-2 transition-all',
                            m.done 
                              ? 'bg-green-500 border-green-500' 
                              : 'bg-muted border-muted-foreground hover:border-green-500'
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {p.milestones && p.milestones.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs"
                      onClick={() => {
                        const nextMilestone = p.milestones?.find(m => !m.done)
                        if (!nextMilestone) return
                        const lista = p.milestones?.map(m => 
                          m.id === nextMilestone.id ? { ...m, done: true } : m
                        ) || []
                        const updated = projects.map(proj => 
                          proj.id === p.id ? { ...proj, milestones: lista } : proj
                        )
                        setProjects(updated)
                        saveStorage(KEY_PROJECTS, updated)
                      }}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Próxima etapa
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
