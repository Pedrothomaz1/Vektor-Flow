import { Link } from "react-router-dom";
import { Target, ChevronRight } from "lucide-react";
import { ProgressBar } from "@/components/okr/ProgressBar";
import { useObjectiveSiblings } from "@/hooks/useObjectiveSiblings";

const statusLabel: Record<string, string> = {
  on_track: "No caminho",
  at_risk: "Em risco",
  behind: "Atrasado",
  completed: "Concluído",
  draft: "Rascunho",
};

const statusBadge: Record<string, string> = {
  on_track: "badge-success",
  at_risk: "badge-warning",
  behind: "badge-danger",
  completed: "badge-info",
};

interface ChildObjectivesListProps {
  objectiveId: string;
}

/** Lista os objetivos filhos diretos, permitindo descer nível a nível. */
export function ChildObjectivesList({ objectiveId }: ChildObjectivesListProps) {
  const { data: children = [], isLoading } = useObjectiveSiblings(objectiveId);

  if (isLoading || children.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Objetivos filhos</h2>
        <span className="text-xs text-muted-foreground">({children.length})</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {children.map((child) => (
          <Link
            key={child.id}
            to={`/objectives/${child.id}`}
            className="card-elevated p-4 block transition-colors hover:border-primary/50"
          >
            <div className="flex items-start gap-2">
              <div className="shrink-0 rounded-md bg-primary/10 h-7 w-7 flex items-center justify-center">
                <Target className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-snug line-clamp-2">{child.title}</p>
                <span className={`${statusBadge[child.status] || "badge-info"} mt-1 inline-block`}>
                  {statusLabel[child.status] || child.status}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            <div className="mt-3">
              <ProgressBar value={child.progress} status={child.status} showLabel />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
