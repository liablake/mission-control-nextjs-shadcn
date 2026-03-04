import { MissionControlBoard } from "@/components/mission-control-board";

export default function TasksPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Mission Control · Tasks</h2>
        <p className="text-sm text-muted-foreground">
          Tracker read-only das tarefas delegadas com visualização em Kanban e Lista.
        </p>
      </div>

      <MissionControlBoard />
    </div>
  );
}
