# Separar Key Results dos objetivos filhos na árvore

Hoje, ao expandir um objetivo intermediário na árvore de OKRs, os Key Results desse objetivo aparecem na mesma lista dos objetivos filhos. Isso mistura dois níveis diferentes na mesma tela e confunde a leitura da hierarquia.

## O que muda

- Ao clicar num objetivo que tem filhos, a expansão mostra **apenas os objetivos filhos**.
- Os Key Results desse objetivo passam a ficar atrás de um botão próprio na linha do objetivo: `Key Results (n)`, que abre um bloco separado, visualmente distinto (fundo e recuo próprios), abaixo dos filhos.
- Objetivos folha (sem filhos) continuam abrindo os KRs direto ao clicar — nada muda para eles.
- O contador na linha continua indicando `n obj · n KR`, agora com o "n KR" clicável.
- "Expandir tudo" abre filhos e KRs; "Colapsar tudo" fecha os dois.

```text
▼ FÁBRICA DE ALTA PERFORMANCE            4 obj · 5 KR       50%
   ▼ Evolução estrutural da Fábrica      2 obj · 3 KR       14%
        ▶ Sistema de pedidos ...                            24%
        ▶ Estruturar a Galvanoplastia ...                    0%
        [ Key Results (3) ]
   ▶ Reduzir custos de GALVANOPLASTIA                        0%
   [ Key Results (5) ]
```

O mesmo comportamento vale nos dois modos do alternador (Lista e Árvore/organograma).

## Detalhes técnicos

- `src/components/okr/OKROrgChart.tsx`: novo estado `krExpandedIds` (Set) separado de `expandedIds`. Em `VerticalNode` e `OrgNode`, quando o nó tem filhos, os KRs deixam de ser renderizados junto e passam a depender de `krExpandedIds`; quando o nó não tem filhos, o toggle único continua controlando os KRs. `handleExpandAll` passa a alternar os dois conjuntos.
- Somente apresentação: nenhuma mudança de dados, hooks, RLS ou cálculo de progresso.
