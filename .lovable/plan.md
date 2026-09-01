# Melhorias na navegação de OKRs (vídeo)

Duas melhorias pedidas no vídeo.

## 1. Mostrar os objetivos filhos dentro da tela do objetivo

Hoje, ao abrir um objetivo (ex.: "Fábrica de Alta Performance"), a tela mostra só os Key Results. Para chegar nos objetivos que estão abaixo dele é preciso voltar ao ciclo e abrir a árvore.

O que muda:

- Nova seção "Objetivos filhos" na tela do objetivo, acima dos Key Results.
- Cada filho aparece como um card clicável com título, responsável, período (ciclo), status e progresso.
- Clicar entra no objetivo filho, que por sua vez mostra os filhos dele — descendo nível a nível sem voltar ao ciclo.
- Se o objetivo não tiver filhos, a seção não aparece (a tela fica como está hoje).
- A barra de irmãos já existente continua funcionando.

## 2. Árvore de OKRs: parar de "fugir" para a direita

Hoje, ao expandir os níveis, a árvore cresce só na horizontal e é preciso rolar muito para a direita e voltar.

O que muda:

- Alternador de layout no topo da árvore: **Horizontal** (organograma atual) e **Vertical** (lista hierárquica indentada, que cresce para baixo em vez de para o lado). O vertical vira o padrão em telas menores.
- Cards mais compactos no modo horizontal (menor largura e espaçamento), cabendo mais itens na tela.
- Barra de rolagem horizontal também no topo da área da árvore (além da de baixo), sempre visível ao rolar, para não precisar ir até o fim da página para navegar.
- A preferência de layout fica salva no navegador.

```text
Modo vertical:
▼ Fábrica de Alta Performance ................. 42%
   ▼ Evolução estrutural da fábrica ........... 14%
        KR Reduzir lead time ................... 60%
   ▶ Estruturar arquitetura de produto ........ 82%
```

## Detalhes técnicos

- `ObjectiveDetail.tsx`: nova seção usando o hook existente `useObjectiveSiblings(id)` (busca `objectives` por `parent_objective_id`, sem filtro de ciclo, respeitando RLS/BU) + novo componente de apresentação `src/components/okr/ChildObjectivesList.tsx`. Nenhuma mudança de regra de negócio, RLS ou cálculo de progresso.
- `OKROrgChart.tsx`: adiciona estado `layout` ("horizontal" | "vertical") persistido em `localStorage`, renderização alternativa em lista indentada reutilizando os mesmos dados de `useOKRTree`, cards horizontais mais compactos e uma barra de rolagem espelhada no topo (div sincronizada por `scrollLeft`). Somente apresentação.
