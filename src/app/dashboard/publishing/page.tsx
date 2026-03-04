import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildChannelHealthRows, buildJourneyRows, buildPublishingCalendarRows, buildReleaseControlRows } from "@/lib/mission-insights";
import { getMissionDataset, type Channel, type PipelineStage } from "@/lib/mission-data";

const channels: Channel[] = ["youtube", "instagram", "tiktok"];

export default async function PublishingPage({
  searchParams,
}: {
  searchParams?: { channel?: Channel; stage?: PipelineStage };
}) {
  const data = await getMissionDataset();
  const channelFilter = searchParams?.channel;
  const stageFilter = searchParams?.stage;

  const filteredSlots = channelFilter ? data.publishSlots.filter((slot) => slot.channel === channelFilter) : data.publishSlots;
  const itemIdsWithSlot = new Set(filteredSlots.map((slot) => slot.contentItemId));

  const filteredItems = data.items.filter((item) => {
    if (stageFilter && item.stage !== stageFilter) return false;
    if (channelFilter && !itemIdsWithSlot.has(item.id)) return false;
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
    publishSlots: filteredSlots.filter((slot) => filteredItemIds.has(slot.contentItemId)),
    stageEvents: data.stageEvents.filter((event) => filteredItemIds.has(event.contentItemId)),
  };

  const journeyRows = buildJourneyRows(filteredData);
  const calendarRows = buildPublishingCalendarRows(filteredData);
  const channelHealthRows = buildChannelHealthRows(filteredData);
  const releaseControlRows = buildReleaseControlRows(filteredData);
  const stages: PipelineStage[] = ["ideation", "planning", "production", "review", "publishing"];

  const slotMap = new Map(filteredData.publishSlots.map((slot) => [`${slot.contentItemId}:${slot.channel}`, slot]));

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Publishing Queue</h2>
        <p className="text-sm text-muted-foreground">
          Planejamento editorial read-first com calendário e execução por canal, mantendo gate de aprovação visível.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant={!channelFilter ? "default" : "outline"}>
            <Link href="/dashboard/publishing">canal: todos</Link>
          </Badge>
          {channels.map((channel) => (
            <Badge key={channel} variant={channelFilter === channel ? "default" : "outline"} className="capitalize">
              <Link href={`/dashboard/publishing?channel=${channel}${stageFilter ? `&stage=${stageFilter}` : ""}`}>{channel}</Link>
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant={!stageFilter ? "default" : "outline"}>
            <Link href={channelFilter ? `/dashboard/publishing?channel=${channelFilter}` : "/dashboard/publishing"}>stage: todos</Link>
          </Badge>
          {stages.map((stage) => (
            <Badge key={stage} variant={stageFilter === stage ? "default" : "outline"} className="capitalize">
              <Link href={`/dashboard/publishing?stage=${stage}${channelFilter ? `&channel=${channelFilter}` : ""}`}>{stage}</Link>
            </Badge>
          ))}
        </div>
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
          <CardTitle className="text-base">Controle de release até publicação (YouTube/Instagram/TikTok)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Comentários</TableHead>
                <TableHead>Canais prontos</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Próxima ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releaseControlRows.map((row) => (
                <TableRow key={row.itemId}>
                  <TableCell>{row.title}</TableCell>
                  <TableCell className="capitalize">{row.stage}</TableCell>
                  <TableCell>{row.latestVersionLabel ?? "—"}</TableCell>
                  <TableCell>{row.openComments}</TableCell>
                  <TableCell>
                    {row.channelsReady}/{row.channelsPlanned} (pub: {row.channelsPublished})
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.scheduleConfidence >= 75 ? "default" : row.scheduleConfidence >= 50 ? "outline" : "secondary"}>
                      {row.scheduleConfidence}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.pipelineRisk === "high" ? "destructive" : row.pipelineRisk === "medium" ? "outline" : "secondary"}>
                      {row.pipelineRisk}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.nextAction}</TableCell>
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
