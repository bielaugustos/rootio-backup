'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { getNivel, getProgresso } from '@/lib/io-system'
import { todayLabel, formatBRL, storage, saveStorage } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { PageSkeleton } from '@/components/PageSkeleton'
import {
  Lightning, ArrowRight, CheckSquare, Trophy,
  Coins, TrendUp, CaretRight, Lock, Star,
  Play, Plus, ChartLineUp, Check, CalendarBlank, Lightbulb, BookOpen, Globe,
} from '@phosphor-icons/react'

const PRI_COLORS: Record<string, string> = { alta:'bg-red-500', media:'bg-amber-500', baixa:'bg-green-500' }

export default function HojePage() {
  const { habits, economy, toggleHabit, plan, history } = useAppStore()
  const [expandExtra, setExpandExtra] = useState(false)
  const [loading, setLoading] = useState(true)
  const nivel    = getNivel(economy.xp_total)
  const pctNivel = getProgresso(economy.xp_total)
  const today    = new Date().getDay()
  const hoje     = habits.filter(h => h.days?.includes(today) ?? true)
  const done     = hoje.filter(h => h.done)
  const proximo  = hoje.find(h => !h.done)
  const pct      = hoje.length ? Math.round((done.length/hoje.length)*100) : 0
  const transactions = storage<any[]>('io_fin_transactions', [])
  const mes   = new Date().toISOString().slice(0,7)
  const saldo = transactions.filter((t:any) => t.date?.startsWith(mes))
    .reduce((a:number,t:any) => a+(t.type==='income'?t.amount:-t.amount), 0)
  const onboarding = storage<any>('io_career_onboarding', null)
  const [learns, setLearns] = useState<any[]>([])
  
  useEffect(() => {
    setLearns(storage<any[]>('io_career_learns', []))
    setLoading(false)
  }, [])
  
  function advanceLearnStatus(id: number) {
    const learn = learns.find(l => l.id === id)
    if (!learn) return
    const statusOrder = ['Quero', 'Em andamento', 'Concluído']
    const currentIndex = statusOrder.findIndex(s => s.toLowerCase() === learn.status)
    if (currentIndex >= statusOrder.length - 1) return
    const newStatus = statusOrder[currentIndex + 1].toLowerCase()
    const lista = learns.map(l => l.id === id ? { ...l, status: newStatus } : l)
    setLearns(lista)
    saveStorage('io_career_learns', lista)
  }

  return loading ? <PageSkeleton /> : (
    <div className="p-4 md:p-6 space-y-8 max-w-2xl">
      {/* Header com saudação */}
      <div className="p-3 pb-0">
        <div className="font-bold text-base text-foreground">
          O que fazer agora?
        </div>
        <div className="text-[10px] text-muted-foreground">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}
        </div>
      </div>

      {/* Hero card — próxima ação (card escuro) */}
      {(() => {
        const today   = new Date().getDay()
        const pending = habits
          .filter(h => !h.done && h.days?.includes(today))
          .sort((a, b) => {
            const ord = { alta: 0, media: 1, baixa: 2 }
            return ord[a.priority] - ord[b.priority]
          })
        const next = pending[0]

        if (!next) {
          return (
            <div className="nb-card mx-3 mt-3 p-4">
              <div className="text-[9px] text-black/40 uppercase tracking-widest mb-2">
                ✓ tudo concluído
              </div>
              <div className="text-lg font-bold text-black mb-1">
                Dia Produtivo!
              </div>
              <div className="text-sm text-black/45 mb-4">
                100% dos hábitos realizados hoje
              </div>
              <Link href="/dashboard/habits"
                className="nb-btn nb-btn-amber py-2.5 w-full flex items-center justify-between px-4 no-underline">
                <span>Ver hábitos</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )
        }

        if (habits.length === 0) {
          return (
            <div className="nb-card mx-3 mt-3 p-4 text-center">
              <div className="text-nb-amber font-bold mb-2">
                Sem hábitos ainda
              </div>
              <div className="text-black/45 text-xs mb-4">
                Crie seu primeiro hábito para começar
              </div>
              <Link href="/dashboard/habits"
                className="nb-btn nb-btn-amber py-2.5 px-6 inline-flex items-center gap-2 no-underline">
                <Plus size={12} weight="bold" /> Criar hábito
              </Link>
            </div>
          )
        }

        return (
          <div className="nb-card mx-3 mt-3 p-4">
            <div className="text-[9px] text-black/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Play size={9} weight="fill" className="text-nb-amber" />
              próxima ação
            </div>
            <div className="text-lg font-bold text-black mb-1 leading-tight">
              {next.name}
            </div>
            <div className="text-xs text-black/45 mb-4">
              {next.priority === 'alta' ? 'Alta' : next.priority === 'media' ? 'Média' : 'Baixa'} prioridade
              {next.freq && ` · ${next.freq === 'diario' ? 'Hábito diário' : next.freq}`}
            </div>
            <button
              onClick={() => toggleHabit(next.id)}
              className="nb-btn nb-btn-amber py-2.5 w-full flex items-center justify-between px-4">
              <span>Concluir o hábito</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )
      })()}

      {/* Card de progresso do dia — Hoje */}
      <Card className="mx-3 mt-3 border-black shadow-[4px_4px_0_0_#000]">
        <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ChartLineUp size={14} className="text-nb-ink" />
            <span className="nb-label">Hoje</span>
          </div>
          <span className="text-xs font-base">{pct}%</span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
           {habits.slice(0,5).map((h, i) => (
             <div
               key={h.id}
               className={cn(
                 'w-[22px] h-[22px] inline-flex items-center justify-center',
                 'bg-white border-2 border-black shadow-[2px_2px_0_0_#000]',
                 'rounded-none flex-shrink-0',
                 h.done && 'bg-amber-500'
               )}
             >
               {h.done && <Check className="h-4 w-4 text-black" />}
             </div>
           ))}
           {habits.length > 5 && (
             <span className="text-[10px] font-base text-nb-gray">+{habits.length - 5}</span>
           )}
           <span className="text-xs font-bold font-base ml-1">
             {done.length} / {habits.length} hábitos
           </span>
         </div>

         <div className="h-[18px] bg-white border-4 border-[#111111] relative overflow-hidden shadow-[2px 2px 0 0 #000] rounded-none">
           <div
             className="h-full bg-amber-500"
             style={{
               width: `${pct}%`,
               backgroundImage: 'repeating-linear-gradient(-45deg, rgba(0,0,0,0.18) 0 5px, transparent 5px 10px)',
               borderRight: '2px solid #000'
             }}
           />
         </div>
              </CardContent>
            </Card>

      {/* Botão para expandir/ocultar cards extras */}
      <div className="mx-3 mt-3">
        <button
          onClick={() => setExpandExtra(!expandExtra)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <CaretRight size={12} className={`transition-transform ${expandExtra ? 'rotate-90' : ''}`} />
          {expandExtra ? 'Ocultar extras' : 'Mostrar extras'}
        </button>
      </div>

      {expandExtra && (
        <>

           {/* Card de Aprendizados — Carreira */}
           {(() => {
             const homeReady = learns.filter(l => l.showOnHome === true).slice(0, 1)
             if (homeReady.length === 0) {
               return (
                 <div className="nb-card-dark mx-3 mt-3 p-4">
                      <div className="text-[9px] text-white/40 uppercase tracking-widest mb-2 font-base flex items-center gap-1.5">
                        <Globe size={9} className="text-nb-amber" />
                        CARREIRA
                      </div>
                      <p className="text-sm text-white/45 font-base mb-3">Nenhum aprendizado para mostrar</p>
                      <Link href="/dashboard/career?tab=aprendizado"
                        className="nb-btn nb-btn-amber py-2.5 w-full flex items-center justify-between px-4 no-underline">
                        Criar aprendizado
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )
                }
                const l = homeReady[0]
                const statusLabel = l.status === 'em andamento' ? 'Em andamento' : l.status === 'quero' ? 'Quero' : 'Concluído'
                const statusColors: Record<string, string> = {
                  'em andamento': 'bg-blue-500/20 text-blue-400',
                  'quero': 'bg-amber-500/20 text-amber-400',
                  'concluído': 'bg-green-500/20 text-green-400',
                }
                const canAdvance = l.status !== 'concluído'
                return (
                  <div className="nb-card-dark mx-3 mt-3 p-4">
                      <div className="text-[9px] text-white/40 uppercase tracking-widest mb-2 font-base flex items-center gap-1.5">
                        <Globe size={9} className="text-nb-amber" />
                        CARREIRA
                      </div>
                      <div className="text-base font-bold text-white font-base">{l.title}</div>
                      <div className="flex gap-1.5">
                        {l.area && <Badge variant="secondary" className="text-xs bg-stone-700 text-stone-300">{l.area}</Badge>}
                        <Badge className={cn('text-xs', statusColors[l.status])}>{statusLabel}</Badge>
                        <Badge variant="outline" className="text-xs border-stone-600 text-stone-300">{l.type}</Badge>
                      </div>
                      {canAdvance ? (
                        <button 
                          onClick={() => advanceLearnStatus(l.id)}
                          className="nb-btn nb-btn-amber py-2.5 w-full flex items-center justify-between px-4"
                        >
                          <span>Avançar status</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <Link href="/dashboard/career?tab=aprendizado"
                          className="nb-btn nb-btn-amber py-2.5 w-full flex items-center justify-between px-4 no-underline">
                          <span>Crie um novo aprendizado</span>
                          <ArrowRight size={14} />
                        </Link>
                      )}
                  </div>
                 )
               })()}

           {/* Card de semana — dias ativos */}
           <Card className="nb-card-dark mx-3 shadow-[4px_4px_0_0_#000]">
             <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <CalendarBlank size={14} />
                  <span className="nb-label">Semana</span>
                </div>
              </div>

              <div className="spec-body stretch">
                <div className="week" style={{width:'100%', maxHeight:'80px'}}>
                  {(() => {
                    // Get current week's days (Sunday = 0, Saturday = 6)
                    const now = new Date()
                    const currentDay = now.getDay()
                    const startOfWeek = new Date(now)
                    startOfWeek.setDate(now.getDate() - currentDay) // Start from Sunday
                    
                    const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
                    
                    return Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(startOfWeek)
                      date.setDate(startOfWeek.getDate() + i)
                      const dayOfWeek = date.getDay()
                      const dayNum = date.getDate()
                      const isToday = dayOfWeek === currentDay
                      const isPastDay = date < now && !isToday
                      
                      // Format date as YYYY-MM-DD for comparison
                      const dateKey = date.toISOString().split('T')[0]
                      
                      // Check if this specific date has completed habits from history
                      const dayHistory = history[dateKey]
                      const hasCompletedHabits = dayHistory && dayHistory.done > 0
                      
                      // Logic:
                      // - Today: amber
                      // - Past day with completed habits: green
                      // - Past day without completed habits: white
                      // - Future day: white
                      const dayClass = isToday 
                        ? 'today' 
                        : (isPastDay && hasCompletedHabits) 
                        ? 'done' 
                        : ''
                      
                      return (
                        <div key={i} className={`day ${dayClass}`}>
                          <span className="d">{dayLabels[dayOfWeek]}</span>
                          <span className="n">{dayNum}</span>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Card de Insights (bloqueado no Free) */}
      <Card className={`mx-3 mt-3 ${plan !== 'pro' ? 'border-dashed opacity-60' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lightbulb size={14} className={plan === 'pro' ? 'text-nb-amber' : 'text-nb-gray'} />
              <span className="nb-label">Insights</span>
            </div>
            {plan !== 'pro' && (
              <div className="w-4 h-4 border border-nb-ink rounded flex items-center justify-center">
                <Lock size={9} />
              </div>
            )}
          </div>

          {plan === 'pro' ? (
            <div className="mt-2 text-xs text-nb-gray font-base">
              Seu melhor dia é segunda-feira. Manter o streak aumenta 40% a conclusão de hábitos.
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-nb-gray font-base">
                Análises personalizadas e recomendações inteligentes para acelerar sua evolução.
              </div>
              <Link href="/dashboard/profile#plano"
                className="nb-btn nb-btn-amber px-2.5 py-1.5 text-[9px] ml-3 no-underline whitespace-nowrap">
                Ver Pro
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}