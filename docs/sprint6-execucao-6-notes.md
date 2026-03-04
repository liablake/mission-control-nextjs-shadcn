# Sprint 6 — Execução 6/8 (Controle de release, cobertura de preview e qualidade de revisão)

Data: 2026-03-04

## Objetivo da rodada

Dar mais controle operacional no trecho crítico **review → publishing** com foco em:

1. leitura rápida de risco de release por item;
2. cobertura de preview/comentários (qualidade da revisão);
3. direcionamento de próxima ação até publicação em YouTube/Instagram/TikTok.

## Entregas implementadas

### 1) Publishing: novo bloco de controle de release

Adicionado em `/dashboard/publishing`:

- tabela **Controle de release até publicação (YouTube/Instagram/TikTok)**;
- visão por conteúdo com:
  - estágio atual,
  - versão mais recente,
  - comentários abertos,
  - canais prontos/publicados,
  - confiança de agenda (`scheduleConfidence`),
  - risco de pipeline (`pipelineRisk`),
  - próxima ação recomendada.

### 2) Reviews: cobertura de qualidade da revisão

Adicionado em `/dashboard/reviews`:

- KPI de **cobertura de preview** (`assetsWithPreview/total` + pendentes sem preview);
- KPI de **comentários com timecode** (%), com média de abertos por asset.

Isso aumenta visibilidade sobre qualidade de feedback e reduz revisão “cega”.

### 3) Camada analítica expandida (`src/lib/mission-insights.ts`)

Novas estruturas/funções:

- `ReviewCoverageSnapshot`
- `ReleaseControlRow`
- `buildReviewCoverageSnapshot(data)`
- `buildReleaseControlRows(data)`

## Resultado operacional esperado

- Menos handoff sem contexto no trecho final do pipeline.
- Priorização mais clara para destravar publicação multi-canal.
- Maior previsibilidade de saída por canal com ação recomendada explícita por item.
