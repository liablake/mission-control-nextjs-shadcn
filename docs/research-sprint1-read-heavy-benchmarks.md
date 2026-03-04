# Sprint 1 — Benchmarks (read-heavy suite)

## Competidores e padrões aplicáveis

### Frame.io
- Comentários ancorados em timecode e versão.
- Fluxo de aprovação explícito (pending / changes requested / approved).
- Histórico de versões como entidade de primeira classe.

### Notion / Airtable
- Multi-view sobre mesmo dataset (table/board/calendar/timeline).
- Estrutura com propriedades padronizadas para filtros rápidos.
- Operação read-heavy baseada em snapshots e rollups.

### Trello / Asana / Monday / ClickUp
- Visão de pipeline por estágio para detectar gargalos.
- Métricas simples e operacionais no topo (WIP, atraso, taxa de conclusão).
- Prioridade e ownership claros para triagem.

### Hootsuite / Buffer / Later
- Fila de publicação por canal com estado de readiness.
- Checklist de publicação para reduzir erro operacional.
- Agenda editorial consolidada por data/hora.

## Decisões aplicadas neste sprint
- Entidades persistidas no Supabase para pipeline audiovisual:
  - `content_items`
  - `asset_versions`
  - `review_comments`
  - `publish_slots`
- Enumeração de status/estágios para consistência de UX e métricas.
- Dashboard com foco em leitura operacional, não edição pesada.
- Fallback para dataset local quando env Supabase não está configurado.

## TODO próximo sprint
- Timeline/calendar visual real (semanal) com conflito de slot.
- RLS por workspace/equipe (políticas abertas são temporárias).
- SLA de review (tempo médio até aprovação) e aging por comentário aberto.
