'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { storage, saveStorage, todayISO } from '@/lib/utils'
import { NbProgress } from '@/components/ui/nb/NbProgress'
import { NbStamp } from '@/components/ui/nb/NbStamp'
import { NbCheck } from '@/components/ui/nb/NbCheck'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Bell, CheckSquare, Cardholder, Target, Books, FirstAid, AirplaneTilt, House } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const OBJETIVOS = [
  { id: 'habits', icon: <CheckSquare size={28} weight="fill" />, label: 'Criar hábitos saudáveis' },
  { id: 'money', icon: <Cardholder size={28} weight="fill" />, label: 'Organizar dinheiro' },
  { id: 'career', icon: <Target size={28} weight="fill" />, label: 'Evoluir na carreira' },
  { id: 'study', icon: <Books size={28} weight="fill" />, label: 'Estudar com ritmo' },
]

const HABITOS_EXEMPLOS = [
  'Beber 2L de água',
  'Exercício físico',
  'Leitura diária',
  'Meditação',
  'Dormir cedo',
  'Alimentação Saudável',
]

const SUGESTOES_HABITO = {
  habits: ['Meditar 10min', 'Beber 2L de água', 'Exercício físico'],
  study: ['Estudar 1 hora', 'Ler 10 páginas', 'Fazer exercícios'],
  career: ['Montar portfólio', 'Atualizar LinkedIn', 'Estudar tecnologias'],
  all: ['Meditar 10min', 'Beber 2L de água', 'Exercício físico'],
}

const META_FINANCEIRA = [
  { id: 'emergency', icon: <FirstAid size={28} weight="fill" />, label: 'Reserva de emergência' },
  { id: 'travel', icon: <AirplaneTilt size={28} weight="fill" />, label: 'Viagem' },
  { id: 'house', icon: <House size={28} weight="fill" />, label: 'Casa própria' },
]

const AVATARES = [
  { id: 'av1', icon: '🌻', label: 'Girassol', cost: 0 },
  { id: 'av2', icon: '👤', label: 'Padrão', cost: 0 },
  { id: 'av3', icon: '⚡', label: 'Raio', cost: 0 },
  { id: 'av4', icon: '🌙', label: 'Lua', cost: 0 },
  { id: 'av5', icon: '🔥', label: 'Fogo', cost: 0 },
  { id: 'av6', icon: '💎', label: 'Diamante', cost: 50 },
  { id: 'av7', icon: '🚀', label: 'Foguete', cost: 100 },
  { id: 'av8', icon: '👑', label: 'Coroa', cost: 300 },
  { id: 'av9', icon: '🆕', label: 'Loja IO', cost: 0, disabled: true },
]

const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

interface OnboardingData {
  nome: string
  objetivos: string[]
  habito: string
  habitoDias: number[]
  habitoFreq: 'diario' | 'semanal' | 'personalizado'
  metaFinanceiraId?: string
  metaFinanceiraValor?: number
  metaFinanceiraPrazo?: string
  avatar: string
}

interface CareerOnboarding {
  momento: string | null
  area: string | null
  cargo: string | null
  objetivo: string | null
  cv: { exp: string; edu: string; extra: string }
  extraGoals: string[]
  pct: number
}

const CAREER_ONBOARDING_VAZIO: CareerOnboarding = {
  momento: null,
  area: null,
  cargo: null,
  objetivo: null,
  cv: { exp: '', edu: '', extra: '' },
  extraGoals: [],
  pct: 0,
}

