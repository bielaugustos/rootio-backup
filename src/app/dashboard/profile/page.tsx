'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { getNivel, getProgresso } from '@/lib/io-system'
import { signOut } from '@/lib/supabase'
import { storage } from '@/lib/utils'
import { PageSkeleton } from '@/components/PageSkeleton'
import { User, Shield, Bell, SpeakerHigh, Info, SignOut, Crown, Trash, ArrowRight, MoonStars, Sun, Phone, Lightning, Lock, PencilSimple } from '@phosphor-icons/react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'
const WA_URL   = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Tenho interesse em ativar o plano Pro vitalício do Rootio por R$ 12,90.')}`
const AVATARES = ['🌱','🔥','🦅','🧘','🪐','⚡','∞']
const KEY_INVENTORY = 'io_shop_inventory'

const sc = (): React.CSSProperties => ({
  background:'var(--secondary-background)', border:'2px solid var(--border)',
  borderRadius:5, boxShadow:'var(--shadow)',
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
  fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', width:'100%',
})
const inp = (): React.CSSProperties => ({
  width:'100%', padding:'10px 12px', fontSize:14,
  background:'var(--background)', color:'var(--foreground)',
  border:'2px solid var(--border)', borderRadius:4,
  fontFamily:'inherit', fontWeight:500, outline:'none',
})
const lbl = (): React.CSSProperties => ({
  fontSize:10, fontWeight:700, letterSpacing:'.14em',
  textTransform:'uppercase', color:'var(--foreground)', opacity:.4,
  display:'block', marginBottom:8,
})

