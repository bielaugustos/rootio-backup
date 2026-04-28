'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useAppStore, Habit }    from '@/store/useAppStore'
import { toast }                 from 'sonner'
import { PageSkeleton }          from '@/components/PageSkeleton'
import { HabitForm }             from '@/components/HabitForm'
import { HabitCard }             from '@/components/HabitCard'
import { CommandPalette }        from '@/components/CommandPalette'
import Link                      from 'next/link'
import { CaretDown, CaretUp, ArrowRight } from '@phosphor-icons/react'

const FREE_LIMIT  = 10
const HABIT_LIMIT = 5

export default function HabitsPage() {
  const {
    habits, toggleHabit, addHabit, updateHabit, deleteHabit,
    plan, earnIO, habitsSearchQuery, habitsFormOpen,
    setHabitsFormOpen, themeMode,
  } = useAppStore()

  const [loading,          setLoading]          = useState(true)
  const [editing,          setEditing]          = useState<Habit | null>(null)
  const [showAllPending,   setShowAllPending]   = useState(false)
  const [showAllCompleted, setShowAllCompleted] = useState(false)
  const formRef = useRef<HTMLInputElement>(null)

  const isDark  = themeMode === 'dark'
  const canAdd  = plan === 'pro' || habits.length < FREE_LIMIT
  const today   = new Date().getDay()
  const search  = habitsSearchQuery

  const filtered   = habits.filter(h =>
    !search || h.name.toLowerCase().includes(search.toLowerCase())
  )
  const paraHoje   = filtered.filter(h => h.days?.includes(today) ?? true)
  const amanha     = filtered.filter(h => !(h.days?.includes(today) ?? true))
  const pendentes  = paraHoje.filter(h => !h.done)
  const concluidos = paraHoje.filter(h =>  h.done)
  const pct        = paraHoje.length
    ? Math.round((concluidos.length / paraHoje.length) * 100)
    : 0

  useEffect(() => { setLoading(false) }, [])

  function openNew() { setEditing(null); setHabitsFormOpen(true) }
  function openEdit(h: Habit) { setEditing(h); setHabitsFormOpen(true) }

  if (loading) return <PageSkeleton />

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-space-grotesk,system-ui)', fontSize: 11,
    fontWeight: 700, letterSpacing: '.12em',
    color: isDark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.35)',
    marginBottom: 8, display: 'block',
  }

  const moreBtnStyle: React.CSSProperties = {
    width: '100%', padding: '8px 0', background: 'none', border: 'none',
    fontFamily: 'var(--font-space-grotesk,system-ui)', fontSize: 11, fontWeight: 700,
    color: isDark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  }

  return (
    <div className="p-4 md:p-6 pb-20 space-y-4 max-w-2xl mx-auto">

      {/* Título */}
      <div style={{ marginBottom: 4 }}>
        <p style={{ fontFamily:'var(--font-space-grotesk,system-ui)', fontWeight:900, fontSize:18,
          letterSpacing:'-.01em', lineHeight:1.2, color: isDark ? '#fff' : '#111' }}>
          ../hábitos
        </p>
        <p style={{ fontFamily:'var(--font-space-grotesk,system-ui)', fontSize:10, fontWeight:700,
          letterSpacing:'.1em', color: isDark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.35)', marginTop:6 }}>
          {concluidos.length}/{paraHoje.length} para hoje
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ flex:1, height:10, background: isDark ? 'rgba(255,255,255,.08)' : 'var(--secondary-background)',
          border:'1.5px solid var(--border)', borderRadius:4, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:'0 auto 0 0', width:`${pct}%`,
            background:'var(--c-habit,#7CE577)', transition:'width .4s ease' }} />
        </div>
        <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700,
          color: isDark ? '#fff' : '#111', flexShrink:0, minWidth:32 }}>{pct}%</span>
      </div>

      {/* Command Palette */}
      {!habitsFormOpen && (
        <CommandPalette themeMode={themeMode} canAdd={canAdd}
          addHabit={addHabit} earnIO={earnIO} plan={plan} />
      )}

      {/* HabitForm */}
      {habitsFormOpen && (
        <HabitForm
          editing={editing}
          onSave={(habit) => {
            if (editing) {
              updateHabit({ ...editing, ...habit } as any)
              toast.success('Hábito atualizado!')
            } else {
              if (!canAdd) { toast.error(`Limite de ${FREE_LIMIT} hábitos.`); return }
              addHabit({ id:Date.now(), ...habit, icon:'⭐', tags:[], streak:0,
                createdAt:new Date().toISOString() } as any)
              earnIO('input_registro')
              toast.success('+10 IO • hábito criado!')
            }
            setHabitsFormOpen(false)
          }}
          onCancel={() => { setHabitsFormOpen(false); setEditing(null) }}
          plan={plan} canAdd={canAdd} today={today} formRef={formRef} themeMode={themeMode}
        />
      )}

      {editing && habitsFormOpen && (
        <HabitCard habit={editing} onToggle={()=>{}} onDelete={()=>{}}
          onEdit={()=>{}} updateHabit={()=>{}} preview isDark={isDark} />
      )}

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div>
          <span style={labelStyle}>../pendentes ({pendentes.length})</span>
          {(showAllPending ? pendentes : pendentes.slice(0,HABIT_LIMIT)).map(h => (
            <HabitCard key={h.id} habit={h} onToggle={toggleHabit}
              onDelete={deleteHabit} onEdit={openEdit} updateHabit={updateHabit} isDark={isDark} />
          ))}
          {pendentes.length > HABIT_LIMIT && (
            <button onClick={()=>setShowAllPending(v=>!v)} style={moreBtnStyle}>
              {showAllPending ? <><CaretUp size={11}/> Ocultar</> : <><CaretDown size={11}/> Ver mais {pendentes.length-HABIT_LIMIT}</>}
            </button>
          )}
        </div>
      )}

      {pendentes.length > 0 && concluidos.length > 0 && (
        <div style={{ height:1, background:'var(--border)' }} />
      )}

      {/* Concluídos */}
      {concluidos.length > 0 && (
        <div>
          <span style={labelStyle}>../concluídos ({concluidos.length})</span>
          {(showAllCompleted ? concluidos : concluidos.slice(0,HABIT_LIMIT)).map(h => (
            <HabitCard key={h.id} habit={h} onToggle={toggleHabit}
              onDelete={deleteHabit} onEdit={openEdit} updateHabit={updateHabit} done isDark={isDark} />
          ))}
          {concluidos.length > HABIT_LIMIT && (
            <button onClick={()=>setShowAllCompleted(v=>!v)} style={moreBtnStyle}>
              {showAllCompleted ? <><CaretUp size={11}/> Ocultar</> : <><CaretDown size={11}/> Ver {concluidos.length-HABIT_LIMIT} mais</>}
            </button>
          )}
        </div>
      )}

      {/* Amanhã */}
      {amanha.length > 0 && (
        <div>
          <span style={labelStyle}>../amanhã ({amanha.length})</span>
          {amanha.map(h => (
            <HabitCard key={h.id} habit={h} onToggle={toggleHabit}
              onDelete={deleteHabit} onEdit={openEdit} updateHabit={updateHabit} isDark={isDark} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {habits.length === 0 && !habitsFormOpen && (
        <div style={{ background: isDark?'#fff':'#111', border:'3px solid var(--border)',
          boxShadow:'var(--shadow)', padding:'28px 20px', textAlign:'center',
          position:'relative', overflow:'hidden' }}>
          <div aria-hidden style={{ position:'absolute', inset:0,
            backgroundImage:'repeating-linear-gradient(-45deg,rgba(0,0,0,.02) 0 1px,transparent 1px 8px)',
            pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <p style={{ fontFamily:'monospace', fontSize:10, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'.16em', color: isDark?'rgba(0,0,0,.3)':'rgba(255,255,255,.35)', marginBottom:8 }}>
              vazio
            </p>
            <p style={{ fontFamily:'var(--font-space-grotesk,system-ui)', fontWeight:900, fontSize:22,
              textTransform:'uppercase', letterSpacing:'-.01em',
              color: isDark?'#111':'#fff', marginBottom:8 }}>
              Nenhum hábito ainda
            </p>
            <p style={{ fontSize:13, lineHeight:1.5, marginBottom:20,
              color: isDark?'rgba(0,0,0,.4)':'rgba(255,255,255,.5)' }}>
              Escolha uma coisa pequena. Só uma. Faça hoje.
            </p>
            <button onClick={openNew} style={{ display:'flex', alignItems:'center',
              justifyContent:'space-between', width:'100%', padding:'13px 16px',
              background:'var(--c-goal,#F59E0B)', color:'#111',
              border:'2px solid var(--border)', boxShadow:'var(--shadow)',
              borderRadius:4, fontWeight:900, fontSize:14, textTransform:'uppercase',
              letterSpacing:'.04em', cursor:'pointer',
              fontFamily:'var(--font-space-grotesk,system-ui)' }}>
              <span>Criar meu primeiro hábito</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Pro limit */}
      {!canAdd && (
        <div style={{ background:'var(--c-goal-bg,#FEF3C7)', border:'2px solid var(--c-goal-b,#92400E)',
          borderRadius:5, padding:'10px 14px', display:'flex',
          alignItems:'center', justifyContent:'space-between', gap:10 }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Limite de {FREE_LIMIT} hábitos (Free)</span>
          <Link href="/dashboard/profile#plano" style={{ display:'flex', alignItems:'center', gap:5,
            padding:'6px 12px', background:'var(--c-goal,#F59E0B)', color:'#111',
            border:'2px solid var(--border)', boxShadow:'var(--shadow-nb-sm)',
            borderRadius:4, fontWeight:700, fontSize:12, textDecoration:'none', whiteSpace:'nowrap' }}>
            Ver Pro <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
      )}
    </div>
  )
}