export default function OnboardingPage() {
  const router = useRouter()
  const { economy, setUsername, setAvatar, addHabit, earnIO } = useAppStore()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    nome: '',
    objetivos: [],
    habito: '',
    habitoDias: [1, 2, 3, 4, 5],
    habitoFreq: 'semanal',
    metaFinanceiraId: undefined,
    metaFinanceiraValor: undefined,
    metaFinanceiraPrazo: undefined,
    avatar: '👤',
  })

  // Cores de background para cada step
  const stepBackgrounds = [
    '#FFD23F', // Step 1: Amarelo
    '#F5EFDF', // Step 2: Bege claro
    '#F5EFDF', // Step 3: Bege claro
    '#F5EFDF', // Step 4: Bege claro
    '#F5EFDF', // Step 5: Bege claro
    '#F59E0B', // Step 6: Ambar
  ]

  useEffect(() => {
    const done = localStorage.getItem('io_onboarding_done')
    if (done === 'true') {
      router.replace('/dashboard')
    }
  }, [router])

  const podeAvançar = () => {
    if (step === 0) return data.nome.trim().length > 0
    if (step === 1) return true
    if (step === 2) return data.habito.trim().length > 0
    if (step === 3) return true
    if (step === 4) return true
    return true
  }

  function handleNext() {
    if (step < 5) {
      setStep(step + 1)
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  function toggleDia(dia: number) {
    const novos = data.habitoDias.includes(dia)
      ? data.habitoDias.filter(d => d !== dia)
      : [...data.habitoDias, dia].sort()
    setData({ ...data, habitoDias: novos })
  }

  function toggleObjetivo(objetivoId: string) {
    const novos = data.objetivos.includes(objetivoId)
      ? data.objetivos.filter(id => id !== objetivoId)
      : [...data.objetivos, objetivoId]
    setData({ ...data, objetivos: novos })
  }

  function finishOnboarding() {
    // 1. Salvar dados básicos
    setUsername(data.nome)
    setAvatar(data.avatar)
    earnIO('input_registro')

    // 2. Criar hábito se preenchido
    if (data.habito) {
      addHabit({
        id: Date.now(),
        name: data.habito,
        priority: 'media' as const,
        freq: data.habitoFreq === 'diario' ? 'diario' as const : 'personalizado' as const,
        days: data.habitoDias,
        pts: 0,
        done: false,
        icon: data.avatar,
        tags: [],
        streak: 0,
        createdAt: todayISO(),
      })
    }

    // 3. Preencher Carreira se selecionou 'career'
    if (data.objetivos.includes('career')) {
      const careerData = {
        ...CAREER_ONBOARDING_VAZIO,
        momento: 'nao-sei',
      }
      saveStorage('io_career_onboarding', careerData)
    }

    // 4. Criar projeto inicial
    let categoria = 'Geral'
    if (data.objetivos.includes('study')) categoria = 'Idioma'
    if (data.objetivos.includes('money')) categoria = 'Finanças'
    if (data.objetivos.includes('career')) categoria = 'Carreira'

    const primeiroProjeto = {
      id: Date.now(),
      title: `Primeiro projeto: ${data.nome}`,
      description: '',
      category: categoria,
      priority: 'media' as const,
      status: 'planejando' as const,
      progress: 0,
      milestones: [],
      createdAt: new Date().toISOString(),
    }

    const projetosExistentes = storage<any[]>('io_projects', [])
    saveStorage('io_projects', [primeiroProjeto, ...projetosExistentes])

    // 5. Marcar onboarding como concluído
    localStorage.setItem('io_onboarding_done', 'true')
    router.replace('/dashboard')
  }

  // Render Step 1
  const renderStep1 = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center mb-8">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-amber-500 border-4 border-black rounded-xl px-6 py-4 shadow-[3px_3px_0_0_#000]">
            <span className="text-2xl font-black">🌻</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[.14em]">
            01 / 06 • INÍCIO
          </span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-4xl font-black uppercase leading-tight mb-4" style={{ fontFamily: 'var(--font-geist)' }}>
          OI!<br />BEM-VINDZ<br />AO ROOTIO.
        </h2>
        <p className="text-xs text-black max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-geist)' }}>
          Hábitos, finanças e carreira num <br/> lugar só. Honesto, aberto,  <br/> gamificado.
        </p>
      </div>

      <div className="mb-8">
        <Label className="mb-3 block max-w-md mx-auto text-xs text-center">Qual seu nome?</Label>
        <Input
          placeholder="Seu nome..."
          value={data.nome}
          onChange={e => setData({ ...data, nome: e.target.value })}
          className="text-sm h-12 transition-shadow duration-200 focus:shadow-nb max-w-md mx-auto"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-4">
        <Button
          onClick={handleNext}
          disabled={!data.nome.trim()}
          className="w-full max-w-md mx-auto"
          variant="io"
        >
          {data.nome.trim() ? 'Começar' : 'Digite seu nome'}
        </Button>

        <Button
          onClick={() => router.push('/auth')}
          className="w-full max-w-md mx-auto"
          variant="io-neutral"
        >
          Já tenho conta
        </Button>
      </div>
    </div>
  )

  // Render Step 2
  const renderStep2 = () => {
    const progressValue = (2 / 6) * 100

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button size="icon" variant="io-neutral" onClick={handleBack}>
            <ArrowLeft size={16} />
          </Button>
          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[.14em]">
            02 / 06 • OBJETIVOS
          </span>
        </div>

        {/* Barra de progresso estilo card Hoje */}
        <div className="mb-8">
          <div
            style={{
              height: 14,
              background: '#fff',
              border: '2.5px solid #111111',
              boxShadow: '2px 2px 0 0 #111111',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '0 auto 0 0',
                width: `${progressValue}%`,
                background: '#7A7268',
                borderRight: progressValue < 100 ? '2px solid #111111' : 'none',
                transition: 'width .4s ease',
              }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-4xl font-black uppercase leading-tight mb-4" style={{ fontFamily: 'var(--font-geist)' }}>
            O QUE VOCÊ QUER PLANTAR AQUI?
          </h2>
          <p className="text-sm text-muted-foreground mb-6" style={{ fontFamily: 'var(--font-geist)' }}>
            Pode escolher mais de 1. Dá pra mudar depois.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {OBJETIVOS.map(objetivo => (
            <button
              key={objetivo.id}
              onClick={() => toggleObjetivo(objetivo.id)}
              className={cn(
                'w-full p-5 border-2 border-black text-left relative',
                'shadow-[2px_2px_0_0_#000]',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-75 rounded-[4px]',
                data.objetivos.includes(objetivo.id)
                  ? 'bg-[#7A7268] text-[#F59E0B]'
                  : 'bg-white hover:bg-amber-50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {objetivo.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-[.04em] leading-tight">
                      {objetivo.label.split(' ').slice(0, 2).join(' ')}
                    </span>
                    <span className="font-bold text-sm tracking-[.04em] leading-tight mt-1">
                      {objetivo.label.split(' ').slice(2).join(' ')}
                    </span>
                  </div>
                </div>
                {data.objetivos.includes(objetivo.id) && (
                  <NbCheck checked={true} size={20} />
                )}
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full"
          variant="io"
        >
          Continuar • {data.objetivos.length} Escolhidos
        </Button>
      </div>
    )
  }

  // Render Step 3
  const renderStep3 = () => {
    const progressValue = (3 / 6) * 100
    const sugestoes = data.objetivos.length > 0
      ? data.objetivos.flatMap(o => SUGESTOES_HABITO[o as keyof typeof SUGESTOES_HABITO] || [])
      : SUGESTOES_HABITO.all

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button size="icon" variant="io-neutral" onClick={handleBack}>
            <ArrowLeft size={16} />
          </Button>
          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[.14em]">
            03 / 06 • HÁBITO
          </span>
        </div>

        {/* Barra de progresso estilo card Hoje */}
        <div className="mb-8">
          <div
            style={{
              height: 14,
              background: '#fff',
              border: '2.5px solid #111111',
              boxShadow: '2px 2px 0 0 #111111',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '0 auto 0 0',
                width: `${progressValue}%`,
                background: '#7CE577',
                borderRight: progressValue < 100 ? '2px solid #111111' : 'none',
                transition: 'width .4s ease',
              }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-4xl font-black uppercase leading-tight mb-4" style={{ fontFamily: 'var(--font-geist)' }}>
            ESCOLHA UM HÁBITO PRA COMEÇAR.
          </h2>
          <p className="text-sm text-muted-foreground mb-6" style={{ fontFamily: 'var(--font-geist)' }}>
            A raiz nasce pequena. Um só • o resto vem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {sugestoes.map(habito => (
            <button
              key={habito}
              onClick={() => setData({ ...data, habito })}
              className={cn(
                'w-full p-5 border-2 border-black text-left relative flex items-center justify-between',
                'shadow-[2px_2px_0_0_#000]',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-75 rounded-[4px]',
                data.habito === habito
                  ? 'bg-[#F5EFDF] text-[#F59E0B]'
                  : 'bg-white hover:bg-amber-50'
              )}
            >
              <span className="font-bold text-sm tracking-[.04em]">{habito}</span>
              {data.habito === habito && (
                <NbCheck checked={true} size={20} />
              )}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <Label className="mb-3 block max-w-md mx-auto text-xs text-center">OU DIGITE SEU PRÓPRIO HÁBITO</Label>
          <Input
            placeholder="Ex: Meditar 10min"
            value={data.habito}
            onChange={e => setData({ ...data, habito: e.target.value })}
            className="text-sm h-12 transition-shadow duration-200 focus:shadow-nb max-w-md mx-auto"
          />
        </div>

        {/* Frequência */}
        <div className="mb-8">
          <Label className="mb-3 block max-w-md mx-auto text-xs text-center">Frequência</Label>
          <div className="flex gap-2 flex-wrap justify-center">
            {[
              { id: 'diario', label: 'Diário' },
              { id: 'semanal', label: 'Semanal' },
            ].map(f => {
              const active = data.habitoFreq === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setData({ 
                      ...data, 
                      habitoFreq: f.id as any,
                      habitoDias: f.id === 'diario' ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]
                    })
                  }}
                  className="px-4 py-2 border-2 border-black text-sm font-bold cursor-pointer transition-all duration-75 rounded-[4px]"
                  style={{
                    background: active ? '#111' : '#fff',
                    color: active ? '#fff' : '#111',
                    boxShadow: active ? '2px 2px 0 0 #111' : 'none',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
            <button
              onClick={() => setData({ ...data, habitoFreq: 'personalizado' })}
              className="px-4 py-2 border-2 border-black text-sm font-bold cursor-pointer transition-all duration-75 rounded-[4px]"
              style={{
                background: data.habitoFreq === 'personalizado' ? '#F59E0B' : '#fff',
                color: data.habitoFreq === 'personalizado' ? '#fff' : '#111',
                boxShadow: data.habitoFreq === 'personalizado' ? '2px 2px 0 0 #111' : 'none',
              }}
            >
              Personalizado
            </button>
          </div>

          {/* Grid de dias — só aparece se personalizado */}
          {data.habitoFreq === 'personalizado' && (
            <div className="grid grid-cols-7 gap-1 mt-3 max-w-sm mx-auto">
              {DIAS.map((dia, i) => {
                const active = data.habitoDias.includes(i)
                return (
                  <button
                    key={i}
                    onClick={() => toggleDia(i)}
                    className="aspect-square border-2 border-black text-xs font-bold cursor-pointer transition-all duration-75 rounded-[4px] flex flex-col items-center justify-center"
                    style={{
                      background: active ? '#7CE577' : '#fff',
                      color: active ? '#111' : 'rgba(0,0,0,.45)',
                      boxShadow: active ? '2px 2px 0 0 #111' : 'none',
                    }}
                  >
                    <span>{dia}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!data.habito.trim()}
          className="w-full bg-[#F5EFDF]"
          variant="io"
        >
          Plantar hábito
        </Button>
      </div>
    )
  }

  // Render Step 4
  const renderStep4 = () => {
    const metaSelecionada = META_FINANCEIRA.find(m => m.id === data.metaFinanceiraId)
    const valorPadrao = data.metaFinanceiraValor || 3000
    const meses = data.metaFinanceiraPrazo === '6' ? 6 : 12
    const valorMensal = Math.round(valorPadrao / meses)
    const progressValue = (4 / 6) * 100

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button size="icon" variant="io-neutral" onClick={handleBack}>
            <ArrowLeft size={16} />
          </Button>
          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[.14em]">
            04 / 06 • META $
          </span>
        </div>

        {/* Barra de progresso estilo card Hoje */}
        <div className="mb-8">
          <div
            style={{
              height: 14,
              background: '#fff',
              border: '2.5px solid #111111',
              boxShadow: '2px 2px 0 0 #111111',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '0 auto 0 0',
                width: `${progressValue}%`,
                background: '#F59E0B',
                borderRight: progressValue < 100 ? '2px solid #111111' : 'none',
                transition: 'width .4s ease',
              }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-4xl font-black uppercase leading-tight mb-4" style={{ fontFamily: 'var(--font-geist)' }}>
            E UMA META DE DINHEIRO?
          </h2>
          <p className="text-sm text-muted-foreground mb-6" style={{ fontFamily: 'var(--font-geist)' }}>
            Começa pequeno. Um número concreto vale mais que ouro.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {META_FINANCEIRA.map(meta => (
            <button
              key={meta.id}
              onClick={() => setData({ ...data, metaFinanceiraId: meta.id })}
              className={cn(
                'w-full p-5 border-2 border-black text-left relative flex items-center justify-between',
                'shadow-[2px_2px_0_0_#000]',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-75 rounded-[4px]',
                data.metaFinanceiraId === meta.id
                  ? 'bg-[#F5EFDF] text-[#F59E0B]'
                  : 'bg-white hover:bg-amber-50'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {meta.icon}
                </div>
                <span className="font-bold text-sm tracking-[.04em]">{meta.label}</span>
              </div>
              {data.metaFinanceiraId === meta.id && (
                <NbCheck checked={true} size={20} />
              )}
            </button>
          ))}
        </div>

        {data.metaFinanceiraId && (
          <div className="p-6 border-2 border-black rounded-[4px] bg-amber-50 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[.14em]">
                VALOR DA META
              </span>
              <span className="font-display text-3xl font-bold">R${valorPadrao.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[.14em]">
                EM {meses} MESES
              </span>
              <span className="font-display text-xl font-bold text-amber-500">
                R${valorMensal.toLocaleString()}/MÊS
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleNext}
          className="w-full"
          variant="io"
        >
          Definir meta
        </Button>
      </div>
    )
  }

  // Render Step 5
  const renderStep5 = () => {
    const progressValue = (5 / 6) * 100

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button size="icon" variant="io-neutral" onClick={handleBack}>
            <ArrowLeft size={16} />
          </Button>
          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[.14em]">
            05 / 06 • SEU AVATAR
          </span>
        </div>

        {/* Barra de progresso estilo card Hoje */}
        <div className="mb-8">
          <div
            style={{
              height: 14,
              background: '#fff',
              border: '2.5px solid #111111',
              boxShadow: '2px 2px 0 0 #111111',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '0 auto 0 0',
                width: `${progressValue}%`,
                background: '#9B7BFF',
                borderRight: progressValue < 100 ? '2px solid #111111' : 'none',
                transition: 'width .4s ease',
              }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-4xl font-black uppercase leading-tight mb-4" style={{ fontFamily: 'var(--font-geist)' }}>
            ESCOLHE SUA CARA
          </h2>
          <p className="text-sm text-muted-foreground mb-6" style={{ fontFamily: 'var(--font-geist)' }}>
            Todos começam com um Girassol. Outros desbloqueiam com IO.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {AVATARES.map(avatar => {
            const podeUsar = !avatar.disabled && (avatar.cost === 0 || economy.saldo_io >= avatar.cost)
            return (
              <button
                key={avatar.id}
                onClick={() => podeUsar && setData({ ...data, avatar: avatar.icon })}
                disabled={!podeUsar}
                className={cn(
                  'aspect-square flex flex-col items-center justify-center gap-2',
                  'border-2 border-black relative',
                  'shadow-[2px_2px_0_0_#000]',
                  'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                  'transition-all duration-75 rounded-[4px]',
                  data.avatar === avatar.icon
                    ? 'bg-[#9B7BFF] text-black'
                    : podeUsar
                    ? 'bg-white hover:bg-amber-50'
                    : 'bg-gray-100 opacity-50 cursor-not-allowed'
                )}
              >
                <span className="text-5xl">{avatar.icon}</span>
                <span className="font-mono text-[10px] font-bold tracking-[.04em]">
                  {avatar.label}
                </span>
                {avatar.cost > 0 && !avatar.disabled && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 font-mono text-[10px] font-bold text-muted-foreground">
                    <span className="text-xs">{avatar.cost} IO</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <Button
          onClick={handleNext}
          className="w-full bg-[#9B7BFF]"
          variant="io"
        >
          É esse aí
        </Button>
      </div>
    )
  }

  // Render Step 6
  const renderStep6 = () => {
    const metaSelecionada = META_FINANCEIRA.find(m => m.id === data.metaFinanceiraId)

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button size="icon" variant="io-neutral" onClick={handleBack}>
            <ArrowLeft size={16} />
          </Button>
          <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[.14em]">
            06 / 06 • PRONTO
          </span>
        </div>

        {/* Barra de progresso estilo card Hoje */}
        <div className="mb-8">
          <div
            style={{
              height: 14,
              background: '#fff',
              border: '2.5px solid #111111',
              boxShadow: '2px 2px 0 0 #111111',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '0 auto 0 0',
                width: '100%',
                background: '#7CE577',
                borderRight: 'none',
                transition: 'width .4s ease',
              }}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <span
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: '#FF6B6B',
              color: '#000',
              fontFamily: 'var(--font-geist), sans-serif',
              fontWeight: 900,
              fontSize: '24px',
              border: '2px solid black',
              borderRadius: '4px',
              boxShadow: 'black 3px 3px 0 0',
              transform: 'rotate(-4deg)',
              letterSpacing: '.04em',
              textTransform: 'uppercase',
            }}
          >
            +10 IO!
          </span>
        </div>

        <h2 className="text-4xl font-black uppercase leading-tight mb-4" style={{ fontFamily: 'var(--font-geist)' }}>
          PRONTO, {data.nome.toUpperCase()}.
        </h2>
        <p className="text-sm text-black mb-8" style={{ fontFamily: 'var(--font-geist)' }}>
          Sua raiz tá plantada. A gente te encontra pra {data.habito || 'começar'}.
        </p>

        <div className="space-y-4 mb-8">
          {data.habito && (
            <div className="p-5 border-2 border-black rounded-[4px] bg-amber-50 text-left flex items-center gap-4">
              <div className="flex-shrink-0" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={28} weight="fill" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-sm uppercase tracking-[.04em] block">
                  {data.habito}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground mt-1 block">
                  {data.habitoDias.length}×/sem
                </span>
              </div>
            </div>
          )}

          {data.metaFinanceiraId && metaSelecionada && (
            <div className="p-5 border-2 border-black rounded-[4px] bg-amber-50 text-left flex items-center gap-4">
              <div className="flex-shrink-0" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {metaSelecionada.icon}
              </div>
              <div className="flex-1">
                <span className="font-bold text-sm uppercase tracking-[.04em] block">
                  Meta R${data.metaFinanceiraValor || 3000}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground mt-1 block">
                  {data.metaFinanceiraPrazo || 6} MESES
                </span>
              </div>
            </div>
          )}

          <div className="p-5 border-2 border-black rounded-[4px] bg-amber-50 text-left flex items-center gap-4">
            <div className="flex-shrink-0" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-2xl">{data.avatar}</span>
            </div>
            <div className="flex-1">
              <span className="font-bold text-sm uppercase tracking-[.04em] block">
                Avatar {AVATARES.find(a => a.icon === data.avatar)?.label || 'Padrão'}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground mt-1 block">
                NV 1
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={finishOnboarding}
            className="w-full"
            variant="io"
            style={{ backgroundColor: '#F59E0B' }}
          >
            Ir pro hoje
          </Button>

          <Button
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission()
              }
              finishOnboarding()
            }}
            className="w-full justify-between"
            variant="io"
            style={{ backgroundColor: '#FFB39B', color: '#000' }}
          >
            <span className="flex-1 text-center">Ativar notificações</span>
            <Bell size={16} weight="bold" style={{ color: '#000' }} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 overflow-hidden transition-colors duration-500 ease-in-out"
      style={{ background: stepBackgrounds[step] }}
    >
      <div className="w-full max-w-2xl mx-auto">
        {step === 0 && renderStep1()}
        {step === 1 && renderStep2()}
        {step === 2 && renderStep3()}
        {step === 3 && renderStep4()}
        {step === 4 && renderStep5()}
        {step === 5 && renderStep6()}
      </div>
    </div>
  )
}