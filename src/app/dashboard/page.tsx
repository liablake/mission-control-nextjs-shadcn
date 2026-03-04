import { AlertTriangle, CheckCircle2, Clock3, ListChecks, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabel, tasks } from "@/lib/tasks";

const MS_DAY = 1000 * 60 * 60 * 24;

function diffDays(from: Date, to: Date) {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / MS_DAY));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function DashboardPage() {
  const now = startOfDay(new Date());

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const doing = tasks.filter((t) => t.status === "doing").length;
  const todo = tasks.filter((t) => t.status === "todo").length;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const overdue = tasks.filter((t) => {
    if (!t.dueAt || t.status === "done") return false;
    return startOfDay(new Date(t.dueAt)).getTime() < now.getTime();
  }).length;

  const cycleTimes = tasks
    .filter((t) => t.completedAt)
    .map((t) => diffDays(startOfDay(new Date(t.createdAt)), startOfDay(new Date(t.completedAt!))));

  const avgCycleTime =
    cycleTimes.length > 0
      ? Math.round((cycleTimes.reduce((acc, days) => acc + days, 0) / cycleTimes.length) * 10) / 10
      : 0;

  const weeklyThroughput = [
    { label: "W-3", count: 0 },
    { label: "W-2", count: 0 },
    { label: "W-1", count: 0 },
    { label: "Atual", count: 0 },
  ];

  for (const task of tasks) {
    if (!task.completedAt) continue;
    const daysAgo = diffDays(startOfDay(new Date(task.completedAt)), now);
    const weekIndex = Math.floor(daysAgo / 7);
    if (weekIndex >= 0 && weekIndex < 4) {
      const slot = 3 - weekIndex;
      weeklyThroughput[slot].count += 1;
    }
  }

  const maxThroughput = Math.max(...weeklyThroughput.map((w) => w.count), 1);

  const statusData = [
    { key: "todo", value: todo },
    { key: "doing", value: doing },
    { key: "done", value: done },
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Mission Control</h2>
        <p className="text-sm text-muted-foreground">
          Métricas operacionais válidas com base no board read-only de tarefas delegadas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4" /> Total de tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4" /> Em andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{doing}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4" /> Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{done}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taxa de conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">done / total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" /> Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overdue}</p>
            <p className="text-xs text-muted-foreground">todo + doing com due date vencida</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusData.map((item) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{statusLabel[item.key]}</span>
                    <span className="text-muted-foreground">
                      {item.value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                      aria-label={`${statusLabel[item.key]} ${pct}%`}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Throughput (últimas 4 semanas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-4">
              {weeklyThroughput.map((week) => {
                const h = Math.max(10, Math.round((week.count / maxThroughput) * 100));
                return (
                  <div key={week.label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-md bg-primary/80"
                      style={{ height: `${h}%` }}
                      title={`${week.count} tarefas concluídas`}
                    />
                    <div className="text-xs text-muted-foreground">{week.label}</div>
                    <Badge variant="secondary">{week.count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4" /> Eficiência de entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="outline">Lead time médio: {avgCycleTime} dias</Badge>
          <Badge variant="outline">Backlog aberto: {todo + doing}</Badge>
          <Badge variant="outline">Tarefas todo: {todo}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
