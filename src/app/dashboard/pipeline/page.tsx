import { AlertTriangle, GaugeCircle, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMissionDataset, type PipelineStage } from "@/lib/mission-data";

const stages: PipelineStage[] = ["ideation", "planning", "production", "review", "publishing"];
const wipLimit: Record<PipelineStage, number> = {
  ideation: 8,
  planning: 6,
  production: 4,
  review: 3,
  publishing: 5,
};

function stageLabel(stage: PipelineStage) {
  return stage === "review" ? "review/qa" : stage;
}

export default async function PipelinePage() {
  const data = await getMissionDataset();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Pipeline</h2>
        <p className="text-sm text-muted-foreground">
          Visão operacional de fluxo, WIP por etapa e gargalos inspirada em Linear/Frame.io (foco em leitura rápida).
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {stages.map((stage) => {
          const items = data.items.filter((item) => item.stage === stage);
          const aboveLimit = items.length > wipLimit[stage];

          return (
            <Card key={stage}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base capitalize">{stageLabel(stage)}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GaugeCircle className="h-3 w-3" /> WIP {items.length}/{wipLimit[stage]}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-bold">{items.length}</p>
                {aboveLimit && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" /> Gargalo
                  </Badge>
                )}
                {items.slice(0, 5).map((item) => {
                  const ageHours = Math.round((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60));

                  return (
                    <div key={item.id} className="rounded-md border p-2 text-xs">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-muted-foreground">Owner: {item.owner}</p>
                      <div className="mt-1 flex items-center justify-between text-muted-foreground">
                        <span className="capitalize">{item.priority}</span>
                        <span className="inline-flex items-center gap-1">
                          <Timer className="h-3 w-3" /> {ageHours}h
                        </span>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && <p className="text-xs text-muted-foreground">Sem itens neste estágio.</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
