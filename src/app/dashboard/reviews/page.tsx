import Link from "next/link";
import { AlertTriangle, ExternalLink, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildJourneyRows, buildReviewSlaRows } from "@/lib/mission-insights";
import { getMissionDataset } from "@/lib/mission-data";

function fmtTimecode(seconds?: number) {
  if (seconds === undefined) return "—";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default async function ReviewsPage() {
  const data = await getMissionDataset();
  const journeyRows = buildJourneyRows(data);
  const slaRows = buildReviewSlaRows(data).sort((a, b) => (b.oldestOpenCommentHours ?? 0) - (a.oldestOpenCommentHours ?? 0));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Review & Comments</h2>
        <p className="text-sm text-muted-foreground">
          Preview de versões, comentários por timecode e aprovação por gate para evitar handoffs cegos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Board de aprovação (preview → review → publish)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {journeyRows.map((row) => (
            <div key={row.itemId} className="rounded-lg border p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-medium">{row.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={row.approvalGate === "ready" ? "default" : row.approvalGate === "needs_review" ? "outline" : "secondary"}>
                    {row.approvalGate}
                  </Badge>
                  <Badge variant="secondary">owner: {row.owner}</Badge>
                </div>
              </div>

              <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>versão: {row.latestVersionLabel ?? "—"}</span>
                <span>status: {row.latestAssetStatus ?? "—"}</span>
                <span>comentários abertos: {row.unresolvedComments}</span>
                <span>
                  canais prontos: {row.approvedChannels}/{row.totalChannels}
                </span>
                {row.latestPreviewUrl && (
                  <Link href={row.latestPreviewUrl} target="_blank" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <PlayCircle className="h-3 w-3" /> preview <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {row.steps.map((step) => (
                  <Badge key={step.stage} variant={step.state === "active" ? "default" : "outline"} className="capitalize">
                    {step.stage}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SLA operacional de review</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Comentários abertos</TableHead>
                <TableHead>Horas em aberto</TableHead>
                <TableHead>Risco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slaRows.map((row) => (
                <TableRow key={row.assetVersionId}>
                  <TableCell>{row.itemTitle}</TableCell>
                  <TableCell>{row.versionLabel}</TableCell>
                  <TableCell>{row.unresolvedComments}</TableCell>
                  <TableCell>{row.oldestOpenCommentHours ?? 0}h</TableCell>
                  <TableCell>
                    <Badge variant={row.risk === "high" ? "destructive" : row.risk === "medium" ? "outline" : "secondary"}>
                      {row.risk === "high" && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {row.risk}
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
