'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getNivel, getProgresso, NIVEIS, IO_RULES } from '@/lib/io-system'
import { storage, saveStorage, todayISO } from '@/lib/utils'
import { PageSkeleton } from '@/components/PageSkeleton'
import { Trophy, Lightning, Fire, Star, Lock, CheckCircle, Target, ChartLineUp, Medal, ArrowRight } from '@phosphor-icons/react'

const KEY_CHALLENGES = 'io_challenges'
const KEY_HISTORY    = 'io_io_history'

const DESAFIOS_BASE = [
  { title:'20 hábitos esta semana', desc:'Conclua 20 hábitos de segunda a domingo', icon:'🔥', reward:100, total:20, type:'semanal' as const },
  { title:'3 dias perfeitos', desc:'100% dos hábitos em 3 dias', icon:'💧', reward:150, total:3, type:'semanal' as const },
  { title:'Streak de 3 dias', desc:'3 dias ativos seguidos', icon:'⚡', reward:20, total:3, type:'semanal' as const },
  { title:'Registrar 3 aprendizados', desc:'Adicione 3 conteúdos na Carreira', icon:'📚', reward:200, total:3, type:'mensal' as const },
  { title:'Primeiro projeto criado', desc:'Crie seu primeiro projeto', icon:'🚀', reward:150, total:1, type:'mensal' as const },
]

const CONQUISTAS = [
  { id:'c1', titulo:'Primeiro passo', desc:'Criou seu primeiro hábito', icon:'🌱', gatilho:'habit_1', raro:false },
  { id:'c2', titulo:'Semana perfeita', desc:'7 dias de streak', icon:'🔥', gatilho:'streak_7', raro:false },
  { id:'c3', titulo:'30 dias', desc:'30 dias consecutivos', icon:'🏅', gatilho:'streak_30', raro:true },
  { id:'c4', titulo:'Conectora', desc:'Nível 2', icon:'🔗', gatilho:'nivel_2', raro:false },
  { id:'c5', titulo:'Visionária', desc:'Nível 3', icon:'🔭', gatilho:'nivel_3', raro:true },
  { id:'c6', titulo:'500 IO', desc:'Acumulou 500 IO', icon:'⚡', gatilho:'io_500', raro:false },
  { id:'c7', titulo:'1500 IO', desc:'Acumulou 1500 IO', icon:'💎', gatilho:'io_1500', raro:true },
]

const DESBLOQUEIOS = [
  { nivel:1, items:['Registro básico','Tela de Progresso','Loja básica'] },
  { nivel:2, items:['Widget de estatísticas','Automação de inputs','Temas intermediários'] },
  { nivel:3, items:['Previsão de tendências','Temas dinâmicos','Exportação avançada'] },
]

function getWeeklyExpiry(){const d=new Date();d.setDate(d.getDate()+(7-d.getDay()));return d.toISOString().split('T')[0]}
function getMonthlyExpiry(){const d=new Date();d.setMonth(d.getMonth()+1);d.setDate(0);return d.toISOString().split('T')[0]}
function yesterdayISO(){const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().split('T')[0]}

const sc = (): React.CSSProperties => ({
  background:'var(--secondary-background)', border:'2px solid var(--border)',
  borderRadius:5, boxShadow:'var(--shadow)', padding:14,
})

const TIPO_CONFIG: Record<string,{label:string;icon:string;color:string;bg:string}> = {
  conclusao:      { label:'Hábito concluído', icon:'✓', color:'#22c55e',  bg:'#f0fdf4' },
  ciclo_completo: { label:'Ciclo completo',   icon:'🔥', color:'#f97316', bg:'#fff7ed' },
  combo_streak:   { label:'Combo diário',     icon:'⚡', color:'#a855f7', bg:'#faf5ff' },
  input_registro: { label:'Dado registrado',  icon:'+',  color:'#3b82f6', bg:'#eff6ff' },
}

