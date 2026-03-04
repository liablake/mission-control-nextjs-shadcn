# Sprint 3/8 — Execução 3 (Mission Control)

## Objetivo desta execução
Aprofundar a jornada completa de vídeo com foco operacional em:
- preview
- commenting
- reviewing
- aprovação
- status
- visibilidade operacional

## Incrementos implementados
1. **Novo módulo de insights (`src/lib/mission-insights.ts`)**
   - `buildJourneyRows`: consolida jornada por item (stage atual, versão mais recente, preview, comentários abertos, gate de aprovação, readiness multi-canal).
   - `buildReviewSlaRows`: cria visão de SLA de review (idade de comentários abertos e risco).
   - `buildStageCycleHours`: calcula lead time/cycle time por item a partir de eventos de etapa.

2. **Reviews (`/dashboard/reviews`) evoluído para controle de aprovação**
   - Board de aprovação ponta-a-ponta por item.
   - Gate `ready | needs_review | blocked`.
   - Link de preview quando disponível.
   - Tabela de SLA de review com risco operacional.
   - Threads por asset mantidas como detalhe tático.

3. **Tracking (`/dashboard/tracking`) com visibilidade de lead time**
   - KPIs operacionais (itens rastreados, lead time médio, transições totais).
   - Tabela de cycle hours por item com destaque para risco.
   - Timeline auditável preservada.

4. **Publishing (`/dashboard/publishing`) com visão multi-plataforma real**
   - Matriz conteúdo × canal (YouTube/Instagram/TikTok).
   - Exibe status e checklist por canal.
   - Mostra gate de aprovação por conteúdo para evitar publicação sem readiness.

5. **Dashboard principal (`/dashboard`) com novos alertas de gate**
   - Contadores de `Gate bloqueado` e `Gate aguardando review`.

## Decisões técnicas
- Mantida abordagem **read-heavy** (sem mutações), focada em visibilidade operacional.
- Cálculos derivados centralizados em `mission-insights.ts` para evitar lógica duplicada entre páginas.
- Gate de aprovação definido por heurística simples e auditável:
  - `needs_review`: comentários abertos > 0
  - `ready`: asset aprovado + ao menos 1 canal scheduled/published
  - `blocked`: restante

## TODOs claros (próximas execuções)
1. Adicionar **filtros por owner/prioridade/canal** nas páginas Reviews/Publishing.
2. Persistir SLA/lead-time no banco para históricos comparáveis por semana.
3. Introduzir indicador de **SLA breach por etapa** (ex.: review > 24h).
4. Adicionar drill-down por item com timeline única (ideação → publicação).
5. Cobrir `mission-insights.ts` com testes unitários.
