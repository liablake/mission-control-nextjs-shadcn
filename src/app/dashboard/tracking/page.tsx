import { Activity, ArrowRight, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildStageCycleHours } from "@/lib/mission-insights";
import { getMissionDataset } from "@/lib/mission-data";

function formatUtc(value: string) {
  return new Date(value).toLocaleString("pt-BR", { timeZone: "UTC" });
}

export default async function TrackingPage() {
  const data = await getMissionDataset();
  const cycleRows = buildStageCycleHours(data).sort((a, b) => b.cycleHours - a.cycleHours);

  const avgCycleHours = cycleRows.length
    ? Math.round(cycleRows.reduce((acc, row) => acc + row.cycleHours, 0) / cycleRows.length)
    : 0;

  const itemById = new Map(data.items.map((item) => [item.id, item]));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Tracking por etapa</h2>
        <p className="text-sm text-muted-foreground">
          Histórico auditável de transições com lead time para dar visibilidade operacional do fluxo ponta-a-ponta.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Itens rastreados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cycleRows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead time médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgCycleHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transições totais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.stageEvents.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4" /> Lead time por item
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Estágio atual</TableHead>
                <TableHead>Transições</TableHead>
                <TableHead>Ciclo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycleRows.map((row) => (
                <TableRow key={row.itemId}>
                  <TableCell>{row.title}</TableCell>
                  <TableCell className="capitalize">{row.currentStage}</TableCell>
                  <TableCell>{row.transitions}</TableCell>
                  <TableCell>
                    <Badge variant={row.cycleHours > 48 ? "destructive" : "outline"}>{row.cycleHours}h</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
