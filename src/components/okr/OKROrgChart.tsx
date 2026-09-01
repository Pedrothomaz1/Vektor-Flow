import { useState, useCallback, useMemo, useRef, useEffect, type RefObject, type ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Target, Key, ChevronDown, ChevronRight, Search, Network, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/okr/ProgressBar";
import { BUFilter } from "@/components/common/BUFilter";
import { useBusinessUnits } from "@/hooks/useBusinessUnits";
import type { TreeNode } from "@/hooks/useOKRTree";

const statusLabel: Record<string, string> = {
  on_track: "No caminho",
  at_risk: "Em risco",
  behind: "Atrasado",
  completed: "Concluído",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  on_track: "default",
  at_risk: "secondary",
  behind: "destructive",
  completed: "outline",
};

const typeLabel: Record<string, string> = {
  annual: "Anual",
  quarterly: "Trimestral",
  monthly: "Mensal",
};

const typeBorderColor: Record<string, string> = {
  annual: "border-l-primary",
  quarterly: "border-l-[hsl(var(--info))]",
  monthly: "border-l-[hsl(var(--warning))]",
};

const typeAccentBg: Record<string, string> = {
  annual: "bg-primary/5",
  quarterly: "bg-[hsl(var(--info)/0.05)]",
  monthly: "bg-[hsl(var(--warning)/0.05)]",
};

function nodeMatchesSearch(node: TreeNode, query: string): boolean {
  const q = query.toLowerCase();
  if (node.objective.title.toLowerCase().includes(q)) return true;
  if (node.objective.owner_name?.toLowerCase().includes(q)) return true;
  if (node.keyResults.some((kr) => kr.title.toLowerCase().includes(q))) return true;
  return node.children.some((child) => nodeMatchesSearch(child, q));
}

function directMatch(node: TreeNode, query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase();
  return (
    node.objective.title.toLowerCase().includes(q) ||
    (node.objective.owner_name?.toLowerCase().includes(q) ?? false)
  );
}

/* ─── Objective Card ─── */
function ObjectiveCard({
  node,
  depth,
  highlighted,
}: {
  node: TreeNode;
  depth: number;
  highlighted?: boolean;
}) {
  const obj = node.objective;
  const isRoot = depth === 0;

  return (
    <Link
      to={`/objectives/${obj.id}`}
      className={[
        "block rounded-lg border-l-4 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/60",
        typeBorderColor[obj.objective_type] || "border-l-primary",
        typeAccentBg[obj.objective_type] || "",
        isRoot ? "w-[196px] p-2.5" : "w-[164px] p-2",
        highlighted ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-1.5 mb-1">
        <div className={`shrink-0 rounded bg-primary/10 flex items-center justify-center ${isRoot ? "h-6 w-6" : "h-5 w-5"}`}>
          <Target className={`text-primary ${isRoot ? "h-3.5 w-3.5" : "h-3 w-3"}`} />
        </div>
        <span className={`font-bold leading-snug line-clamp-3 flex-1 ${isRoot ? "text-xs" : "text-[11px]"}`}>
          {obj.title}
        </span>
      </div>

      {obj.objective_type && (
        <div className="mb-1 ml-0.5">
          <Badge
            variant="outline"
            className={`text-[8px] px-1 py-0 h-4 ${obj.objective_type === "annual" ? "border-primary/60 text-primary font-bold" : "border-border"}`}
          >
            {typeLabel[obj.objective_type] || obj.objective_type}
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-1 mb-1">
        <Badge variant={statusVariant[obj.status] || "outline"} className="text-[8px] px-1 py-0 h-4 shrink-0">
          {statusLabel[obj.status] || obj.status}
        </Badge>
      </div>

      <div className="flex items-center gap-1 mb-1.5">
        <Avatar className="h-4 w-4 shrink-0">
          {obj.owner_avatar && <AvatarImage src={obj.owner_avatar} alt={obj.owner_name} />}
          <AvatarFallback className="text-[7px]">
            {(obj.owner_name || "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-[9px] text-muted-foreground truncate">{obj.owner_name}</span>
      </div>

      <ProgressBar value={obj.progress} status={obj.status} showLabel />
    </Link>
  );
}

/* ─── KR Card (same style as Objective) ─── */
function KRCard({ kr }: { kr: any }) {
  const progress = kr.target_value > 0 ? Math.round((kr.current_value / kr.target_value) * 100) : 0;

  return (
    <Link
      to={`/objectives/${kr.objective_id}#kr-${kr.id}`}
      className="block rounded-lg border-l-4 border-l-muted-foreground/40 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/60 w-[164px] p-2"
    >
      <div className="flex items-start gap-1.5 mb-1">
        <div className="shrink-0 rounded bg-muted-foreground/10 flex items-center justify-center h-5 w-5">
          <Key className="h-3 w-3 text-muted-foreground" />
        </div>
        <span className="font-bold leading-snug line-clamp-3 flex-1 text-[11px]">
          {kr.title}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-1">
        <Badge variant={statusVariant[kr.status] || "outline"} className="text-[8px] px-1 py-0 h-4 shrink-0">
          {statusLabel[kr.status] || kr.status}
        </Badge>
        <span className="font-mono text-muted-foreground text-[9px] ml-auto">
          {kr.current_value}/{kr.target_value}
        </span>
      </div>

      <ProgressBar value={progress} status={kr.status} showLabel />
    </Link>
  );
}

/* ─── Connector Lines ─── */
function VLine({ height = "h-5" }: { height?: string }) {
  return <div className={`w-[2px] ${height} bg-border mx-auto`} />;
}

/* ─── Org Node ─── */
function OrgNode({
  node,
  depth = 0,
  searchQuery,
  expandedIds,
  onToggle,
}: {
  node: TreeNode;
  depth?: number;
  searchQuery: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const hasKRs = node.keyResults.length > 0;
  const isExpanded = expandedIds.has(node.objective.id);
  const isHighlighted = directMatch(node, searchQuery);
  const childCount = node.children.length;
  const krCount = node.keyResults.length;
  

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ObjectiveCard node={node} depth={depth} highlighted={isHighlighted} />
        {(hasChildren || hasKRs) && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(node.objective.id);
            }}
            className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 rounded-full border border-border bg-card px-1.5 py-0.5 text-[8px] text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
          >
            {isExpanded ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
            <span>
              {childCount > 0 ? `${childCount} obj` : ""}
              {childCount > 0 && krCount > 0 ? " · " : ""}
              {krCount > 0 ? `${krCount} KR` : ""}
            </span>
          </button>
        )}
      </div>

      {/* KRs as compact chips stacked vertically */}
      {isExpanded && hasKRs && (
        <>
          <VLine height="h-4" />
          <div className="flex flex-col gap-2 items-center">
            {node.keyResults.map((kr) => (
              <KRCard key={kr.id} kr={kr} />
            ))}
          </div>
        </>
      )}

      {/* Child objectives */}
      {isExpanded && hasChildren && (
        <>
          <VLine height="h-5" />
          {node.children.length === 1 ? (
            <OrgNode
              node={node.children[0]}
              depth={depth + 1}
              searchQuery={searchQuery}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ) : (
            <div className="relative">
              <div className="flex">
                {node.children.map((child, i) => (
                  <div key={child.objective.id} className="flex flex-col items-center" style={{ margin: "0 8px" }}>
                    <div className="relative w-full flex justify-center">
                      {i > 0 && (
                        <div className="absolute top-0 h-[2px] bg-border" style={{ left: "-8px", right: "50%" }} />
                      )}
                      {i < node.children.length - 1 && (
                        <div className="absolute top-0 h-[2px] bg-border" style={{ right: "-8px", left: "50%" }} />
                      )}
                      <div className="w-[2px] h-3 bg-border" />
                    </div>
                    <OrgNode
                      node={child}
                      depth={depth + 1}
                      searchQuery={searchQuery}
                      expandedIds={expandedIds}
                      onToggle={onToggle}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Vertical (lista hierárquica indentada) ─── */
function VerticalNode({
  node,
  depth = 0,
  searchQuery,
  expandedIds,
  onToggle,
}: {
  node: TreeNode;
  depth?: number;
  searchQuery: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const hasKRs = node.keyResults.length > 0;
  const isExpanded = expandedIds.has(node.objective.id);
  const isHighlighted = directMatch(node, searchQuery);
  const obj = node.objective;

  return (
    <div className="min-w-0">
      <div
        className={[
          "flex items-center gap-2 rounded-lg border-l-4 bg-card px-2 py-1.5 shadow-sm",
          typeBorderColor[obj.objective_type] || "border-l-primary",
          typeAccentBg[obj.objective_type] || "",
          isHighlighted ? "ring-2 ring-primary" : "",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => onToggle(obj.id)}
          disabled={!hasChildren && !hasKRs}
          className="shrink-0 text-muted-foreground disabled:opacity-30 hover:text-foreground"
          aria-label={isExpanded ? "Recolher" : "Expandir"}
        >
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <Target className="h-3.5 w-3.5 shrink-0 text-primary" />
        <Link to={`/objectives/${obj.id}`} className="flex-1 min-w-0 truncate text-xs font-semibold hover:underline">
          {obj.title}
        </Link>
        <span className="hidden sm:block shrink-0 text-[10px] text-muted-foreground truncate max-w-[120px]">
          {obj.owner_name}
        </span>
        <div className="w-24 sm:w-32 shrink-0">
          <ProgressBar value={obj.progress} status={obj.status} showLabel />
        </div>
      </div>

      {isExpanded && (hasKRs || hasChildren) && (
        <div className="ml-3 sm:ml-5 mt-1.5 space-y-1.5 border-l border-border pl-2 sm:pl-3">
          {hasKRs &&
            node.keyResults.map((kr) => {
              const progress = kr.target_value > 0 ? Math.round((kr.current_value / kr.target_value) * 100) : 0;
              return (
                <Link
                  key={kr.id}
                  to={`/objectives/${kr.objective_id}#kr-${kr.id}`}
                  className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-2 py-1 hover:bg-accent/40"
                >
                  <Key className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="flex-1 min-w-0 truncate text-[11px]">{kr.title}</span>
                  <span className="hidden sm:inline shrink-0 font-mono text-[10px] text-muted-foreground">
                    {kr.current_value}/{kr.target_value}
                  </span>
                  <div className="w-20 sm:w-28 shrink-0">
                    <ProgressBar value={progress} status={kr.status} showLabel />
                  </div>
                </Link>
              );
            })}
          {node.children.map((child) => (
            <VerticalNode
              key={child.objective.id}
              node={child}
              depth={depth + 1}
              searchQuery={searchQuery}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}



function collectIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  for (const n of nodes) {
    ids.push(n.objective.id);
    ids.push(...collectIds(n.children));
  }
  return ids;
}

function collectMatchingIds(nodes: TreeNode[], query: string): string[] {
  const ids: string[] = [];
  for (const n of nodes) {
    if (nodeMatchesSearch(n, query)) {
      ids.push(n.objective.id);
      ids.push(...collectMatchingIds(n.children, query));
    }
  }
  return ids;
}

interface OKROrgChartProps {
  tree: TreeNode[];
  /** Slot de filtros extras (ex.: seletor de período) exibido na barra superior */
  extraFilters?: ReactNode;
}

/**
 * Filtro estrito: mantém apenas nós que atendem ao predicado.
 * Filhos que passam no filtro são promovidos ao lugar do pai removido.
 */
function pruneTree(nodes: TreeNode[], keep: (n: TreeNode) => boolean): TreeNode[] {
  const result: TreeNode[] = [];
  for (const n of nodes) {
    const children = pruneTree(n.children, keep);
    if (keep(n)) {
      result.push({ ...n, children });
    } else {
      result.push(...children);
    }
  }
  return result;
}

export function OKROrgChart({ tree, extraFilters }: OKROrgChartProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [buFilter, setBuFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const { businessUnits } = useBusinessUnits();
  const showBUFilter = businessUnits.length > 1;

  // Lista de responsáveis presentes na árvore
  const owners = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        map.set(n.objective.owner_id, n.objective.owner_name || "Sem dono");
        walk(n.children);
      }
    };
    walk(tree);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [tree]);

  // O filtro determina exatamente o que aparece
  const filteredTree = useMemo(() => {
    if (buFilter === "all" && ownerFilter === "all") return tree;
    const keep = (n: TreeNode) => {
      const buId = n.objective.business_unit_id;
      const buOk =
        buFilter === "all" ? true : buFilter === "none" ? !buId : buId === buFilter;
      const ownerOk = ownerFilter === "all" ? true : n.objective.owner_id === ownerFilter;
      return buOk && ownerOk;
    };
    return pruneTree(tree, keep);
  }, [tree, buFilter, ownerFilter]);

  const allIds = useMemo(() => collectIds(filteredTree), [filteredTree]);
  // Start collapsed — only root nodes visible
  const rootIds = useMemo(() => filteredTree.map((n) => n.objective.id), [filteredTree]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(rootIds));
  const allExpanded = expandedIds.size >= allIds.length;

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        const matching = collectMatchingIds(filteredTree, query.trim());
        setExpandedIds(new Set(matching));
      }
    },
    [filteredTree]
  );

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedIds(allExpanded ? new Set() : new Set(allIds));
  }, [allExpanded, allIds]);

  const buName = (id: string | null | undefined) =>
    businessUnits.find((b) => b.id === id)?.name ?? "Corporativo";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar objetivo ou responsável..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        {extraFilters}
        {showBUFilter && (
          <BUFilter value={buFilter} onValueChange={setBuFilter} className="h-8 text-xs w-[200px]" />
        )}
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="h-8 text-xs w-[200px]">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os responsáveis</SelectItem>
            {owners.map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleExpandAll}>
          {allExpanded ? "Colapsar tudo" : "Expandir tudo"}
        </Button>
        <div className="flex items-center rounded-md border border-border p-0.5">
          <button
            type="button"
            onClick={() => setLayout("horizontal")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] ${layout === "horizontal" ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Network className="h-3.5 w-3.5" /> Horizontal
          </button>
          <button
            type="button"
            onClick={() => setLayout("vertical")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] ${layout === "vertical" ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-3.5 w-3.5" /> Vertical
          </button>
        </div>
      </div>

      {filteredTree.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Nenhum objetivo encontrado para os filtros selecionados.</p>
        </div>
      ) : layout === "vertical" ? (
        <div className="overflow-y-auto max-h-[calc(100vh-260px)] space-y-4 pb-4">
          {filteredTree.map((node) => (
            <div key={node.objective.id} className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {buName(node.objective.business_unit_id)}
              </span>
              <VerticalNode
                node={node}
                depth={0}
                searchQuery={searchQuery}
                expandedIds={expandedIds}
                onToggle={handleToggle}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {/* Barra de rolagem espelhada no topo */}
          <div
            ref={topScrollRef}
            onScroll={() => syncScroll(topScrollRef, bodyScrollRef)}
            className="overflow-x-auto overflow-y-hidden"
          >
            <div style={{ width: scrollWidth, height: 1 }} />
          </div>

          <div
            ref={bodyScrollRef}
            onScroll={() => syncScroll(bodyScrollRef, topScrollRef)}
            className="overflow-auto pb-4 max-h-[calc(100vh-280px)] touch-pan-x touch-pan-y"
          >
            {/* Cada raiz é uma coluna independente — ramos nunca se misturam */}
            <div ref={contentRef} className="flex gap-6 items-start py-2 px-2 w-max min-w-full">
              {filteredTree.map((node) => (
                <div
                  key={node.objective.id}
                  className="flex flex-col items-center shrink-0 rounded-xl border border-border/60 bg-muted/20 px-4 pt-3 pb-5"
                >
                  <span className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {buName(node.objective.business_unit_id)}
                  </span>
                  <OrgNode
                    node={node}
                    depth={0}
                    searchQuery={searchQuery}
                    expandedIds={expandedIds}
                    onToggle={handleToggle}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      )}
    </div>
  );
}
