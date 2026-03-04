# Sprint 2 — Benchmarks de UX/workflow (read-heavy audiovisual)

Data: 2026-03-04

## Concorrentes / referências analisadas

1. **Frame.io**
   - Força: revisão com comentário ancorado em timecode + preview central.
   - Padrão útil aplicado: thread por versão com sinalização de comentários abertos.

2. **Wipster**
   - Força: fluxo de aprovação explícito (pending / changes requested / approved).
   - Padrão útil aplicado: status visual de revisão por asset + agregação de pendências.

3. **Asana + Timeline/Kanban para produção de conteúdo**
   - Força: clareza de etapa com limites de WIP e gargalos visíveis.
   - Padrão útil aplicado: cartões por etapa com WIP atual vs limite.

4. **Linear (issue tracking)**
   - Força: leitura rápida, baixa fricção visual, histórico auditável por evento.
   - Padrão útil aplicado: timeline de transições por item (tracking por etapa).

5. **YouTube Studio / Meta Business Suite (publishing)**
   - Força: checklist de readiness antes de publicar.
   - Padrão útil aplicado: score de checklist no queue de publicação.

## Decisões de produto implementadas no Sprint 2

- **Tracking por etapa**: novo módulo `/dashboard/tracking` com timeline de eventos `from_stage -> to_stage`.
- **Review mais operacional**:
  - preview URL por versão;
  - threads de comentário por asset;
  - destaque de comentários abertos por versão.
- **Pipeline com controles de fluxo**:
  - WIP limit por etapa;
  - badge de gargalo quando acima do limite.
- **Dashboard com auditabilidade**:
  - card de qualidade de dados com checks de integridade;
  - indicação da fonte de dados (`supabase` ou `sample`) e timestamp de atualização.

## Próximos experimentos sugeridos

- Lead time médio por etapa (P50/P90) com base em `pipeline_stage_events`.
- SLA de revisão (tempo entre upload e aprovação).
- Filtro por owner/projeto com URLs compartilháveis.
- Segmentação de métricas por canal (YouTube vs Reels vs TikTok).
