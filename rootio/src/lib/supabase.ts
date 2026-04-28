import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient()

// ─── Auth ──────────────────────────────────────────────────────────────
export const signUp = (email: string, password: string, username: string) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = async () => {
  await supabase.auth.signOut()
  window.location.href = '/'
}

export const resetPassword = (email: string) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

export const getSession = () => supabase.auth.getSession()
export const getUser    = () => supabase.auth.getUser()

// ─── CRUD genérico ─────────────────────────────────────────────────────
export const upsertRows = (table: string, rows: object[]) =>
  supabase.from(table).upsert(rows)

export const fetchRows = (table: string, userId: string) =>
  supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: true })

export const deleteRow = (table: string, id: number, userId: string) =>
  supabase.from(table).delete().eq('id', id).eq('user_id', userId)

// ─── Erros traduzidos ─────────────────────────────────────────────────
export const AUTH_ERRORS: Record<string, string> = {
  'Email not confirmed':      'Confirme seu e-mail antes de entrar.',
  'Invalid login credentials':'E-mail ou senha incorretos.',
  'User already registered':  'Este e-mail já tem uma conta. Tente fazer login.',
  'Password should be at least 6 characters': 'A senha deve ter ao menos 6 caracteres.',
}