# Timeline de comentários em iniciativas

Adicionar seção de comentários em cada iniciativa, exibida como timeline cronológica. Qualquer usuário com acesso à BU da iniciativa pode postar; comentários são imutáveis (sem editar/excluir).

## Backend (migração)

Nova tabela `public.initiative_comments`:
- `id uuid pk`
- `initiative_id uuid → initiatives(id) on delete cascade`
- `author_id uuid → auth.users(id)`
- `content text not null` (validar tamanho 1–2000)
- `created_at timestamptz default now()`
- índice por `(initiative_id, created_at)`

GRANTs para `authenticated` e `service_role`. RLS habilitado com políticas:
- **SELECT**: usuário enxerga se enxerga a iniciativa (via `user_can_see_bu` sobre `initiatives.business_unit_id`).
- **INSERT**: `author_id = auth.uid()` E mesma checagem de BU da iniciativa.
- **UPDATE/DELETE**: nenhuma política (imutáveis por padrão).

## Frontend

Novo hook `src/hooks/useInitiativeComments.ts`:
- `list(initiativeId)` via React Query, faz join manual com `profiles_public` (padrão já usado em `useActivityComments`) para pegar `full_name` e `avatar_url`.
- `addComment({ initiative_id, content })` mutation, invalida a query.

Novo componente `src/components/initiatives/InitiativeTimeline.tsx`:
- Lista vertical estilo timeline (linha à esquerda, bolinha com avatar, card com autor, data relativa em pt-BR e conteúdo).
- Campo de novo comentário no topo (Textarea + botão "Comentar"), desabilitado se vazio.
- Estado vazio: "Nenhum comentário ainda."

Integração em `src/pages/initiatives/InitiativesList.tsx`:
- Adicionar botão "Comentários" (ícone MessageSquare) em `InitiativeActions` OU na linha da tabela, abrindo um `Dialog` que renderiza `InitiativeTimeline` da iniciativa selecionada.
- Segue o padrão dos outros dialogs (form de edição) já usados na página.

## Detalhes técnicos

- Datas formatadas com `formatDistanceToNow` do `date-fns` com `locale: ptBR`.
- Sem edição/exclusão na UI (imutáveis).
- Regras de BU herdadas da iniciativa — não duplicar `business_unit_id` na tabela de comentários; a RLS resolve via subquery no `initiatives`.
- Sem alterações em `useInitiatives` nem na lógica de status.
