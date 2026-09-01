# Árvore de OKRs em formato de acordeão (sem rolagem lateral)

Hoje a árvore é um organograma largo: cada nível cresce para o lado, os cards são pequenos e é preciso arrastar muito na horizontal, perdendo a noção do todo. O modo vertical existe, mas é secundário e ainda parece uma lista simples.

## O que muda

- **Acordeão passa a ser o padrão.** Ao abrir a tela de alinhamento, a árvore aparece como uma lista que ocupa 100% da largura e cresce para baixo. Nada de rolagem lateral.
- **Abertura por clique, nível a nível.** Cada linha de objetivo tem uma seta:
  - clicar na seta abre os objetivos filhos, indentados logo abaixo;
  - quando o objetivo não tem filhos (ou já no último nível), a abertura mostra os Key Results;
  - objetivos com filhos e KRs mostram os filhos primeiro e os KRs em um bloco "Key Results" ao final.
  - clicar no título continua entrando na tela do objetivo.
- **Linha rica e legível.** Cada linha usa a largura disponível: título, badge de tipo (Anual/Trimestral), status, responsável (avatar + nome), barra de progresso e a porcentagem alinhada à direita. Indentação com guias verticais para deixar a hierarquia clara.
- **Controles de leitura no topo:** "Expandir tudo" / "Recolher tudo", além da busca e dos filtros de período/BU já existentes. A busca continua abrindo automaticamente os ramos com resultado.
- **Densidade adaptativa.** Em telas estreitas a linha compacta (esconde responsável e badge de tipo, mantém título + progresso).
- **Organograma continua disponível** pelo alternador Horizontal/Vertical, agora com o vertical como opção inicial e a preferência salva no navegador. As melhorias já feitas no horizontal (cards compactos, barra de rolagem no topo) permanecem.

```text
▼ Fábrica de Alta Performance      Anual   No caminho   Fabiana ████████░░ 42%
   ▼ Evolução estrutural da fábrica  Trim.  Em risco     Pedro   ██░░░░░░░░ 14%
        Key Results
        • Reduzir lead time                              ██████░░░░ 60%
   ▶ Estruturar arquitetura de produto Trim. No caminho  Ana     ████████░░ 82%
```

## Detalhes técnicos

- `src/components/okr/OKROrgChart.tsx`: reescrever o renderer vertical como componente de linha recursivo (`TreeRow`) com estado de expansão por nó (`Set<string>`), guias de indentação em CSS e KRs renderizados dentro do nó expandido. Padrão do `layout` em `localStorage` passa a `"vertical"`; o renderer horizontal atual fica intacto.
- Botões "Expandir tudo"/"Recolher tudo" operam sobre o mesmo `Set` derivado de `useOKRTree`.
- Somente apresentação: sem mudanças em dados, hooks de query, RLS ou cálculo de progresso.
