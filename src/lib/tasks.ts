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

export const tasks: Task[] = [];
