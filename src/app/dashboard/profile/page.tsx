'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { getNivel, getProgresso } from '@/lib/io-system'
import { signOut } from '@/lib/supabase'
import { storage, saveStorage } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { PageSkeleton } from '@/components/PageSkeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  User, Shield, Palette, Bell, SpeakerHigh,
  Info, SignOut, Crown, Trash, ArrowRight,
  MoonStars, Sun, Phone, Lightning, Lock, PencilSimple, Atom,
} from '@phosphor-icons/react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'
const WA_URL   = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  'Olá! Tenho interesse em ativar o plano Pro vitalício do Rootio por R$ 12,90.'
)}`

/* ─── Avatar options ─────────────────────────────────────── */
const AVATARES = ['🌱','🔥','🦅','🧘','🪐','⚡','∞']

const KEY_INVENTORY = 'io_shop_inventory'

export default function AjustesPage() {
  const router = useRouter()
  const {
    economy, plan, username, avatar, theme, themeMode, soundOn, bgColor, bgImage,
    setAvatar, setTheme, setThemeMode, setSoundOn, setBgColor, setBgImage, reset,
  } = useAppStore()

  const nivel  = getNivel(economy.xp_total)
  const pct    = getProgresso(economy.xp_total)
  const prox   = [
    { nivel:1, titulo:'Pessoa Exploradora', xp_min:0,    xp_max:500   },
    { nivel:2, titulo:'Pessoa Conectora',   xp_min:501,  xp_max:1500  },
    { nivel:3, titulo:'Pessoa Visionária',  xp_min:1501, xp_max:99999 },
  ].find(n => n.nivel === nivel.nivel + 1)

  const [showAvatars, setShowAvatars] = useState(false)
  const [selectedBgColor, setSelectedBgColor] = useState(bgColor || '#fef3c7')
  const [inventory, setInventory] = useState<string[]>([])
  const [themePage, setThemePage] = useState(1)
  const [loading, setLoading] = useState(true)

  const THEMES_PER_PAGE = 5
  const THEME_LIST = [
    { id: 'tm1', name: 'Sol', icon: Sun, key: 'light' },
    { id: 'tm2', name: 'Lua', icon: MoonStars, key: 'dark' },
    { id: 'tm3', name: 'Nuclear', icon: Atom, key: 'nuclear', hasMode: true },
  ]
  const THEMES_WITH_MODE = ['nuclear', 'neo-brutalism', 'eclipse', 'aurora']
  const currentThemeSupportsMode = THEMES_WITH_MODE.includes(theme)
  const totalThemePages = Math.ceil(THEME_LIST.length / THEMES_PER_PAGE)

  useEffect(() => {
    const inv = storage<string[]>(KEY_INVENTORY, [])
    setInventory(inv)
    setLoading(false)
  }, [])

  useEffect(() => {
    setSelectedBgColor(bgColor || '#fef3c7')
  }, [bgColor])

  function handleSaveAvatar() {
    setBgColor(selectedBgColor)
    setShowAvatars(false)
  }

  async function handleSignOut() {
    reset()
    await signOut()
  }

  function handleReset() {
    reset()
    router.push('/auth')
  }

  return loading ? <PageSkeleton /> : (
    <div className="p-4 md:p-6 max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ajustes</h2>
        <p className="text-sm text-muted-foreground">Conta, aparência e preferências</p>
      </div>

      {/* ─── Perfil ─────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <button onClick={() => setShowAvatars(v => !v)}
              className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-200
                         flex items-center justify-center text-4xl hover:border-amber-400
                         transition-colors flex-shrink-0 relative shadow-md"
              style={{ backgroundColor: selectedBgColor }}>
              {avatar}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full
                              flex items-center justify-center border-2 border-background shadow-md">
                <PencilSimple size={12} className="text-white" />
              </div>
            </button>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate">{username}</p>
              <p className="text-sm text-muted-foreground">{nivel.titulo}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                  {economy.xp_total} XP
                </span>
              </div>
              {prox && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {prox.xp_min - economy.xp_total} XP para {prox.titulo}
                </p>
              )}
            </div>
          </div>

          {/* Seletor de avatar */}
          {showAvatars && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-3">Escolha seu avatar</p>
                <div className="grid grid-cols-8 gap-2">
                  {AVATARES.map(av => (
                    <button key={av} onClick={() => { setAvatar(av); setShowAvatars(false) }}
                      className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-colors
                        ${avatar === av
                          ? 'bg-amber-500 ring-2 ring-amber-500 ring-offset-1'
                          : 'bg-muted hover:bg-amber-50'}`}>
                        {av}
                      </button>
                  ))}
                </div>
              </div>

              <div className="my-6">
                <p className="text-xs text-muted-foreground mb-3">Cor de fundo</p>
                <div className="flex gap-2 flex-wrap">
                  {['#fef3c7','#fce7f3','#dbeafe','#dcfce7','#e0e7ff'].map(c => (
                    <button key={c} onClick={() => setSelectedBgColor(c)}
                      className={`w-8 h-8 rounded-lg ${selectedBgColor === c ? 'ring-2 ring-amber-500' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="my-6">
                <p className="text-xs text-muted-foreground mb-3">
                  Tema <span className="ml-2">{themePage}/{totalThemePages}</span>
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setThemePage(p => Math.max(1, p - 1))} disabled={themePage <= 1}
                    className="w-8 h-8 rounded-lg border bg-transparent disabled:opacity-50">‹</button>
                  {THEME_LIST.map(t => {
                    const isOwned = inventory.includes(t.id)
                    return (
                      <button key={t.id} onClick={() => isOwned && setTheme(t.key)}
                        disabled={!isOwned}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOwned ? 'bg-muted hover:bg-amber-50' : 'opacity-50'}`}>
                        <t.icon size={16} />
                      </button>
                    )
                  })}
                  <button onClick={() => setThemePage(p => Math.min(totalThemePages, p + 1))} disabled={themePage >= totalThemePages}
                    className="w-8 h-8 rounded-lg border bg-transparent disabled:opacity-50">›</button>
                </div>
              </div>

              <div className="mt-8">
                <Button onClick={handleSaveAvatar} className="w-full">Salvar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Stats resumidas ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Saldo IO',  value: economy.saldo_io,  icon: Lightning },
          { label: 'XP total',  value: economy.xp_total,  icon: Crown },
          { label: 'Streak',    value: `${economy.streak}d`, icon: null },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
              <p className="font-bold font-mono text-lg">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Plano ───────────────────────────────────────────── */}
      {plan !== 'pro' ? (
        <Card className="bg-zinc-950 border-zinc-800 text-white overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={16} className="text-amber-400" />
                  <p className="font-bold text-amber-400">Pro vitalício</p>
                </div>
                <p className="text-2xl font-bold text-white">R$ 12,90</p>
                <p className="text-xs text-zinc-400">pagamento único · sem mensalidade</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
              {[
                'Hábitos ilimitados',
                'Sync entre dispositivos',
                'Todos os temas',
                'Acesso vitalício',
                'IA em breve',
                'Suporte prioritário',
              ].map(f => (
                <div key={f} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-[7px] font-bold text-white">✓</span>
                  </div>
                  <span className="text-xs text-zinc-300">{f}</span>
                </div>
              ))}
            </div>
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2"
              onClick={() => window.open(WA_URL, '_blank')}>
              <Crown size={14} weight="fill" />
              Ativar Pro via WhatsApp
            </Button>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 mt-2"
              onClick={() => window.open('https://buy.stripe.com/cNi3cufptc2t8AhgWf6g802', '_blank')}>
              <Crown size={14} weight="fill" />
              Ativar Pro via Stripe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Crown size={24} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Plano Pro ativo</p>
              <p className="text-xs text-amber-600">Acesso vitalício a todos os recursos</p>
            </div>
            <Badge className="ml-auto bg-amber-500 text-white border-0">Pro</Badge>
          </CardContent>
        </Card>
      )}

      {/* ─── Conta ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground px-1">Conta</p>
        <Card>
          <CardContent className="p-0 divide-y">

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <User size={15} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Conta</p>
                <p className="text-[11px] text-muted-foreground">usuario@email.com</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Lock size={15} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Privacidade</p>
                <p className="text-[11px] text-muted-foreground">Biometria, PIN e dados</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Phone size={15} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sync e dispositivos</p>
                <p className="text-[11px] text-muted-foreground">Dados na nuvem via Supabase</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </div>

          </CardContent>
        </Card>
      </div>

      {/* ─── Aparência ───────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground px-1">Aparência</p>
        <Card>
          <CardContent className="p-0 divide-y">

            {/* Tema */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                {theme === 'dark'
                  ? <MoonStars size={15} className="text-zinc-600" />
                  : <Sun size={15} className="text-amber-600" />}
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium cursor-pointer">Tema</Label>
                <p className="text-[11px] text-muted-foreground">
                  {theme === 'dark' ? 'Escuro' : 'Claro'}
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={v => setTheme(v ? 'dark' : 'light')} />
            </div>

            {/* Sons */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <SpeakerHigh size={15} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium cursor-pointer">Sons</Label>
                <p className="text-[11px] text-muted-foreground">
                  Efeitos sonoros ao ganhar IO
                </p>
              </div>
              <Switch checked={soundOn} onCheckedChange={setSoundOn} />
            </div>

            {/* Notificações */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <Bell size={15} className="text-red-500" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium cursor-pointer">Notificações</Label>
                <p className="text-[11px] text-muted-foreground">Lembretes de hábitos</p>
              </div>
              <Switch defaultChecked />
            </div>

          </CardContent>
        </Card>
      </div>

      {/* ─── Loja IO ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground px-1">Sistema IO</p>
        <Card>
          <CardContent className="p-0 divide-y">

            <Link href="/dashboard/shop"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Shield size={15} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Loja IO</p>
                <p className="text-[11px] text-muted-foreground">
                  {economy.saldo_io} IO disponíveis para gastar
                </p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </Link>

            <Link href="/dashboard/progress"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Crown size={15} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Progresso e conquistas</p>
                <p className="text-[11px] text-muted-foreground">
                  Nível {nivel.nivel} · {economy.xp_total} XP total
                </p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </Link>

          </CardContent>
        </Card>
      </div>

      {/* ─── Sobre ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground px-1">Sobre</p>
        <Card>
          <CardContent className="p-0 divide-y">

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                <Info size={15} className="text-zinc-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Versão</p>
                <p className="text-[11px] text-muted-foreground">
                  Rootio {process.env.NEXT_PUBLIC_APP_VERSION ?? '0.3.0'} · Sistema IO
                </p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* ─── Zona de perigo ──────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground px-1">Conta</p>

        {/* Sair */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2 text-muted-foreground">
              <SignOut size={15} />
              Sair da conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
              <AlertDialogDescription>
                Seus dados locais serão mantidos. Para acessar novamente você precisará entrar com e-mail e senha.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>
                Sair
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Apagar dados */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline"
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
              <Trash size={15} />
              Apagar todos os dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apagar todos os dados?</AlertDialogTitle>
              <AlertDialogDescription>
                Todos os seus hábitos, transações, projetos e progresso serão{' '}
                <strong>apagados permanentemente</strong>. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Apagar tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

    </div>
  )
}
