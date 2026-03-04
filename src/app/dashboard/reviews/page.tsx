import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMissionDataset } from "@/lib/mission-data";

function fmtTimecode(seconds?: number) {
  if (seconds === undefined) return "—";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default async function ReviewsPage() {
  const data = await getMissionDataset();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Review & Comments</h2>
        <p className="text-sm text-muted-foreground">Preview de versões, comentários por timecode e status de aprovação.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Versões de assets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Versão</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.versionLabel}</TableCell>
                  <TableCell>{asset.format}</TableCell>
                  <TableCell>{asset.durationSec ? `${Math.round(asset.durationSec / 60)} min` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={asset.status === "approved" ? "default" : "secondary"}>{asset.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comentários recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border p-3 text-sm">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-medium">{comment.author}</p>
                <Badge variant={comment.resolved ? "default" : "outline"}>{comment.resolved ? "resolved" : "open"}</Badge>
              </div>
              <p className="text-muted-foreground">{comment.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">Timecode: {fmtTimecode(comment.timecodeSec)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
