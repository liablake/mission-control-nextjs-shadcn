# Sprint 5 — Execução 5/8 (Calendário editorial, feedback loop e métricas de entrega)

Data: 2026-03-04

## Objetivo da rodada

Fortalecer o produto para pipeline audiovisual read-first com três frentes:

1. visão calendário/editorial/publicação por canal;
2. revisão/comentários/feedback mais operacional;
3. métricas de operação e entrega mais acionáveis.

## Entregas implementadas

### 1) Publicação com visão editorial por canal (`/dashboard/publishing`)

- Novo bloco **Calendário editorial por canal** com leitura diária (UTC) de slots por YouTube/Instagram/TikTok.
- Mantida a matriz conteúdo × canal com gate de aprovação por item.
- Novo bloco **Saúde de publicação por canal** com:
  - slots totais,
  - readiness,
  - publicados,
  - checklist médio,
  - slots atrasados.

### 2) Review com feedback loop explícito (`/dashboard/reviews`)

- KPIs no topo para leitura rápida:
  - assets em feedback loop,
  - comentários em aberto,
  - assets bloqueando entrega.
- Nova tabela **Visão de feedback por asset** com:
  - participantes,
  - abertos vs resolvidos,
  - aging,
  - velocidade do feedback (fast/moderate/slow).
- Mantido o board de aprovação e a visão detalhada de threads por timecode.

### 3) Tracking com operação + entrega (`/dashboard/tracking`)

- Ampliação dos cards com métricas de entrega:
  - aderência de agenda,
  - fechamento de review,
  - throughput de publicados (7d),
  - checklist médio,
  - handoffs registrados.
- Nova tabela **Padrão de handoff por etapa** para identificar gargalos de transição.

## Camada analítica expandida (`src/lib/mission-insights.ts`)

Novas funções:

- `buildPublishingCalendarRows(data)`
- `buildChannelHealthRows(data)`
- `buildFeedbackLoopRows(data)`
- `buildOpsDeliverySnapshot(data)`

Essas funções mantêm o produto orientado a leitura rápida (scan first, detail next).

## Resultado esperado para o time audiovisual

- Planejamento editorial mais claro por canal e por dia.
- Menos incerteza no ciclo de revisão por visibilidade do feedback loop.
- Gestão operacional com métricas de entrega sem depender de leitura manual de eventos.
