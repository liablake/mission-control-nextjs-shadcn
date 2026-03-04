import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMissionDataset, type PipelineStage } from "@/lib/mission-data";

const stages: PipelineStage[] = ["ideation", "planning", "production", "review", "publishing"];

export default async function PipelinePage() {
  const data = await getMissionDataset();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Pipeline</h2>
        <p className="text-sm text-muted-foreground">Visão operacional de fluxo e gargalos por estágio.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {stages.map((stage) => {
          const items = data.items.filter((item) => item.stage === stage);
          return (
            <Card key={stage}>
              <CardHeader>
                <CardTitle className="text-base capitalize">{stage}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-bold">{items.length}</p>
                {items.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-md border p-2 text-xs">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground">Owner: {item.owner}</p>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-muted-foreground">Sem itens neste estágio.</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
