import { Check, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Cycle } from "@/hooks/useCycles";

interface PeriodFilterProps {
  /** Ciclo anual (pai) */
  root?: Cycle;
  /** Trimestres cadastrados para o ciclo anual */
  quarters: Cycle[];
  /** IDs de ciclos selecionados */
  value: string[];
  onValueChange: (ids: string[]) => void;
  className?: string;
}

/** Filtro de períodos com seleção múltipla (ex.: Anual + Q3) */
export function PeriodFilter({ root, quarters, value, onValueChange, className }: PeriodFilterProps) {
  const options = [
    ...(root ? [{ id: root.id, label: `${root.name} (anual)` }] : []),
    ...quarters.map((q) => ({ id: q.id, label: q.name })),
  ];
  const allIds = options.map((o) => o.id);

  const toggle = (id: string) => {
    onValueChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const label =
    value.length === 0
      ? "Nenhum período"
      : value.length === allIds.length
      ? "Todos os períodos"
      : options.filter((o) => value.includes(o.id)).map((o) => o.label).join(", ");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className ?? "h-8 text-xs w-[220px] justify-start"}>
          <CalendarRange className="mr-2 h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2 pointer-events-auto">
        <div className="flex items-center justify-between px-1 pb-2">
          <span className="text-xs font-medium text-muted-foreground">Períodos</span>
          <button
            type="button"
            className="text-2xs text-primary hover:underline"
            onClick={() => onValueChange(value.length === allIds.length ? [] : allIds)}
          >
            {value.length === allIds.length ? "Limpar" : "Todos"}
          </button>
        </div>
        <div className="space-y-1 max-h-64 overflow-auto">
          {options.map((o) => (
            <label
              key={o.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent cursor-pointer"
            >
              <Checkbox checked={value.includes(o.id)} onCheckedChange={() => toggle(o.id)} />
              <span className="truncate">{o.label}</span>
              {value.includes(o.id) && <Check className="ml-auto h-3 w-3 text-primary" />}
            </label>
          ))}
          {options.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted-foreground">Nenhum período cadastrado.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
