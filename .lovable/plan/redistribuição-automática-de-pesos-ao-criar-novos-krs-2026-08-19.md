# Redistribuição automática de pesos ao criar novos KRs

Hoje, ao criar um KR cujo peso ultrapassa os 100% disponíveis, o formulário bloqueia o envio com um toast de erro. Isso trava a inserção de novos KRs quando os pesos já somam 100%.

## Novo comportamento

1. O campo "Peso (%)" passa a sugerir automaticamente um valor viável:
   - Se ainda há espaço livre, sugere o espaço restante.
   - Se não há espaço (soma já é 100%), sugere o peso de uma divisão igualitária entre todos os KRs (existentes + o novo).
2. O envio nunca é bloqueado. Se a soma passar de 100%, os pesos dos KRs existentes são reescalados proporcionalmente para que o total volte a 100% após a criação.
3. Um aviso discreto no formulário informa quando a redistribuição vai acontecer ("Os pesos dos demais KRs serão ajustados proporcionalmente").
4. Na edição de um KR existente, mesma regra: salva e reescala os outros, em vez de bloquear.

## Detalhes técnicos

- `src/components/okr/KeyResultForm.tsx`: remover o `return` que bloqueia o submit no toast "Peso excede 100%"; substituir por texto informativo. Ajustar `buildDefaults` para calcular o peso sugerido a partir de `existingWeights` na criação.
- `src/pages/objectives/ObjectiveDetail.tsx`: após criar/editar um KR, se o total exceder 100, chamar `updateKeyResult` para os demais KRs com peso reescalado (`peso * (100 - novoPeso) / somaAtualDosOutros`), arredondado com ajuste do resto no último KR para fechar exatamente 100.
- Nenhuma mudança de banco de dados; a coluna `weight` continua a mesma.
