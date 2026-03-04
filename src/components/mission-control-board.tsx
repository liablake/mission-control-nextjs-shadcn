"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, List, SquareKanban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statuses = ["todo", "doing", "done"] as const;
type Status = (typeof statuses)[number];

type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
};

const statusLabel: Record<Status, string> = {
  todo: "Todo",
  doing: "Doing",
  done: "Done",
};

const tasks: Task[] = [
  {
    id: "1",
    title: "Definir escopo do MVP",
    description: "Mapear funcionalidades essenciais do Mission Control.",
    status: "todo",
  },
  {
    id: "2",
    title: "Construir layout base",
    description: "Sidebar clássica com múltiplas páginas no dashboard.",
    status: "doing",
  },
  {
    id: "3",
    title: "Criar board de tarefas",
    description: "Implementar views Kanban e Lista para acompanhamento.",
    status: "done",
  },
];

export function MissionControlBoard() {
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const groupedTasks = useMemo(
    () =>
      statuses.reduce(
        (acc, status) => {
          acc[status] = tasks.filter((task) => task.status === status);
          return acc;
        },
        {} as Record<Status, Task[]>
      ),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Tracker de tarefas (read-only)</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhamento das tarefas delegadas para o Shark.
          </p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")}>
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <SquareKanban className="h-4 w-4" /> Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" /> Lista
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "kanban" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {statuses.map((status) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {statusLabel[status]}
                  <Badge variant="secondary">{groupedTasks[status].length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedTasks[status].map((task) => (
                  <Card key={task.id} className="border-dashed">
                    <CardContent className="space-y-2 p-4">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.description || "Sem descrição"}</p>
                    </CardContent>
                  </Card>
                ))}
                {groupedTasks[status].length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa nesta coluna.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.description || "Sem descrição"}</TableCell>
                    <TableCell>
                      <Badge variant={task.status === "done" ? "default" : "secondary"} className="gap-1">
                        {task.status === "done" && <CheckCircle2 className="h-3 w-3" />}
                        {statusLabel[task.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
