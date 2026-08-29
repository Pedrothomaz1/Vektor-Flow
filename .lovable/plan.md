# Árvore de OKRs: períodos (anual/trimestre) e hierarquia organizada

## O que muda

### 1. Ciclos com sub-períodos (trimestres)
- Um ciclo anual (ex.: "2026 - Rumo à 5000 consultoras") passa a poder ter ciclos filhos trimestrais (Q1, Q2, Q3, Q4).
- Na tela de Ciclos, ao criar/editar, é possível escolher se o ciclo é **Anual** ou **Trimestral** e, no caso do trimestral, a qual ciclo anual ele pertence.
- Botão "Gerar trimestres" no ciclo anual: cria automaticamente Q1–Q4 com as datas corretas dentro do intervalo do ciclo pai.
- Objetivos continuam vinculados a um ciclo — agora podem estar no ciclo anual ou em um trimestre específico.

### 2. Filtro de período na árvore
No topo da árvore de OKRs:
- **Período**: "Ano completo" (mostra os objetivos do ciclo anual + de todos os trimestres) ou um trimestre específico (mostra só o que pertence àquele trimestre).
- **Business Unit**: já existe; permanece (oculto quando o usuário só tem uma BU).
- **Responsável**: novo, para focar em uma pessoa.
- O filtro determina exatamente o que aparece na árvore: o que não bate com o filtro é removido da visualização (mantendo apenas os pais necessários para dar contexto, exibidos em estilo esmaecido).

### 3. Correção da bagunça visual
Hoje as duas raízes (Heads e Backoffice) ficam lado a lado num contêiner que quebra linha, então ao expandir os cards de níveis diferentes se misturam.
Correções:
- Cada raiz vira uma **coluna independente** com separação clara e cabeçalho (nome da BU + progresso), sem quebra de linha entre ramos — a rolagem horizontal cuida do excesso.
- Cards do mesmo nível ficam **alinhados na mesma altura** (altura fixa por card, texto com reticências), com linhas de conexão retas.
- KRs deixam de ficar embaralhados com objetivos filhos: aparecem numa faixa própria, recuada e visualmente distinta, abaixo do objetivo.
- Rótulo de nível no card (N1 Diretoria / N2 / N3) para deixar a profundidade explícita.
- Rolagem vertical e horizontal com cabeçalho de filtros fixo.

## Detalhes técnicos

**Banco (migração)**
- `cycles`: novas colunas `parent_cycle_id uuid references public.cycles(id) on delete cascade` e `period_type text not null default 'annual'` (`annual` | `quarterly`).
- RLS existente de `cycles` é mantida; sub-ciclos herdam `business_unit_id` do pai por padrão.
- Sem alteração em `objectives` (o vínculo de período é via `cycle_id`).

**Frontend**
- `useCycles`: expõe `parent_cycle_id`/`period_type`, helper `useCycleTree()` para agrupar anual → trimestres, e mutation `createQuarters(cycleId)`.
- `useOKRTree(cycleId, { includeChildCycles })`: quando "Ano completo", busca objetivos do ciclo pai e dos ciclos filhos numa única consulta (`cycle_id in (...)`) e monta a árvore por `parent_objective_id`; quando um trimestre é escolhido, filtra só aquele ciclo.
- `CycleForm` / `CyclesList`: campos de tipo de período, ciclo pai e ação "Gerar trimestres".
- `OKROrgChart`: nova barra de filtros (Período, BU, Responsável, busca, expandir/colapsar), render por coluna de raiz, cards de altura uniforme e faixa separada de KRs.
- `AlignmentView`: mesmo seletor de período para manter consistência.

## Fora de escopo
- Migrar automaticamente os 27 objetivos atuais para trimestres — isso fica como ajuste manual ou como próxima task, se você quiser.
