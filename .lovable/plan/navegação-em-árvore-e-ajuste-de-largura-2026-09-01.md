# Navegação em árvore e ajuste de largura

Três frentes, a partir do vídeo enviado.

## 1. Rolagem lateral na tela do objetivo

No vídeo, a página do objetivo desliza horizontalmente: título, barras de progresso e a régua de objetivos irmãos ficam cortados à direita.

A causa exata ainda não está confirmada. O primeiro passo é reproduzir a tela na largura do vídeo (~820px) e identificar o elemento que estoura a largura — a régua de irmãos usa uma faixa interna de largura automática (`w-max`) dentro de um contêiner rolável, o que é um candidato provável, mas será verificado antes da correção.

Correção prevista:
- Garantir que a rolagem horizontal fique confinada à régua de irmãos, nunca na página inteira.
- Cabeçalho do objetivo com quebra de texto em telas estreitas (título longo em duas linhas em vez de empurrar a largura).
- Barras de progresso e cards limitados a 100% da largura disponível.

## 2. Árvore de contexto dentro do objetivo

Adicionar, na tela do objetivo, um bloco "Onde estou" com a linhagem navegável:

```text
Ciclo 2026
  └ ESCALA COM CONTROLE E INTELIGÊNCIA
      └ FÁBRICA DE ALTA PERFORMANCE   <- atual
          ├ Evolução estrutural da Fábrica
          ├ Reduzir custos de GALVANOPLASTIA
          └ ...
```

- Cada nível é clicável (sobe para o pai, desce para o filho).
- Os irmãos continuam disponíveis na régua atual; o bloco mostra o caminho completo até a raiz.
- Recolhível, para não competir com os Key Results.

## 3. Árvore de OKRs na tela do ciclo

- Aplicar a mesma visualização em lista/acordeão de largura total já usada na tela de alinhamento, com o alternador Lista / Árvore.
- Cards mais legíveis: título em duas linhas, progresso e responsável alinhados, sem cortes.
- Manter os filtros existentes (períodos, BUs, responsável).

## Detalhes técnicos

- `src/pages/objectives/ObjectiveDetail.tsx`: correção de overflow e inclusão do novo bloco de linhagem.
- `src/components/okr/SiblingObjectiveNav.tsx`: confinar a rolagem, evitar propagação de largura.
- Novo `src/components/okr/ObjectiveBreadcrumbTree.tsx` + hook para buscar a cadeia de ancestrais (consulta recursiva pelo `parent_objective_id`).
- `src/components/okr/OKROrgChart.tsx` reaproveitado em `src/pages/cycles/CycleDetail.tsx`, sem mudanças de dados ou regras de negócio.
- Nenhuma alteração de banco, RLS ou lógica de cálculo de progresso.
