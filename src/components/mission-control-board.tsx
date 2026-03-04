"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, List, Plus, SquareKanban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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

const initialTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: "Definir escopo do MVP",
    description: "Mapear funcionalidades essenciais do Mission Control.",
    status: "todo",
  },
  {
    id: crypto.randomUUID(),
    title: "Construir layout base",
    description: "Sidebar clássica com múltiplas páginas no dashboard.",
    status: "doing",
  },
  {
    id: crypto.randomUUID(),
    title: "Criar board de tarefas",
    description: "Implementar views Kanban e Lista para acompanhamento.",
    status: "done",
  },
];

export function MissionControlBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const groupedTasks = useMemo(
    () =>
      statuses.reduce(
        (acc, status) => {
          acc[status] = tasks.filter((task) => task.status === status);
          return acc;
        },
        {} as Record<Status, Task[]>
      ),
    [tasks]
  );

  const createTask = () => {
    if (!title.trim()) return;

    setTasks((prev) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        status: "todo",
      },
      ...prev,
    ]);

    setTitle("");
    setDescription("");
  };

  const moveTask = (id: string, status: Status) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova tarefa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Título da tarefa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={createTask} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Tarefas</h3>
          <p className="text-sm text-muted-foreground">Alterne entre Kanban e Lista.</p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list") }>
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
                    <CardContent className="space-y-3 p-4">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description || "Sem descrição"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statuses.map((nextStatus) => (
                          <Button
                            key={nextStatus}
                            size="sm"
                            variant={nextStatus === task.status ? "default" : "outline"}
                            onClick={() => moveTask(task.id, nextStatus)}
                          >
                            {statusLabel[nextStatus]}
                          </Button>
                        ))}
                      </div>
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
                  <TableHead className="w-[220px]">Ações</TableHead>
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
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {statuses.map((nextStatus) => (
                          <Button
                            key={nextStatus}
                            size="sm"
                            variant={nextStatus === task.status ? "default" : "outline"}
                            onClick={() => moveTask(task.id, nextStatus)}
                          >
                            {statusLabel[nextStatus]}
                          </Button>
                        ))}
                      </div>
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
