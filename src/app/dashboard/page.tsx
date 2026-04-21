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
import {
  Lightning, ArrowRight, CheckSquare, Trophy,
  Coins, TrendUp, CaretRight, Lock, Star,
  Play, Plus, ChartLineUp, Check, CalendarBlank, Lightbulb, BookOpen, Globe,
} from '@phosphor-icons/react'

const PRI_COLORS: Record<string, string> = { alta:'bg-red-500', media:'bg-amber-500', baixa:'bg-green-500' }

export default function HojePage() {
  const { habits, economy, toggleHabit, plan } = useAppStore()
  const [expandExtra, setExpandExtra] = useState(true)
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

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      {/* Header com saudação */}
      <div className="p-3 pb-0">
        <div className="font-bold text-base">
          O que fazer agora?
        </div>
        <div className="text-[10px] text-nb-gray">
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
            <div className="nb-card-dark mx-3 mt-3 p-4">
              <div className="text-[9px] text-white/40 uppercase tracking-widest mb-2">
                ✓ tudo concluído
              </div>
              <div className="text-lg font-bold text-white mb-1">
                Dia Produtivo!
              </div>
              <div className="text-sm text-white/45 mb-4">
                100% dos hábitos realizados hoje
              </div>
              <a href="/dashboard/progress"
                className="nb-btn nb-btn-amber py-2.5 w-full flex items-center justify-between px-4 no-underline">
                <span>Ver detalhes</span>
                <ArrowRight size={14} />
              </a>
            </div>
          )
        }

        if (habits.length === 0) {
          return (
            <div className="nb-card-dark mx-3 mt-3 p-4 text-center">
              <div className="text-nb-amber font-bold mb-2">
                Sem hábitos ainda
              </div>
              <div className="text-white/45 text-xs mb-4">
                Crie seu primeiro hábito para começar
              </div>
              <a href="/dashboard/habits"
                className="nb-btn nb-btn-amber py-2.5 px-6 inline-flex items-center gap-2 no-underline">
                <Plus size={12} weight="bold" /> Criar hábito
              </a>
            </div>
          )
        }

        return (
          <div className="nb-card-dark mx-3 mt-3 p-4">
            <div className="text-[9px] text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Play size={9} weight="fill" className="text-nb-amber" />
              próxima ação
            </div>
            <div className="text-lg font-bold text-white mb-1 leading-tight">
              {next.name}
            </div>
            <div className="text-xs text-white/45 mb-4">
              {next.priority === 'alta' ? 'Alta' : next.priority === 'media' ? 'Média' : 'Baixa'} prioridade
              {next.freq && ` · ${next.freq === 'diario' ? 'Hábito diário' : next.freq}`}
            </div>
            <button
              onClick={() => toggleHabit(next.id)}
              className="nb-btn nb-btn-amber py-2.5 w-full flex items-center justify-between px-4">
              <span>Concluir agora</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )
      })()}

      {/* Card de progresso do dia — Hoje */}
      <Card className="mx-3 mt-3">
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
            <div key={h.id}
              className={`w-5 h-5 border-2 border-nb-ink rounded-[3px] flex items-center justify-center
                ${h.done ? 'bg-nb-amber' : 'bg-white'}`}>
              {h.done && <Check size={10} weight="bold" />}
            </div>
          ))}
          {habits.length > 5 && (
            <span className="text-[10px] font-base text-nb-gray">+{habits.length - 5}</span>
          )}
          <span className="text-xs font-bold font-base ml-1">
            {done.length} / {habits.length} hábitos
          </span>
        </div>

        <div className="nb-progress-bar">
          <div className="nb-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </CardContent>
      </Card>

      {/* Botão para expandir/ocultar cards extras */}
      <div className="mx-3 mt-3">
        <button
          onClick={() => setExpandExtra(!expandExtra)}
          className="flex items-center gap-2 text-xs text-nb-gray hover:text-nb-ink transition-colors"
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
            if (!homeReady.length) {
              return (
                <div className="nb-card-dark mx-3 mt-3 p-4">
                  <div className="text-[9px] text-white/40 uppercase tracking-widest mb-2 font-base flex items-center gap-1.5">
                    <Globe size={9} className="text-nb-amber" />
                    CARREIRA
                  </div>
                  <p className="text-sm text-white/45 font-base mb-3">Nenhum aprendizado para mostrar</p>
                  <a href="/dashboard/career?tab=aprendizado"
                    className="nb-btn nb-btn-amber py-2.5 w-full flex items-center justify-between px-4 no-underline">
                    Criar aprendizado
                    <ArrowRight size={14} />
                  </a>
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
                <CardContent className="p-0 space-y-3">
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
                    <a href="/dashboard/career?tab=aprendizado"
                      className="nb-btn nb-btn-amber py-2.5 w-full flex items-center justify-between px-4 no-underline">
                      <span>Crie um novo aprendizado</span>
                      <ArrowRight size={14} />
                    </a>
                  )}
                </CardContent>
              </div>
            )
          })()}

          {/* Card de Impulso — Streak + IO */}
          <Card className="mx-3 mt-3">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Lightning size={14} weight="fill" className="text-nb-amberd" />
                  <span className="nb-label">Impulso</span>
                </div>
                <span className="font-base text-xs text-nb-amberd">{economy.io_hoje} IO hoje</span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-base font-bold text-2xl text-nb-amberd">{economy.streak}</span>
                <span className="text-xs text-nb-amberd/70 font-base">dias seguidos</span>
                <span className="ml-auto font-base text-xs text-nb-amberd/60">{economy.saldo_io} IO</span>
              </div>

              <div className="text-[10px] font-base text-nb-amberd/60 italic mb-2">
                {economy.streak === 0
                  ? 'Algo começou.'
                  : economy.streak < 7
                    ? 'Mantendo o ritmo!'
                    : economy.streak < 30
                      ? `${economy.streak} dias - você está em chamas!`
                      : `${economy.streak} dias - consistência lendária!`}
              </div>

              <div className="nb-progress-bar" style={{ background: 'bg-stone-700' }}>
                <div style={{
                  height: '100%',
                  background: '#F59E0B',
                  width: `${Math.min((economy.io_hoje / 200) * 100, 100)}%`,
                  transition: 'width .5s ease'
                }} />
              </div>

              <div className="text-[9px] text-nb-amberd/50 font-base mt-1">
                {200 - economy.io_hoje} IO restantes hoje
              </div>
            </CardContent>
          </Card>

          {/* Card de semana — dias ativos */}
          <Card className="mx-3 mt-3">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <CalendarBlank size={14} />
                  <span className="nb-label">Semana</span>
                </div>
              </div>

              <div className="flex justify-between">
                {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((day, i) => {
                  const dayIndex = i === 6 ? 0 : i + 1
                  const isToday  = new Date().getDay() === dayIndex
                  const hasActivity = false
                  return (
                    <div key={day} className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 border-2 border-nb-ink rounded-nb-sm flex items-center justify-center
                            font-mono text-[10px] font-bold transition-colors
                            ${isToday    ? 'bg-nb-ink text-nb-amber'
                            : hasActivity ? 'bg-nb-amberl text-nb-amberd'
                            : 'bg-white text-nb-gray'}`}>
                        {isToday ? <Lightning size={12} weight="fill" className="text-nb-amber" /> : day[0]}
                      </div>
                      <span className={`text-[8px] font-mono ${isToday ? 'font-bold text-nb-ink' : 'text-nb-gray'}`}>
                        {day}
                      </span>
                    </div>
                  )
                })}
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
              <a href="/dashboard/profile#plano"
                className="nb-btn nb-btn-amber px-2.5 py-1.5 text-[9px] ml-3 no-underline whitespace-nowrap">
                Ver Pro
              </a>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
