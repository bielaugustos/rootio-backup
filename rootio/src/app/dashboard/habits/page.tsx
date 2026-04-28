'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useAppStore, Habit }           from '@/store/useAppStore'
import { useListTheme }                 from '@/contexts/ListThemeContext'
import { toast }                        from 'sonner'
import { PageSkeleton }                 from '@/components/PageSkeleton'
import { Input }                        from '@/components/ui/input'
import { HabitForm }                    from '@/components/HabitForm'
import { CommandPalette }               from '@/components/CommandPalette'
import Link                             from 'next/link'
import {
  Plus, Trash, PencilSimple,
  CaretDown, CaretUp, Check, Flag, Moon,
  ArrowClockwise, CalendarBlank, X, List, Target, Sliders, Bell,
} from '@phosphor-icons/react'

// ─── Constantes ───────────────────────────────────────────────────────────────
const FREE_LIMIT  = 10
const HABIT_LIMIT = 5

// Cores por prioridade — usadas na HabitCard
const PRI_COLOR: Record<string,{ fill:string; dot:string }> = {
  alta:  { fill:'#FF6B6B', dot:'#FF6B6B' },
  media: { fill:'#F59E0B', dot:'#F59E0B' },
  baixa: { fill:'#7CE577', dot:'#7CE577' },
}

// Cores por tipo de lista — usadas nas badges
const LIST_TYPE_COLOR: Record<string, string> = {
  habito:    '#F5EFDF',
  evento:    '#9B7BFF',
  tarefa:    '#6FB8FF',
  meta:      '#F59E0B',
}

