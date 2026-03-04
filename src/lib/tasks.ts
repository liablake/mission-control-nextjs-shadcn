export type Status = "todo" | "doing" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  createdAt: string;
  dueAt?: string;
  completedAt?: string;
};

export const statusLabel: Record<Status, string> = {
  todo: "Todo",
  doing: "Doing",
  done: "Done",
};

export const tasks: Task[] = [
  {
    id: "1",
    title: "Definir escopo do MVP",
    description: "Mapear funcionalidades essenciais do Mission Control.",
    status: "done",
    createdAt: "2026-02-01",
    dueAt: "2026-02-04",
    completedAt: "2026-02-03",
  },
  {
    id: "2",
    title: "Construir layout base",
    description: "Sidebar clássica com múltiplas páginas no dashboard.",
    status: "done",
    createdAt: "2026-02-03",
    dueAt: "2026-02-08",
    completedAt: "2026-02-07",
  },
  {
    id: "3",
    title: "Criar board de tarefas",
    description: "Implementar views Kanban e Lista para acompanhamento.",
    status: "done",
    createdAt: "2026-02-07",
    dueAt: "2026-02-10",
    completedAt: "2026-02-10",
  },
  {
    id: "4",
    title: "Adicionar dark mode",
    description: "Implementar toggle de tema claro/escuro na sidebar.",
    status: "done",
    createdAt: "2026-02-11",
    dueAt: "2026-02-13",
    completedAt: "2026-02-12",
  },
  {
    id: "5",
    title: "Transformar board em read-only",
    description: "Remover criação/edição e deixar foco em tracking.",
    status: "done",
    createdAt: "2026-02-13",
    dueAt: "2026-02-15",
    completedAt: "2026-02-15",
  },
  {
    id: "6",
    title: "Definir padrão de nomenclatura",
    description: "Padronizar nomes de tarefas para relatórios.",
    status: "doing",
    createdAt: "2026-02-16",
    dueAt: "2026-03-05",
  },
  {
    id: "7",
    title: "Mapear integrações futuras",
    description: "Levantar integrações de CI/CD e notificações.",
    status: "doing",
    createdAt: "2026-02-18",
    dueAt: "2026-03-08",
  },
  {
    id: "8",
    title: "Definir modelo de priorização",
    description: "Criar critérios para classificar backlog.",
    status: "todo",
    createdAt: "2026-02-20",
    dueAt: "2026-03-12",
  },
  {
    id: "9",
    title: "Documentar fluxo de delegação",
    description: "Escrever guideline de delegação de tarefas ao Shark.",
    status: "todo",
    createdAt: "2026-02-24",
    dueAt: "2026-03-14",
  },
  {
    id: "10",
    title: "Criar rotina semanal de revisão",
    description: "Checklist para revisão semanal de progresso.",
    status: "doing",
    createdAt: "2026-02-25",
    dueAt: "2026-03-10",
  },
  {
    id: "11",
    title: "Definir SLA de entrega",
    description: "Estabelecer prazo padrão por tipo de tarefa.",
    status: "todo",
    createdAt: "2026-02-27",
    dueAt: "2026-03-18",
  },
  {
    id: "12",
    title: "Revisar qualidade dos cards",
    description: "Garantir título e descrição claros para execução.",
    status: "doing",
    createdAt: "2026-03-01",
    dueAt: "2026-03-16",
  },
];
