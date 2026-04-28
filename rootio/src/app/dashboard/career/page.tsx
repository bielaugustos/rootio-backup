'use client'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { storage, saveStorage, todayISO } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageSkeleton } from '@/components/PageSkeleton'
import { NbEmptyState } from '@/components/NbEmptyState'
import {
  Briefcase, GraduationCap, Star, Shield,
  Plus, Trash, PencilSimple, FileText,
  ArrowRight, Download, ArrowClockwise, CheckCircle,
  XCircle, BookOpen, Video, Article, ArrowCircleRight,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { CareerOnboarding, CareerLearn, CareerSkill } from '@/types'

const KEY_ONBOARDING = 'io_career_onboarding'
const KEY_LEARNS = 'io_career_learns'
const KEY_SKILLS = 'io_career_skills'

const ONBOARDING_VAZIO: CareerOnboarding = {
  momento: null,
  area: null,
  cargo: null,
  objetivo: null,
  cv: { exp: '', edu: '', extra: '' },
  extraGoals: [],
  pct: 0,
}

const MOMENTOS = [
  { id: 'primeiro-emprego', label: 'Estou buscando meu primeiro emprego' },
  { id: 'mudar-area', label: 'Quero mudar de área' },
  { id: 'crescer', label: 'Já trabalho e quero crescer' },
  { id: 'freelance', label: 'Quero trabalhar por conta própria' },
  { id: 'nao-sei', label: 'Ainda não sei ao certo' },
]

const AREAS = [
  'Tecnologia', 'Saúde', 'Educação', 'Comunicação',
  'Negócios', 'Direito', 'Arte & Design', 'Engenharia', 'Ciências', 'Outro'
]

const CARGOS: Record<string, string[]> = {
  'Tecnologia': ['Desenvolvedor', 'Designer UX', 'Analista de Dados', 'QA', 'Product Manager'],
  'Saúde': ['Enfermeiro', 'Técnico em Saúde', 'Psicólogo', 'Nutricionista', 'Fisioterapeuta'],
  'Educação': ['Professor', 'Pedagogo', 'Instrutor', 'Tutor', 'Coordenador'],
  'Comunicação': ['Jornalista', 'Redator', 'Social Media', 'Relações Públicas', 'Publicitário'],
  'Negócios': ['Analista', 'Consultor', 'Gestor de Projetos', 'Empreendedor', 'Vendedor'],
  'Direito': ['Advogado', 'Assistente Jurídico', 'Paralegal', 'Analista Jurídico', 'Consultor'],
  'Arte & Design': ['Designer Gráfico', 'Ilustrador', 'Motion Designer', 'Art Director', 'Fotógrafo'],
  'Engenharia': ['Engenheiro Civil', 'Eng. de Software', 'Eng. Mecânico', 'Técnico', 'Projetista'],
  'Ciências': ['Pesquisador', 'Analista', 'Biólogo', 'Químico', 'Estatístico'],
  'Outro': ['Profissional Autônomo', 'Assistente', 'Analista', 'Coordenador', 'Consultor'],
}

const TIPOS = ['Curso', 'Livro', 'Artigo', 'Documentário'] as const

const TIPOS_COLORS: Record<string, string> = {
  'Curso': 'bg-secondary text-secondary-foreground',
  'Livro': 'bg-secondary text-secondary-foreground',
  'Artigo': 'bg-secondary text-secondary-foreground',
  'Documentário': 'bg-secondary text-secondary-foreground',
}

const SUGESTOES = [
  'Excel', 'Word', 'Inglês', 'Comunicação', 'Gestão de tempo',
  'Python', 'JavaScript', 'Figma', 'Atendimento', 'Vendas',
]

const EXTRA_GOALS = [
  'Certificação', 'Idioma', 'Portfólio', 'Networking', 'Liderança', 'empreender'
]

function calcPct(cv: CareerOnboarding['cv'], skills: CareerSkill[], objetivo: string | null): number {
  let pts = 0
  if (objetivo) pts += 20
  if (cv?.exp) pts += 25
  if (cv?.edu) pts += 25
  if (skills.length) pts += 15
  if (cv?.extra) pts += 15
  return pts
}

function gerarObjetivo(momento: string, cargo: string, area: string): string {
  const t: Record<string, string> = {
    'primeiro-emprego': `Profissional em início de carreira em ${area}, buscando oportunidade como ${cargo} para aplicar meu potencial e aprender na prática.`,
    'mudar-area': `Profissional em transição para ${area}, buscando atuar como ${cargo} com foco em aprendizado contínuo.`,
    'crescer': `Profissional em ${area} buscando crescimento como ${cargo} em ambiente que valorize autonomia e impacto.`,
    'freelance': `Profissional independente em ${area} oferecendo serviços como ${cargo} com foco em qualidade e resultado.`,
    'nao-sei': `Profissional explorando oportunidades em ${area} com abertura para aprender e contribuir como ${cargo}.`,
  }
  return t[momento] || t['nao-sei']
}

export default function CareerPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CareerPageContent />
    </Suspense>
  )
}

