import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMissionDataset } from "@/lib/mission-data";

export default async function PublishingPage() {
  const data = await getMissionDataset();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Publishing Queue</h2>
        <p className="text-sm text-muted-foreground">
          Planejamento de publicação YouTube/Instagram/TikTok com score de checklist de readiness.
        </p>
      </div>

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