export default function ProgressPage() {
  const { economy } = useAppStore()
  const nivel = getNivel(economy.xp_total)
  const pct   = getProgresso(economy.xp_total)
  const prox  = NIVEIS.find(n => n.nivel === nivel.nivel + 1)
  const faltam = prox ? prox.xp_min - economy.xp_total : 0

  const [tab,        setTab]        = useState<'nivel'|'desafios'|'historico'>('nivel')
  const [challenges, setChallenges] = useState<any[]>([])
  const [ioHistory,  setIoHistory]  = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const stored = storage<any[]>(KEY_CHALLENGES, [])
    if (stored.length === 0) {
      const newC = DESAFIOS_BASE.map((c,i) => ({...c,id:`c${i}-${Date.now()}`,progress:0,done:false,expiresAt:c.type==='semanal'?getWeeklyExpiry():getMonthlyExpiry()}))
      setChallenges(newC); saveStorage(KEY_CHALLENGES, newC)
    } else { setChallenges(stored) }
    setIoHistory(storage<any[]>(KEY_HISTORY, []))
    setLoading(false)
  }, [])

  const STATS = [
    { label:'XP total',  value:economy.xp_total,          icon:Star      },
    { label:'Saldo IO',  value:economy.saldo_io,           icon:Lightning },
    { label:'Streak',    value:`${economy.streak}d`,       icon:Fire      },
    { label:'IO hoje',   value:`+${economy.io_hoje}`,      icon:Target    },
  ]

  const pctDia = Math.min(Math.round((economy.io_hoje / 200) * 100), 100)
  const grouped = ioHistory.reduce((a:any,ev:any) => { if(!a[ev.data])a[ev.data]=[];a[ev.data].push(ev);return a }, {} as Record<string,any[]>)
  const sortedDates = Object.keys(grouped).sort((a,b) => b.localeCompare(a))

  if (loading) return <PageSkeleton />

  const TABS: [typeof tab, string][] = [['nivel','Nível'],['desafios','Desafios'],['historico','Histórico']]

  return (
    <div style={{padding:'24px 16px 80px',maxWidth:672,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>
      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'2px solid var(--border)'}}>
        {TABS.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'9px 4px',fontSize:12,fontWeight:700,
              background:tab===id?'var(--c-goal,#F59E0B)':'transparent',
              color:tab===id?'#111':'var(--foreground)',border:'none',
              borderBottom:`2px solid ${tab===id?'var(--c-goal,#F59E0B)':'var(--border)'}`,
              cursor:'pointer',fontFamily:'inherit',letterSpacing:'.04em',
              textTransform:'uppercase',opacity:tab===id?1:.6}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── NÍVEL ── */}
      {tab==='nivel'&&(
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Hero */}
          <div style={{background:'var(--background,#0c0c0c)',border:'2px solid var(--border)',borderRadius:5,boxShadow:'var(--shadow)',padding:20}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
              {/* Badge nível */}
              <div style={{
                width:64,height:64,borderRadius:4,border:'3px solid var(--c-goal,#F59E0B)',
                background:'var(--c-goal-bg,rgba(245,158,11,.1))',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0,
                boxShadow:'var(--shadow-nb,4px 4px 0 #1a1814)',
              }}>
                <span style={{fontFamily:'monospace',fontWeight:700,fontSize:22,color:'var(--c-goal,#F59E0B)',lineHeight:1}}>
                  {String(nivel.nivel).padStart(2,'0')}
                </span>
                <span style={{fontSize:9,color:'var(--foreground)',opacity:.5,textTransform:'uppercase',letterSpacing:'.1em'}}>nível</span>
              </div>
              <div style={{flex:1}}>
                <p style={{fontSize:10,opacity:.45,textTransform:'uppercase',letterSpacing:'.14em',marginBottom:5}}>Título atual</p>
                <h2 style={{fontSize:17,fontWeight:700,marginBottom:10}}>{nivel.titulo}</h2>
                {/* Progress */}
                <div style={{height:8,background:'var(--border)',borderRadius:4,overflow:'hidden',marginBottom:5,position:'relative'}}>
                  <div style={{position:'absolute',inset:'0 auto 0 0',width:`${pct}%`,background:'var(--c-goal,#F59E0B)'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,fontFamily:'monospace',opacity:.5}}>
                  <span>{economy.xp_total} XP</span>
                  <span>{prox?`→ ${prox.xp_min} XP`:'Nível máximo'}</span>
                </div>
              </div>
            </div>
            {prox&&(
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:12,borderTop:'1px solid var(--border)'}}>
                <span style={{fontSize:10,opacity:.45,textTransform:'uppercase',letterSpacing:'.1em'}}>PRÓXIMO: {prox.titulo}</span>
                <span style={{fontFamily:'monospace',fontSize:11,fontWeight:700,
                  background:'var(--c-goal-bg,rgba(245,158,11,.15))',color:'var(--c-goal,#F59E0B)',
                  padding:'2px 8px',borderRadius:4,border:'1.5px solid var(--c-goal-b,#92400E)'}}>
                  {faltam} XP
                </span>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {STATS.map(({label,value,icon:Icon})=>(
              <div key={label} style={{...sc()}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                  <Icon size={13} style={{color:'var(--c-goal,#F59E0B)'}}/>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',opacity:.5}}>{label}</span>
                </div>
                <p style={{fontFamily:'monospace',fontWeight:700,fontSize:24}}>{value}</p>
              </div>
            ))}
          </div>

          {/* IO hoje */}
          <div style={{...sc(),background:'var(--c-goal-bg,rgba(245,158,11,.08))',borderColor:'var(--c-goal-b,#92400E)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <Lightning size={14} style={{color:'var(--c-goal,#F59E0B)'}}/>
                <span style={{fontSize:12,fontWeight:700,color:'var(--c-goal,#F59E0B)'}}>IO ganho hoje</span>
              </div>
              <span style={{fontFamily:'monospace',fontSize:11,opacity:.6}}>{economy.io_hoje} / 200</span>
            </div>
            <div style={{fontFamily:'monospace',fontWeight:700,fontSize:30,color:'var(--c-goal,#F59E0B)',marginBottom:10}}>
              +{economy.io_hoje}
            </div>
            <div style={{height:8,background:'var(--border)',borderRadius:4,overflow:'hidden',marginBottom:6}}>
              <div style={{height:'100%',background:'var(--c-goal,#F59E0B)',width:`${pctDia}%`}}/>
            </div>
            <p style={{fontSize:10,opacity:.5}}>{200-economy.io_hoje} IO até o limite diário</p>
          </div>

          {/* Desbloqueios */}
          <div style={sc()}>
            <p style={{fontWeight:700,fontSize:13,marginBottom:12}}>Desbloqueios</p>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {DESBLOQUEIOS.map(({nivel:n,items})=>items.map(item=>{
                const unlocked = nivel.nivel >= n
                return(
                  <div key={item} style={{
                    display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:4,
                    border:unlocked?'1.5px solid var(--c-habit-b,#D4C9A9)':'1.5px dashed var(--border)',
                    background:unlocked?'var(--c-habit,#F5EFDF)':'transparent',
                    opacity:unlocked?1:.5,
                  }}>
                    {unlocked
                      ?<CheckCircle size={14} style={{color:'#22c55e',flexShrink:0}}/>
                      :<Lock size={14} style={{flexShrink:0}}/>}
                    <span style={{fontSize:12,fontWeight:500}}>{item}</span>
                    {!unlocked&&<span style={{marginLeft:'auto',fontSize:10,fontFamily:'monospace',opacity:.5}}>Nv {n}</span>}
                  </div>
                )
              }))}
            </div>
          </div>

          {/* Conquistas */}
          <div style={sc()}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <Medal size={15} style={{color:'var(--c-goal,#F59E0B)'}}/>
              <p style={{fontWeight:700,fontSize:13}}>Conquistas</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {CONQUISTAS.map(c=>{
                let unlocked = false
                if(c.gatilho==='nivel_2')  unlocked = nivel.nivel>=2
                if(c.gatilho==='nivel_3')  unlocked = nivel.nivel>=3
                if(c.gatilho==='io_500')   unlocked = economy.xp_total>=500
                if(c.gatilho==='io_1500')  unlocked = economy.xp_total>=1500
                if(c.gatilho==='streak_7') unlocked = economy.streak>=7
                if(c.gatilho==='streak_30')unlocked = economy.streak>=30
                return(
                  <div key={c.id} style={{
                    padding:10,borderRadius:4,border:'1.5px solid var(--border)',
                    display:'flex',alignItems:'flex-start',gap:8,
                    opacity:unlocked?1:.4,filter:unlocked?'none':'grayscale(1)',
                  }}>
                    <span style={{fontSize:22,flexShrink:0}}>{c.icon}</span>
                    <div style={{minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'}}>
                        <p style={{fontSize:11,fontWeight:700,lineHeight:1.2}}>{c.titulo}</p>
                        {c.raro&&<span style={{fontSize:9,fontFamily:'monospace',fontWeight:700,
                          background:'var(--c-goal,#F59E0B)',color:'#111',padding:'1px 5px',borderRadius:3}}>raro</span>}
                      </div>
                      <p style={{fontSize:10,opacity:.55,marginTop:2}}>{c.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── DESAFIOS ── */}
      {tab==='desafios'&&(
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {(['semanal','mensal'] as const).map(type=>(
            <div key={type}>
              <p style={{fontWeight:700,fontSize:13,marginBottom:10}}>
                Desafios {type==='semanal'?'da semana':'do mês'}
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {challenges.filter(c=>c.type===type).map((c:any)=>{
                  const pct=Math.min(Math.round((c.progress/c.total)*100),100)
                  return(
                    <div key={c.id} style={{...sc(),
                      borderColor:c.done?'var(--c-habit-b,#D4C9A9)':'var(--border)',
                      background:c.done?'var(--c-habit,#F5EFDF)':'var(--secondary-background)'}}>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:10}}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                          <span style={{fontSize:22}}>{c.icon}</span>
                          <div>
                            <p style={{fontSize:13,fontWeight:700,color:c.done?'#0C0C0C':'var(--foreground)'}}>{c.title}</p>
                            <p style={{fontSize:11,opacity:.55}}>{c.desc}</p>
                          </div>
                        </div>
                        <span style={{fontFamily:'monospace',fontSize:11,fontWeight:700,
                          background:c.done?'var(--c-goal,#F59E0B)':'var(--background)',
                          color:c.done?'#111':'var(--c-goal,#F59E0B)',
                          padding:'3px 8px',borderRadius:4,border:'1.5px solid var(--c-goal-b,#92400E)',flexShrink:0}}>
                          {c.done?'✓ ':''}{c.reward} IO
                        </span>
                      </div>
                      {!c.done&&(
                        <>
                          <div style={{height:7,background:'var(--background)',border:'1.5px solid var(--border)',borderRadius:4,overflow:'hidden',marginBottom:5}}>
                            <div style={{height:'100%',background:'var(--c-goal,#F59E0B)',width:`${pct}%`}}/>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,opacity:.5}}>
                            <span>{c.progress} / {c.total}</span>
                            <span>expira {c.expiresAt}</span>
                          </div>
                        </>
                      )}
                      {c.done&&<p style={{fontSize:11,color:'var(--c-goal,#F59E0B)',fontWeight:700}}>Concluído! +{c.reward} IO recebidos</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HISTÓRICO ── */}
      {tab==='historico'&&(
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {sortedDates.length===0?(
            <div style={{...sc(),padding:'40px 16px',textAlign:'center'}}>
              <ChartLineUp size={32} style={{margin:'0 auto 12px',opacity:.35}}/>
              <p style={{fontWeight:700,fontSize:14,marginBottom:6}}>Nenhuma ação ainda</p>
              <p style={{fontSize:12,opacity:.5}}>Complete hábitos para ver seu histórico de IO</p>
            </div>
          ):sortedDates.map(date=>{
            const evs = grouped[date]
            const total = evs.reduce((a:number,e:any)=>a+e.valor,0)
            const label = date===todayISO()?'Hoje':date===yesterdayISO()?'Ontem':new Date(date).toLocaleDateString('pt-BR',{day:'numeric',month:'long'})
            return(
              <div key={date}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontWeight:700,fontSize:13}}>{label}</span>
                  <span style={{fontFamily:'monospace',fontSize:11,fontWeight:700,
                    background:'var(--c-goal,#F59E0B)',color:'#111',
                    padding:'2px 8px',borderRadius:4}}>
                    {total>=0?'+':''}{total} IO
                  </span>
                </div>
                <div style={{...sc(),padding:0,overflow:'hidden'}}>
                  {evs.map((ev:any)=>{
                    const cfg=TIPO_CONFIG[ev.tipo]||{label:'IO',icon:'⚡',color:'var(--foreground)',bg:'var(--background)'}
                    return(
                      <div key={ev.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderBottom:'1px solid var(--border)'}}>
                        <div style={{width:32,height:32,borderRadius:4,flexShrink:0,fontSize:14,
                          background:cfg.bg,border:'1.5px solid var(--border)',
                          display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {cfg.icon}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.descricao}</p>
                          <p style={{fontSize:10,opacity:.5}}>{cfg.label} · {ev.hora}</p>
                        </div>
                        <span style={{fontFamily:'monospace',fontWeight:700,fontSize:13,flexShrink:0,
                          color:ev.valor>=0?'#22c55e':'var(--destructive-pastel,#FF6B6B)'}}>
                          {ev.valor>=0?'+':''}{ev.valor} IO
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}