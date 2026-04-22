'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp, resetPassword } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { toast } from 'sonner'
import { Lightning, Eye, EyeSlash, X, ArrowLeft, FingerprintSimple } from '@phosphor-icons/react'

const ERR: Record<string, string> = {
  'Email not confirmed':      'Confirme seu e-mail antes de entrar.',
  'Invalid login credentials':'E-mail ou senha incorretos.',
  'User already registered':  'E-mail já cadastrado.',
}

type AuthView = 'login' | 'signup' | 'reset'

export default function AuthPage() {
  const router = useRouter()
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [name, setName]     = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')
  const [isErr, setIsErr]   = useState(true)
  const [openDrawer, setOpenDrawer] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setMsg('')
    if (!email || !pass) { setMsg('Preencha todos os campos.'); setIsErr(true); return }
    setLoading(true)
    const { error } = await signIn(email, pass)
    setLoading(false)
    if (error) { setMsg(ERR[error.message] ?? error.message); setIsErr(true) }
    else router.replace('/dashboard')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault(); setMsg('')
    if (!email || !pass) { setMsg('Preencha todos os campos.'); setIsErr(true); return }
    if (pass.length < 6) { setMsg('Senha mínima: 6 caracteres.'); setIsErr(true); return }
    setLoading(true)
    const { error } = await signUp(email, pass, name || 'Io User')
    setLoading(false)
    if (error) { setMsg(ERR[error.message] ?? error.message); setIsErr(true) }
    else { setMsg('Confirme seu e-mail para continuar.'); setIsErr(false) }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault(); setMsg('')
    if (!email) { setMsg('Preencha o e-mail.'); setIsErr(true); return }
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) { setMsg('Erro ao enviar e-mail. Verifique se o e-mail está correto.'); setIsErr(true) }
    else {
      toast.success('Link de recuperação enviado!', {
        description: 'Verifique seu e-mail para redefinir sua senha.',
      })
      setView('login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Rootio" className="w-10 h-10" />
          <div>
            <h1 className="font-bold text-xl">Rootio</h1>
            <p className="text-xs text-muted-foreground">Sua Evolução Pessoal</p>
          </div>
        </div>

        {view === 'reset' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <button onClick={() => setView('login')} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft size={20} />
                </button>
                Recuperar senha
              </CardTitle>
              <CardDescription>Digite seu e-mail para receber o link de recuperação</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-mail</Label>
                  <Input id="reset-email" type="email" placeholder="seu@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                {msg && (
                  <p className={`text-xs ${isErr ? 'text-destructive' : 'text-green-600'}`}>{msg}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs defaultValue="login" onValueChange={(v) => { setView(v as AuthView); setMsg('') }}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bem-vindo de volta</CardTitle>
                    <CardDescription>Entre com seu e-mail e senha</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-login">E-mail</Label>
                        <Input id="email-login" type="email" placeholder="seu@email.com"
                          value={email} onChange={e => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="pass-login">Senha</Label>
                          <button type="button" onClick={() => setView('reset')} className="text-xs text-foreground hover:underline">
                            Esqueceu a senha?
                          </button>
                        </div>
                        <div className="relative">
                          <Input id="pass-login" type={showPw ? 'text' : 'password'}
                            placeholder="••••••••" className="pr-10"
                            value={pass} onChange={e => setPass(e.target.value)} />
                          <button type="button" onClick={() => setShowPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPw ? <EyeSlash size={16}/> : <Eye size={16}/>}
                          </button>
                        </div>
                      </div>
                      {msg && (
                        <p className={`text-xs ${isErr ? 'text-destructive' : 'text-green-600'}`}>{msg}</p>
                      )}
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="signup">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Criar conta grátis</CardTitle>
                    <CardDescription>Comece sua jornada com o Rootio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" placeholder="Como quer ser chamado"
                          value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-signup">E-mail</Label>
                        <Input id="email-signup" type="email" placeholder="seu@email.com"
                          value={email} onChange={e => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pass-signup">Senha</Label>
                        <div className="relative">
                          <Input id="pass-signup" type={showPw ? 'text' : 'password'}
                            placeholder="Mínimo 6 caracteres" className="pr-10"
                            value={pass} onChange={e => setPass(e.target.value)} />
                          <button type="button" onClick={() => setShowPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPw ? <EyeSlash size={16}/> : <Eye size={16}/>}
                          </button>
                        </div>
                      </div>
                      {msg && (
                        <p className={`text-xs ${isErr ? 'text-destructive' : 'text-green-600'}`}>{msg}</p>
                      )}
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Criando...' : 'Criar conta'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button variant="outline" className="w-full"
              onClick={() => { localStorage.setItem('io_auth_skipped','true'); router.replace('/dashboard') }}>
              Continuar sem conta
            </Button>
          </>
        )}

        {view !== 'reset' && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            <FingerprintSimple size={14} className="inline mr-3" />
            Ao continuar, você concorda com nossa <button type="button" onClick={() => setOpenDrawer('privacy')} className="text-foreground hover:underline"><strong>Política de Privacidade</strong></button> os <button type="button" onClick={() => setOpenDrawer('terms')} className="text-foreground hover:underline"><strong>Termos de Uso</strong></button> e <button type="button" onClick={() => setOpenDrawer('lgpd')} className="text-foreground hover:underline"><strong>LGPD</strong></button>.
          </p>
        )}

        <Drawer open={openDrawer === 'privacy'} onOpenChange={(open) => !open && setOpenDrawer(null)}>
          <DrawerContent className="max-h-[85vh]">
            <div className="mx-auto w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <DrawerTitle className="text-xl">Política de Privacidade</DrawerTitle>
                <button onClick={() => setOpenDrawer(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="prose prose-sm prose-amber dark:prose-invert max-w-none space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                <div>
                  <h4 className="font-semibold text-base mb-2">1. Dados coletados</h4>
                  <p className="text-sm text-muted-foreground">Nós coletamos apenas e-mail, nome e dados de uso do aplicativo necessários para o funcionamento da plataforma Rootio.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">2. Uso dos dados</h4>
                  <p className="text-sm text-muted-foreground">Seus dados são usados exclusivamente para personalizar sua experiência, enviar notificações de progresso e melhorar o produto.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">3. Compartilhamento</h4>
                  <p className="text-sm text-muted-foreground">Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">4. Armazenamento de Dados</h4>
                  <p className="text-sm text-muted-foreground">Dados são armazenados com criptografia via Supabase em servidores seguros. Retenção máxima de 2 anos após inatividade.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">5. Seus direitos</h4>
                  <p className="text-sm text-muted-foreground">Você pode solicitar exclusão, exportação ou correção dos seus dados a qualquer momento excluindo seus dados no aplicativo.</p>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <Drawer open={openDrawer === 'terms'} onOpenChange={(open) => !open && setOpenDrawer(null)}>
          <DrawerContent className="max-h-[85vh]">
            <div className="mx-auto w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <DrawerTitle className="text-xl">Termos de Uso</DrawerTitle>
                <button onClick={() => setOpenDrawer(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="prose prose-sm prose-amber dark:prose-invert max-w-none space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                <div>
                  <h4 className="font-semibold text-base mb-2">1. Aceitação dos termos</h4>
                  <p className="text-sm text-muted-foreground">Ao aceitar usar o Rootio, você concorda com estes termos. Caso não concorde, não utilize o serviço.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">2. Uso permitido</h4>
                  <p className="text-sm text-muted-foreground">O Rootio é uma ferramenta de desenvolvimento pessoal. É proibido usar a plataforma para fins ilícitos ou prejudiciais a terceiros.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">3. Conta</h4>
                  <p className="text-sm text-muted-foreground">Você é responsável pela segurança da sua conta e por todas as atividades realizadas nela.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">4. Limitações gratuitas</h4>
                  <p className="text-sm text-muted-foreground">O plano gratuito permite até 10 hábitos ativos. Recursos adicionais estão disponíveis no plano Pro.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">5. Alterações</h4>
                  <p className="text-sm text-muted-foreground">Podemos alterar estes termos com aviso prévio.</p>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <Drawer open={openDrawer === 'lgpd'} onOpenChange={(open) => !open && setOpenDrawer(null)}>
          <DrawerContent className="max-h-[85vh]">
            <div className="mx-auto w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <DrawerTitle className="text-xl">LGPD</DrawerTitle>
                <button onClick={() => setOpenDrawer(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="prose prose-sm prose-amber dark:prose-invert max-w-none space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                <div>
                  <h4 className="font-semibold text-base mb-2">Lei 13.709/2018</h4>
                  <p className="text-sm text-muted-foreground">O Rootio opera em conformidade com a Lei Geral de Proteção de Dados do Brasil (LGPD).</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">Base legal</h4>
                  <p className="text-sm text-muted-foreground">O tratamento dos seus dados tem como base legal o legítimo interesse e o consentimento explícito obtido no momento do cadastro.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">Responsável</h4>
                  <p className="text-sm text-muted-foreground">A Ioverso (Startup) possui CNPJ em processo de atualização. Responsável pelo tratamento dos dados pessoais dos usuários.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">Seus direitos (Art. 18)</h4>
                  <p className="text-sm text-muted-foreground">Acesso · Correção · Anonimização · Portabilidade · Eliminação · Revogação do consentimento.</p>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
