import { useState } from "react";
import { Link } from "react-router-dom";
import { Target, ChevronRight, ChevronDown, ExternalLink, Key } from "lucide-react";
import { ProgressBar } from "@/components/okr/ProgressBar";
import { useObjectiveSiblings } from "@/hooks/useObjectiveSiblings";
import { useKeyResults } from "@/hooks/useKeyResults";

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

function ChildKeyResults({ objectiveId }: { objectiveId: string }) {
  const { keyResults, isLoading } = useKeyResults(objectiveId);

  if (isLoading) return <p className="text-xs text-muted-foreground">Carregando Key Results...</p>;
  if (keyResults.length === 0)
    return <p className="text-xs text-muted-foreground">Nenhum Key Result cadastrado.</p>;

  return (
    <div className="space-y-2">
      {keyResults.map((kr) => (
        <div key={kr.id} className="rounded-[calc(var(--radius)-8px)] border border-border bg-background p-3">
          <div className="flex items-start gap-2">
            <Key className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug break-words">{kr.title}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">
                {kr.current_value} / {kr.target_value} {kr.unit || ""} · {kr.owner_name}
              </p>
              <div className="mt-2">
                <ProgressBar
                  value={
                    kr.target_value !== kr.start_value
                      ? Math.round(((kr.current_value - kr.start_value) / (kr.target_value - kr.start_value)) * 100)
                      : 0
                  }
                  status={kr.status}
                  showLabel
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ChildObjectivesListProps {
  objectiveId: string;
}

/** Lista os objetivos filhos diretos; ao clicar, expande os Key Results na mesma tela. */
export function ChildObjectivesList({ objectiveId }: ChildObjectivesListProps) {
  const { data: children = [], isLoading } = useObjectiveSiblings(objectiveId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading || children.length === 0) return null;

  return (
    <div className="space-y-3 w-full min-w-0">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Objetivos filhos</h2>
        <span className="text-xs text-muted-foreground">({children.length})</span>
      </div>

      <div className="space-y-3">
        {children.map((child) => {
          const open = expandedId === child.id;
          return (
            <div key={child.id} className="card-elevated p-4 w-full min-w-0">
              <button
                type="button"
                onClick={() => setExpandedId(open ? null : child.id)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <div className="shrink-0 rounded-md bg-primary/10 h-7 w-7 flex items-center justify-center">
                    <Target className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium leading-snug break-words">{child.title}</p>
                    <span className={`${statusBadge[child.status] || "badge-info"} mt-1 inline-block`}>
                      {statusLabel[child.status] || child.status}
                    </span>
                  </div>
                  {open ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  )}
                </div>
                <div className="mt-3">
                  <ProgressBar value={child.progress} status={child.status} showLabel />
                </div>
              </button>

              {open && (
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  <ChildKeyResults objectiveId={child.id} />
                  <Link
                    to={`/objectives/${child.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> Abrir objetivo
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
