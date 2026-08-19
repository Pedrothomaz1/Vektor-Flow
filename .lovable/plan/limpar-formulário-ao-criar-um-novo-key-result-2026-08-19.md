# Limpar formulário ao criar um novo Key Result

Hoje, ao criar um KR e abrir o formulário novamente, os textos digitados anteriormente continuam preenchidos. O formulário é montado uma vez e mantém o estado antigo entre aberturas.

## Correção

Em `src/components/okr/KeyResultForm.tsx`:
- Adicionar um `useEffect` que executa `reset(...)` sempre que o diálogo abre (`open`) ou quando `defaultValues` muda.
- Ao abrir para criação (sem `defaultValues.id`), restaurar os valores iniciais vazios: título e descrição em branco, tipo "Porcentagem", início 0, atual 0, meta 100, unidade vazia, peso 1, responsável "Eu mesmo".
- Ao abrir para edição, carregar os dados do KR selecionado.

## Detalhes técnicos

- Extrair a montagem dos valores iniciais em uma função para reutilizar no `useForm` e no `reset`.
- Sem mudanças na validação, na regra de peso máximo de 100% ou na lógica de submit.
