# Rootio v0.3.0

App de produtividade gamificada: hábitos, finanças e carreira com Sistema IO.

## Stack
- Next.js 14 · TypeScript · Tailwind CSS
- shadcn/ui (Radix UI) · Phosphor Icons
- Zustand · Supabase SSR · Sonner · Vaul
- Design system: Neobrutalism (storybook em docs/)

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env.local
# Preencher com suas chaves do Supabase

# 3. Banco de dados
# Executar supabase/schema.sql no Supabase SQL Editor

# 4. Rodar
npm run dev
```

## Estrutura

```
src/
  app/
    auth/           → Tela de login/cadastro
    dashboard/
      page.tsx      → Hoje (dashboard principal)
      habits/       → Hábitos com Sistema IO
      finance/      → Controle financeiro
      progress/     → Nível XP e conquistas
      career/       → Trilha de carreira
      projects/     → Projetos de vida
      sprint/       → Kanban / Sprint
      mentor/       → Diário + IA
      shop/         → Loja IO
      profile/      → Perfil e ajustes
      feed/         → Feed social
  components/
    navigation/FabNav.tsx     → FAB mobile (substituir bottom nav)
    sprint/SprintDashboard.tsx
    SplashScreen.tsx
    ui/                       → shadcn components
  store/
    useAppStore.ts            → Store global Zustand
    sprint/sprintStore.ts     → Store do Sprint
  lib/
    io-system.ts              → Sistema de economia IO
    supabase.ts               → Cliente Supabase
    webauthn.ts               → Autenticação biométrica
  hooks/
    useIO.ts                  → Hook de registro IO
  types/
    index.ts                  → Types globais

docs/
  Rootio_Storybook.html       → Design system visual (abrir no browser)
  rootio-migration-mockup.html → Mockup interativo das telas
  rootio-desktop-nav-mockup.html → Nav desktop mockup
  prompts/                    → Prompts de implementação por módulo
```

## Sistema IO

- Completar hábito → +10 IO + 10 XP
- Ciclo completo do dia → +50 IO
- Streak diário → +20 IO
- Limite diário → 200 IO

XP determina o nível (nunca diminui).
IO é saldo para gastar na Loja IO.

## Variáveis de ambiente obrigatórias

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |

## SQL — executar no Supabase

Arquivo: `supabase/schema.sql`

Contém: profiles, habits, transactions, goals, journal_entries,
career_profiles, projects, feed_posts, shop_inventory, io_events.
Inclui RLS policies e triggers.

## Design System

Ver `docs/Rootio_Storybook.html` no browser para referência visual completa.

Classes principais: `.nb-card`, `.nb-btn`, `.nb-btn-primary`, `.nb-prog`,
`.nb-tag`, `.nb-ticker`, `.nb-label`, `.nb-display`, `.nb-check`

Tokens: `--ink #111111`, `--amber #F59E0B`, `--sun #FFD23F`,
`--grass #7CE577`, `--violet #9B7BFF`, `--coral #FF6B6B`
