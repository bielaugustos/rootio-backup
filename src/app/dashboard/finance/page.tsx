'use client'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { saveStorage, storage, formatBRL, todayISO } from '@/lib/utils'
import { Transaction, FinancialGoal } from '@/types'
import { PageSkeleton } from '@/components/PageSkeleton'
import { ArrowUp, ArrowDown, Trash, Plus, CaretLeft, CaretRight, PiggyBank, PencilSimple, ArrowCounterClockwise } from '@phosphor-icons/react'

const KEY = { transactions:'io_fin_transactions', goals:'io_fin_goals', emergency:'io_fin_emergency' }
const CATS_IN  = ['Salário','Freelance','Investimento','Outros']
const CATS_OUT = ['Alimentação','Transporte','Moradia','Lazer','Saúde','Educação','Outros']

// Botões design system
function BtnP({children,onClick,style={}}:{children:React.ReactNode;onClick:()=>void;style?:React.CSSProperties}){
  const[h,setH]=useState(false);const[p,setP]=useState(false)
  return(<button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>{setH(false);setP(false)}}
    onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)}
    style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',
      background:'var(--main,var(--c-goal,#F59E0B))',color:'var(--main-foreground,#111)',
      border:'2px solid var(--border)',borderRadius:4,fontWeight:700,fontSize:13,cursor:'pointer',
      fontFamily:'inherit',boxShadow:h||p?'none':'var(--shadow,4px 4px 0 var(--border))',
      transform:h||p?'translate(4px,4px)':'none',transition:'box-shadow .1s,transform .1s',...style}}>{children}</button>)
}
function BtnG({children,onClick,style={}}:{children:React.ReactNode;onClick:()=>void;style?:React.CSSProperties}){
  const[h,setH]=useState(false);const[p,setP]=useState(false)
  return(<button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>{setH(false);setP(false)}}
    onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)}
    style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'10px 14px',
      background:'var(--secondary-background)',color:'var(--foreground)',border:'2px solid var(--border)',
      borderRadius:4,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit',
      boxShadow:h||p?'none':'4px 4px 0 var(--border)',
      transform:h||p?'translate(4px,4px)':'none',transition:'box-shadow .1s,transform .1s',...style}}>{children}</button>)
}

const inp:React.CSSProperties={width:'100%',padding:'10px 12px',fontSize:13,background:'var(--background)',
  color:'var(--foreground)',border:'2px solid var(--border)',borderRadius:4,fontFamily:'inherit',
  fontWeight:500,outline:'none',boxShadow:'2px 2px 0 var(--border)'}
const lbl:React.CSSProperties={fontSize:9,fontWeight:700,letterSpacing:'.12em',color:'var(--foreground)',
  opacity:.4,textTransform:'uppercase' as const,display:'block',marginBottom:5}

export default function FinancePage(){
  return <Suspense fallback={<PageSkeleton/>}><FinanceContent/></Suspense>
}

