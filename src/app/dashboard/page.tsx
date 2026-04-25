'use client'
import { useState, useEffect, useRef } from 'react'
import Link                             from 'next/link'
import { useAppStore }                  from '@/store/useAppStore'
import { storage, saveStorage }         from '@/lib/utils'
import { PageSkeleton }                 from '@/components/PageSkeleton'
import { HeroCard, HeroCardEmpty, HeroCardEmpty_NoHabits } from '@/components/HeroCard'
import { HojeProgressCard }             from '@/components/HojeProgressCard'
import { CarreiraCard }                 from '@/components/CarreiraCard'
import { ArrowRight, CaretDown, CaretUp, Info, Lock } from '@phosphor-icons/react'

const WEEK_ORDER  = [1, 2, 3, 4, 5, 6, 0]
const WEEK_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export default function HojePage() {
  const { habits, economy, toggleHabit, plan, history, themeMode } = useAppStore()
  const dark = themeMode === 'dark'
  const [expandExtra, setExpandExtra] = useState<boolean>(storage('io_dashboard_expand_extra', false))
  const [loading, setLoading]         = useState(true)
  const [learns, setLearns]           = useState<any[]>([])
  const [skippedIds, setSkippedIds]   = useState<Set<number>>(new Set())

  const today   = new Date().getDay()
  const hoje    = habits.filter(h => h.days?.includes(today) ?? true)
  const done    = hoje.filter(h => h.done)
  const pct     = hoje.length ? Math.round((done.length / hoje.length) * 100) : 0
  const pending = hoje
    .filter(h => !h.done && !skippedIds.has(h.id))
    .sort((a, b) => {
      const ord: Record<string,number> = { alta:0, media:1, baixa:2 }
      return (ord[a.priority]??1) - (ord[b.priority]??1)
    })
  const next = pending[0]

   function advanceLearnStatus(id: number) {
     const l = learns.find(l => l.id === id)
     if (!l) return
     const order = ['quero','em andamento','concluído']
     const idx   = order.indexOf(l.status)
     if (idx >= order.length - 1) return
     const lista = learns.map(x => x.id === id ? { ...x, status: order[idx+1] } : x)
     setLearns(lista)
     saveStorage('io_career_learns', lista)
   }

     function handleSkip() {
       if (!next) return
       setSkippedIds(prev => {
         const newSet = new Set(prev).add(next.id)
         // Conta quantos hábitos NÃO concluídos existem hoje
         const totalPending = hoje.filter(h => !h.done).length
         // Se todos os hábitos pendentes foram pulados, reseta a lista
         if (newSet.size >= totalPending) {
           return new Set()
         }
         return newSet
       })
       // Rola para o topo para mostrar o próximo hábito no HeroCard
       setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
     }

   useEffect(() => {
     setLearns(storage<any[]>('io_career_learns', []))
     setLoading(false)
   }, [])

   // Limpa hábitos pulados ao mudar o dia
   useEffect(() => {
     setSkippedIds(new Set())
   }, [today])

  const now         = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const weekDays = WEEK_ORDER.map((dow, i) => {
    const d       = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + dow)
    const dateKey = d.toISOString().split('T')[0]
    const hist    = history[dateKey]
    const isToday = dow === today
    const isPast  = d < now && !isToday
    return { label: WEEK_LABELS[i], num: d.getDate(), isToday, isDone: isPast && hist?.done > 0 }
  })

  if (loading) return <PageSkeleton />

  return (
    <div className="px-4 pt-6 pb-20 max-w-2xl mx-auto w-full flex flex-col gap-4">

      {/* Data */}
      <p style={{ fontFamily:'var(--font-space-grotesk)', fontSize:11, fontWeight:700,
        textTransform:'lowercase', letterSpacing:'.12em', color: dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)',
        marginTop:2, marginBottom:4 }}>
        quem se importa com {now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}
      </p>

      {/* Hero card */}
      <div className="mt-4">
        {habits.length === 0 ? <HeroCardEmpty_NoHabits /> : !next ? <HeroCardEmpty /> : (
          <HeroCard
            key={next.id}
            habit={{
              id: next.id,
              name: next.name,
              priority: next.priority as 'alta'|'media'|'baixa',
              freq: next.freq,
              category: (next as any).listType
            }}
            onConcluir={() => toggleHabit(next.id)}
            onPular={handleSkip}
          />
        )}
      </div>

      {/* Progresso */}
      <HojeProgressCard
        habits={hoje.map(h => ({ id:h.id, done:h.done,
          listType:(h as any).listType, name:h.name }))}
        done={done.length} total={hoje.length} pct={pct}
        onToggle={id => toggleHabit(id as number)}
        dark={dark}
      />

      {/* Toggle extras */}
      <button
        onClick={() => {
          const newValue = !expandExtra
          setExpandExtra(newValue)
          saveStorage('io_dashboard_expand_extra', newValue)
        }}
        style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
          cursor:'pointer', fontFamily:'var(--font-space-grotesk,monospace)', fontSize:11, fontWeight:700,
          textTransform:'uppercase', letterSpacing:'.1em', color: dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)',
          padding:'4px 0' }}
      >
        {expandExtra ? <CaretUp size={11} weight="bold"/> : <CaretDown size={11} weight="bold"/>}
        {expandExtra ? 'ocultar extras' : 'mostrar extras'}
      </button>

      {/* Extras */}
      {expandExtra && (
        <>
          <SemanaCard weekDays={weekDays} streak={economy.streak} dark={dark} />

          {(() => {
            const l = learns.filter(x => x.showOnHome).slice(0,1)[0]
            return l
              ? <CarreiraCard learn={l} onAvancar={() => advanceLearnStatus(l.id)} dark={dark} />
              : <CarreiraCard dark={dark} />
          })()}

        </>
      )}

      {/* Insights / Pro */}
      <InsightsCard plan={plan} />

    </div>
  )
}

