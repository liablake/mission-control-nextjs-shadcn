# Sprint 4 — Execução 4/8 (UX de operação diária para audiovisual)

Data: 2026-03-04

## Benchmark de mercado integrado neste sprint

### Referências usadas
- **Frame.io / Wipster**: fila de revisão por urgência + aging de comentários.
- **Linear**: triagem operacional orientada por prioridade (quick scan primeiro, detalhe depois).
- **Asana workload view**: visão de carga por owner para balancear revisão/aprovação.

## Melhorias concretas implementadas

1. **Fila prioritária de operação diária** (`/dashboard/reviews`)
   - Nova tabela "Fila prioritária" com ordenação por score de urgência.
   - Score combina: prioridade do item + comentários abertos + aging + gate + proximidade de prazo.
   - Campos para decisão rápida: owner, prazo, versão, comentários e urgência.

2. **Carga por owner (review queue)** (`/dashboard/reviews`)
   - Novo card com distribuição de carga por responsável.
   - Mostra itens em review, comentários pendentes e itens críticos por pessoa.

3. **Camada analítica de daily ops** (`src/lib/mission-insights.ts`)
   - `buildDailyOpsQueue(data)`
   - `buildReviewerWorkload(queue)`
   - Tipos novos para suportar UX operacional: `DailyOpsQueueRow`, `ReviewerWorkloadRow`.

## Resultado esperado para o time audiovisual

- Menos tempo procurando "qual item mexer agora".
- Priorização clara para leitura/revisão/aprovação.
- Visibilidade de sobrecarga por pessoa, ajudando no balanceamento diário.

## Próximo pivot sugerido (se houver bloqueio)

- Filtro por owner e estágio com query params compartilháveis (`?owner=Ana&stage=review`).
- Atalhos operacionais de ação rápida (abrir preview, abrir thread, ir para tracking do item).
- SLA por owner com tendência semanal (subida/queda de backlog de comentários).
