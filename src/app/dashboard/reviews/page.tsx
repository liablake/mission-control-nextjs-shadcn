import Link from "next/link";
import { ExternalLink, PlayCircle } from "lucide-react";

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
        <p className="text-sm text-muted-foreground">
          Preview de versões, comentários por timecode e ciclo de revisão com foco em resolução rápida.
        </p>
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
                <TableHead>Preview</TableHead>
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
                    {asset.previewUrl ? (
                      <Link
                        href={asset.previewUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <PlayCircle className="h-3 w-3" /> abrir <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
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
          <CardTitle className="text-base">Threads de comentários por asset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.assets.map((asset) => {
            const thread = data.comments.filter((comment) => comment.assetVersionId === asset.id);
            const openCount = thread.filter((comment) => !comment.resolved).length;

            return (
              <div key={asset.id} className="rounded-lg border p-3 text-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {asset.versionLabel} · {asset.format}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={openCount === 0 ? "default" : "outline"}>abertos: {openCount}</Badge>
                    <Badge variant="secondary">total: {thread.length}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {thread.length > 0 ? (
                    thread.map((comment) => (
                      <div key={comment.id} className="rounded-md bg-muted/40 p-2">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs font-medium">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">{fmtTimecode(comment.timecodeSec)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{comment.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhum comentário neste asset.</p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
