import { useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Paperclip, Download, Trash2, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useKRAttachments, MAX_ATTACHMENT_SIZE, type KRAttachment } from "@/hooks/useKRAttachments";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface KRAttachmentsProps {
  keyResultId: string;
  canEdit?: boolean;
}

export function KRAttachments({ keyResultId, canEdit = false }: KRAttachmentsProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const { attachments, isLoading, upload, remove, getUrl } = useKRAttachments(keyResultId);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast({ title: "Arquivo muito grande", description: "O limite é de 10MB por arquivo.", variant: "destructive" });
      return;
    }
    upload.mutate(file, {
      onSuccess: () => toast({ title: "Anexo enviado" }),
      onError: (e: any) => toast({ title: "Erro ao enviar anexo", description: e?.message, variant: "destructive" }),
    });
  };

  const handleOpen = async (att: KRAttachment) => {
    try {
      const url = await getUrl(att.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({ title: "Erro ao abrir anexo", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="pt-3 space-y-3">
      {canEdit && (
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {upload.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5 mr-1.5" />}
            Anexar arquivo
          </Button>
          <p className="text-[11px] text-muted-foreground mt-1">Máximo de 10MB por arquivo.</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando anexos...</p>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum anexo.</p>
      ) : (
        <ul className="space-y-1.5">
          {attachments.map((att) => {
            const isImage = (att.content_type || "").startsWith("image/");
            const Icon = isImage ? ImageIcon : FileText;
            return (
              <li key={att.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-2">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => handleOpen(att)}
                  className="flex-1 min-w-0 text-left"
                >
                  <span className="block text-xs font-medium truncate hover:underline">{att.file_name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {formatSize(att.file_size)}
                    {att.file_size ? " · " : ""}
                    {format(new Date(att.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </button>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleOpen(att)}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {canEdit && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir anexo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir "{att.file_name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() =>
                            remove.mutate(att, {
                              onSuccess: () => toast({ title: "Anexo excluído" }),
                              onError: (e: any) => toast({ title: "Erro ao excluir", description: e?.message, variant: "destructive" }),
                            })
                          }
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}