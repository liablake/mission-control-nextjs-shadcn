# Sprint 7 — Execução 7/8 (Filtros operacionais e SLA breach por etapa)

Data: 2026-03-04

## Objetivo da rodada

Consolidar lacunas de uso real em operação audiovisual com foco em:

1. filtragem rápida e compartilhável por contexto de operação;
2. sinalização de itens estourando SLA por etapa;
3. manter leitura read-first sem adicionar complexidade de mutação.

## Entregas implementadas

### 1) Reviews com filtros via query params (`/dashboard/reviews`)

- Filtros por **owner** e **stage** no topo da página.
- Filtros aplicados em toda a visão (KPIs, fila, board, SLA, feedback e threads).
- Links compartilháveis (ex.: `?owner=Ana&stage=review`) para uso operacional diário.

### 2) Publishing com filtros operacionais (`/dashboard/publishing`)

- Filtros por **canal** e **stage** no topo da página.
- Segmentação aplicada nas tabelas de calendário, matriz, release control e saúde por canal.
- Leitura focada por contexto real de execução (ex.: apenas YouTube em review).

### 3) Tracking com indicador de SLA breach por etapa (`/dashboard/tracking`)

- Novo KPI: **SLA breach por etapa**.
- Nova tabela com itens acima do limite, incluindo:
  - owner,
  - etapa atual,
  - horas na etapa,
  - limite esperado,
  - estouro em horas.
- Regra inicial de SLA por etapa:
  - ideation: 24h
  - planning: 24h
  - production: 48h
  - review: 24h
  - publishing: 12h

## Decisões e tradeoffs

- **Decisão:** implementar filtros no nível de página (server-side) com `searchParams`.
  - **Tradeoff:** menor interatividade instantânea que filtros client-side, mas melhor simplicidade e URL compartilhável.
- **Decisão:** manter thresholds de SLA hardcoded em `mission-insights.ts` nesta fase.
  - **Tradeoff:** menor flexibilidade por operação/equipe, porém baixa fricção e heurística auditável para Sprint 7.
- **Decisão:** não introduzir mutações/escrita no pipeline.
  - **Tradeoff:** mantém proposta read-heavy estável, adiando workflows de ação transacional para etapa futura.

## Qualidade

- `npm run lint` ✅
- `npm run build` ✅

## Resultado operacional esperado

- Menor tempo para triagem em janelas de operação (por dono, estágio e canal).
- Detecção explícita de gargalos de ciclo por etapa.
- Maior previsibilidade de priorização no trecho review → publishing.
