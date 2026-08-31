# Navegar entre objetivos irmãos na tela do objetivo

## O que muda

Na tela de um objetivo (ex.: "Evolução estrutural da fábrica"), além do caminho de alinhamento já existente ("Fábrica de alta performance > ..."), passa a existir uma navegação entre os objetivos que compartilham o mesmo objetivo pai.

- Uma barra de irmãos logo abaixo do breadcrumb, com o nome do pai e a lista dos objetivos filhos dele (incluindo o atual, destacado).
- Cada item mostra título curto, progresso e status; clicar troca a tela para aquele objetivo, mantendo os KRs visíveis na mesma estrutura.
- Setas "anterior / próximo" para percorrer os irmãos em sequência, com contador (ex.: "2 de 4").
- Quando o objetivo não tem pai (raiz), a barra não aparece.
- Se a lista for longa, ela rola horizontalmente e o item atual entra em foco.

## Detalhes técnicos

- Novo hook `useObjectiveSiblings(parentObjectiveId)`: busca em `objectives` todos os registros com `parent_objective_id = <pai>`, ordenados por `created_at`, trazendo título, status, progresso e `cycle_id`. Não usa o cycle atual como filtro — irmãos podem estar em períodos (trimestres) diferentes do objetivo aberto.
- Novo componente `src/components/okr/SiblingObjectiveNav.tsx` (apresentação apenas: chips/pílulas + botões anterior/próximo com `Link`/`navigate`).
- `ObjectiveDetail.tsx`: renderiza o componente após o breadcrumb, usando `obj.parent_objective_id`. Nenhuma alteração em regras de negócio, RLS ou progresso.
- RLS existente já limita a visibilidade por BU, então só aparecem irmãos que o usuário pode ver.
