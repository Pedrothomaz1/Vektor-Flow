import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, CornerDownRight, Target } from "lucide-react";
import { useObjectiveSiblings } from "@/hooks/useObjectiveSiblings";

interface Ancestor {
  id: string;
  title: string;
}

interface ObjectiveContextTreeProps {
  ancestors: Ancestor[];
  current: { id: string; title: string; progress?: number | null };
  cycleName?: string | null;
  cycleId?: string | null;
}

/**
 * Bloco "Onde estou": mostra o caminho completo do ciclo até o objetivo atual
 * e, abaixo, os filhos diretos — cada nível navegável.
 */
export function ObjectiveContextTree({
  ancestors,
  current,
  cycleName,
  cycleId,
}: ObjectiveContextTreeProps) {
  const [open, setOpen] = useState(true);
  const { data: children = [] } = useObjectiveSiblings(current.id);

  return (
    <div className="rounded-xl border border-border bg-muted/20 w-full min-w-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Onde estou
        </span>
        <span className="truncate text-xs text-muted-foreground">
          · {ancestors.length + 1} {ancestors.length + 1 === 1 ? "nível" : "níveis"}
          {children.length > 0 ? ` · ${children.length} filho(s)` : ""}
        </span>
      </button>

      {open && (
        <div className="space-y-1 px-3 pb-3">
          {cycleName && (
            <div className="text-xs text-muted-foreground">
              {cycleId ? (
                <Link to={`/cycles/${cycleId}`} className="hover:text-foreground hover:underline">
                  {cycleName}
                </Link>
              ) : (
                cycleName
              )}
            </div>
          )}

          {ancestors.map((a, i) => (
            <div
              key={a.id}
              className="flex min-w-0 items-start gap-1 text-sm"
              style={{ paddingLeft: `${(i + 1) * 14}px` }}
            >
              <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <Link
                to={`/objectives/${a.id}`}
                className="min-w-0 break-words text-muted-foreground hover:text-foreground hover:underline"
              >
                {a.title}
              </Link>
            </div>
          ))}

          <div
            className="flex min-w-0 items-start gap-1 text-sm"
            style={{ paddingLeft: `${(ancestors.length + 1) * 14}px` }}
          >
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="min-w-0 break-words font-semibold text-foreground">{current.title}</span>
          </div>

          {children.map((c) => (
            <div
              key={c.id}
              className="flex min-w-0 items-start gap-1 text-sm"
              style={{ paddingLeft: `${(ancestors.length + 2) * 14}px` }}
            >
              <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <Link
                to={`/objectives/${c.id}`}
                className="min-w-0 break-words text-muted-foreground hover:text-foreground hover:underline"
              >
                {c.title}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