export default function AjustesPage() {
  const router = useRouter()
  const { economy, plan, username, avatar, theme, themeMode, soundOn,
    bgColor, setAvatar, setTheme, setThemeMode, setSoundOn,
    setBgColor, reset, setUsername } = useAppStore()
  const isDark = themeMode === 'dark'

  const nivel = getNivel(economy.xp_total)
  const pct   = getProgresso(economy.xp_total)
  const prox  = [{nivel:1,titulo:'Exploradora',xp_min:0,xp_max:500},{nivel:2,titulo:'Conectora',xp_min:501,xp_max:1500},{nivel:3,titulo:'Visionária',xp_min:1501,xp_max:99999}]
    .find(n => n.nivel === nivel.nivel + 1)

  const [showAvatars,    setShowAvatars]    = useState(false)
  const [selBgColor,     setSelBgColor]     = useState(bgColor || '#fef3c7')
  const [inventory,      setInventory]      = useState<string[]>([])
  const [loading,        setLoading]        = useState(true)
  const [editingName,    setEditingName]    = useState(false)
  const [newName,        setNewName]        = useState(username)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false)

  useEffect(() => {
    setInventory(storage<string[]>(KEY_INVENTORY, []))
    setLoading(false)
  }, [])

  useEffect(() => { setSelBgColor(bgColor || '#fef3c7') }, [bgColor])

  if (loading) return <PageSkeleton />

  const STATS = [
    { label:'Saldo IO',  value:economy.saldo_io   },
    { label:'XP total',  value:economy.xp_total   },
    { label:'Streak',    value:`${economy.streak}d`},
  ]

  function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p style={{...lbl(),marginBottom:6,marginTop:4}}>{children}</p>
  }

  function Row({ icon, bg, title, sub, right, onClick, href }: any) {
    const content = (
      <div style={{display:'flex',alignItems:'center',gap:16,padding:'12px 14px',
        cursor:onClick||href?'pointer':'default',
        borderBottom:'1px solid var(--border)'}}>
        <div style={{width:32,height:32,borderRadius:4,background:bg||'var(--background)',
          border:'1.5px solid var(--border)',display:'flex',alignItems:'center',
          justifyContent:'center',flexShrink:0}}>
          {icon}
        </div>
        <div style={{flex:1}}>
          <p style={{fontSize:13,fontWeight:600}}>{title}</p>
          {sub&&<p style={{fontSize:11,opacity:.5}}>{sub}</p>}
        </div>
        {right}
      </div>
    )
    if (href) return <Link href={href} style={{textDecoration:'none',color:'inherit',display:'block'}}>{content}</Link>
    if (onClick) return <div onClick={onClick}>{content}</div>
    return content
  }

  // Toggle switch simples
  function Toggle({ checked, onChange }: { checked:boolean; onChange:(v:boolean)=>void }) {
    return (
      <div onClick={() => onChange(!checked)} style={{
        width:44, height:24, borderRadius:12,
        background: checked ? 'var(--c-goal,#F59E0B)' : 'var(--border)',
        position:'relative', cursor:'pointer', flexShrink:0,
        border:'2px solid var(--border)', transition:'background .2s',
      }}>
        <div style={{
          position:'absolute', top:1, left: checked?20:1,
          width:18, height:18, borderRadius:9,
          background:'#fff', transition:'left .2s',
          boxShadow:'0 1px 3px rgba(0,0,0,.3)',
        }}/>
      </div>
    )
  }

  return (
    <div style={{padding:'24px 16px 80px',maxWidth:672,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>
      <div>
        <h2 style={{fontWeight:700,fontSize:20}}>Ajustes</h2>
        <p style={{fontSize:13,opacity:.5,marginTop:2}}>Conta, aparência e preferências</p>
      </div>

      {/* ── Perfil ── */}
      <div style={{...sc(),padding:16}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          {/* Avatar */}
          <button onClick={()=>setShowAvatars(v=>!v)}
            style={{width:72,height:72,borderRadius:4,
              border:'3px solid var(--c-goal-b,#92400E)',
              background:selBgColor,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:36,cursor:'pointer',flexShrink:0,position:'relative',
              boxShadow:'var(--shadow-nb,4px 4px 0 #1a1814)'}}>
            {avatar}
            <div style={{position:'absolute',bottom:-4,right:-4,width:20,height:20,
              background:'var(--c-goal,#F59E0B)',borderRadius:4,
              border:'2px solid var(--border)',
              display:'flex',alignItems:'center',justifyContent:'center'}}>
              <PencilSimple size={10} style={{color:'#111'}}/>
            </div>
          </button>

          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {editingName ? (
                <>
                  <input style={{...inp(),fontSize:14,padding:'6px 10px'}}
                    value={newName} onChange={e=>setNewName(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter'&&newName.trim()){setUsername(newName.trim());setEditingName(false)}}} autoFocus/>
                  <button onClick={()=>{if(newName.trim()){setUsername(newName.trim());setEditingName(false)}}}
                    style={{...btnP(),width:'auto',padding:'6px 12px',fontSize:12,flexShrink:0}}>OK</button>
                  <button onClick={()=>{setNewName(username);setEditingName(false)}}
                    style={{...btnG(),width:'auto',padding:'6px 10px',fontSize:12,flexShrink:0}}>✕</button>
                </>
              ):(
                <>
                  <p style={{fontWeight:700,fontSize:15,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{username}</p>
                  <button onClick={()=>{setNewName(username);setEditingName(true)}}
                    style={{background:'none',border:'none',cursor:'pointer',opacity:.45,color:'var(--foreground)',padding:2}}>
                    <PencilSimple size={13}/>
                  </button>
                </>
              )}
            </div>
            <p style={{fontSize:12,opacity:.5,marginBottom:8}}>{nivel.titulo}</p>
            <div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden',marginBottom:4}}>
              <div style={{height:'100%',background:'var(--c-goal,#F59E0B)',width:`${pct}%`}}/>
            </div>
            <p style={{fontSize:10,fontFamily:'monospace',opacity:.45}}>{economy.xp_total} XP{prox?` · ${prox.xp_min-economy.xp_total} até ${prox.titulo}`:''}</p>
          </div>
        </div>

        {/* Seletor de avatar */}
        {showAvatars&&(
          <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid var(--border)',display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <span style={lbl()}>Avatar</span>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {AVATARES.map(av=>(
                  <button key={av} onClick={()=>{setAvatar(av);setShowAvatars(false)}}
                    style={{width:40,height:40,borderRadius:4,fontSize:20,cursor:'pointer',
                      border:`2.5px solid ${avatar===av?'var(--c-goal,#F59E0B)':'var(--border)'}`,
                      background:avatar===av?'var(--c-goal-bg,rgba(245,158,11,.15))':'var(--background)',
                      display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {av}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span style={lbl()}>Cor de fundo</span>
              <div style={{display:'flex',gap:8}}>
                {['#fef3c7','#fce7f3','#dbeafe','#dcfce7','#e0e7ff'].map(c=>(
                  <button key={c} onClick={()=>{setSelBgColor(c);setBgColor(c)}}
                    style={{width:32,height:32,borderRadius:4,background:c,cursor:'pointer',
                      border:`2.5px solid ${selBgColor===c?'var(--c-goal,#F59E0B)':'var(--border)'}`}}/>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        {STATS.map(({label,value})=>(
          <div key={label} style={{...sc(),padding:'10px 12px',textAlign:'center'}}>
            <p style={{...lbl(),textAlign:'center'}}>{label}</p>
            <p style={{fontFamily:'monospace',fontWeight:700,fontSize:18}}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Plano ── */}
      {plan!=='pro'?(
        <div style={{...sc(),padding:18,
          background:'var(--background)',
          borderColor:'var(--c-goal-b,#92400E)'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                <Crown size={16} style={{color:'var(--c-goal,#F59E0B)'}}/>
                <p style={{fontWeight:700,color:'var(--c-goal,#F59E0B)'}}>Pro vitalício</p>
              </div>
              <p style={{fontFamily:'monospace',fontWeight:700,fontSize:24}}>R$ 12,90</p>
              <p style={{fontSize:11,opacity:.5}}>pagamento único · sem mensalidade</p>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:14}}>
            {['Hábitos ilimitados','Sync entre dispositivos','Todos os temas','Acesso vitalício','IA em breve','Suporte prioritário'].map(f=>(
              <div key={f} style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:14,height:14,borderRadius:2,background:'var(--c-goal,#F59E0B)',
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:8,fontWeight:700,color:'#111'}}>✓</span>
                </div>
                <span style={{fontSize:12}}>{f}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>window.open(WA_URL,'_blank')} style={{...btnP(),marginBottom:8,justifyContent:'center',gap:6}}>
            <Crown size={14} weight="fill"/> Ativar via WhatsApp
          </button>
          <button onClick={()=>window.open('https://buy.stripe.com/cNi3cufptc2t8AhgWf6g802','_blank')}
            style={{...btnP(),background:'var(--c-event,#9B7BFF)',justifyContent:'center',gap:6}}>
            <Crown size={14} weight="fill"/> Ativar via Stripe
          </button>
        </div>
      ):(
        <div style={{...sc(),padding:14,
          background:'var(--c-goal-bg,rgba(245,158,11,.08))',
          borderColor:'var(--c-goal-b,#92400E)',
          display:'flex',alignItems:'center',gap:16}}>
          <Crown size={22} style={{color:'var(--c-goal,#F59E0B)',flexShrink:0}}/>
          <div style={{flex:1}}>
            <p style={{fontWeight:700}}>Plano Pro ativo</p>
            <p style={{fontSize:11,opacity:.5}}>Acesso vitalício</p>
          </div>
          <span style={{fontFamily:'monospace',fontSize:11,fontWeight:700,
            background:'var(--c-goal,#F59E0B)',color:'#111',
            padding:'2px 8px',borderRadius:4,border:'1.5px solid var(--c-goal-b,#92400E)'}}>Pro</span>
        </div>
      )}

      {/* ── Aparência ── */}
      <div>
        <SectionLabel>Aparência</SectionLabel>
        <div style={{...sc(),overflow:'hidden'}}>
          <Row
            icon={themeMode==='dark'?<MoonStars size={15} style={{color:'#60a5fa'}}/>:<Sun size={15} style={{color:'#f59e0b'}}/>}
            bg="var(--background)"
            title="Tema"
            sub={themeMode==='dark'?'Escuro':'Claro'}
            right={<Toggle checked={themeMode==='dark'} onChange={v=>{setThemeMode(v?'dark':'light');setTheme(v?'dark':'light')}}/>}
          />
          <Row
            icon={<SpeakerHigh size={15} style={{color:'#f59e0b'}}/>}
            bg="var(--background)"
            title="Sons"
            sub="Efeitos sonoros ao ganhar IO"
            right={<Toggle checked={soundOn} onChange={setSoundOn}/>}
          />
          <Row
            icon={<Bell size={15} style={{color:'#ef4444'}}/>}
            bg="var(--background)"
            title="Notificações"
            sub="Lembretes de hábitos"
            right={<Toggle checked={true} onChange={()=>{}}/>}
          />
        </div>
      </div>

      {/* ── Conta ── */}
      <div>
        <SectionLabel>Conta</SectionLabel>
        <div style={{...sc(),overflow:'hidden'}}>
          <Row icon={<User size={15} style={{color:'#3b82f6'}}/>} bg="var(--background)"
            title="Conta" sub="usuario@email.com"
            right={<ArrowRight size={13} style={{opacity:.4}}/>}/>
          <Row icon={<Lock size={15} style={{color:'#a855f7'}}/>} bg="var(--background)"
            title="Privacidade" sub="Biometria, PIN e dados"
            right={<ArrowRight size={13} style={{opacity:.4}}/>}/>
          <Row icon={<Phone size={15} style={{color:'#22c55e'}}/>} bg="var(--background)"
            title="Sync e dispositivos" sub="Dados na nuvem via Supabase"
            right={<ArrowRight size={13} style={{opacity:.4}}/>}/>
        </div>
      </div>

      {/* ── Sistema IO ── */}
      <div>
        <SectionLabel>Sistema IO</SectionLabel>
        <div style={{...sc(),overflow:'hidden'}}>
          <Row href="/dashboard/shop"
            icon={<Shield size={15} style={{color:'#f59e0b'}}/>} bg="var(--background)"
            title="Loja IO" sub={`${economy.saldo_io} IO disponíveis`}
            right={<ArrowRight size={13} style={{opacity:.4}}/>}/>
          <Row href="/dashboard/progress"
            icon={<Crown size={15} style={{color:'#a855f7'}}/>} bg="var(--background)"
            title="Progresso" sub={`Nível ${nivel.nivel} · ${economy.xp_total} XP`}
            right={<ArrowRight size={13} style={{opacity:.4}}/>}/>
        </div>
      </div>

      {/* ── Sobre ── */}
      <div>
        <SectionLabel>Sobre</SectionLabel>
        <div style={{...sc(),overflow:'hidden'}}>
          <Row icon={<Info size={15} style={{opacity:.5}}/>} bg="var(--background)"
            title="Versão"
            sub={`Rootio ${process.env.NEXT_PUBLIC_APP_VERSION??'0.4.0'} · Sistema IO`}/>
        </div>
      </div>

      {/* ── Zona de perigo ── */}
      <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
        {!showSignoutConfirm?(
          <button onClick={()=>setShowSignoutConfirm(true)} style={{...btnG(),gap:8}}>
            <SignOut size={15}/> Sair da conta
          </button>
        ):(
          <div style={{...sc(),padding:14}}>
            <p style={{fontSize:13,fontWeight:600,marginBottom:6}}>Sair da conta?</p>
            <p style={{fontSize:12,opacity:.5,marginBottom:12}}>Seus dados locais serão mantidos.</p>
            <div style={{display:'flex',gap:8}}>
              <button onClick={async()=>{reset();await signOut()}} style={{...btnP(),flex:1,justifyContent:'center'}}><span>Sair</span></button>
              <button onClick={()=>setShowSignoutConfirm(false)} style={{...btnG(),flex:1}}>Cancelar</button>
            </div>
          </div>
        )}

        {!showResetConfirm?(
          <button onClick={()=>setShowResetConfirm(true)}
            style={{...btnG(),gap:8,color:'var(--destructive-pastel,#FF6B6B)',
              borderColor:'var(--destructive-pastel,#FF6B6B)'}}>
            <Trash size={15}/> Apagar todos os dados
          </button>
        ):(
          <div style={{...sc(),padding:14,borderColor:'var(--destructive-pastel,#FF6B6B)'}}>
            <p style={{fontSize:13,fontWeight:600,marginBottom:6}}>Apagar todos os dados?</p>
            <p style={{fontSize:12,opacity:.5,marginBottom:12}}>Esta ação não pode ser desfeita.</p>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{reset();router.push('/auth')}}
                style={{...btnP(),flex:1,justifyContent:'center',background:'var(--destructive-pastel,#FF6B6B)',color:'#fff'}}>
                <span>Apagar tudo</span>
              </button>
              <button onClick={()=>setShowResetConfirm(false)} style={{...btnG(),flex:1}}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}