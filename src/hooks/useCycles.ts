import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Json } from "@/integrations/supabase/types";

export interface Cycle {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string;
  metadata: Json | null;
  locked: boolean;
  created_at: string;
  updated_at: string;
  business_unit_id?: string | null;
  parent_cycle_id?: string | null;
  period_type?: string;
}

/** Divide o intervalo do ciclo anual em até 4 trimestres calendário */
export function computeQuarters(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const result: { label: string; start_date: string; end_date: string }[] = [];

  let cursorYear = start.getFullYear();
  let cursorQuarter = Math.floor(start.getMonth() / 3);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  while (result.length < 8) {
    const qStart = new Date(cursorYear, cursorQuarter * 3, 1);
    const qEnd = new Date(cursorYear, cursorQuarter * 3 + 3, 0);
    if (qStart > end) break;

    const effStart = qStart < start ? start : qStart;
    const effEnd = qEnd > end ? end : qEnd;
    if (effEnd > effStart) {
      result.push({
        label: `Q${cursorQuarter + 1} ${cursorYear}`,
        start_date: fmt(effStart),
        end_date: fmt(effEnd),
      });
    }

    cursorQuarter += 1;
    if (cursorQuarter > 3) {
      cursorQuarter = 0;
      cursorYear += 1;
    }
  }

  return result;
}

export function useCycles() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const cyclesQuery = useQuery({
    queryKey: ["cycles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cycles")
        .select("*")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as Cycle[];
    },
    enabled: Boolean(user?.id),
  });

  const createCycle = useMutation({
    mutationFn: async (cycle: { name: string; description?: string; start_date: string; end_date: string; status?: string; metadata?: Record<string, unknown>; business_unit_id?: string | null; parent_cycle_id?: string | null; period_type?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { metadata, ...rest } = cycle;
      const { data, error } = await supabase
        .from("cycles")
        .insert({ ...rest, created_by: user.id, metadata: metadata as Json })
        .select()
        .single();
      if (error) throw error;
      return data as Cycle;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cycles", user?.id] }),
  });

  const updateCycle = useMutation({
    mutationFn: async ({ id, metadata, ...rest }: { id: string; name?: string; description?: string; start_date?: string; end_date?: string; status?: string; metadata?: Record<string, unknown>; business_unit_id?: string | null; parent_cycle_id?: string | null; period_type?: string }) => {
      const updates = { ...rest, ...(metadata !== undefined ? { metadata: metadata as Json } : {}) };
      const { data, error } = await supabase
        .from("cycles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Cycle;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cycles", user?.id] }),
  });

  const deleteCycle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cycles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cycles", user?.id] }),
  });

  /** Cria os trimestres faltantes de um ciclo anual */
  const createQuarters = useMutation({
    mutationFn: async (parentId: string) => {
      if (!user) throw new Error("Not authenticated");
      const all = cyclesQuery.data ?? [];
      const parent = all.find((c) => c.id === parentId);
      if (!parent) throw new Error("Ciclo não encontrado");

      const existing = all.filter((c) => c.parent_cycle_id === parentId).map((c) => c.name);
      const quarters = computeQuarters(parent.start_date, parent.end_date)
        .filter((q) => !existing.includes(q.label));

      if (quarters.length === 0) return 0;

      const rows = quarters.map((q) => ({
        name: q.label,
        start_date: q.start_date,
        end_date: q.end_date,
        status: parent.status === "active" ? "active" : "draft",
        created_by: user.id,
        business_unit_id: parent.business_unit_id ?? null,
        parent_cycle_id: parentId,
        period_type: "quarterly",
      }));

      const { error } = await supabase.from("cycles").insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cycles", user?.id] }),
  });

  return {
    cycles: cyclesQuery.data ?? [],
    isLoading: cyclesQuery.isLoading,
    error: cyclesQuery.error,
    createCycle,
    updateCycle,
    deleteCycle,
    createQuarters,
  };
}

/** Retorna os trimestres (ciclos filhos) de um ciclo, ordenados por data */
export function useCycleQuarters(cycleId: string | undefined) {
  const { cycles } = useCycles();
  const cycle = cycles.find((c) => c.id === cycleId);
  const rootId = cycle?.parent_cycle_id || cycle?.id;
  const quarters = cycles
    .filter((c) => c.parent_cycle_id === rootId)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  return { root: cycles.find((c) => c.id === rootId), quarters };
}