// ─── Estilos inline reutilizáveis ─────────────────────────────────────────────
const NB: Record<string, React.CSSProperties> = {
  card: {
    background:'#fff', border:'4px solid #111', boxShadow:'4px 4px 0 0 #111',
    borderRadius:0, padding:20,
  },
  label: {
    fontFamily:'var(--font-space-grotesk), monospace', fontSize:11, fontWeight:700,
    textTransform:'uppercase', letterSpacing:'.12em', color:'rgba(0,0,0,.45)',
    display:'block', marginBottom:6,
  },
  btnAmber: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    width:'100%', padding:'14px 18px', background:'#F59E0B', color:'#111',
    border:'3px solid #111', boxShadow:'2px 2px 0 0 #111', borderRadius:0,
    fontFamily:'var(--font-display,sans-serif)', fontWeight:900, fontSize:14,
    letterSpacing:'.04em', cursor:'pointer', transition:'all .075s ease',
  },
  btnGhost: {
    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
    padding:'12px 18px', background:'#fff', color:'#111',
    border:'2px solid #111', boxShadow:'2px 2px 0 0 #111', borderRadius:0,
    fontFamily:'var(--font-body,system-ui)', fontWeight:700, fontSize:13,
    cursor:'pointer', transition:'all .075s ease',
  },
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function HabitsPage() {
  const { habits, toggleHabit, addHabit, updateHabit, deleteHabit, plan, earnIO, habitsSearchQuery, habitsFormOpen, setHabitsFormOpen, themeMode } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Habit | null>(null)
  const formRef = useRef<HTMLInputElement>(null)

  const [showAllPending,   setShowAllPending]   = useState(false)
  const [showAllCompleted, setShowAllCompleted] = useState(false)

  const canAdd = plan === 'pro' || habits.length < FREE_LIMIT
  const today  = new Date().getDay()
  const search = habitsSearchQuery
  const filtered   = habits.filter(h => !search || h.name.toLowerCase().includes(search.toLowerCase()))
  const paraHoje   = filtered.filter(h => h.days?.includes(today) ?? true)
  const amanha     = filtered.filter(h => !(h.days?.includes(today) ?? true))
  const pendentes  = paraHoje.filter(h => !h.done)
  const concluidos = paraHoje.filter(h => h.done)
  const done  = concluidos.length
  const total = paraHoje.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  useEffect(() => {
    setLoading(false)
  }, [])

  function openNew() {
    setEditing(null)
    setHabitsFormOpen(true)
  }

  function openEdit(h: Habit) {
    setEditing(h)
    setHabitsFormOpen(true)
  }

  if (loading) return <PageSkeleton />

   return (
     <div className="px-4 pt-6 pb-20 max-w-2xl mx-auto w-full flex flex-col gap-4">

      {/* ── AppBar ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-start', marginBottom:12 }}>
        <div>
          <p style={{ fontFamily:'var(--font-space-grotesk)', fontWeight:900,
            fontSize:18, letterSpacing:'-.01em', lineHeight:1.2 }}>
            ../hábitos
          </p>
          <p style={{      fontFamily:'var(--font-space-grotesk)', fontSize:10, color:themeMode === 'dark' ? '#fff' : 'rgba(0,0,0,.4)',
            fontWeight:700, letterSpacing:'.1em', marginTop:8 }}>
            ../parahoje
          </p>
        </div>
      </div>

      {/* ── Barra de progresso ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          flex:1,
          height:14,
          background: themeMode === 'dark' ? 'rgba(255,255,255,.1)' : '#fff',
          border:'2.5px solid #111',
          boxShadow:'2px 2px 0 0 #111',
          position:'relative',
          overflow:'hidden',
          borderRadius:4,
        }}>
          <div style={{
            position:'absolute',
            inset:'0 auto 0 0',
            width:`${pct}%`,
            background:'#7CE577',
            borderRight: pct < 100 ? '2px solid #111' : 'none',
            transition:'width .4s ease',
          }} />
        </div>
        <span style={{
          fontFamily:'var(--font-space-grotesk)',
          fontSize:13,
          fontWeight:700,
          color: themeMode === 'dark' ? '#fff' : '#111',
          flexShrink:0,
          minWidth:36,
        }}>
          {pct}%
        </span>
      </div>

      {/* ── Command Palette ── */}
      {!habitsFormOpen && (
        <CommandPalette
          themeMode={themeMode}
          canAdd={canAdd}
          addHabit={addHabit}
          earnIO={earnIO}
          plan={plan}
        />
      )}

      {/* ── FORM de edição ── */}
      {habitsFormOpen && (
        <HabitForm
          editing={editing}
          onSave={(habit) => {
            if (editing) {
              updateHabit({ ...editing, ...habit } as any)
              toast.success('Hábito atualizado!')
            } else {
              if (!canAdd) { toast.error(`Limite de ${FREE_LIMIT} hábitos no plano Free.`); return }
              addHabit({ 
                id:Date.now(), 
                ...habit,
                icon:'⭐', 
                tags:[], 
                streak:0,
                createdAt:new Date().toISOString() 
              } as any)
              earnIO('input_registro')
              toast.success('+10 IO • hábito criado!')
            }
            setHabitsFormOpen(false)
          }}
          onCancel={() => { setHabitsFormOpen(false); setEditing(null) }}
          plan={plan}
          canAdd={canAdd}
          today={today}
          formRef={formRef}
          themeMode={themeMode}
        />
      )}

      {/* ── HabitCard no topo — o hábito que está sendo editado ── */}
        {editing && habitsFormOpen && (
          <HabitCard
            habit={editing}
            onToggle={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            updateHabit={() => {}}
            preview
            themeMode={themeMode}
          />
        )}

      {/* ── Pendentes ── */}
      {pendentes.length > 0 && (
        <div>
          <p style={{ ...NB.label, marginBottom:8, display:'flex', alignItems:'center', gap:5, textTransform:'none', color:themeMode === 'dark' ? '#fff' : undefined }}>
            ../pendentes ({pendentes.length})
          </p>
            {(showAllPending ? pendentes : pendentes.slice(0,HABIT_LIMIT)).map(h => (
              <HabitCard key={h.id} habit={h} onToggle={toggleHabit}
                onDelete={deleteHabit} onEdit={openEdit} updateHabit={updateHabit} themeMode={themeMode} />
            ))}
          {pendentes.length > HABIT_LIMIT && (
             <button onClick={() => setShowAllPending(v=>!v)}
               style={{ width:'100%', padding:'8px 0', background:'none', border:'none',
                 fontFamily:'var(--font-space-grotesk)', fontSize:11, fontWeight:700,
                color:'rgba(0,0,0,.4)', cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center', gap:4 }}>
              {showAllPending
                ? <><CaretUp size={11}/> Ocultar</>
                : <><CaretDown size={11}/> Ver mais {pendentes.length-HABIT_LIMIT}</>}
            </button>
          )}
        </div>
      )}

      {/* ── Divider ── */}
      {pendentes.length>0 && concluidos.length>0 && (
        <div style={{ height:2, background:'#111' }} />
      )}

      {/* ── Concluídos ── */}
      {concluidos.length > 0 && (
        <div>
          <p style={{ ...NB.label, marginBottom:8, display:'flex', alignItems:'center', gap:5, textTransform:'none', color:themeMode === 'dark' ? '#fff' : undefined }}>
            ../concluidos ({concluidos.length})
          </p>
            {(showAllCompleted ? concluidos : concluidos.slice(0,HABIT_LIMIT)).map(h => (
              <HabitCard key={h.id} habit={h} done onToggle={toggleHabit}
                onDelete={deleteHabit} onEdit={openEdit} updateHabit={updateHabit} themeMode={themeMode} />
            ))}
          {concluidos.length > HABIT_LIMIT && (
             <button onClick={() => setShowAllCompleted(v=>!v)}
               style={{ width:'100%', padding:'8px 0', background:'none', border:'none',
                 fontFamily:'var(--font-space-grotesk)', fontSize:11, fontWeight:700,
                color:'rgba(0,0,0,.4)', cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center', gap:4 }}>
              {showAllCompleted
                ? <><CaretUp size={11}/> Ocultar</>
                : <><CaretDown size={11}/> Ver {concluidos.length-HABIT_LIMIT} mais</>}
            </button>
          )}
        </div>
      )}

       {/* ── Amanhã ── */}
       {amanha.length > 0 && (
         <div>
           <p style={{ ...NB.label, marginBottom:8, display:'flex', alignItems:'center', gap:5, textTransform:'none', color:themeMode === 'dark' ? '#fff' : undefined }}>
             ../amanhã ({amanha.length})
           </p>
            {amanha.map(h => (
              <HabitCard
                key={h.id}
                habit={h}
                onToggle={toggleHabit}
                onDelete={deleteHabit}
                onEdit={openEdit}
                updateHabit={updateHabit}
                themeMode={themeMode}
              />
            ))}
         </div>
       )}

       {/* ── Empty state ── */}
       {habits.length === 0 && !habitsFormOpen && (
         <div style={{
           background: themeMode === 'dark' ? '#fff' : '#1E1E1E', 
           border:'3px solid #111', 
           boxShadow:'4px 4px 0 0 #111',
           borderRadius:0, 
           padding:'24px 20px',
           textAlign:'center',
           position:'relative',
         }}>
           {/* Hachura de fundo — textura visual sutil */}
           <div style={{
             position:'absolute',
             inset:0,
             backgroundImage:'repeating-linear-gradient(-45deg, rgba(0,0,0,.025) 0 1px, transparent 1px 8px)',
             pointerEvents:'none',
             zIndex:0,
           }} />
           
           <div style={{ position:'relative', zIndex:1 }}>
             {/* Label kicker */}
             <p style={{
               fontFamily:'var(--font-mono, monospace)',
               fontSize:10,
               fontWeight:700,
               textTransform:'uppercase',
               letterSpacing:'.16em',
               color:themeMode === 'dark' ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.35)',
               marginBottom:8,
             }}>
               vazio
             </p>

             {/* Título */}
             <p style={{
               fontFamily:'var(--font-display, sans-serif)',
               fontWeight:900,
               fontSize:22,
               textTransform:'uppercase',
               letterSpacing:'-.01em',
               lineHeight:1,
               color:themeMode === 'dark' ? '#111' : '#fff',
               marginBottom:10,
             }}>
               Nenhum hábito ainda
             </p>

             {/* Subtítulo */}
             <p style={{
               fontFamily:'var(--font-body, system-ui)',
               fontSize:13,
               lineHeight:1.55,
               color:themeMode === 'dark' ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.5)',
               maxWidth:'30ch',
               margin:'0 auto',
             }}>
               Escolha uma coisa pequena. Só uma. Faça hoje.
             </p>
           </div>
         </div>
       )}

      {/* ── Pro limit ── */}
      {!canAdd && (
        <div style={{ ...NB.card, background:'#FEF3C7', display:'flex',
          alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'var(--font-body)', fontSize:13, fontWeight:600 }}>
            Limite de {FREE_LIMIT} hábitos (Free)
          </span>
          <Link href="/dashboard/profile#plano"
            style={{ ...NB.btnAmber, width:'auto', padding:'6px 12px',
              fontSize:12, justifyContent:'center' }}>
            Ver Pro
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── HabitCard ────────────────────────────────────────────────────────────────
function HabitCard(props: {
  habit:    Habit
  onToggle: (id:number) => void
  onDelete: (id:number) => void
  onEdit:   (h:Habit)  => void
  updateHabit: (h: Habit) => void
  done?:    boolean
  preview?: boolean
  themeMode: 'light' | 'dark'
}) {
  const { habit, onToggle, onDelete, onEdit, updateHabit, done = false, preview = false, themeMode } = props
  const { setCurrentType, currentColor } = useListTheme()
  const [expanded, setExpanded] = useState(false)
  const [showListMenu, setShowListMenu] = useState(false)
  const [activePanel, setActivePanel] = useState<'streak' | 'calendar' | 'chart' | 'progress' | 'table' | 'priority' | 'kanban' | 'urgency' | null>(null)

  const types = ['habito', 'evento', 'tarefa', 'meta']
  const listColors: Record<string, string> = {
    habito: '#F5EFDF',
    evento: '#9B7BFF',
    tarefa: '#6FB8FF',
    meta: '#F59E0B',
  }

  // Map habit to item structure matching core schema
  const item: any = {
    id: habit.id.toString(),
    listId: (habit as any).listType ?? 'habit',
    rawText: habit.name,
    type: (habit as any).listType ?? 'habit',
    title: habit.name,
    tags: [], // Assuming tags aren't currently stored
    isCompleted: done,
    isStarred: false, // Not implemented
    ioValue: habit.pts,
    habitFrequency: {
      type: habit.freq === 'semanal' ? 'weekly' : habit.freq === 'diario' ? 'daily' : 'custom',
      interval: 1,
      days: habit.freq === 'personalizado' && habit.days ? habit.days : undefined
    },
    habitStreakCurrent: 0, // Not tracked currently
    habitStreakBest: 0, // Not tracked currently
    updatedAt: Date.now(),
    createdAt: new Date(habit.createdAt ?? Date.now()).getTime()
  }

  // Calculate IO with streak multiplier (simplified since we don't track streak)
  const baseIO = item.ioValue || 0
  const streakDays = item.habitStreakCurrent || 0
  const calculatedIO = Math.round(baseIO * Math.min(1 + streakDays * 0.1, 2.0))

  const tagBg = habit.priority==='alta'  ? '#FF6B6B'
              : habit.priority==='media' ? '#F59E0B' : '#7CE577'
  const tagColor = habit.priority==='alta' ? '#fff' : '#111'

  // Helper function to format time (simplified)
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }

  // Placeholder AI insight (would come from AI service in Pro plan)
  const aiInsight = "Mantenha a consistência para melhores resultados!" // Placeholder

  // Placeholder for AI label based on type
  const aiLabel = (habit as any).listType === 'habit' ? 'Hábito diário recomendado' : 
                 (habit as any).listType === 'evento' ? 'Lembrete importante' : 
                 (habit as any).listType === 'tarefa' ? 'Prioridade alta' : 
                 (habit as any).listType === 'meta' ? 'Objetivo estratégico' : 
                 'Item padrão'

  return (
    <div style={{ marginBottom:12 }}>
      <div style={{
        background:themeMode === 'dark' ? '#1E1E1E' : '#fff', border:'3px solid #111', boxShadow:'4px 4px 0 0 #111',
        borderRadius:0, padding:'20px 24px',
        opacity: done ? .7 : 1,
      }}>
        {/* Linha principal */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>

          {/* Checkbox */}
          {!preview && (
            <button
              onClick={() => onToggle(habit.id)}
              style={{
                width:22, height:22, border:'2.5px solid #111',
                background: done ? tagBg : (themeMode === 'dark' ? '#1E1E1E' : '#fff'),
                borderRadius:0, cursor:'pointer', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'2px 2px 0 0 #111',
              }}
            >
              {done && <Check size={12} weight="bold" />}
            </button>
          )}

          {/* Nome + tags */}
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontWeight:700, fontSize:14,
              textDecoration: done ? 'line-through' : 'none',
              color: done ? (themeMode === 'dark' ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.45)') : (themeMode === 'dark' ? '#fff' : '#111'),
              marginBottom:4 }}>
              {habit.name}
            </p>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {/* Tag prioridade */}
              <span style={{
                display:'inline-flex', alignItems:'center', padding:'2px 7px',
                 background:tagBg, color:tagColor,
                 border:'1.5px solid #111', borderRadius:0,
                 fontFamily:'var(--font-space-grotesk)', fontSize:9, fontWeight:700,
                 textTransform:'uppercase', letterSpacing:'.1em',
              }}>
                {habit.priority==='alta'?'Alta':habit.priority==='media'?'Média':'Baixa'}
              </span>
               {/* Tag tipo */}
               <span style={{
                  display:'inline-flex', alignItems:'center', padding:'2px 7px',
                  background: LIST_TYPE_COLOR[(habit as any).listType ?? 'habito'],
                  border:'1.5px solid #111', borderRadius:0,
                  fontFamily:'var(--font-space-grotesk)', fontSize:9, fontWeight:700,
                  textTransform:'uppercase', letterSpacing:'.1em',
                  color: '#111111',
               }}>
                 {(habit as any).listType ?? 'Hábito'}
               </span>
            </div>
          </div>

          {/* IO badge + expand */}
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            {habit.pts > 0 && (
              <span style={{
                 fontFamily:'var(--font-space-grotesk)', fontSize:10, fontWeight:700,
                 background:'#111', color:'#FFD23F',
                 padding:'2px 6px', border:'1.5px solid #111', borderRadius:0,
                 transform: 'rotate(-90deg)',
                 transformOrigin: 'bottom',
               }}>
                 +{habit.pts}
              </span>
            )}
            {!preview && (
              <button
                onClick={() => setExpanded(v=>!v)}
                style={{ background:'none', border:'none', cursor:'pointer',
                  color: themeMode === 'dark' ? '#fff' : 'rgba(0,0,0,.4)', display:'flex', alignItems:'center' }}
              >
                {expanded ? <CaretUp size={14}/> : <CaretDown size={14}/>}
              </button>
            )}
          </div>
        </div>

        {/* Nota */}
        {habit.notes && (
          <p style={{ fontFamily:'var(--font-body)', fontSize:12,
            color:themeMode === 'dark' ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.45)', marginTop:6, marginLeft: preview?0:32 }}>
            {habit.notes}
          </p>
        )}

        {/* Ações — expand */}
        {expanded && !preview && (
          <React.Fragment>
            <div style={{ display:'flex', gap:8, marginTop:10, marginLeft:32 }}>
              <button
                onClick={() => { onEdit(habit); setExpanded(false) }}
                style={{
                  flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                  gap:5, padding:'6px 0', background: currentColor, color:'#111',
                  border:'2px solid #111', boxShadow:'2px 2px 0 0 #111',
                  borderRadius:0, fontFamily:'var(--font-body)', fontWeight:700,
                  fontSize:11, cursor:'pointer',
                }}
              >
                <PencilSimple size={12}/> Editar
              </button>
              <button
                onClick={() => onDelete(habit.id)}
                style={{
                  flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                  gap:5, padding:'6px 0', background:'#FF6B6B', color:'#fff',
                  border:'2px solid #111', boxShadow:'2px 2px 0 0 #111',
                  borderRadius:0, fontFamily:'var(--font-body)', fontWeight:700,
                  fontSize:11, cursor:'pointer',
                }}
              >
                <Trash size={12}/> Excluir
              </button>
              <button
                onClick={() => setShowListMenu(true)}
                style={{
                  flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                  gap:5, padding:'6px 0', background: currentColor, color:'#111',
                  border:'2px solid #111', boxShadow:'2px 2px 0 0 #111',
                  borderRadius:0, fontFamily:'var(--font-body)', fontWeight:700,
                  fontSize:11, cursor:'pointer',
                }}
              >
                Mudar Lista
              </button>
            </div>

            {showListMenu && (
              <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:8, marginLeft:32 }}>
              {types.map(type => {
                return (
                  <button
                    key={type}
                    onClick={() => {
                      updateHabit({ ...habit, listType: type } as any)
                      setCurrentType(type)
                      setExpanded(false)
                      setShowListMenu(false)
                    }}
                    style={{
                      display:'flex', alignItems:'center', justifyContent:'center',
                      gap:5, padding:'6px 0', background: listColors[type], color:'#111',
                      border:'2px solid #111', boxShadow:'2px 2px 0 0 #111',
                      borderRadius:0, fontFamily:'var(--font-body)', fontWeight:700,
                      fontSize:11, cursor:'pointer',
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                )
              })}
              </div>
            )}
          </React.Fragment>
        )        }
      </div>
    </div>
  )
}

// Helper components for HabitCard to match theme-editor design
function TypeIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ComponentType<{ size?: number; weight?: string }>> = {
    habit: ArrowClockwise,
    event: CalendarBlank,
    goal: Flag,
    task: X,
    note: Moon,
  }
  
  const Icon = iconMap[type] || ArrowClockwise
  return <Icon size={16} weight="bold" />
}

function TypeBadge({ type, label }: { type: string; label: string }) {
  const bgColor = LIST_TYPE_COLOR[type as keyof typeof LIST_TYPE_COLOR] || '#F59E0B'
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: bgColor,
      color: '#111',
      fontFamily: 'var(--font-space-grotesk)',
      fontSize: 9,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.1em',
      padding: '2px 6px',
      border: '1.5px solid #111',
      borderRadius: 0
    }}>
      {label}
    </span>
  )
}

function TagRow({ tags, expanded, onToggle }: { tags: string[]; expanded: boolean; onToggle: () => void }) {
  if (!expanded || !tags || tags.length === 0) return null
  
  return (
    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {tags.map((tag, index) => (
        <span
          key={index}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: '#F59E0B',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.1em',
            padding: '2px 6px',
            border: '1.5px solid #111',
            borderRadius: 0
          }}
        >
          #{tag}
        </span>
      ))}
      {!expanded && (
        <button
          onClick={onToggle}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            color: 'rgba(0,0,0,.4)',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: 9,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <CaretDown size={10}/> Mais tags
        </button>
      )}
    </div>
  )
}

