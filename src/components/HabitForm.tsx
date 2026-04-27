'use client'
import { useState } from 'react'
import { Habit } from '@/store/useAppStore'
import { toast } from 'sonner'
import { Sliders, Target, Lightbulb, ArrowRight } from '@phosphor-icons/react'
import Link from 'next/link'

// ─── Constantes ───────────────────────────────────────────────────────────────
const IO_VALUES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
const IO_PER_PAGE = 5
const WEEK_LABELS = ['D','S','T','Q','Q','S','S']
const WEEK_ORDER = [1,2,3,4,5,6,0]  // seg→dom na grid

// Ícones de tipo de lista - baseado no schema do core
const LIST_TYPES = [
  { id:'habit',       label:'Hábito',       icon:'⟳' },
  { id:'event',       label:'Evento',       icon:'△' },
  { id:'goal',        label:'Meta',         icon:'◎' },
  { id:'task',        label:'Tarefa',       icon:'↺' },
  { id:'note',        label:'Nota',         icon:'📝' },
]

// Cores por prioridade
const PRI_COLOR: Record<string,{ fill:string; dot:string }> = {
  alta:  { fill:'#FF6B6B', dot:'#FF6B6B' },
  media: { fill:'#F59E0B', dot:'#F59E0B' },
  baixa: { fill:'#7CE577', dot:'#7CE577' },
}

// Cores por tipo de lista
const LIST_TYPE_COLOR: Record<string, string> = {
  habito:    '#F5EFDF',
  evento:    '#9B7BFF',
  tarefa:    '#6FB8FF',
  meta:      '#F59E0B',
}

// ─── Tipo do componente ─────────────────────────────────────────────────────
type HabitFormProps = {
  editing: Habit | null
  onSave: (habit: Omit<Habit, 'id' | 'icon' | 'tags' | 'streak' | 'createdAt' | 'listType'>) => void
  onCancel: () => void
  plan: string
  canAdd: boolean
  today: number
  formRef: React.RefObject<HTMLInputElement>
  themeMode: 'light' | 'dark'
}

