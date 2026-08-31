import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiblingObjective {
  id: string;
  title: string;
  status: string;
  progress: number;
  cycle_id: string;
}

/**
 * Objetivos que compartilham o mesmo objetivo pai (inclui o próprio).
 * Não filtra por ciclo — irmãos podem estar em trimestres diferentes.
 */
export function useObjectiveSiblings(parentObjectiveId: string | null | undefined) {
  return useQuery({
    queryKey: ["objective-siblings", parentObjectiveId],
    queryFn: async () => {
      if (!parentObjectiveId) return [] as SiblingObjective[];
      const { data, error } = await supabase
        .from("objectives")
        .select("id, title, status, progress, cycle_id")
        .eq("parent_objective_id", parentObjectiveId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SiblingObjective[];
    },
    enabled: !!parentObjectiveId,
  });
}
