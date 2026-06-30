<!--
SPDX-FileCopyrightText: 2026 Gabriel Rodrigues Antunes <gabrielrodantunes@gmail.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Contribuindo com o Caderno

Que bom te ver por aqui. 💛 O Caderno é um projeto livre, local-first e mantido
em trabalho voluntário — toda ajuda conta, desde corrigir um typo até propor uma
funcionalidade nova.

Este guia explica como contribuir. Antes de começar, vale conhecer dois
documentos que dão o tom do projeto:

- A **[Constituição][constitution]** — o que decide quando há dúvida de produto.
- Os **[Princípios][principles]** — a base ética do projeto.

E ao participar, você concorda em seguir o nosso
**[Código de Conduta][coc]**.

## Antes de propor uma funcionalidade

O Caderno tem uma régua clara para o que entra. Antes de abrir uma proposta,
passe a ideia por estas perguntas (são as mesmas da [Constituição][constitution]):

- Ela funciona **offline**?
- O usuário continua **no controle**?
- A ação é **reversível**?
- Mantém os dados **portáveis** (exporta/importa, sem lock-in)?
- Aparece na **profundidade certa** — faz sentido para iniciantes sem limitar
  quem é avançado?

Se alguma resposta for "não", a proposta provavelmente precisa de ajuste. Isso
não é um "não" definitivo — é um convite para refiná-la junto.

## Como contribuir

### Reportar um bug

Abra uma issue usando o template **Relatório de bug**. Quanto mais informação
(passos para reproduzir, o que esperava, o que aconteceu, ambiente), mais rápido
conseguimos ajudar.

> Encontrou uma **vulnerabilidade de segurança**? Não abra issue pública — siga o
> [SECURITY.md][security].

### Sugerir uma funcionalidade

Abra uma issue usando o template **Sugestão de funcionalidade**. Ele já inclui a
checagem contra os critérios acima — responder a elas ajuda muito na avaliação.

### Tirar dúvidas / discutir ideias

Para perguntas e conversas abertas, prefira o
[GitHub Discussions][discussions] (quando habilitado) em vez de issues. Veja o
[SUPPORT.md][support] para todos os canais.

## Ambiente de desenvolvimento

O projeto usa **DevContainer** para garantir um ambiente reproduzível. A forma
recomendada de desenvolver é abrir o repositório no container:

1. Faça o clone:

   ```sh
   git clone https://github.com/meu-caderno/caderno.git
   cd caderno
   ```

2. Abra no **VSCode** (extensão *Dev Containers*) ou na sua **IDE JetBrains** e
   conecte ao **Caderno SDK** (DevContainer).

O código-fonte vive no monorepo em [`src/`](./src), gerenciado com **Bun** +
**Nx**. Para detalhes de arquitetura e comandos do dia a dia, veja
[docs/DEVELOPMENT.md][development] e [docs/ARCHITECTURE.md][architecture].

Ao escrever ou refatorar código, siga o
**[Guia de boas práticas][guidelines]** — um catálogo de _code smells_,
convenções por camada e o que o gate impõe.

### Comandos úteis

Rodando de dentro de `src/`:

```sh
bun run quality:check    # lint + format check (biome check)
bun run quality:fix      # corrige o que dá para corrigir automaticamente
bun run all:build        # build de tudo (precisa passar)
```

Antes de abrir um PR, garanta que rodam sem erro localmente os **mesmos checks do
CI**: `quality:check:ci` (Biome) e `all:build`. Veja
[docs/DEVELOPMENT.md][development].

## Convenção de commits

Usamos [Conventional Commits][conventional]. Prefixos comuns:

- `feat:` — nova funcionalidade
- `fix:` — correção de bug
- `docs:` — só documentação
- `chore:` — manutenção (build, deps, config)
- `refactor:`, `test:`, `ci:` — conforme o caso

Exemplo: `feat: adicionar exportação de disciplinas em JSON`.

## Fluxo de Pull Request

1. **Fork** o repositório e crie uma branch a partir de `main`
   (ex.: `feat/exportar-json`).
2. Faça suas mudanças seguindo a convenção de commits.
3. Garanta que **lint, format, typecheck e build passam** localmente.
4. Se mexeu em arquivos novos, confirme que estão cobertos por licença
   (`reuse lint` — veja [REUSE.toml](./REUSE.toml)).
5. Abra o PR preenchendo o template. Relacione a issue correspondente
   (ex.: `Closes #123`).
6. A automação de CI roda os checks e os [CODEOWNERS](./CODEOWNERS) fazem a
   revisão. Pode haver idas e vindas — faz parte. 🙂

## Licença das contribuições

Ao contribuir, você concorda que sua contribuição será licenciada sob a
**[AGPL-3.0-or-later][license]** (código) ou **CC-BY-SA-4.0** (assets visuais),
conforme o [REUSE.toml](./REUSE.toml). Mantenha os cabeçalhos SPDX nos arquivos
novos.

---

Obrigado por ajudar a manter o Caderno livre, independente e de todo mundo. 🌱

[constitution]: ./CONSTITUTION.md
[principles]: ./PRINCIPLES.md
[coc]: ./CODE_OF_CONDUCT.md
[security]: ./SECURITY.md
[support]: ./SUPPORT.md
[license]: ./LICENSE
[development]: ./docs/DEVELOPMENT.md
[architecture]: ./docs/ARCHITECTURE.md
[guidelines]: ./docs/GUIA-BOAS-PRATICAS.md
[discussions]: https://github.com/meu-caderno/caderno/discussions
[conventional]: https://www.conventionalcommits.org/pt-br/v1.0.0/
