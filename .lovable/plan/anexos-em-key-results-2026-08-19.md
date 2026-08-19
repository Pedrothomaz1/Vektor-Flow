# Anexos em Key Results

Permitir upload de arquivos em cada KR, listados no card do KR. Envio e exclusão restritos a quem pode editar o KR (dono, admin, okr_master, respeitando ciclo travado).

## Backend

Novo bucket privado `kr-attachments` (arquivos servidos por URL assinada).

Nova tabela `public.kr_attachments`:
- `id uuid pk`
- `key_result_id uuid → key_results(id) on delete cascade`
- `storage_path text not null` (`{key_result_id}/{uuid}-{nome}`)
- `file_name text not null`, `file_size bigint`, `content_type text`
- `uploaded_by uuid`, `created_at timestamptz default now()`
- índice em `key_result_id`

GRANTs para `authenticated` e `service_role`. RLS:
- SELECT: quem já enxerga o KR (via objetivo → `user_can_see_bu`).
- INSERT/DELETE: dono do KR, admin ou okr_master.
- UPDATE: nenhuma política.

Políticas em `storage.objects` para o bucket, espelhando as mesmas regras (primeiro segmento do path = `key_result_id`).

## Frontend

Novo hook `src/hooks/useKRAttachments.ts`:
- `list(keyResultId)` via React Query.
- `upload(file)`: valida tamanho (máx. 10MB), envia ao Storage e insere a linha na tabela.
- `remove(attachment)`: apaga do Storage e da tabela.
- `getUrl(path)`: gera URL assinada sob demanda para download.

Novo componente `src/components/okr/KRAttachments.tsx`:
- Lista de arquivos com ícone por tipo, nome, tamanho formatado e data.
- Clique baixa/abre via URL assinada.
- Botão "Anexar arquivo" (input file oculto) visível apenas quando `canEdit`.
- Botão de excluir por item com confirmação, apenas quando `canEdit`.
- Estado vazio: "Nenhum anexo."
- Toast de erro para arquivo acima de 10MB ou falha de upload.

Integração em `src/components/okr/KeyResultCard.tsx`:
- Nova aba "Anexos" ao lado de "Timeline" e "Gráfico" dentro do `CollapsibleContent`, renderizando `KRAttachments` com `canEdit={canEdit}`.
- Badge com a contagem de anexos ao lado do botão de histórico quando houver arquivos.

## Detalhes técnicos

- Qualquer tipo de arquivo, limite de 10MB validado no cliente e no bucket.
- Bucket privado + `createSignedUrl` (60s) no clique, sem expor arquivos publicamente.
- Nomes de arquivo sanitizados no path; `file_name` original preservado para exibição.
- Tamanho formatado em KB/MB e datas em pt-BR com `date-fns`.
- Sem alterações na lógica de progresso ou nas regras de check-in.
