import Link from "next/link";
import { AlertTriangle, ExternalLink, PlayCircle, Siren, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  buildDailyOpsQueue,
  buildFeedbackLoopRows,
  buildJourneyRows,
  buildReviewCoverageSnapshot,
  buildReviewerWorkload,
  buildReviewSlaRows,
} from "@/lib/mission-insights";
import { getMissionDataset, type PipelineStage } from "@/lib/mission-data";

function fmtTimecode(seconds?: number) {
  if (seconds === undefined) return "—";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatDueInHours(value?: number) {
  if (value === undefined) return "sem prazo";
  if (value < 0) return `${Math.abs(value)}h atrasado`;
  return `${value}h restantes`;
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: { owner?: string; stage?: PipelineStage };
}) {
  const data = await getMissionDataset();
  const ownerFilter = searchParams?.owner;
  const stageFilter = searchParams?.stage;

  const filteredItems = data.items.filter((item) => {
    if (ownerFilter && item.owner !== ownerFilter) return false;
    if (stageFilter && item.stage !== stageFilter) return false;
    return true;
  });

  const filteredItemIds = new Set(filteredItems.map((item) => item.id));
  const filteredAssets = data.assets.filter((asset) => filteredItemIds.has(asset.contentItemId));
  const filteredAssetIds = new Set(filteredAssets.map((asset) => asset.id));

  const filteredData = {
    ...data,
    items: filteredItems,
    assets: filteredAssets,
    comments: data.comments.filter((comment) => filteredAssetIds.has(comment.assetVersionId)),
    publishSlots: data.publishSlots.filter((slot) => filteredItemIds.has(slot.contentItemId)),
    stageEvents: data.stageEvents.filter((event) => filteredItemIds.has(event.contentItemId)),
  };

  const journeyRows = buildJourneyRows(filteredData);
  const slaRows = buildReviewSlaRows(filteredData).sort((a, b) => (b.oldestOpenCommentHours ?? 0) - (a.oldestOpenCommentHours ?? 0));
  const dailyOpsQueue = buildDailyOpsQueue(filteredData);
  const workloadRows = buildReviewerWorkload(dailyOpsQueue);
  const feedbackRows = buildFeedbackLoopRows(filteredData).sort((a, b) => (b.oldestOpenCommentHours ?? 0) - (a.oldestOpenCommentHours ?? 0));
  const reviewCoverage = buildReviewCoverageSnapshot(filteredData);

  const owners = [...new Set(data.items.map((item) => item.owner))].sort();
  const stages: PipelineStage[] = ["ideation", "planning", "production", "review", "publishing"];

  const blockingFeedback = feedbackRows.filter((row) => row.blocking).length;
  const totalOpenComments = feedbackRows.reduce((acc, row) => acc + row.openComments, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Review & Comments</h2>
        <p className="text-sm text-muted-foreground">
          Preview de versões, comentários por timecode e feedback loop por asset para evitar handoffs cegos.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant={!ownerFilter ? "default" : "outline"}>
            <Link href="/dashboard/reviews">owner: todos</Link>
          </Badge>
          {owners.map((owner) => (
            <Badge key={owner} variant={ownerFilter === owner ? "default" : "outline"}>
              <Link href={`/dashboard/reviews?owner=${encodeURIComponent(owner)}${stageFilter ? `&stage=${stageFilter}` : ""}`}>
                owner: {owner}
              </Link>
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant={!stageFilter ? "default" : "outline"}>
            <Link href={ownerFilter ? `/dashboard/reviews?owner=${encodeURIComponent(ownerFilter)}` : "/dashboard/reviews"}>stage: todos</Link>
          </Badge>
          {stages.map((stage) => (
            <Badge key={stage} variant={stageFilter === stage ? "default" : "outline"} className="capitalize">
              <Link href={`/dashboard/reviews?stage=${stage}${ownerFilter ? `&owner=${encodeURIComponent(ownerFilter)}` : ""}`}>
                {stage}
              </Link>
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets em feedback loop</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{feedbackRows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comentários em aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalOpenComments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets bloqueando entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{blockingFeedback}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cobertura de preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{reviewCoverage.assetsWithPreview}/{filteredData.assets.length}</p>
            <p className="text-xs text-muted-foreground">pendentes sem preview: {reviewCoverage.pendingWithoutPreview}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comentários com timecode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{reviewCoverage.commentsWithTimecodeRate}%</p>
            <p className="text-xs text-muted-foreground">média abertos/asset: {reviewCoverage.avgOpenCommentsPerAsset}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Siren className="h-4 w-4" /> Fila prioritária de operação diária
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Comentários</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Urgência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyOpsQueue.slice(0, 6).map((row) => (
                  <TableRow key={row.itemId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{row.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {row.stage} · {row.versionLabel ?? "sem versão"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{row.owner}</TableCell>
                    <TableCell>
                      {row.unresolvedComments} abertos
                      <p className="text-xs text-muted-foreground">{row.oldestOpenCommentHours ?? 0}h em aberto</p>
                    </TableCell>
                    <TableCell>{formatDueInHours(row.dueInHours)}</TableCell>
                    <TableCell>
                      <Badge variant={row.urgency === "critical" ? "destructive" : row.urgency === "attention" ? "outline" : "secondary"}>
                        {row.urgency}
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Carga por owner (review queue)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {workloadRows.map((row) => (
              <div key={row.owner} className="rounded-lg border p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-medium">{row.owner}</p>
                  <Badge variant={row.criticalItems > 0 ? "destructive" : "secondary"}>críticos: {row.criticalItems}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>itens em review: {row.itemsInReview}</span>
                  <span>comentários pendentes: {row.unresolvedComments}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
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
          <CardTitle className="text-base">Visão de feedback por asset</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Aging</TableHead>
                <TableHead>Velocidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbackRows.map((row) => (
                <TableRow key={row.assetVersionId}>
                  <TableCell>{row.itemTitle}</TableCell>
                  <TableCell>{row.versionLabel}</TableCell>
                  <TableCell>{row.participants}</TableCell>
                  <TableCell>
                    <span className="text-sm">{row.openComments} abertos</span>
                    <p className="text-xs text-muted-foreground">{row.resolvedComments} resolvidos</p>
                  </TableCell>
                  <TableCell>{row.oldestOpenCommentHours ?? 0}h</TableCell>
                  <TableCell>
                    <Badge variant={row.feedbackVelocity === "slow" ? "destructive" : row.feedbackVelocity === "moderate" ? "outline" : "secondary"}>
                      {row.feedbackVelocity}
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
          {filteredData.assets.map((asset) => {
            const thread = filteredData.comments.filter((comment) => comment.assetVersionId === asset.id);
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
