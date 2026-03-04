import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildChannelHealthRows, buildJourneyRows, buildPublishingCalendarRows } from "@/lib/mission-insights";
import { getMissionDataset, type Channel } from "@/lib/mission-data";

const channels: Channel[] = ["youtube", "instagram", "tiktok"];

export default async function PublishingPage() {
  const data = await getMissionDataset();
  const journeyRows = buildJourneyRows(data);
  const calendarRows = buildPublishingCalendarRows(data);
  const channelHealthRows = buildChannelHealthRows(data);

  const slotMap = new Map(data.publishSlots.map((slot) => [`${slot.contentItemId}:${slot.channel}`, slot]));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Publishing Queue</h2>
        <p className="text-sm text-muted-foreground">
          Planejamento editorial read-first com calendário e execução por canal, mantendo gate de aprovação visível.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calendário editorial por canal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data (UTC)</TableHead>
                {channels.map((channel) => (
                  <TableHead key={channel} className="capitalize">
                    {channel}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {calendarRows.map((row) => (
                <TableRow key={row.dateKey}>
                  <TableCell>{row.dateLabel}</TableCell>
                  {channels.map((channel) => {
                    const value = row.channels[channel];
                    return (
                      <TableCell key={channel}>
                        {value.total === 0 ? (
                          <Badge variant="outline">sem slots</Badge>
                        ) : (
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">slots: {value.total}</Badge>
                              <Badge variant="outline">ready: {value.scheduled + value.published}</Badge>
                            </div>
                            <p className="text-muted-foreground">checklist médio: {value.avgChecklist}%</p>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
          <CardTitle className="text-base">Saúde de publicação por canal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead>Readiness</TableHead>
                <TableHead>Publicados</TableHead>
                <TableHead>Checklist médio</TableHead>
                <TableHead>Atrasos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelHealthRows.map((row) => (
                <TableRow key={row.channel}>
                  <TableCell className="capitalize">{row.channel}</TableCell>
                  <TableCell>{row.totalSlots}</TableCell>
                  <TableCell>
                    <Badge variant={row.readyRate >= 70 ? "default" : row.readyRate >= 40 ? "outline" : "secondary"}>{row.readyRate}%</Badge>
                  </TableCell>
                  <TableCell>{row.published}</TableCell>
                  <TableCell>{row.avgChecklist}%</TableCell>
                  <TableCell>
                    <Badge variant={row.missedSlots > 0 ? "destructive" : "secondary"}>{row.missedSlots}</Badge>
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
