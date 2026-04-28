'use client'
import { useState, useEffect, useMemo, useRef, Suspense } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { saveStorage, storage, formatBRL, todayISO } from '@/lib/utils'
import { Transaction, FinancialGoal } from '@/types'
import { PageSkeleton } from '@/components/PageSkeleton'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, Trash, Plus, CaretLeft, CaretRight, PiggyBank, PencilSimple, ArrowCounterClockwise, PaperPlaneTilt } from '@phosphor-icons/react'

const KEY = { transactions:'io_fin_transactions', goals:'io_fin_goals', emergency:'io_fin_emergency' }
const CATS_IN  = ['Salário','Freelance','Investimento','Outros']
const CATS_OUT = ['Alimentação','Transporte','Moradia','Lazer','Saúde','Educação','Outros']

const sc = (isDark: boolean): React.CSSProperties => ({
  background: 'var(--secondary-background)', border:'2px solid var(--border)',
  borderRadius:5, boxShadow:'var(--shadow)',
})
const inp = (): React.CSSProperties => ({
  width:'100%', padding:'10px 12px', fontSize:14,
  background:'var(--background)', color:'var(--foreground)',
  border:'2px solid var(--border)', borderRadius:4,
  fontFamily:'inherit', fontWeight:500, outline:'none',
})
const btnP = (): React.CSSProperties => ({
  display:'flex', alignItems:'center', justifyContent:'space-between',
  width:'100%', padding:'12px 16px',
  background:'var(--c-goal,#F59E0B)', color:'#111',
  border:'2px solid var(--border)', boxShadow:'var(--shadow)',
  borderRadius:4, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit',
})
const btnG = (): React.CSSProperties => ({
  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
  padding:'10px 14px', background:'var(--secondary-background)',
  color:'var(--foreground)', border:'2px solid var(--border)',
  boxShadow:'var(--shadow-nb-sm,2px 2px 0 #1a1814)', borderRadius:4,
  fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit',
})
const lbl = (): React.CSSProperties => ({
  fontFamily:'inherit', fontSize:10, fontWeight:700, letterSpacing:'.14em',
  textTransform:'uppercase', color:'var(--foreground)', opacity:.45, display:'block', marginBottom:5,
})

export default function FinancePage() {
  return <Suspense fallback={<PageSkeleton />}><FinanceContent /></Suspense>
}

