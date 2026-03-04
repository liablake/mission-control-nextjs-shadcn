import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildJourneyRows } from "@/lib/mission-insights";
import { getMissionDataset, type Channel } from "@/lib/mission-data";

const channels: Channel[] = ["youtube", "instagram", "tiktok"];

export default async function PublishingPage() {
  const data = await getMissionDataset();
  const journeyRows = buildJourneyRows(data);

  const slotMap = new Map(data.publishSlots.map((slot) => [`${slot.contentItemId}:${slot.channel}`, slot]));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Publishing Queue</h2>
        <p className="text-sm text-muted-foreground">
          Planejamento multi-plataforma com gate de aprovação e visibilidade de readiness por canal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matriz operacional por conteúdo × canal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conteúdo</TableHead>
                {channels.map((channel) => (
                  <TableHead key={channel} className="capitalize">
                    {channel}
                  </TableHead>
                ))}
                <TableHead>Gate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journeyRows.map((row) => (
                <TableRow key={row.itemId}>
                  <TableCell>{row.title}</TableCell>
                  {channels.map((channel) => {
                    const slot = slotMap.get(`${row.itemId}:${channel}`);
                    if (!slot) {
                      return (
                        <TableCell key={channel}>
                          <Badge variant="outline">não planejado</Badge>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={channel}>
                        <div className="space-y-1 text-xs">
                          <Badge variant={slot.status === "published" ? "default" : "secondary"}>{slot.status}</Badge>
                          <p className="text-muted-foreground">checklist: {slot.checklistScore}%</p>
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <Badge variant={row.approvalGate === "ready" ? "default" : row.approvalGate === "needs_review" ? "outline" : "secondary"}>
                      {row.approvalGate}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fila por canal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal</TableHead>
                <TableHead>Agendamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Checklist</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.publishSlots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="capitalize">{slot.channel}</TableCell>
                  <TableCell>{new Date(slot.scheduledFor).toLocaleString("pt-BR", { timeZone: "UTC" })} UTC</TableCell>
                  <TableCell>
                    <Badge variant={slot.status === "published" ? "default" : "secondary"}>{slot.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${slot.checklistScore}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{slot.checklistScore}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
