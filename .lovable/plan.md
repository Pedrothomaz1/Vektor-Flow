## Objetivo
Adicionar um filtro de "Canal" (Board, etc.) na barra de filtros da tela de Iniciativas (`/initiatives`), ao lado dos filtros de BU, Responsável e Status.

## Mudanças

**Arquivo:** `src/pages/initiatives/InitiativesList.tsx`

1. Adicionar estado `filterCanal` (string, default `"all"`).
2. Calcular `uniqueCanais` via `useMemo` extraindo valores distintos de `initiatives[].canal` (ignorando vazios), ordenados alfabeticamente.
3. Adicionar um `<Select>` na seção de filtros com:
   - Opção "Todos os canais" (`all`)
   - Opção "Sem canal" para iniciativas com canal vazio/null
   - Lista dinâmica dos canais existentes
4. Incluir o filtro na função `filtered` (useMemo): pular iniciativas cujo `canal` não bate com `filterCanal`.

## Observações
- Filtro é dinâmico: popula automaticamente conforme novos canais aparecem nos dados (Board, Marketing, etc.).
- Sem mudança de schema, hook ou backend — apenas UI/presentation.
- Mantém o padrão visual dos filtros existentes (largura `w-[200px]`, mesmo estilo de `Select`).
