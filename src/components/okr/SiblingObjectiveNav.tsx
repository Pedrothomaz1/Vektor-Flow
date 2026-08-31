import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useObjectiveSiblings } from "@/hooks/useObjectiveSiblings";

interface SiblingObjectiveNavProps {
  parentObjectiveId: string | null | undefined;
  parentTitle?: string | null;
  currentObjectiveId: string;
}

export function SiblingObjectiveNav({
  parentObjectiveId,
  parentTitle,
  currentObjectiveId,
}: SiblingObjectiveNavProps) {
  const navigate = useNavigate();
  const { data: siblings = [] } = useObjectiveSiblings(parentObjectiveId);
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [currentObjectiveId, siblings.length]);

  if (!parentObjectiveId || siblings.length < 2) return null;

  const index = siblings.findIndex((s) => s.id === currentObjectiveId);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!prev}
          onClick={() => prev && navigate(`/objectives/${prev.id}`)}
          aria-label="Objetivo anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="flex items-center gap-2 w-max">
            {siblings.map((s) => {
              const isCurrent = s.id === currentObjectiveId;
              return (
                <Link
                  key={s.id}
                  to={`/objectives/${s.id}`}
                  ref={isCurrent ? activeRef : undefined}
                  className={[
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors max-w-[240px]",
                    isCurrent
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50",
                  ].join(" ")}
                >
                  <span className="truncate">{s.title}</span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {s.progress}%
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!next}
          onClick={() => next && navigate(`/objectives/${next.id}`)}
          aria-label="Próximo objetivo"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <span className="shrink-0 text-[11px] text-muted-foreground pl-1 pr-1">
          {index >= 0 ? `${index + 1} de ${siblings.length}` : `${siblings.length}`}
        </span>
      </div>
      {parentTitle && (
        <p className="mt-1.5 px-1 text-[11px] text-muted-foreground truncate">
          Objetivos de: <span className="text-foreground">{parentTitle}</span>
        </p>
      )}
    </div>
  );
}
