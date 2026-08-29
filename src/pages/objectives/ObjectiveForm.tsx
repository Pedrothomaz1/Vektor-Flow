import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfiles } from "@/hooks/useProfiles";
import { useCycles } from "@/hooks/useCycles";
import type { Objective } from "@/hooks/useObjectives";
import { BUSelectField } from "@/components/common/BUFilter";

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  status: z.string().default("on_track"),
  cycle_id: z.string().min(1, "Período obrigatório"),
  objective_type: z.string().default("quarterly"),
  owner_id: z.string().optional(),
  parent_objective_id: z.string().optional(),
  business_unit_id: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ObjectiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void;
  defaultValues?: Partial<Objective>;
  isPending?: boolean;
  objectives?: Objective[];
  /** Ciclo/período padrão quando criando um novo objetivo */
  cycleId?: string;
}

const statuses = [
  { value: "on_track", label: "No caminho" },
  { value: "at_risk", label: "Em risco" },
  { value: "behind", label: "Atrasado" },
  { value: "completed", label: "Concluído" },
];

export function ObjectiveForm({ open, onOpenChange, onSubmit, defaultValues, isPending, objectives = [], cycleId }: ObjectiveFormProps) {
  const { data: profiles = [] } = useProfiles();
  const { cycles } = useCycles();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      status: defaultValues?.status || "on_track",
      cycle_id: defaultValues?.cycle_id || cycleId || "",
      objective_type: defaultValues?.objective_type || "quarterly",
      owner_id: defaultValues?.owner_id || "",
      parent_objective_id: defaultValues?.parent_objective_id || "",
      business_unit_id: defaultValues?.business_unit_id ?? null,
    },
  });

  // Períodos disponíveis: ciclos anuais com seus trimestres logo abaixo
  const periodOptions = (() => {
    const roots = cycles.filter((c) => !c.parent_cycle_id);
    const out: { id: string; label: string; child: boolean }[] = [];
    for (const root of roots) {
      out.push({ id: root.id, label: root.name, child: false });
      cycles
        .filter((c) => c.parent_cycle_id === root.id)
        .sort((a, b) => a.start_date.localeCompare(b.start_date))
        .forEach((q) => out.push({ id: q.id, label: q.name, child: true }));
    }
    // ciclos órfãos (pai não visível)
    for (const c of cycles) {
      if (c.parent_cycle_id && !roots.some((r) => r.id === c.parent_cycle_id) && !out.some((o) => o.id === c.id)) {
        out.push({ id: c.id, label: c.name, child: false });
      }
    }
    return out;
  })();

  const handlePeriodChange = (id: string) => {
    setValue("cycle_id", id);
    const cycle = cycles.find((c) => c.id === id);
    if (cycle) setValue("objective_type", cycle.period_type || (cycle.parent_cycle_id ? "quarterly" : "annual"));
  };

  const availableParents = objectives.filter((o) => o.id !== defaultValues?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues?.id ? "Editar Objetivo" : "Novo Objetivo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="obj-title">Título</Label>
            <Input id="obj-title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="obj-desc">Descrição</Label>
            <Textarea id="obj-desc" rows={3} {...register("description")} />
          </div>
          <div>
            <Label>Responsável</Label>
            <Select value={watch("owner_id") || "auto"} onValueChange={(v) => setValue("owner_id", v === "auto" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Eu mesmo" /></SelectTrigger>
              <SelectContent position="popper" className="z-[9999]">
                <SelectItem value="auto">Eu mesmo</SelectItem>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name || p.email || "Sem nome"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent position="popper" className="z-[9999]">
                  {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período</Label>
              <Select value={watch("cycle_id") || ""} onValueChange={handlePeriodChange}>
                <SelectTrigger><SelectValue placeholder="Selecione o período" /></SelectTrigger>
                <SelectContent position="popper" className="z-[9999]">
                  {periodOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.child ? `— ${p.label}` : p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cycle_id && <p className="text-xs text-destructive mt-1">{errors.cycle_id.message}</p>}
            </div>
          </div>
          <div>
            <Label>Objetivo Pai</Label>
            <Select
              value={watch("parent_objective_id") || "none"}
              onValueChange={(v) => setValue("parent_objective_id", v === "none" ? "" : v)}
            >
              <SelectTrigger><SelectValue placeholder="Nenhum (raiz)" /></SelectTrigger>
              <SelectContent position="popper" className="z-[9999]">
                <SelectItem value="none">Nenhum (raiz)</SelectItem>
                {availableParents.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Business Unit</Label>
            <BUSelectField
              value={watch("business_unit_id") ?? null}
              onValueChange={(v) => setValue("business_unit_id", v)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{defaultValues?.id ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
