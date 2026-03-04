import { Activity, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMissionDataset } from "@/lib/mission-data";

function formatUtc(value: string) {
  return new Date(value).toLocaleString("pt-BR", { timeZone: "UTC" });
}

export default async function TrackingPage() {
  const data = await getMissionDataset();

  const itemById = new Map(data.items.map((item) => [item.id, item]));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Tracking por etapa</h2>
        <p className="text-sm text-muted-foreground">
          Histórico auditável de transições entre etapas para rastrear lead time e handoffs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" /> Timeline de transições
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.stageEvents.map((event) => {
            const item = itemById.get(event.contentItemId);

            return (
              <div key={event.id} className="rounded-lg border p-3 text-sm">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-medium">{item?.title ?? `Item ${event.contentItemId}`}</p>
                  <Badge variant="outline">{formatUtc(event.changedAt)} UTC</Badge>
                </div>
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{event.fromStage ?? "start"}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="capitalize">{event.toStage}</span>
                  <span>· por {event.actor}</span>
                </div>
                {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
              </div>
            );
          })}
          {data.stageEvents.length === 0 && <p className="text-sm text-muted-foreground">Sem eventos de tracking ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