function ActionBar({ type, expanded, activePanel, onPanel, themeMode }: {
  type: string;
  expanded: boolean;
  activePanel: string | null;
  onPanel: (panel: string) => void;
  themeMode: 'light' | 'dark'
}) {
  if (!expanded) return null
  
  const panels = [
    { id: 'streak', label: 'Streak', icon: ArrowClockwise },
    { id: 'calendar', label: 'Calendar', icon: CalendarBlank },
    { id: 'chart', label: 'Chart', icon: Moon }, // Simplified
    { id: 'progress', label: 'Progress', icon: Flag },
    { id: 'table', label: 'Table', icon: List },
    { id: 'priority', label: 'Priority', icon: Target },
    { id: 'kanban', label: 'Kanban', icon: Sliders },
    { id: 'urgency', label: 'Urgency', icon: Bell },
  ]
  
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      {panels.map(panel => (
        <button
          key={panel.id}
          onClick={() => onPanel(panel.id)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 0',
            background: activePanel === panel.id 
              ? (LIST_TYPE_COLOR[type as keyof typeof LIST_TYPE_COLOR] || '#F59E0B')
              : (themeMode === 'dark' ? '#1E1E1E' : '#fff'),
            color: activePanel === panel.id ? '#fff' : (themeMode === 'dark' ? '#fff' : '#111'),
            border: '2px solid #111',
            boxShadow: '2px 2px 0 0 #111',
            borderRadius: 0,
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 11,
            cursor: 'pointer'
          }}
        >
          <panel.icon size={12} weight="bold" />
          <span>{panel.label}</span>
        </button>
      ))}
    </div>
  )
}

