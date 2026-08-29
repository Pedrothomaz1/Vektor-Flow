import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Lock, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCycles, useCycleQuarters } from "@/hooks/useCycles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useOKRTree } from "@/hooks/useOKRTree";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ObjectivesList } from "@/pages/objectives/ObjectivesList";
import { OKROrgChart } from "@/components/okr/OKROrgChart";
import { CycleApprovalCard } from "@/components/cycles/CycleApprovalCard";
import { ExportReportDialog } from "@/components/reports/ExportReportDialog";

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  closed: "Encerrado",
  archived: "Arquivado",
  pending_approval: "Aguardando Aprovação",
};

const statusBadge = (status: string) => {
  switch (status) {
    case "active": return "badge-success";
    case "draft": return "badge-info";
    case "closed": return "badge-warning";
    case "archived": return "badge-destructive";
    case "pending_approval": return "badge-warning";
    default: return "badge-info";
  }
};

export default function CycleDetail() {
  const { id } = useParams<{ id: string }>();
  const { cycles, isLoading, createQuarters } = useCycles();
  const { toast } = useToast();
  const cycle = cycles.find((c) => c.id === id);
  const { root, quarters } = useCycleQuarters(id);
  const [period, setPeriod] = useState<string>("all");

  // "all" = ciclo anual + todos os trimestres; caso contrário, apenas o período escolhido
  const treeCycleIds =
    period === "all"
      ? [root?.id, ...quarters.map((q) => q.id)].filter(Boolean) as string[]
      : [period];

  const { data: tree, isLoading: treeLoading } = useOKRTree(treeCycleIds);

  const handleCreateQuarters = async () => {
    if (!root) return;
    try {
      const created = await createQuarters.mutateAsync(root.id);
      toast({ title: created ? `${created} trimestre(s) criado(s)` : "Trimestres já existentes" });
    } catch (e: any) {
      toast({ title: "Erro ao gerar trimestres", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  if (!cycle) {
    return (
      <div className="space-y-4">
        <Link to="/cycles"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button></Link>
        <p className="text-muted-foreground">Ciclo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/cycles"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{cycle.name}</h1>
            {cycle.locked && <Lock className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={statusBadge(cycle.status)}>{statusLabel[cycle.status] || cycle.status}</span>
            {cycle.locked && (
              <span className="text-xs text-muted-foreground">Ciclo travado</span>
            )}
          </div>
        </div>
        <ExportReportDialog cycleId={cycle.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base">Detalhes</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{cycle.description || "Sem descrição"}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(cycle.start_date), "dd MMM yyyy", { locale: ptBR })} — {format(new Date(cycle.end_date), "dd MMM yyyy", { locale: ptBR })}
            </div>
          </CardContent>
        </Card>

        <CycleApprovalCard cycleId={cycle.id} cycleStatus={cycle.status} />
      </div>

      {/* Org chart tree view */}
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Árvore de OKRs</CardTitle>
          {quarters.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleCreateQuarters} disabled={createQuarters.isPending}>
              <CalendarRange className="mr-2 h-4 w-4" /> Gerar trimestres
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {treeLoading ? (
            <p className="text-sm text-muted-foreground">Carregando árvore...</p>
          ) : (
            <OKROrgChart
              tree={tree || []}
              extraFilters={
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="h-8 text-xs w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Ano completo</SelectItem>
                    {root && <SelectItem value={root.id}>Somente anual</SelectItem>}
                    {quarters.map((q) => (
                      <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
          )}
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-base">OKRs Vinculados</CardTitle></CardHeader>
        <CardContent>
          <ObjectivesList cycleId={cycle.id} />
        </CardContent>
      </Card>
    </div>
  );
}
