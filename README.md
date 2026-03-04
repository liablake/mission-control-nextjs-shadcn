# Mission Control

Dashboard de acompanhamento (read-only) para tarefas delegadas, feito com **Next.js + shadcn/ui**.

## Rodando o app

```bash
npm install
npm run dev
```

App em: <http://localhost:3000>

## Clean state

O projeto foi resetado para estado limpo:
- dataset local em `src/lib/tasks.ts` começa vazio (`[]`)
- métricas e gráficos continuam funcionando com zero dados

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
