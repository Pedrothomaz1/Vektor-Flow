import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface InitiativeComment {
  id: string;
  initiative_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
}

export function useInitiativeComments(initiativeId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const commentsQuery = useQuery({
    queryKey: ["initiative-comments", initiativeId],
    queryFn: async () => {
      if (!initiativeId) return [];
      const { data, error } = await supabase
        .from("initiative_comments" as any)
        .select("*")
        .eq("initiative_id", initiativeId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const rows = (data ?? []) as any[];
      const authorIds = [...new Set(rows.map((c) => c.author_id))];
      const { data: profiles } = authorIds.length > 0
        ? await supabase.from("profiles_public" as any).select("id, full_name, avatar_url").in("id", authorIds)
        : { data: [] as any[] };
      const map = new Map((profiles ?? []).map((p: any) => [p.id, p]));

      return rows.map((c) => ({
        id: c.id,
        initiative_id: c.initiative_id,
        author_id: c.author_id,
        content: c.content,
        created_at: c.created_at,
        author_name: map.get(c.author_id)?.full_name ?? null,
        author_avatar: map.get(c.author_id)?.avatar_url ?? null,
      })) as InitiativeComment[];
    },
    enabled: !!initiativeId,
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Não autenticado");
      if (!initiativeId) throw new Error("Iniciativa inválida");
      const { error } = await supabase
        .from("initiative_comments" as any)
        .insert({ initiative_id: initiativeId, author_id: user.id, content } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["initiative-comments", initiativeId] });
    },
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment,
  };
}