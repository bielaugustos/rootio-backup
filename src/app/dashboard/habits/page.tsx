'use client'
import { useState, useEffect, useRef } from 'react'
import { useAppStore, Habit }           from '@/store/useAppStore'
import { toast }                        from 'sonner'
import { cn }                           from '@/lib/utils'
import { PageSkeleton }                 from '@/components/PageSkeleton'
import { NbEmptyState }                 from '@/components/NbEmptyState'
import Link                             from 'next/link'
import {
  Plus, Trash, PencilSimple,
  CaretDown, CaretUp, Check, Flag, Moon,
  Sliders, Target, ArrowClockwise, CalendarBlank,
  Lightbulb, ArrowRight, X,
} from '@phosphor-icons/react'

// ─── Constantes ───────────────────────────────────────────────────────────────
const FREE_LIMIT  = 10
const HABIT_LIMIT = 5
const IO_VALUES   = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
const IO_PER_PAGE = 5
const WEEK_LABELS = ['D','S','T','Q','Q','S','S']
const WEEK_ORDER  = [1,2,3,4,5,6,0]  // seg→dom na grid

// Ícones de tipo de lista
const LIST_TYPES = [
  { id:'habito',       label:'Hábito',       icon:'⟳' },
  { id:'evento',       label:'Evento',       icon:'△' },
  { id:'tarefa',       label:'Tarefa',       icon:'↺' },
  { id:'meta',         label:'Meta',         icon:'◎' },
  { id:'personalizado',label:'Personalizado',icon:'+' },
]

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
      fontFamily:'var(--font-space-grotesk,monospace)', fontSize:11, fontWeight:700,
    textTransform:'uppercase', letterSpacing:'.12em', color:'rgba(0,0,0,.45)',
    display:'block', marginBottom:6,
  },
  input: {
    width:'100%', background:'#fff', border:'2px solid #111', padding:'12px 14px',
    fontFamily:'var(--font-body,system-ui)', fontSize:14, fontWeight:500,
    boxShadow:'2px 2px 0 0 #111', outline:'none', borderRadius:0, color:'#111',
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
  const { habits, toggleHabit, addHabit, updateHabit, deleteHabit, plan, earnIO, habitsSearchQuery, habitsFormOpen, setHabitsFormOpen } = useAppStore()
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState<Habit | null>(null)
  const [editTab, setEditTab]     = useState<'simples'|'lista'>('simples')
  const formRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(false)
  }, [])

  // Campos do form
  const [name, setName]         = useState('')
  const [priority, setPriority] = useState<'alta'|'media'|'baixa'>('media')
  const [freq, setFreq]         = useState<'diario'|'semanal'|'personalizado'>('diario')
  const [days, setDays]         = useState([0,1,2,3,4,5,6])
  const [notes, setNotes]       = useState('')
  const [pts, setPts]           = useState(0)
  const [ptsPage, setPtsPage]   = useState(1)
  const [listType, setListType] = useState('habito')

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
  const pct   = total ? Math.round((done / total) * 100) : 0

  const totalPtsPages = Math.ceil(IO_VALUES.length / IO_PER_PAGE)
  const visibleIO     = IO_VALUES.slice((ptsPage-1)*IO_PER_PAGE, ptsPage*IO_PER_PAGE)

  function resetForm() {
    setName(''); setPriority('media'); setFreq('diario')
    setDays([0,1,2,3,4,5,6]); setNotes(''); setPts(0)
    setPtsPage(1); setListType('habito'); setEditTab('simples')
  }

  function openNew() {
    setEditing(null); resetForm(); setHabitsFormOpen(true)
    setTimeout(() => formRef.current?.focus(), 80)
  }

  function openEdit(h: Habit) {
    setEditing(h); setName(h.name); setPriority(h.priority)
    setFreq(h.freq); setDays(h.days); setNotes(h.notes ?? '')
    setPts(h.pts ?? 0); setPtsPage(1)
    setListType((h as any).listType ?? 'habito')
    setHabitsFormOpen(true)
    setTimeout(() => formRef.current?.focus(), 80)
  }

  function save() {
    if (!name.trim()) { toast.error('Digite o nome do hábito.'); return }
    if (editing) {
      updateHabit({ ...editing, name, priority, freq, days, notes, pts,
        ...(listType && { listType }) } as any)
      toast.success('Hábito atualizado!')
    } else {
      if (!canAdd) { toast.error(`Limite de ${FREE_LIMIT} hábitos no plano Free.`); return }
      addHabit({ id:Date.now(), name, priority, freq, days, notes, pts,
        done:false, icon:'⭐', tags:[], streak:0,
        createdAt:new Date().toISOString() })
      earnIO('input_registro')
      toast.success('+10 IO • hábito criado!')
    }
    setHabitsFormOpen(false)
  }

  function cancelForm() { setHabitsFormOpen(false); resetForm(); setEditing(null) }

  function toggleDay(i: number) {
    setDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
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
          <p style={{      fontFamily:'var(--font-space-grotesk)', fontSize:10, color:'rgba(0,0,0,.4)',
            fontWeight:700, letterSpacing:'.1em', marginTop:2 }}>
            {done} de {total} hoje
          </p>
        </div>
      </div>

      {/* ── FORM de edição ── */}
      {habitsFormOpen && (
        <div style={{ ...NB.card }}>

          {/* Header do form */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <span style={{ fontFamily:'var(--font-space-grotesk)', fontSize:11, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'.12em' }}>
              EDITAR
            </span>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {/* Tab Simples */}
              <button
                onClick={() => setEditTab('simples')}
                style={{
                  width:28, height:28, border:'2px solid #111',
                  background: editTab==='simples' ? '#111' : '#fff',
                  color:      editTab==='simples' ? '#fff' : '#111',
                  borderRadius:0, cursor:'pointer', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  boxShadow: editTab==='simples' ? '2px 2px 0 0 #111' : 'none',
                }}
                title="Simples"
              >
                <Sliders size={13} />
              </button>
              {/* Tab Lista */}
              <button
                onClick={() => setEditTab('lista')}
                style={{
                  width:28, height:28, border:'2px solid #111',
                  background: editTab==='lista' ? '#111' : '#fff',
                  color:      editTab==='lista' ? '#fff' : '#111',
                  borderRadius:0, cursor:'pointer', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  boxShadow: editTab==='lista' ? '2px 2px 0 0 #111' : 'none',
                }}
                title="Tipo de lista"
              >
                <Target size={13} />
              </button>
            </div>
          </div>

          {/* ── Tab: SIMPLES ── */}
          {editTab === 'simples' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Nome */}
              <div>
                <span style={NB.label}>Nome</span>
                <input
                  ref={formRef}
                  style={NB.input}
                  placeholder="Ex: Beber água"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && save()}
                />
              </div>

              {/* Prioridade */}
              <div>
                <span style={NB.label}>Prioridade</span>
                <div style={{ display:'flex', gap:8 }}>
                  {(['alta','media','baixa'] as const).map(p => {
                    const active = priority === p
                    const bg = active
                      ? (p==='alta'?'#FF6B6B':p==='media'?'#F59E0B':'#7CE577')
                      : '#fff'
                    const color = active && p==='alta' ? '#fff' : '#111'
                    return (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        style={{
                          flex:1, padding:'8px 0', border:'2px solid #111',
                          background:bg, color, borderRadius:0,
                          fontFamily:'var(--font-body)', fontWeight:700, fontSize:13,
                          cursor:'pointer', textTransform:'capitalize',
                          boxShadow: active ? '2px 2px 0 0 #111' : 'none',
                        }}
                      >
                        {p.charAt(0).toUpperCase()+p.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Frequência */}
              <div>
                <span style={NB.label}>Frequência</span>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {[{id:'diario',label:'Diário'},{id:'semanal',label:'Semanal'}].map(f => {
                    const active = freq === f.id
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFreq(f.id as any)}
                        style={{
                          padding:'8px 16px', border:'2px solid #111',
                          background: active ? '#111' : '#fff',
                          color: active ? '#fff' : '#111',
                          borderRadius:0, fontFamily:'var(--font-body)',
                          fontWeight:700, fontSize:13, cursor:'pointer',
                          boxShadow: active ? '2px 2px 0 0 #111' : 'none',
                        }}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                  {/* Personalizado — destaque amber */}
                  <button
                    onClick={() => setFreq('personalizado')}
                    style={{
                      padding:'8px 14px', border:'2px solid #111', borderRadius:0,
                      background: freq==='personalizado' ? '#F59E0B' : '#fff',
                      color: freq==='personalizado' ? '#fff' : '#111',
                      fontFamily:'var(--font-body)', fontWeight:700, fontSize:13,
                      cursor:'pointer',
                      boxShadow: freq==='personalizado' ? '2px 2px 0 0 #111' : 'none',
                    }}
                  >
                    Personalizado
                  </button>
                </div>

                {/* Grid de dias — só aparece se personalizado */}
                {freq === 'personalizado' && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:5, marginTop:10 }}>
                    {WEEK_ORDER.map((dow, i) => {
                      const active = days.includes(dow)
                      const isToday = dow === today
                      return (
                        <button
                          key={dow}
                          onClick={() => toggleDay(dow)}
                          style={{
                            border:'2px solid #111', borderRadius:0, padding:'5px 0',
                            background: active && isToday ? '#F59E0B'
                              : active ? '#7CE577' : '#fff',
                            color: active ? '#111' : 'rgba(0,0,0,.45)',
                            fontFamily:'var(--font-display,sans-serif)',
                            fontWeight:900, fontSize:12, cursor:'pointer',
                            display:'flex', flexDirection:'column',
                            alignItems:'center', gap:1,
                            boxShadow: active ? '2px 2px 0 0 #111' : 'none',
                          }}
                        >
                          <span>{WEEK_LABELS[dow]}</span>
                           <span style={{ fontFamily:'var(--font-space-grotesk)', fontSize:9,
                             fontWeight:700, opacity:.7 }}>
                            {(() => {
                              const d = new Date(); d.setDate(d.getDate() - today + dow)
                              return d.getDate()
                            })()}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Nota */}
              <div>
                <span style={NB.label}>Nota (opcional)</span>
                <input
                  style={NB.input}
                  placeholder="Ex: Porquê esse hábito importa?"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              {/* IO por conclusão */}
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <Lightbulb size={13} style={{ color:'rgba(0,0,0,.4)' }} />
                  <span style={{ ...NB.label, marginBottom:0 }}>IO por conclusão</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {/* Prev */}
                  <button
                    onClick={() => setPtsPage(p => Math.max(1, p-1))}
                    disabled={ptsPage <= 1}
                    style={{ width:32, height:32, border:'2px solid #111', background:'#fff',
                      borderRadius:0, cursor:'pointer', fontSize:16, display:'flex',
                      alignItems:'center', justifyContent:'center',
                      opacity: ptsPage<=1 ? .35 : 1 }}
                  >
                    ‹
                  </button>

                  {/* Valores */}
                  <div style={{ display:'flex', gap:5, flex:1, justifyContent:'center' }}>
                    {visibleIO.map(val => (
                      <button
                        key={val}
                        onClick={() => setPts(val)}
                        style={{
                          width:32, height:32, border:'2px solid #111', borderRadius:0,
                          background: pts===val ? '#7CE577' : '#fff',
                           color:'#111', fontFamily:'var(--font-space-grotesk)', fontSize:11,
                           fontWeight:700, cursor:'pointer',
                          boxShadow: pts===val ? '2px 2px 0 0 #111' : 'none',
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => setPtsPage(p => Math.min(totalPtsPages, p+1))}
                    disabled={ptsPage >= totalPtsPages}
                    style={{ width:32, height:32, border:'2px solid #111', background:'#fff',
                      borderRadius:0, cursor:'pointer', fontSize:16, display:'flex',
                      alignItems:'center', justifyContent:'center',
                      opacity: ptsPage>=totalPtsPages ? .35 : 1 }}
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Ações */}
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button 
                  onClick={cancelForm} 
                  style={{ ...NB.btnGhost, flex:1 }}
                  onMouseEnter={e => { const t = e.currentTarget; t.style.boxShadow = 'none'; t.style.transform = 'translate(4px,4px)' }}
                  onMouseLeave={e => { const t = e.currentTarget; t.style.boxShadow = '2px 2px 0 0 #111'; t.style.transform = '' }}
                  onMouseDown={e => { const t = e.currentTarget; t.style.boxShadow = 'none'; t.style.transform = 'translate(4px,4px)' }}
                  onMouseUp={e => { const t = e.currentTarget; t.style.boxShadow = 'none'; t.style.transform = 'translate(4px,4px)' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={save} 
                  style={{ ...NB.btnAmber, flex:2, justifyContent:'center', gap:0 }}
                  onMouseEnter={e => { const t = e.currentTarget; t.style.boxShadow = 'none'; t.style.transform = 'translate(4px,4px)' }}
                  onMouseLeave={e => { const t = e.currentTarget; t.style.boxShadow = '2px 2px 0 0 #111'; t.style.transform = '' }}
                  onMouseDown={e => { const t = e.currentTarget; t.style.boxShadow = 'none'; t.style.transform = 'translate(4px,4px)' }}
                  onMouseUp={e => { const t = e.currentTarget; t.style.boxShadow = 'none'; t.style.transform = 'translate(4px,4px)' }}
                >
                  {editing ? 'Salvar' : 'Adicionar hábito'}
                </button>
              </div>
            </div>
          )}

          {/* ── Tab: LISTA ── */}
          {editTab === 'lista' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <span style={NB.label}>Lista</span>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                 {LIST_TYPES.map(lt => {
                   const active = listType === lt.id
                   const isLocked = lt.id === 'personalizado' && plan !== 'pro'
                   return (
                     <button
                       key={lt.id}
                       onClick={() => !isLocked && setListType(lt.id)}
                       disabled={isLocked}
                       style={{
                         display:'flex', alignItems:'center', gap:5,
                         padding:'8px 12px', border:'2px solid #111', borderRadius:0,
                         background: active ? (LIST_TYPE_COLOR[lt.id] ?? '#111') : '#fff',
                         color: active ? '#fff' : '#111',
                         fontFamily:'var(--font-body)', fontWeight:700, fontSize:13,
                         cursor: isLocked ? 'not-allowed' : 'pointer',
                         opacity: isLocked ? .45 : 1,
                         boxShadow: active ? '2px 2px 0 0 #111' : 'none',
                       }}
                     >
                      <span style={{ fontSize:12 }}>{lt.icon}</span>
                      {lt.label}
                    </button>
                  )
                })}
              </div>

              {/* Pro gate */}
              {plan !== 'pro' && (
                <Link
                  href="/dashboard/profile#plano"
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 14px', background:'#9B7BFF', color:'#fff',
                    border:'3px solid #111', boxShadow:'3px 3px 0 0 #111', borderRadius:0,
                    fontFamily:'var(--font-display,sans-serif)', fontWeight:900,
                    fontSize:13, textTransform:'uppercase', letterSpacing:'.04em',
                    textDecoration:'none',
                  }}
                >
                  <span>PRO VITALÍCIO · R$12,90 ★ VER PRO</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              )}

              {/* Ações */}
              <div style={{ display:'flex', gap:8 }}>
                <button
                  onClick={() => { setListType('habito'); toast('Lista arquivada.') }}
                  style={{ ...NB.btnGhost, flex:1 }}
                >
                  Arquivar
                </button>
                <button onClick={save} style={{ ...NB.btnAmber, flex:2, justifyContent:'center' }}>
                  Salvar lista
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HabitCard no topo — o hábito que está sendo editado ── */}
      {editing && habitsFormOpen && (
        <HabitCard
          habit={editing}
          onToggle={() => {}}
          onDelete={() => {}}
          onEdit={() => {}}
          preview
        />
      )}

      {/* ── Pendentes ── */}
      {pendentes.length > 0 && (
        <div>
          <p style={{ ...NB.label, marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
            <Flag size={11} /> Pendentes ({pendentes.length})
          </p>
          {(showAllPending ? pendentes : pendentes.slice(0,HABIT_LIMIT)).map(h => (
            <HabitCard key={h.id} habit={h} onToggle={toggleHabit}
              onDelete={deleteHabit} onEdit={openEdit} />
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
          <p style={{ ...NB.label, marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
            <Check size={11} /> Concluídos hoje ({concluidos.length})
          </p>
          {(showAllCompleted ? concluidos : concluidos.slice(0,HABIT_LIMIT)).map(h => (
            <HabitCard key={h.id} habit={h} done onToggle={toggleHabit}
              onDelete={deleteHabit} onEdit={openEdit} />
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
           <p style={{ ...NB.label, marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
             <Moon size={11} /> Amanhã · {amanha.length}
           </p>
           {amanha.map(h => (
             <HabitCard
               key={h.id}
               habit={h}
               onToggle={toggleHabit}
               onDelete={deleteHabit}
               onEdit={openEdit}
             />
           ))}
         </div>
       )}

       {/* ── Empty state ── */}
       {habits.length === 0 && !habitsFormOpen && (
         <NbEmptyState
           icon="🌱"
           title="Nenhum hábito ainda"
           sub="Escolha uma coisa pequena. Só uma. Faça hoje."
           action={{ label: 'Criar meu primeiro hábito', onClick: openNew }}
         />
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
function HabitCard({
  habit, onToggle, onDelete, onEdit, done=false, preview=false,
}: {
  habit:    Habit
  onToggle: (id:number) => void
  onDelete: (id:number) => void
  onEdit:   (h:Habit)  => void
  done?:    boolean
  preview?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const pri = PRI_COLOR[habit.priority]

  const tagBg = habit.priority==='alta'  ? '#FF6B6B'
              : habit.priority==='media' ? '#F59E0B' : '#7CE577'
  const tagColor = habit.priority==='alta' ? '#fff' : '#111'

  return (
    <div style={{ marginBottom:8 }}>
      <div style={{
        background:'#fff', border:'3px solid #111', boxShadow:'4px 4px 0 0 #111',
        borderRadius:0, padding:'16px 18px',
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
                background: done ? tagBg : '#fff',
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
              color: done ? 'rgba(0,0,0,.45)' : '#111',
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
              }}>
                +{habit.pts}
              </span>
            )}
            {!preview && (
              <button
                onClick={() => setExpanded(v=>!v)}
                style={{ background:'none', border:'none', cursor:'pointer',
                  color:'rgba(0,0,0,.4)', display:'flex', alignItems:'center' }}
              >
                {expanded ? <CaretUp size={14}/> : <CaretDown size={14}/>}
              </button>
            )}
          </div>
        </div>

        {/* Nota */}
        {habit.notes && (
          <p style={{ fontFamily:'var(--font-body)', fontSize:12,
            color:'rgba(0,0,0,.45)', marginTop:6, marginLeft: preview?0:32 }}>
            {habit.notes}
          </p>
        )}

        {/* Ações — expand */}
        {expanded && !preview && (
          <div style={{ display:'flex', gap:8, marginTop:10, marginLeft:32 }}>
            <button
              onClick={() => { onEdit(habit); setExpanded(false) }}
              style={{
                flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                gap:5, padding:'8px 0', background:'#fff', color:'#111',
                border:'2px solid #111', boxShadow:'2px 2px 0 0 #111',
                borderRadius:0, fontFamily:'var(--font-body)', fontWeight:700,
                fontSize:12, cursor:'pointer',
              }}
            >
              <PencilSimple size={12}/> Editar
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              style={{
                flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                gap:5, padding:'8px 0', background:'#FF6B6B', color:'#fff',
                border:'2px solid #111', boxShadow:'2px 2px 0 0 #111',
                borderRadius:0, fontFamily:'var(--font-body)', fontWeight:700,
                fontSize:12, cursor:'pointer',
              }}
            >
              <Trash size={12}/> Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}