function FinanceContent(){
  const{themeMode}=useAppStore()
  const[currentDate,setCurrentDate]=useState(()=>new Date())
  const[transactions,setTransactions]=useState<Transaction[]>(()=>storage(KEY.transactions,[]))
  const[goals,setGoals]=useState<FinancialGoal[]>(()=>storage(KEY.goals,[]))
  const[emergency,setEmergency]=useState(()=>storage(KEY.emergency,{current:0,target:5000}))
  const[loading,setLoading]=useState(true)
  const[tab,setTab]=useState<'fin'|'reserva'|'metas'>('fin')
  // Transação
  const[showForm,setShowForm]=useState(false)
  const[txType,setTxType]=useState<'income'|'expense'>('expense')
  const[amount,setAmount]=useState('')
  const[desc,setDesc]=useState('')
  const[cat,setCat]=useState('')
  const[txDate,setTxDate]=useState(todayISO())
  // Meta
  const[showGoalForm,setShowGoalForm]=useState(false)
  const[goalName,setGoalName]=useState('')
  const[goalTarget,setGoalTarget]=useState('')
  const[goalDeadline,setGoalDeadline]=useState('')
  const[editingGoal,setEditingGoal]=useState<FinancialGoal|null>(null)
  const[aportGoalId,setAportGoalId]=useState<number|null>(null)
  const[aportValue,setAportValue]=useState('')
  // Reserva
  const[showEmerForm,setShowEmerForm]=useState(false)
  const[emerTarget,setEmerTarget]=useState('')
  const[emerAport,setEmerAport]=useState('')
  const[lastAport,setLastAport]=useState<number|null>(null)

  useEffect(()=>{setLoading(false)},[])
  const currentMonth=useMemo(()=>currentDate.toISOString().slice(0,7),[currentDate])
  const monthLabel=useMemo(()=>currentDate.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}),[currentDate])
  const txMes=useMemo(()=>transactions.filter(t=>t.date?.startsWith(currentMonth)),[transactions,currentMonth])
  const income=txMes.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0)
  const expense=txMes.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0)
  const balance=income-expense

  function addTx(){
    const val=parseFloat(amount.replace(',','.'))
    if(!val||!desc)return
    const n:Transaction={id:Date.now(),type:txType,amount:val,description:desc,category:cat||'Outros',date:txDate}
    const l=[n,...transactions];setTransactions(l);saveStorage(KEY.transactions,l)
    setAmount('');setDesc('');setCat('');setTxDate(todayISO());setShowForm(false)
  }
  function delTx(id:number){const l=transactions.filter(t=>t.id!==id);setTransactions(l);saveStorage(KEY.transactions,l)}

  function saveGoal(){
    if(!goalName||!goalTarget)return
    if(editingGoal){
      const l=goals.map(g=>g.id===editingGoal.id?{...g,name:goalName,target:parseFloat(goalTarget),deadline:goalDeadline||undefined}:g)
      setGoals(l);saveStorage(KEY.goals,l)
    } else {
      const n:FinancialGoal={id:Date.now(),name:goalName,target:parseFloat(goalTarget),saved:0,deadline:goalDeadline||undefined,aportes:[]}
      const l=[n,...goals];setGoals(l);saveStorage(KEY.goals,l)
    }
    setGoalName('');setGoalTarget('');setGoalDeadline('');setEditingGoal(null);setShowGoalForm(false)
  }
  function delGoal(id:number){const l=goals.filter(g=>g.id!==id);setGoals(l);saveStorage(KEY.goals,l)}
  function openEditGoal(g:FinancialGoal){setEditingGoal(g);setGoalName(g.name);setGoalTarget(String(g.target));setGoalDeadline(g.deadline||'');setShowGoalForm(true)}

  function addAport(){
    if(!aportGoalId)return
    const val=parseFloat(aportValue.replace(',','.'))
    if(!val||val<=0)return
    const l=goals.map(g=>g.id===aportGoalId?{...g,saved:g.saved+val,aportes:[...g.aportes,{id:Date.now(),amount:val,date:todayISO()}]}:g)
    setGoals(l);saveStorage(KEY.goals,l);setAportGoalId(null);setAportValue('')
  }

  function saveEmer(){
    const t=parseFloat(emerTarget.replace(',','.'))
    if(!t||t<=0)return
    const n={...emergency,target:t};setEmergency(n);saveStorage(KEY.emergency,n);setEmerTarget('');setShowEmerForm(false)
  }
  function addEmerAport(){
    const a=parseFloat(emerAport.replace(',','.'))
    if(!a||a<=0)return
    const n={...emergency,current:emergency.current+a};setEmergency(n);saveStorage(KEY.emergency,n);setLastAport(a);setEmerAport('')
  }
  function undoEmerAport(){
    if(lastAport===null)return
    const n={...emergency,current:Math.max(0,emergency.current-lastAport)};setEmergency(n);saveStorage(KEY.emergency,n);setLastAport(null)
  }

  if(loading) return <PageSkeleton/>

  const card:React.CSSProperties={background:'var(--secondary-background)',border:'2px solid var(--border)',borderRadius:5,boxShadow:'var(--shadow)'}
  const TABS:[typeof tab,string][]=[['fin','Finanças'],['reserva','Reserva'],['metas','Metas']]

  return(
    <div style={{padding:'16px 16px 80px',maxWidth:640,display:'flex',flexDirection:'column',gap:14}}>
      {/* Nav mês */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <BtnG onClick={()=>setCurrentDate(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{width:36,height:36,padding:0}}><CaretLeft size={14}/></BtnG>
        <span style={{fontWeight:700,fontSize:15,textTransform:'capitalize'}}>{monthLabel}</span>
        <BtnG onClick={()=>setCurrentDate(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{width:36,height:36,padding:0}}><CaretRight size={14}/></BtnG>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'2px solid var(--border)'}}>
        {TABS.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'9px 4px',fontSize:12,fontWeight:700,
              background:tab===id?'var(--main,var(--c-goal,#F59E0B))':'transparent',
              color:tab===id?'var(--main-foreground,#111)':'var(--foreground)',border:'none',
              borderBottom:`2px solid ${tab===id?'var(--main,var(--c-goal,#F59E0B))':'var(--border)'}`,
              cursor:'pointer',fontFamily:'inherit',letterSpacing:'.04em',textTransform:'uppercase',
              opacity:tab===id?1:.6}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── FINANÇAS ── */}
      {tab==='fin'&&(<div style={{display:'flex',flexDirection:'column',gap:12}}>
        {/* Saldo hero */}
        <div style={{...card,padding:20,textAlign:'center'}}>
          <span style={lbl}>Saldo do mês</span>
          <div style={{fontFamily:'monospace',fontWeight:700,fontSize:36,marginBottom:14,
            color:balance>=0?'#22c55e':'var(--destructive-pastel,#FF6B6B)'}}>{formatBRL(balance)}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <BtnG onClick={()=>{setTxType('income');setShowForm(true)}} style={{justifyContent:'center',background:'var(--c-habit,#F5EFDF)',color:'#111',borderColor:'var(--c-habit-b)'}}>
              <ArrowUp size={14}/> Entrada
            </BtnG>
            <BtnG onClick={()=>{setTxType('expense');setShowForm(true)}} style={{justifyContent:'center',background:'var(--destructive-pastel,#FF6B6B)',color:'#fff'}}>
              <ArrowDown size={14}/> Saída
            </BtnG>
          </div>
        </div>
        {/* Mini stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <div style={{...card,padding:14,borderColor:'var(--c-habit-b)',background:'var(--c-habit,#F5EFDF)'}}>
            <span style={{...lbl,color:'#0C0C0C'}}>Entradas</span>
            <div style={{fontFamily:'monospace',fontWeight:700,fontSize:20,color:'#0C0C0C'}}>{formatBRL(income)}</div>
          </div>
          <div style={{...card,padding:14,background:'var(--destructive-pastel,#FF6B6B)',borderColor:'var(--border)'}}>
            <span style={{...lbl,color:'#fff'}}>Saídas</span>
            <div style={{fontFamily:'monospace',fontWeight:700,fontSize:20,color:'#fff'}}>{formatBRL(expense)}</div>
          </div>
        </div>
        {/* Form transação */}
        {showForm&&(<div style={{...card,padding:16,display:'flex',flexDirection:'column',gap:11}}>
          <div style={{display:'flex',gap:8}}>
            {(['income','expense']as const).map(t=>(
              <button key={t} onClick={()=>setTxType(t)}
                style={{flex:1,padding:'9px 0',border:'2px solid var(--border)',borderRadius:4,
                  background:txType===t?(t==='income'?'var(--c-habit,#F5EFDF)':'var(--destructive-pastel,#FF6B6B)'):'var(--background)',
                  color:txType===t&&t==='expense'?'#fff':'var(--foreground)',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
                {t==='income'?'↑ Receita':'↓ Despesa'}
              </button>
            ))}
          </div>
          <div><span style={lbl}>Valor (R$)</span><input style={inp} type="number" placeholder="0,00" value={amount} onChange={e=>setAmount(e.target.value)}/></div>
          <div><span style={lbl}>Descrição</span><input style={inp} placeholder="Ex: Mercado..." value={desc} onChange={e=>setDesc(e.target.value)}/></div>
          <div><span style={lbl}>Categoria</span>
            <select style={{...inp,appearance:'none' as any}} value={cat} onChange={e=>setCat(e.target.value)}>
              <option value="">Selecionar...</option>
              {(txType==='income'?CATS_IN:CATS_OUT).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><span style={lbl}>Data</span><input style={inp} type="date" value={txDate} onChange={e=>setTxDate(e.target.value)}/></div>
          <div style={{display:'flex',gap:8}}>
            <BtnP onClick={addTx} style={{flex:2,justifyContent:'center'}}><span>Salvar</span></BtnP>
            <BtnG onClick={()=>setShowForm(false)}>Cancelar</BtnG>
          </div>
        </div>)}
        {/* Lista */}
        <div style={{...card,overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',borderBottom:'1px solid var(--border)'}}>
            <span style={{fontWeight:700,fontSize:13}}>Movimentações</span>
            <button onClick={()=>{setTxType('expense');setShowForm(true)}} className="btn btn-primary btn-sm"><Plus size={14} /> + nova entrada</button>
          </div>
          {txMes.length===0?(
            <div style={{padding:'32px 16px',textAlign:'center'}}>
              <p style={{...lbl,textAlign:'center',marginBottom:12}}>Sem movimentações este mês</p>
              <BtnP onClick={()=>{setTxType('expense');setShowForm(true)}} style={{justifyContent:'center'}}><span>Registrar</span></BtnP>
            </div>
          ):txMes.slice(0,15).map(t=>(
            <div key={t.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:32,height:32,borderRadius:4,flexShrink:0,border:'2px solid var(--border)',
                background:t.type==='income'?'var(--c-habit,#F5EFDF)':'var(--destructive-pastel,#FF6B6B)',
                display:'flex',alignItems:'center',justifyContent:'center'}}>
                {t.type==='income'?<ArrowUp size={13} style={{color:'#0C0C0C'}}/>:<ArrowDown size={13} style={{color:'#fff'}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.description}</p>
                <p style={{fontSize:11,opacity:.5}}>{t.category} · {t.date}</p>
              </div>
              <span style={{fontFamily:'monospace',fontWeight:700,fontSize:13,flexShrink:0,
                color:t.type==='income'?'#22c55e':'var(--destructive-pastel,#FF6B6B)'}}>
                {t.type==='income'?'+':'−'}{formatBRL(t.amount)}
              </span>
              <button onClick={()=>delTx(t.id)} style={{background:'none',border:'none',cursor:'pointer',opacity:.4,color:'var(--foreground)',padding:4}}>
                <Trash size={13}/>
              </button>
            </div>
          ))}
        </div>
      </div>)}

      {/* ── RESERVA ── */}
      {tab==='reserva'&&(<div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{...card,padding:20,textAlign:'center'}}>
          <PiggyBank size={36} style={{color:'var(--c-goal,#F59E0B)',margin:'0 auto 10px'}}/>
          <span style={lbl}>Reserva de emergência</span>
          <div style={{fontFamily:'monospace',fontWeight:700,fontSize:30,marginBottom:6}}>{formatBRL(emergency.current)}</div>
          <div style={{fontSize:12,opacity:.5,marginBottom:12}}>Meta: {formatBRL(emergency.target)}</div>
          <div style={{height:8,background:'var(--background)',border:'1.5px solid var(--border)',borderRadius:4,overflow:'hidden',marginBottom:6}}>
            <div style={{height:'100%',background:'var(--c-goal,#F59E0B)',width:`${Math.min((emergency.current/emergency.target)*100,100)}%`}}/>
          </div>
          <p style={{fontSize:11,opacity:.5,marginBottom:14}}>{Math.round((emergency.current/emergency.target)*100)}% alcançado</p>
          <div style={{display:'flex',gap:8}}>
            <BtnG onClick={()=>setShowEmerForm(true)} style={{flex:1}}>Editar meta</BtnG>
            <BtnP onClick={()=>setEmerAport('0')} style={{flex:1,justifyContent:'center'}}><span>Aportar</span></BtnP>
          </div>
          {lastAport!==null&&(<BtnG onClick={undoEmerAport} style={{marginTop:8,width:'100%',fontSize:12}}>
            <ArrowCounterClockwise size={13}/> Desfazer ({formatBRL(lastAport)})
          </BtnG>)}
        </div>
        {showEmerForm&&(<div style={{...card,padding:16,display:'flex',flexDirection:'column',gap:11}}>
          <span style={lbl}>Meta da reserva (R$)</span>
          <input style={inp} type="number" placeholder="0,00" value={emerTarget} onChange={e=>setEmerTarget(e.target.value)}/>
          <div style={{display:'flex',flexWrap:'wrap' as const,gap:6}}>
            {[3000,5000,10000,15000,20000].map(v=><BtnG key={v} onClick={()=>setEmerTarget(String(v))} style={{padding:'5px 10px',fontSize:12}}>{formatBRL(v)}</BtnG>)}
          </div>
          <div style={{display:'flex',gap:8}}>
            <BtnP onClick={saveEmer} style={{flex:2,justifyContent:'center'}}><span>Salvar</span></BtnP>
            <BtnG onClick={()=>setShowEmerForm(false)}>Cancelar</BtnG>
          </div>
        </div>)}
        {emerAport!==''&&(<div style={{...card,padding:16,display:'flex',flexDirection:'column',gap:11}}>
          <span style={lbl}>Valor do aporte (R$)</span>
          <input style={inp} type="number" placeholder="0,00" value={emerAport} onChange={e=>setEmerAport(e.target.value)}/>
          <div style={{display:'flex',gap:8}}>
            <BtnP onClick={addEmerAport} style={{flex:2,justifyContent:'center'}}><span>Confirmar</span></BtnP>
            <BtnG onClick={()=>setEmerAport('')}>Cancelar</BtnG>
          </div>
        </div>)}
      </div>)}

      {/* ── METAS ── */}
      {tab==='metas'&&(<div style={{display:'flex',flexDirection:'column',gap:12}}>
        {showGoalForm&&(<div style={{...card,padding:16,display:'flex',flexDirection:'column',gap:11}}>
          <span style={{fontWeight:700,fontSize:14}}>{editingGoal?'Editar meta':'Nova meta'}</span>
          <input style={inp} placeholder="Nome da meta" value={goalName} onChange={e=>setGoalName(e.target.value)}/>
          <input style={inp} type="number" placeholder="Valor (R$)" value={goalTarget} onChange={e=>setGoalTarget(e.target.value)}/>
          <input style={inp} type="date" placeholder="Prazo" value={goalDeadline} onChange={e=>setGoalDeadline(e.target.value)}/>
          <div style={{display:'flex',gap:8}}>
            <BtnP onClick={saveGoal} style={{flex:2,justifyContent:'center'}}><span>Salvar</span></BtnP>
            <BtnG onClick={()=>{setShowGoalForm(false);setEditingGoal(null)}}>Cancelar</BtnG>
          </div>
        </div>)}

        {/* Form aporte em meta */}
        {aportGoalId!==null&&(<div style={{...card,padding:16,display:'flex',flexDirection:'column',gap:11}}>
          <span style={{fontWeight:700,fontSize:14}}>Aportar na meta</span>
          <input style={inp} type="number" placeholder="Valor (R$)" value={aportValue} onChange={e=>setAportValue(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addAport()}/>
          <div style={{display:'flex',gap:8}}>
            <BtnP onClick={addAport} style={{flex:2,justifyContent:'center'}}><span>Confirmar aporte</span></BtnP>
            <BtnG onClick={()=>{setAportGoalId(null);setAportValue('')}}>Cancelar</BtnG>
          </div>
        </div>)}

        {goals.length===0&&!showGoalForm?(
          <div style={{...card,padding:'32px 16px',textAlign:'center'}}>
            <p style={{...lbl,textAlign:'center',marginBottom:8}}>Nenhuma meta ainda</p>
            <p style={{fontSize:13,opacity:.5,marginBottom:16}}>Defina um objetivo e acompanhe.</p>
            <BtnP onClick={()=>setShowGoalForm(true)} style={{justifyContent:'center'}}><span>Criar meta</span></BtnP>
          </div>
        ):goals.map(g=>{
          const pct=g.target>0?Math.min(Math.round((g.saved/g.target)*100),100):0
          return(<div key={g.id} style={{...card,padding:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontWeight:700,fontSize:14}}>{g.name}</span>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>setAportGoalId(g.id===aportGoalId?null:g.id)}
                  style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',
                    background:'var(--c-goal,#F59E0B)',color:'#111',border:'2px solid var(--border)',
                    borderRadius:4,fontWeight:700,fontSize:11,cursor:'pointer',fontFamily:'inherit',
                    boxShadow:'2px 2px 0 var(--border)'}}>
                  <Plus size={11}/> Aportar
                </button>
                <button onClick={()=>openEditGoal(g)}
                  style={{background:'none',border:'none',cursor:'pointer',opacity:.5,color:'var(--foreground)'}}>
                  <PencilSimple size={14}/>
                </button>
                <button onClick={()=>delGoal(g.id)}
                  style={{background:'none',border:'none',cursor:'pointer',opacity:.5,color:'var(--foreground)'}}>
                  <Trash size={14}/>
                </button>
              </div>
            </div>
            <div style={{height:7,background:'var(--background)',border:'1.5px solid var(--border)',borderRadius:4,overflow:'hidden',marginBottom:6}}>
              <div style={{height:'100%',background:'var(--c-goal,#F59E0B)',width:`${pct}%`}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,opacity:.6}}>
              <span style={{fontFamily:'monospace',fontWeight:700}}>{formatBRL(g.saved)} / {formatBRL(g.target)}</span>
              {g.deadline&&<span>{new Date(g.deadline).toLocaleDateString('pt-BR')}</span>}
            </div>
          </div>)
        })}
        {goals.length>0&&!showGoalForm&&(
          <BtnP onClick={()=>setShowGoalForm(true)} style={{justifyContent:'center',gap:6}}><Plus size={14}/> Nova meta</BtnP>
        )}
      </div>)}
    </div>
  )
}