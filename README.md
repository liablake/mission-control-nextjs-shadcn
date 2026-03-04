# Mission Control

Dashboard de acompanhamento (read-only) para tarefas delegadas, feito com **Next.js + shadcn/ui**.

## Rodando o app

```bash
npm install
npm run dev
```

App em: <http://localhost:3000>

## Sprint 1 (read-heavy audiovisual)

Novas telas no dashboard:
- `/dashboard/pipeline`
- `/dashboard/reviews`
- `/dashboard/publishing`

Dataset principal em `src/lib/mission-data.ts`:
- usa Supabase quando `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão definidos
- fallback para dataset local de demonstração quando env não está configurado

Pesquisa de benchmark documentada em:
- `docs/research-sprint1-read-heavy-benchmarks.md`

## Supabase local

O projeto já está inicializado com `supabase init` e schema em migration.

### 1) Subir stack local

```bash
npx supabase start
```

### 2) Aplicar schema (reset + migrations)

```bash
npx supabase db reset
```

Isso cria as tabelas:
- `projects`
- `tasks`
- `task_status_history`
- type `task_status` (`todo`, `doing`, `done`)

Migration: `supabase/migrations/202603030001_init_schema.sql`

### 3) Parar stack local

```bash
npx supabase stop
```
