import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export interface KRAttachment {
  id: string;
  key_result_id: string;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  content_type: string | null;
  uploaded_by: string;
  created_at: string;
}

function sanitize(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-80);
}

export function useKRAttachments(keyResultId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const attachmentsQuery = useQuery({
    queryKey: ["kr-attachments", keyResultId],
    queryFn: async () => {
      if (!keyResultId) return [];
      const { data, error } = await supabase
        .from("kr_attachments")
        .select("*")
        .eq("key_result_id", keyResultId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as KRAttachment[];
    },
    enabled: !!keyResultId,
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Não autenticado");
      if (!keyResultId) throw new Error("Key Result inválido");
      if (file.size > MAX_ATTACHMENT_SIZE) throw new Error("Arquivo acima de 10MB");

      const path = `${keyResultId}/${crypto.randomUUID()}-${sanitize(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from("kr-attachments")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) throw upErr;

      const { error } = await supabase.from("kr_attachments").insert({
        key_result_id: keyResultId,
        storage_path: path,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type || null,
        uploaded_by: user.id,
      });
      if (error) {
        await supabase.storage.from("kr-attachments").remove([path]);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kr-attachments", keyResultId] });
    },
  });

  const remove = useMutation({
    mutationFn: async (attachment: KRAttachment) => {
      const { error } = await supabase.from("kr_attachments").delete().eq("id", attachment.id);
      if (error) throw error;
      await supabase.storage.from("kr-attachments").remove([attachment.storage_path]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kr-attachments", keyResultId] });
    },
  });

  const getUrl = async (path: string) => {
    const { data, error } = await supabase.storage.from("kr-attachments").createSignedUrl(path, 60);
    if (error) throw error;
    return data.signedUrl;
  };

  return {
    attachments: attachmentsQuery.data ?? [],
    isLoading: attachmentsQuery.isLoading,
    upload,
    remove,
    getUrl,
  };
}