// Placeholder panels (would be implemented separately in full version)
function StreakPanel({ item }: { item: any }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 11, color: '#666', marginBottom: 4 }}>
        Streak atual: {item.habitStreakCurrent} dias
      </p>
      <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 11, color: '#666' }}>
        Melhor streak: {item.habitStreakBest} dias
      </p>
    </div>
  )
}

function HabitCalendar({ item }: { item: any }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 11, color: '#666' }}>
        Calendário de hábito (implementação futura)
      </p>
    </div>
  )
}

function WeeklyChart({ item }: { item: any }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 11, color: '#666' }}>
        Gráfico semanal (implementação futura)
      </p>
    </div>
  )
}

function GoalProgress({ item }: { item: any }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 11, color: '#666' }}>
        Progresso da meta: {item.goalCurrentValue ?? 0}/{item.goalTargetValue ?? 100}
      </p>
    </div>
  )
}

function GoalTable({ item }: { item: any }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 11, color: '#666' }}>
        Tabela de metas (implementação futura)
      </p>
    </div>
  )
}

function TaskPriority({ item }: { item: any }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 11, color: '#666' }}>
        Prioridade da tarefa: {item.taskPriority ?? 'média'}
      </p>
    </div>
  )
}

function KanbanBoard({ item }: { item: any }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 11, color: '#666' }}>
        Kanban: {item.taskKanbanStatus ?? 'todo'}
      </p>
    </div>
  )
}

function EventUrgency({ item }: { item: any }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 11, color: '#666' }}>
        Urgência do evento: {item.eventUrgency ?? 'média'}
      </p>
    </div>
  )
}