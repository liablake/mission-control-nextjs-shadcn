# Mission Control

Dashboard de acompanhamento (read-only) para tarefas delegadas, feito com **Next.js + shadcn/ui**.

## Rodando o app

```bash
npm install
npm run dev
```

App em: <http://localhost:3000>

## Sprint 1-2 (read-heavy audiovisual)

Telas no dashboard:
- `/dashboard/pipeline`
- `/dashboard/reviews`
- `/dashboard/tracking`
- `/dashboard/publishing`

Dataset principal em `src/lib/mission-data.ts`:
- usa Supabase quando `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão definidos
- fallback para dataset local de demonstração quando env não está configurado
- inclui validações de qualidade/auditabilidade (`buildMissionDataQuality`)

Pesquisa de benchmark documentada em:
- `docs/research-sprint1-read-heavy-benchmarks.md`
- `docs/research-sprint2-read-heavy-ux-workflows.md`
- `docs/sprint4-execucao-4-notes.md`
- `docs/sprint5-execucao-5-notes.md`
- `docs/sprint6-execucao-6-notes.md`
- `docs/sprint7-execucao-7-notes.md`

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
- `content_items`
- `asset_versions`
- `review_comments`
- `publish_slots`
- `pipeline_stage_events`
- types: `task_status`, `pipeline_stage`, `review_status`, `publish_channel`, `publish_status`

Migrations:
- `supabase/migrations/202603030001_init_schema.sql`
- `supabase/migrations/202603040350_pipeline_read_models.sql`
- `supabase/migrations/202603040455_stage_tracking.sql`

### 3) Parar stack local

```bash
npx supabase stop
```