// ─── Componente HabitForm ───────────────────────────────────────────────────────
export function HabitForm({
  editing,
  onSave,
  onCancel,
  plan,
  canAdd,
  today,
  formRef,
  themeMode,
}: HabitFormProps) {
  const [editTab, setEditTab] = useState<'simples'>('simples')
   
   // Campos do form
   const [name, setName]         = useState(editing?.name ?? '')
   const [priority, setPriority] = useState<'alta'|'media'|'baixa'>(editing?.priority ?? 'media')
   const [freq, setFreq]         = useState<'diario'|'semanal'|'personalizado'>(editing?.freq ?? 'diario')
   const [days, setDays]         = useState(editing?.days ?? [0,1,2,3,4,5,6])
   const [notes, setNotes]       = useState(editing?.notes ?? '')
   const [pts, setPts]           = useState(editing?.pts ?? 0)
   const [ptsPage, setPtsPage]   = useState(1)

  const totalPtsPages = Math.ceil(IO_VALUES.length / IO_PER_PAGE)
  const visibleIO     = IO_VALUES.slice((ptsPage-1)*IO_PER_PAGE, ptsPage*IO_PER_PAGE)

   function handleSave() {
     if (!name.trim()) { toast.error('Digite o nome do hábito.'); return }
     
     onSave({
       name,
       priority,
       freq,
       days,
       notes,
       pts,
       done: editing?.done ?? false,
     } as any)
   }

  function toggleDay(i: number) {
    setDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  // Estilos responsivos ao tema
  const NB: Record<string, React.CSSProperties> = {
    card: {
      background: themeMode === 'dark' ? '#1E1E1E' : '#fff',
      border:'4px solid #111',
      boxShadow:'4px 4px 0 0 #111',
      borderRadius:0,
      padding:20,
    },
    label: {
        fontFamily:'var(--font-space-grotesk,monospace)', fontSize:11, fontWeight:700,
      textTransform:'uppercase', letterSpacing:'.12em', 
      color: themeMode === 'dark' ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.45)',
      display:'block', marginBottom:6,
    },
    input: {
      width:'100%', 
      background: themeMode === 'dark' ? '#1E1E1E' : '#fff',
      border:'2px solid #111', 
      padding:'12px 14px',
      fontFamily:'var(--font-body,system-ui)', fontSize:14, fontWeight:500,
      boxShadow:'2px 2px 0 0 #111', outline:'none', borderRadius:0, 
      color: themeMode === 'dark' ? '#fff' : '#111',
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
      padding:'12px 18px', 
      background: themeMode === 'dark' ? '#1E1E1E' : '#fff',
      color: themeMode === 'dark' ? '#fff' : '#111',
      border:'2px solid #111', boxShadow:'2px 2px 0 0 #111', borderRadius:0,
      fontFamily:'var(--font-body,system-ui)', fontWeight:700, fontSize:13,
      cursor:'pointer', transition:'all .075s ease',
    },
  }

  return (
    <div style={{ ...NB.card }}>
      {/* Header do form */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <span style={{ fontFamily:'var(--font-space-grotesk)', fontSize:11, fontWeight:700,
          textTransform:'uppercase', letterSpacing:'.12em',
          color: themeMode === 'dark' ? '#fff' : 'rgba(0,0,0,.45)' }}>
          EDITAR
        </span>
       <div style={{ display:'flex', gap:8, alignItems:'center' }}>
           {/* Tab Simples */}
           <button
             onClick={() => setEditTab('simples')}
             style={{
               width:28, height:28, border:'2px solid #111',
               background: editTab==='simples' ? '#111' : (themeMode === 'dark' ? '#1E1E1E' : '#fff'),
               color:      editTab==='simples' ? '#fff' : (themeMode === 'dark' ? '#fff' : '#111'),
               borderRadius:0, cursor:'pointer', display:'flex',
               alignItems:'center', justifyContent:'center',
               boxShadow: editTab==='simples' ? '2px 2px 0 0 #111' : 'none',
             }}
           >
             <Sliders size={13} />
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
              onKeyDown={e => e.key === 'Enter' && handleSave()}
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
                  : (themeMode === 'dark' ? '#1E1E1E' : '#fff')
                const color = active && p==='alta' ? '#fff' : (themeMode === 'dark' ? '#fff' : '#111')
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
                      background: active ? '#111' : (themeMode === 'dark' ? '#1E1E1E' : '#fff'),
                      color: active ? '#fff' : (themeMode === 'dark' ? '#fff' : '#111'),
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
                  background: freq==='personalizado' ? '#F59E0B' : (themeMode === 'dark' ? '#1E1E1E' : '#fff'),
                  color: freq==='personalizado' ? '#fff' : (themeMode === 'dark' ? '#fff' : '#111'),
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
                          : active ? '#7CE577' : (themeMode === 'dark' ? '#1E1E1E' : '#fff'),
                        color: active ? '#111' : (themeMode === 'dark' ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.45)'),
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
              <Lightbulb size={13} style={{ color:themeMode === 'dark' ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)' }} />
              <span style={{ ...NB.label, marginBottom:0 }}>IO por conclusão</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {/* Prev */}
              <button
                onClick={() => setPtsPage(p => Math.max(1, p-1))}
                disabled={ptsPage <= 1}
                style={{ width:32, height:32, border:'2px solid #111', background: themeMode === 'dark' ? '#1E1E1E' : '#fff',
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
                      background: pts===val ? '#7CE577' : (themeMode === 'dark' ? '#1E1E1E' : '#fff'),
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
                style={{ width:32, height:32, border:'2px solid #111', background: themeMode === 'dark' ? '#1E1E1E' : '#fff',
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
               onClick={onCancel} 
               style={{ ...NB.btnGhost, flex:1 }}
               onMouseEnter={e => { const t = e.currentTarget; t.style.boxShadow = 'none'; t.style.transform = 'translate(4px,4px)' }}
               onMouseLeave={e => { const t = e.currentTarget; t.style.boxShadow = '2px 2px 0 0 #111'; t.style.transform = '' }}
               onMouseDown={e => { const t = e.currentTarget; t.style.boxShadow = 'none'; t.style.transform = 'translate(4px,4px)' }}
               onMouseUp={e => { const t = e.currentTarget; t.style.boxShadow = 'none'; t.style.transform = 'translate(4px,4px)' }}
             >
               Cancelar
             </button>
             <button 
               onClick={handleSave} 
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
     </div>
   )
 }