function CareerPageContent() {
  const [onboarding, setOnboarding] = useState<CareerOnboarding>(ONBOARDING_VAZIO)
  const [etapa, setEtapa] = useState(0)
  const [learns, setLearns] = useState<CareerLearn[]>([])
  const [skills, setSkills] = useState<CareerSkill[]>([])
  const [showAddLearn, setShowAddLearn] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [loading, setLoading] = useState(true)
  const [novaLearn, setNovaLearn] = useState({
    title: '',
    type: 'Curso' as const,
    area: '',
    status: 'Quero',
    link: '',
    showOnHome: true
  })
  const [novaSkill, setNovaSkill] = useState('')
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [cargoPersonalizado, setCargoPersonalizado] = useState('')

  useEffect(() => {
    setOnboarding(storage<CareerOnboarding>(KEY_ONBOARDING, ONBOARDING_VAZIO))
    setLearns(storage<CareerLearn[]>(KEY_LEARNS, []))
    setSkills(storage<CareerSkill[]>(KEY_SKILLS, []))
    setLoading(false)
    
    if (tabParam === 'aprendizado') {
      setShowAddLearn(true)
    }
  }, [])

  useEffect(() => {
    if (onboarding.momento && onboarding.area && onboarding.cargo) {
      const pct = calcPct(onboarding.cv, skills, onboarding.objetivo)
      const updated = { ...onboarding, pct }
      setOnboarding(updated)
      saveStorage(KEY_ONBOARDING, updated)
    }
  }, [skills, onboarding.cv, onboarding.objetivo])

  function handleMomentoSelect(momentoId: string) {
    const updated = { ...onboarding, momento: momentoId }
    setOnboarding(updated)
    setEtapa(1)
  }

  function handleAreaSelect(area: string) {
    const updated = { ...onboarding, area }
    setOnboarding(updated)
    setEtapa(2)
  }

  function handleCargoSelect(cargo: string) {
    const updated = { 
      ...onboarding, 
      cargo,
      objetivo: gerarObjetivo(onboarding.momento!, cargo, onboarding.area!)
    }
    setOnboarding(updated)
    setEtapa(3)
    saveStorage(KEY_ONBOARDING, updated)
  }

  function updateCV(field: 'exp' | 'edu' | 'extra', value: string) {
    const updated = { ...onboarding, cv: { ...onboarding.cv, [field]: value } }
    setOnboarding(updated)
    saveStorage(KEY_ONBOARDING, updated)
  }

  function toggleExtraGoal(goal: string) {
    const goals = onboarding.extraGoals?.includes(goal)
      ? onboarding.extraGoals.filter(g => g !== goal)
      : [...(onboarding.extraGoals || []), goal]
    const updated = { ...onboarding, extraGoals: goals }
    setOnboarding(updated)
    saveStorage(KEY_ONBOARDING, updated)
  }

  function recomecar() {
    saveStorage(KEY_ONBOARDING, ONBOARDING_VAZIO)
    setOnboarding(ONBOARDING_VAZIO)
    setEtapa(0)
  }

  function addLearn() {
    if (!novaLearn.title.trim()) return
    const novo: CareerLearn = {
      id: Date.now(),
      title: novaLearn.title,
      type: novaLearn.type,
      area: novaLearn.area,
      status: novaLearn.status.toLowerCase() as CareerLearn['status'],
      link: novaLearn.link || undefined,
      showOnHome: novaLearn.showOnHome,
      createdAt: todayISO(),
    }
    const lista = [novo, ...learns]
    setLearns(lista)
    saveStorage(KEY_LEARNS, lista)
    setNovaLearn({ title: '', type: 'Curso', area: '', status: 'Quero', link: '', showOnHome: true })
    setShowAddLearn(false)
  }

  function deleteLearn(id: number) {
    const lista = learns.filter(l => l.id !== id)
    setLearns(lista)
    saveStorage(KEY_LEARNS, lista)
  }

  function advanceLearnStatus(id: number) {
    const learn = learns.find(l => l.id === id)
    if (!learn) return
    const statusOrder = ['Quero', 'Em andamento', 'Concluído'] as const
    const currentIndex = statusOrder.indexOf(learn.status.charAt(0).toUpperCase() + learn.status.slice(1) as any)
    if (currentIndex >= statusOrder.length - 1) return
    const newStatus = statusOrder[currentIndex + 1].toLowerCase() as any
    const lista = learns.map(l => l.id === id ? { ...l, status: newStatus } : l)
    setLearns(lista)
    saveStorage(KEY_LEARNS, lista)
  }

  function addSkill() {
    if (!novaSkill.trim()) return
    if (skills.find(s => s.name === novaSkill)) return
    const nova: CareerSkill = { id: Date.now(), name: novaSkill, level: 50, createdAt: todayISO() }
    const lista = [...skills, nova]
    setSkills(lista)
    saveStorage(KEY_SKILLS, lista)
    setNovaSkill('')
    setShowAddSkill(false)
  }

  function deleteSkill(id: number) {
    const lista = skills.filter(s => s.id !== id)
    setSkills(lista)
    saveStorage(KEY_SKILLS, lista)
  }

  function updateSkillLevel(id: number, level: number) {
    const lista = skills.map(s => s.id === id ? { ...s, level } : s)
    setSkills(lista)
    saveStorage(KEY_SKILLS, lista)
  }

  const sugestoesFiltradas = SUGESTOES.filter(s => !skills.find(skill => skill.name === s))

  return loading ? <PageSkeleton /> : (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      <Tabs defaultValue={tabParam || 'agente'} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="agente">Agente</TabsTrigger>
          <TabsTrigger value="aprendizado">Aprendizado</TabsTrigger>
          <TabsTrigger value="habilidades">Habilidades</TabsTrigger>
        </TabsList>

        <TabsContent value="agente" className="space-y-4 mt-4">
          {etapa === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Qual é o seu momento profissional agora?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOMENTOS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleMomentoSelect(m.id)}
                    className="w-full p-3 text-left rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                  >
                    {m.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {etapa === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Em qual área você quer atuar?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {AREAS.map(a => (
                  <button
                    key={a}
                    onClick={() => handleAreaSelect(a)}
                    className="w-full p-3 text-left rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {etapa === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Qual cargo você prefere?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(CARGOS[onboarding.area!] || []).map(c => (
                    <button
                      key={c}
                      onClick={() => handleCargoSelect(c)}
                      className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-accent transition-colors text-sm"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Ou digite seu cargo</Label>
                  <Input
                    placeholder="Seu cargo..."
                    value={cargoPersonalizado}
                    onChange={e => setCargoPersonalizado(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && cargoPersonalizado && handleCargoSelect(cargoPersonalizado)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {etapa === 3 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Currículo</CardTitle>
                <div className="flex gap-2">
                  {onboarding.pct >= 40 && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" /> Exportar PDF
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={recomecar}>
                    <ArrowClockwise className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Progress value={onboarding.pct} className="flex-1 h-2" />
                  <span className="text-sm font-mono">{onboarding.pct}%</span>
                </div>

                <div className="p-3 rounded-lg bg-muted border">
                  <p className="text-xs font-semibold text-muted-foreground">OBJETIVO PROFISSIONAL</p>
                  <p className="text-sm mt-1">{onboarding.objetivo}</p>
                </div>

                <div className="space-y-2">
                  <Label>Experiência profissional</Label>
                  <Input
                    placeholder="Cargo, empresa, período..."
                    value={onboarding.cv?.exp || ''}
                    onChange={e => updateCV('exp', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Formação</Label>
                  <Input
                    placeholder="Curso, instituição, ano..."
                    value={onboarding.cv?.edu || ''}
                    onChange={e => updateCV('edu', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Habilidades</Label>
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {skills.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada</span>
                    ) : (
                      skills.map(s => (
                        <Badge key={s.id} variant="secondary" className="text-xs">
                          {s.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Diferenciais</Label>
                  <Input
                    placeholder="Projetos, idiomas, certificações..."
                    value={onboarding.cv?.extra || ''}
                    onChange={e => updateCV('extra', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2">Objetivos adicionais</Label>
                  <div className="flex flex-wrap gap-2">
                    {EXTRA_GOALS.map(g => (
                      <button
                        key={g}
                        onClick={() => toggleExtraGoal(g)}
                        className={cn(
                          'px-2 py-1 rounded-full text-xs border transition-colors',
                          onboarding.extraGoals?.includes(g)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary'
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="aprendizado" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Conteúdos ({learns.length})</h3>
            <Button size="sm" onClick={() => setShowAddLearn(true)}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>

          {showAddLearn && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="learn-title">Título do conteúdo</Label>
                  <Input
                    id="learn-title"
                    placeholder="Ex: Curso de Python"
                    value={novaLearn.title}
                    onChange={e => setNovaLearn({ ...novaLearn, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="flex gap-2">
                    {TIPOS.map(t => (
                      <Button
                        key={t}
                        size="sm"
                        variant={novaLearn.type === t ? 'default' : 'outline'}
                        onClick={() => setNovaLearn({ ...novaLearn, type: t as typeof novaLearn.type })}
                        className={cn(TIPOS_COLORS[t], novaLearn.type === t && 'ring-2 ring-offset-1')}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    {(['Quero', 'Em andamento', 'Concluído'] as const).map(s => (
                      <Button
                        key={s}
                        size="sm"
                        variant={novaLearn.status.toLowerCase() === s.toLowerCase() ? 'default' : 'outline'}
                        onClick={() => setNovaLearn({ ...novaLearn, status: s.toLowerCase() as typeof novaLearn.status })}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learn-area">Área (opcional)</Label>
                  <Input
                    id="learn-area"
                    placeholder="Ex: Tecnologia"
                    value={novaLearn.area}
                    onChange={e => setNovaLearn({ ...novaLearn, area: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-on-home" className="cursor-pointer">
                    Mostrar na tela inicial
                  </Label>
                  <Switch
                    id="show-on-home"
                    checked={novaLearn.showOnHome}
                    onCheckedChange={checked => setNovaLearn({ ...novaLearn, showOnHome: checked })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={addLearn} className="flex-1">Salvar</Button>
                  <Button variant="outline" onClick={() => setShowAddLearn(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {learns.length === 0 ? (
            <NbEmptyState
              icon="📚"
              title="Nenhum aprendizado"
              sub="Adicione cursos, livros ou artigos que quer acompanhar."
              action={{ label: 'Adicionar aprendizado', href: '/dashboard/career?tab=aprendizado' }}
            />
          ) : (
            <div className="space-y-2">
              {learns.map(l => (
                <Card key={l.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{l.title}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge className={cn('text-[10px]', TIPOS_COLORS[l.type])}>{l.type}</Badge>
                        {l.area && <Badge variant="outline" className="text-[10px]">{l.area}</Badge>}
                        <Badge variant={l.status === 'concluído' ? 'default' : 'secondary'} className="text-[10px]">
                          {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                       {l.status !== 'concluído' && (
                         <button
                           style={{
                             height: 40,
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             padding: '13px 16px',
                             background: '#F59E0B',
                             color: '#000',
                             border: '2px solid #111111',
                             borderRadius: 4,
                             boxShadow: '2px 2px 0 0 #111111',
                             fontFamily: 'var(--font-display, sans-serif)',
                             fontWeight: 900,
                             fontSize: 13,
                             textTransform: 'uppercase',
                             letterSpacing: '.04em',
                             cursor: 'pointer',
                             transition: 'all .075s ease',
                           }}
                           onClick={() => advanceLearnStatus(l.id)}
                           title="Avançar status"
                           onMouseEnter={e => {
                             const t = e.currentTarget
                             t.style.boxShadow = 'none'
                             t.style.transform = 'translate(4px,4px)'
                           }}
                           onMouseLeave={e => {
                             const t = e.currentTarget
                             t.style.boxShadow = '2px 2px 0 0 #111111'
                             t.style.transform = ''
                           }}
                           onMouseDown={e => {
                             const t = e.currentTarget
                             t.style.boxShadow = 'none'
                             t.style.transform = 'translate(4px,4px)'
                           }}
                           onMouseUp={e => {
                             const t = e.currentTarget
                             t.style.boxShadow = 'none'
                             t.style.transform = 'translate(4px,4px)'
                           }}
                         >
                          <span>Avançar status</span>
                          <ArrowRight size={14} weight="bold" />
                        </button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteLearn(l.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

          <TabsContent value="habilidades" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Habilidades ({skills.length})</h3>
            <Button size="sm" onClick={() => setShowAddSkill(true)}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>

          {showAddSkill && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Nome da habilidade..."
                  value={novaSkill}
                  onChange={e => setNovaSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill()}
                />
                <div className="flex flex-wrap gap-1">
                  {sugestoesFiltradas.slice(0, 6).map(s => (
                    <Button
                      key={s}
                      size="sm"
                      variant="outline"
                      onClick={() => { setNovaSkill(s); addSkill() }}
                      className="text-xs"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={addSkill} className="flex-1">Salvar</Button>
                  <Button variant="outline" onClick={() => setShowAddSkill(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {skills.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhuma habilidade ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {skills.map(s => (
                <Card key={s.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{s.name}</span>
                        <span className="text-xs font-mono">{s.level}%</span>
                      </div>
                      <Progress value={s.level} className="h-1.5" />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={s.level}
                      onChange={e => updateSkillLevel(s.id, parseInt(e.target.value))}
                      className="w-20"
                    />
                    <Button variant="ghost" size="icon" onClick={() => deleteSkill(s.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