function FinanceContent() {
  const { themeMode } = useAppStore()
  const isDark = themeMode === 'dark'
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage(KEY.transactions, []))
  const [goals, setGoals] = useState<FinancialGoal[]>(() => storage(KEY.goals, []))
  const [emergency, setEmergency] = useState(() => storage(KEY.emergency, { current:0, target:5000 }))
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'fin'|'chat'|'reserva'|'metas'>('fin')
  const [showForm, setShowForm] = useState(false)
  const [txType, setTxType] = useState<'income'|'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('')
  const [txDate, setTxDate] = useState(todayISO())
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [editingGoal, setEditingGoal] = useState<FinancialGoal|null>(null)
  const [showEmerForm, setShowEmerForm] = useState(false)
  const [emerTarget, setEmerTarget] = useState('')
  const [emerAport, setEmerAport] = useState('')
  const [lastAport, setLastAport] = useState<number|null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMsgs, setChatMsgs] = useState<{t:'u'|'a';text?:string;d?:any;id:number}[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatEnd = useRef<HTMLDivElement>(null)

  useEffect(() => { setLoading(false) }, [])
  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth'}) }, [chatMsgs])

  const currentMonth = useMemo(() => currentDate.toISOString().slice(0,7), [currentDate])
  const monthLabel   = useMemo(() => currentDate.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}), [currentDate])
  const txMes   = useMemo(() => transactions.filter(t => t.date?.startsWith(currentMonth)), [transactions, currentMonth])
  const income  = txMes.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0)
  const expense = txMes.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0)
  const balance = income - expense

  function addTx() {
    const val = parseFloat(amount.replace(',','.'))
    if (!val||!desc) return
    const novo:Transaction = {id:Date.now(),type:txType,amount:val,description:desc,category:cat||'Outros',date:txDate}
    const lista=[novo,...transactions]; setTransactions(lista); saveStorage(KEY.transactions,lista)
    setAmount(''); setDesc(''); setCat(''); setTxDate(todayISO()); setShowForm(false)
  }
  function delTx(id:number){const l=transactions.filter(t=>t.id!==id);setTransactions(l);saveStorage(KEY.transactions,l)}
  function saveGoal(){
    if(!goalName||!goalTarget)return
    if(editingGoal){const l=goals.map(g=>g.id===editingGoal.id?{...g,name:goalName,target:parseFloat(goalTarget),deadline:goalDeadline||undefined}:g);setGoals(l);saveStorage(KEY.goals,l)}
    else{const n:FinancialGoal={id:Date.now(),name:goalName,target:parseFloat(goalTarget),saved:0,deadline:goalDeadline||undefined,aportes:[]};const l=[n,...goals];setGoals(l);saveStorage(KEY.goals,l)}
    setGoalName('');setGoalTarget('');setGoalDeadline('');setEditingGoal(null);setShowGoalForm(false)
  }
  function delGoal(id:number){const l=goals.filter(g=>g.id!==id);setGoals(l);saveStorage(KEY.goals,l)}
  function saveEmer(){
    const t=parseFloat(emerTarget.replace(',','.'))
    if(!t||t<=0)return
    const n={...emergency,target:t};setEmergency(n);saveStorage(KEY.emergency,n);setEmerTarget('');setShowEmerForm(false)
  }
  function addAport(){
    const a=parseFloat(emerAport.replace(',','.'))
    if(!a||a<=0)return
    const n={...emergency,current:emergency.current+a};setEmergency(n);saveStorage(KEY.emergency,n);setLastAport(a);setEmerAport('')
  }
  function undoAport(){
    if(lastAport===null)return
    const n={...emergency,current:Math.max(0,emergency.current-lastAport)};setEmergency(n);saveStorage(KEY.emergency,n);setLastAport(null)
  }
  function sendChat(){
    const text=chatInput.trim();if(!text||chatLoading)return
    setChatMsgs(p=>[...p,{t:'u',text,id:Date.now()}]);setChatInput('');setChatLoading(true)
    setTimeout(()=>{setChatMsgs(p=>[...p,{t:'a',d:{resposta:'Entendido! Use a aba Finanças para registrar transações.'},id:Date.now()+1}]);setChatLoading(false)},800)
  }

  if (loading) return <PageSkeleton />

  const TABS:[typeof tab,string][] = [['fin','Finanças'],['chat','Assistente'],['reserva','Reserva'],['metas','Metas']]

  return (
    <div style={{padding:'24px 16px 80px',maxWidth:672,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>
      {/* Nav mês */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>setCurrentDate(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{...btnG(),width:36,height:36,padding:0}}><CaretLeft size={14}/></button>
        <span style={{fontWeight:700,fontSize:15,textTransform:'capitalize'}}>{monthLabel}</span>
        <button onClick={()=>setCurrentDate(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{...btnG(),width:36,height:36,padding:0}}><CaretRight size={14}/></button>
      </div>
      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'2px solid var(--border)'}}>
        {TABS.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id as typeof tab)}
            style={{flex:1,padding:'9px 4px',fontSize:12,fontWeight:700,background:tab===id?'var(--c-goal,#F59E0B)':'transparent',
              color:tab===id?'#111':'var(--foreground)',border:'none',borderBottom:`2px solid ${tab===id?'var(--c-goal,#F59E0B)':'var(--border)'}`,
              cursor:'pointer',fontFamily:'inherit',letterSpacing:'.04em',textTransform:'uppercase',opacity:tab===id?1:.6}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── FINANÇAS ── */}
      {tab==='fin'&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Saldo */}
          <div style={{...sc(isDark),padding:20,textAlign:'center'}}>
            <span style={lbl()}>Saldo do mês</span>
            <div style={{fontFamily:'monospace',fontWeight:700,fontSize:36,marginBottom:14,
              color:balance>=0?'#22c55e':'var(--destructive-pastel,#FF6B6B)'}}>
              {formatBRL(balance)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <button onClick={()=>{setTxType('income');setShowForm(true)}}
                style={{...btnG(),justifyContent:'center',background:'var(--c-habit,#F5EFDF)',color:'#111',border:'2px solid var(--c-habit-b,#D4C9A9)'}}>
                <ArrowUp size={14}/> Entrada
              </button>
              <button onClick={()=>{setTxType('expense');setShowForm(true)}}
                style={{...btnG(),justifyContent:'center',background:'var(--destructive-pastel,#FF6B6B)',color:'#fff',border:'2px solid var(--border)'}}>
                <ArrowDown size={14}/> Saída
              </button>
            </div>
          </div>
          {/* Mini stats */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div style={{...sc(isDark),padding:14,borderColor:'var(--c-habit-b)',background:'var(--c-habit,#F5EFDF)'}}>
              <span style={{...lbl(),color:'#0C0C0C'}}>Entradas</span>
              <div style={{fontFamily:'monospace',fontWeight:700,fontSize:20,color:'#0C0C0C'}}>{formatBRL(income)}</div>
            </div>
            <div style={{...sc(isDark),padding:14,background:'var(--destructive-pastel,#FF6B6B)',borderColor:'var(--border)',opacity:.9}}>
              <span style={{...lbl(),color:'#fff'}}>Saídas</span>
              <div style={{fontFamily:'monospace',fontWeight:700,fontSize:20,color:'#fff'}}>{formatBRL(expense)}</div>
            </div>
          </div>
          {/* Form */}
          {showForm&&(
            <div style={{...sc(isDark),padding:16,display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'flex',gap:8}}>
                {(['income','expense']as const).map(t=>(
                  <button key={t} onClick={()=>setTxType(t)}
                    style={{flex:1,padding:'9px 0',border:'2px solid var(--border)',borderRadius:4,
                      background:txType===t?(t==='income'?'var(--c-habit,#F5EFDF)':'var(--destructive-pastel,#FF6B6B)'):'var(--background)',
                      color:txType===t&&t==='expense'?'#fff':'var(--foreground)',
                      fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
                    {t==='income'?'↑ Receita':'↓ Despesa'}
                  </button>
                ))}
              </div>
              <div><span style={lbl()}>Valor (R$)</span><input style={inp()} type="number" placeholder="0,00" value={amount} onChange={e=>setAmount(e.target.value)}/></div>
              <div><span style={lbl()}>Descrição</span><input style={inp()} placeholder="Ex: Mercado..." value={desc} onChange={e=>setDesc(e.target.value)}/></div>
              <div>
                <span style={lbl()}>Categoria</span>
                <select style={{...inp(),appearance:'none' as any}} value={cat} onChange={e=>setCat(e.target.value)}>
                  <option value="">Selecionar...</option>
                  {(txType==='income'?CATS_IN:CATS_OUT).map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><span style={lbl()}>Data</span><input style={inp()} type="date" value={txDate} onChange={e=>setTxDate(e.target.value)}/></div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={addTx} style={{...btnP(),flex:2}}><span>Salvar</span></button>
                <button onClick={()=>setShowForm(false)} style={{...btnG(),flex:1,justifyContent:'center'}}>Cancelar</button>
              </div>
            </div>
          )}
          {/* Lista */}
          <div style={{...sc(isDark),overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontWeight:700,fontSize:13}}>Movimentações</span>
              <Button
                onClick={()=>{setTxType('expense');setShowForm(true)}}
                variant="io"
              ><Plus size={14} /> Nova entrada</Button>
            </div>
            {txMes.length===0?(
              <div style={{padding:'32px 16px',textAlign:'center'}}>
                <p style={{...lbl(),textAlign:'center',marginBottom:12}}>Sem movimentações este mês</p>
                <button onClick={()=>{setTxType('expense');setShowForm(true)}} style={{...btnP(),justifyContent:'center'}}><span>Registrar transação</span></button>
              </div>
            ):txMes.slice(0,10).map(t=>(
              <div key={t.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:34,height:34,borderRadius:4,flexShrink:0,border:'2px solid var(--border)',
                  background:t.type==='income'?'var(--c-habit,#F5EFDF)':'var(--destructive-pastel,#FF6B6B)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {t.type==='income'?<ArrowUp size={14} style={{color:'#0C0C0C'}}/>:<ArrowDown size={14} style={{color:'#fff'}}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.description}</p>
                  <p style={{fontSize:11,opacity:.5}}>{t.category} · {t.date}</p>
                </div>
                <span style={{fontFamily:'monospace',fontWeight:700,fontSize:13,flexShrink:0,
                  color:t.type==='income'?'#22c55e':'var(--destructive-pastel,#FF6B6B)'}}>
                  {t.type==='income'?'+':'−'}{formatBRL(t.amount)}
                </span>
                <button onClick={()=>delTx(t.id)} style={{background:'none',border:'none',cursor:'pointer',opacity:.4,color:'var(--foreground)',padding:4}}><Trash size={13}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CHAT ── */}
      {tab==='chat'&&(
        <div style={{...sc(isDark),display:'flex',flexDirection:'column',height:'calc(100vh - 280px)',overflow:'hidden'}}>
          <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
            {chatMsgs.length===0&&<div style={{textAlign:'center',padding:'40px 0',opacity:.4}}><p style={{fontSize:13}}>Assistente financeiro</p><p style={{fontSize:11,marginTop:4}}>Descreva uma transação em linguagem natural</p></div>}
            {chatMsgs.map(m=>(
              <div key={m.id} style={{alignSelf:m.t==='u'?'flex-end':'flex-start',maxWidth:'80%',
                background:m.t==='u'?'var(--c-goal,#F59E0B)':'var(--background)',
                border:'2px solid var(--border)',borderRadius:5,padding:'10px 14px',fontSize:13}}>
                {m.t==='u'?m.text:m.d?.resposta}
              </div>
            ))}
            {chatLoading&&<div style={{alignSelf:'flex-start',opacity:.5,fontSize:20,letterSpacing:4}}>···</div>}
            <div ref={chatEnd}/>
          </div>
          <div style={{padding:'12px 14px',borderTop:'1px solid var(--border)',display:'flex',gap:8}}>
            <input style={{...inp(),flex:1}} placeholder="Ex: Recebi 3000 de salário..."
              value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&sendChat()}/>
            <button onClick={sendChat} style={{...btnG(),width:40,height:40,padding:0,background:'var(--c-goal,#F59E0B)',color:'#111',border:'2px solid var(--border)'}}>
              <PaperPlaneTilt size={15} weight="fill"/>
            </button>
          </div>
        </div>
      )}

      {/* ── RESERVA ── */}
      {tab==='reserva'&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{...sc(isDark),padding:20,textAlign:'center'}}>
            <PiggyBank size={40} style={{color:'var(--c-goal,#F59E0B)',margin:'0 auto 12px'}}/>
            <span style={lbl()}>Reserva de emergência</span>
            <div style={{fontFamily:'monospace',fontWeight:700,fontSize:32,marginBottom:6}}>{formatBRL(emergency.current)}</div>
            <div style={{fontSize:12,opacity:.5,marginBottom:14}}>Meta: {formatBRL(emergency.target)}</div>
            <div style={{height:8,background:'var(--background)',border:'1.5px solid var(--border)',borderRadius:4,overflow:'hidden',marginBottom:6}}>
              <div style={{height:'100%',background:'var(--c-goal,#F59E0B)',width:`${Math.min((emergency.current/emergency.target)*100,100)}%`}}/>
            </div>
            <div style={{fontSize:11,opacity:.5,marginBottom:16}}>{Math.round((emergency.current/emergency.target)*100)}% alcançado</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowEmerForm(true)} style={{...btnG(),flex:1,justifyContent:'center'}}>Editar meta</button>
              <button onClick={()=>setEmerAport('0')} style={{...btnP(),flex:1,justifyContent:'center'}}><span>Aportar</span></button>
            </div>
            {lastAport!==null&&<button onClick={undoAport} style={{...btnG(),width:'100%',justifyContent:'center',marginTop:8,fontSize:12,gap:6}}><ArrowCounterClockwise size={13}/>Desfazer ({formatBRL(lastAport)})</button>}
          </div>
          {showEmerForm&&(
            <div style={{...sc(isDark),padding:16,display:'flex',flexDirection:'column',gap:12}}>
              <span style={lbl()}>Meta da reserva (R$)</span>
              <input style={inp()} type="number" placeholder="0,00" value={emerTarget} onChange={e=>setEmerTarget(e.target.value)}/>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {[3000,5000,10000,15000,20000].map(v=><button key={v} onClick={()=>setEmerTarget(String(v))} style={{...btnG(),padding:'5px 10px',fontSize:12}}>{formatBRL(v)}</button>)}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={saveEmer} style={{...btnP(),flex:2}}><span>Salvar</span></button>
                <button onClick={()=>setShowEmerForm(false)} style={{...btnG(),flex:1,justifyContent:'center'}}>Cancelar</button>
              </div>
            </div>
          )}
          {emerAport!==''&&(
            <div style={{...sc(isDark),padding:16,display:'flex',flexDirection:'column',gap:12}}>
              <span style={lbl()}>Valor do aporte (R$)</span>
              <input style={inp()} type="number" placeholder="0,00" value={emerAport} onChange={e=>setEmerAport(e.target.value)}/>
              <div style={{display:'flex',gap:8}}>
                <button onClick={addAport} style={{...btnP(),flex:2}}><span>Confirmar</span></button>
                <button onClick={()=>setEmerAport('')} style={{...btnG(),flex:1,justifyContent:'center'}}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── METAS ── */}
      {tab==='metas'&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {showGoalForm&&(
            <div style={{...sc(isDark),padding:16,display:'flex',flexDirection:'column',gap:12}}>
              <span style={{fontWeight:700,fontSize:14}}>{editingGoal?'Editar meta':'Nova meta'}</span>
              <input style={inp()} placeholder="Nome da meta" value={goalName} onChange={e=>setGoalName(e.target.value)}/>
              <input style={inp()} type="number" placeholder="Valor (R$)" value={goalTarget} onChange={e=>setGoalTarget(e.target.value)}/>
              <input style={inp()} type="date" value={goalDeadline} onChange={e=>setGoalDeadline(e.target.value)}/>
              <div style={{display:'flex',gap:8}}>
                <button onClick={saveGoal} style={{...btnP(),flex:2}}><span>Salvar</span></button>
                <button onClick={()=>{setShowGoalForm(false);setEditingGoal(null)}} style={{...btnG(),flex:1,justifyContent:'center'}}>Cancelar</button>
              </div>
            </div>
          )}
          {goals.length===0&&!showGoalForm?(
            <div style={{...sc(isDark),padding:'32px 16px',textAlign:'center'}}>
              <p style={{...lbl(),textAlign:'center',marginBottom:8}}>Nenhuma meta ainda</p>
              <p style={{fontSize:13,opacity:.5,marginBottom:16}}>Defina um objetivo e acompanhe.</p>
              <button onClick={()=>setShowGoalForm(true)} style={btnP()}><span>Criar meta</span></button>
            </div>
          ):goals.map(g=>{
            const pct=g.target>0?Math.min(Math.round((g.saved/g.target)*100),100):0
            return(
              <div key={g.id} style={{...sc(isDark),padding:14}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <span style={{fontWeight:700,fontSize:14}}>{g.name}</span>
                  <div style={{display:'flex',gap:4}}>
                    <button onClick={()=>{setEditingGoal(g);setGoalName(g.name);setGoalTarget(String(g.target));setGoalDeadline(g.deadline||'');setShowGoalForm(true)}} style={{background:'none',border:'none',cursor:'pointer',opacity:.5,color:'var(--foreground)'}}><PencilSimple size={13}/></button>
                    <button onClick={()=>delGoal(g.id)} style={{background:'none',border:'none',cursor:'pointer',opacity:.5,color:'var(--foreground)'}}><Trash size={13}/></button>
                  </div>
                </div>
                <div style={{height:7,background:'var(--background)',border:'1.5px solid var(--border)',borderRadius:4,overflow:'hidden',marginBottom:6}}>
                  <div style={{height:'100%',background:'var(--c-goal,#F59E0B)',width:`${pct}%`}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,opacity:.6}}>
                  <span style={{fontFamily:'monospace',fontWeight:700}}>{formatBRL(g.saved)} / {formatBRL(g.target)}</span>
                  {g.deadline&&<span>{new Date(g.deadline).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
            )
          })}
          {goals.length>0&&!showGoalForm&&<button onClick={()=>setShowGoalForm(true)} style={{...btnP(),justifyContent:'center',gap:6}}><Plus size={14}/> Nova meta</button>}
        </div>
      )}
    </div>
  )
}