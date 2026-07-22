import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useInitiativeComments } from "@/hooks/useInitiativeComments";

interface Props {
  initiativeId: string;
}

export default function InitiativeTimeline({ initiativeId }: Props) {
  const { comments, isLoading, addComment } = useInitiativeComments(initiativeId);
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    const value = content.trim();
    if (!value) return;
    try {
      await addComment.mutateAsync(value);
      setContent("");
    } catch (err: any) {
      toast({ title: "Erro ao comentar", description: err.message, variant: "destructive" });
    }
  };

  const initials = (name: string | null) =>
    (name ?? "?")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva um comentário..."
          rows={3}
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || addComment.isPending}
          >
            {addComment.isPending ? "Enviando..." : "Comentar"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Carregando...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nenhum comentário ainda.</p>
      ) : (
        <ol className="relative border-l border-border pl-6 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="relative">
              <span className="absolute -left-[34px] top-0">
                <Avatar className="h-7 w-7 ring-2 ring-background">
                  {c.author_avatar && <AvatarImage src={c.author_avatar} alt={c.author_name ?? ""} />}
                  <AvatarFallback className="text-xs">{initials(c.author_name)}</AvatarFallback>
                </Avatar>
              </span>
              <div className="rounded-[var(--radius)] border bg-card p-3">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-sm font-medium">{c.author_name ?? "Usuário"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{c.content}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}