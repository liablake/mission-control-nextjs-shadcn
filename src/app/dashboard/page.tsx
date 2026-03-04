import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, MessageSquareQuote, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMissionDataset } from "@/lib/mission-data";

export default async function DashboardPage() {
  const data = await getMissionDataset();

  const overdueReviews = data.assets.filter((a) => a.status === "changes_requested").length;
  const unresolvedComments = data.comments.filter((c) => !c.resolved).length;
  const readyToPublish = data.publishSlots.filter((s) => s.status === "scheduled").length;
  const avgChecklist =
    data.publishSlots.length > 0
      ? Math.round(data.publishSlots.reduce((acc, s) => acc + s.checklistScore, 0) / data.publishSlots.length)
      : 0;

  const stageCounts = {
    ideation: data.items.filter((i) => i.stage === "ideation").length,
    planning: data.items.filter((i) => i.stage === "planning").length,
    production: data.items.filter((i) => i.stage === "production").length,
    review: data.items.filter((i) => i.stage === "review").length,
    publishing: data.items.filter((i) => i.stage === "publishing").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Mission Control</h2>
        <p className="text-sm text-muted-foreground">
          Operação read-heavy do pipeline audiovisual: ideação → planejamento → produção → revisão → publicação.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric title="Itens no pipeline" value={String(data.items.length)} icon={Video} />
        <Metric title="Assets em revisão" value={String(data.assets.length)} icon={Clock3} />
        <Metric title="Comentários pendentes" value={String(unresolvedComments)} icon={MessageSquareQuote} />
        <Metric title="Prontos para publicar" value={String(readyToPublish)} icon={CheckCircle2} />
        <Metric title="Checklist médio" value={`${avgChecklist}%`} icon={CalendarClock} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por estágio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {Object.entries(stageCounts).map(([stage, count]) => {
              const pct = data.items.length ? Math.round((count / data.items.length) * 100) : 0;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{stage}</span>
                    <span className="text-muted-foreground">{count} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" /> Alertas operacionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="outline">Changes requested: {overdueReviews}</Badge>
            <Badge variant="outline">Comentários não resolvidos: {unresolvedComments}</Badge>
            <Badge variant="outline">Slots em rascunho: {data.publishSlots.filter((s) => s.status === "draft").length}</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