// ─── SemanaCard ───────────────────────────────────────────────────────────────
function SemanaCard(
  { weekDays, streak, dark = false }:
  { weekDays: { label: string; num: number; isToday: boolean; isDone: boolean }[]; streak: number; dark?: boolean }
) {
  const bg = dark ? '#1E1E1E' : '#ffffff'
  const txtMute = dark ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.4)'
  const txtMain = dark ? '#ffffff' : '#111111'
  return (
      <div style={{ background: bg, border: 'none', boxShadow: 'none', borderRadius: 0, padding:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
         <span style={{ fontFamily:'var(--font-space-grotesk)', fontSize:11, fontWeight:700,
          textTransform:'none', letterSpacing:'.12em', color:txtMute }}>../semana</span>
        <span style={{ color:txtMute, fontSize:11, fontWeight:700 }}>•</span>
         <span style={{ fontFamily:'var(--font-space-grotesk)', fontSize:11, fontWeight:700, color:txtMain }}>
          streak de {streak}d
        </span>
       </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:12, padding: '20px 0' }}>
           {weekDays.map((d,i) => {
             const dayBg    = d.isToday ? '#F59E0B' : d.isDone ? '#7CE577' : (dark?'rgba(255,255,255,.08)':'#fff')
             const dayColor = d.isToday ? '#fff'    : d.isDone ? '#111'    : txtMain
             return (
               <div key={i} style={{ background:dayBg, border:'2px solid #111', boxShadow:'2px 2px 0 0 #111',
                 borderRadius:0, padding:'12px 4px', display:'flex', flexDirection:'column',
                 alignItems:'center', gap:3 }}>
                 <span style={{ fontFamily:'var(--font-display,sans-serif)', fontWeight:900,
                   fontSize:13, color:dayColor, textTransform:'uppercase', marginTop:2 }}>{d.label}</span>
                 <span style={{                 fontFamily:'var(--font-space-grotesk)', fontWeight:700,
                   fontSize:10, color:dayColor, opacity:.8 }}>{d.num}</span>
               </div>
             )
           })}
         </div>
    </div>
  )
}

// ─── InsightsCard ─────────────────────────────────────────────────────────────
function InsightsCard({ plan }: { plan: string }) {
  const isPro = plan === 'pro'
  return (
    <div style={{ background:'#1E1E1E', border:'3px solid #111', boxShadow:'4px 4px 0 0 #111',
      borderRadius:0, padding:'20px', marginTop:10 }}>
      {/* Header: label + lock */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ fontFamily:'var(--font-space-grotesk)', fontSize:11, fontWeight:700,
          textTransform:'none', letterSpacing:'.12em', color:'rgba(255,255,255,.4)' }}>
          ../insights
        </span>
        {!isPro && (
          <div style={{ width:28, height:28, background:'#F59E0B', border:'2px solid #111',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Lock size={12} weight="bold" style={{ color:'#000' }} />
          </div>
        )}
      </div>

      {/* Conteúdo: ícone + texto */}
      {isPro ? (
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Info size={14} style={{ color:'#F59E0B' }} />
          <p style={{ fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:1.5, flex:1 }}>
            Seu melhor dia é segunda-feira. Manter o streak aumenta 40% a conclusão de hábitos.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:14 }}>
            <Info size={14} style={{ color:'rgba(255,255,255,.35)', flexShrink:0, marginTop:1 }} />
            <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.5, flex:1 }}>
              Análises personalizadas e recomendações inteligentes para acelerar sua evolução.
            </p>
          </div>
           <Link
             href="/dashboard/profile#plano"
             style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               padding: '13px 16px',
               height: 40,
               background: '#F59E0B',
               color: '#000',
               border: '2px solid #111111',
               boxShadow: '3px 3px 0 0 #111111',
               borderRadius: 4,
               fontFamily: 'var(--font-display, sans-serif)',
               fontWeight: 900,
               fontSize: 13,
               textTransform: 'uppercase',
               letterSpacing: '.04em',
               textDecoration: 'none',
               transition: 'transform .08s, box-shadow .08s',
             }}
             onMouseEnter={e => {
               const t = e.currentTarget
               t.style.transform = 'translate(-1px,-1px)'
               t.style.boxShadow = '4px 4px 0 0 #111111'
             }}
             onMouseLeave={e => {
               const t = e.currentTarget
               t.style.transform = ''
               t.style.boxShadow = '3px 3px 0 0 #111111'
             }}
               onMouseDown={e => {
                 const t = e.currentTarget
                 t.style.transform = 'translate(2px,2px)'
                 t.style.boxShadow = '1px 1px 0 0 #111111'
               }}
             onMouseUp={e => {
               const t = e.currentTarget
               t.style.transform = 'translate(-1px,-1px)'
               t.style.boxShadow = '4px 4px 0 0 #111111'
             }}
           >
            <span>PRO VITALÍCIO · R$12,90 ★ Ver PRO</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </>
      )}
    </div>
  )
}
