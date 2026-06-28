<!--
SPDX-FileCopyrightText: 2026 Gabriel Rodrigues Antunes <gabrielrodantunes@gmail.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Governança

Este documento descreve **como o projeto Caderno é conduzido**: quem decide, como
as decisões são tomadas e quais são os papéis. Ele é curto de propósito —
honestidade sobre o tamanho atual do projeto vale mais que um processo elaborado
que ninguém segue.

> Há uma divisão importante:
> a **[Constituição][constitution]** governa o **produto** (o que entra, o que
> não entra, por quê). Este documento governa **o projeto** (pessoas, decisões,
> processo).

## Modelo atual

O Caderno está em fase de **MVP** e hoje funciona como um projeto de
**mantenedor único** (modelo BDFL — *Benevolent Dictator For Life*):

- **Mantenedor principal:** Gabriel Rodrigues Antunes ([@guesant][guesant]).
- **Time de segurança:** [@meu-caderno/security][security-team], responsável por
  infraestrutura, CI/CD e resposta a vulnerabilidades.

A relação de quem revisa o quê está formalizada em [CODEOWNERS](./CODEOWNERS).

## Como as decisões são tomadas

- **Decisões de produto** (features, comportamento, UX) são avaliadas contra a
  [Constituição][constitution]. Se uma proposta fere um princípio de lá, ela é
  recusada ou revista — independentemente de quão útil pareça.
- **Decisões técnicas** (arquitetura, dependências, ferramentas) são discutidas
  em issues e pull requests, e decididas pelo mantenedor principal, buscando
  consenso sempre que possível.
- **Discordâncias** são resolvidas por conversa aberta. Enquanto o projeto tiver
  um mantenedor único, ele tem a palavra final — mas o objetivo é convencer, não
  impor.

Discussões abertas acontecem preferencialmente no
[GitHub Discussions][discussions] e em issues.

## Papéis

- **Usuário** — usa o Caderno. Pode reportar bugs, sugerir ideias e participar das
  discussões.
- **Contribuidor** — envia pull requests, melhora documentação, ajuda na triagem
  de issues. Veja o [CONTRIBUTING.md][contributing].
- **Mantenedor** — tem permissão para revisar e fazer merge, e responde pela
  saúde do projeto.

## Como se tornar mantenedor

Não há processo burocrático. Contribuições consistentes e de qualidade ao longo
do tempo — código, revisões, ajuda à comunidade — são o caminho. O mantenedor
principal pode convidar contribuidores ativos para o papel de mantenedor, e o
[CODEOWNERS](./CODEOWNERS) é atualizado para refletir isso.

À medida que o projeto crescer, este documento será revisado para descrever um
modelo de governança mais distribuído.

## Código de conduta

Toda participação no projeto segue o [Código de Conduta][coc].

[constitution]: ./CONSTITUTION.md
[contributing]: ./CONTRIBUTING.md
[coc]: ./CODE_OF_CONDUCT.md
[guesant]: https://github.com/guesant
[security-team]: https://github.com/orgs/meu-caderno/teams/security
[discussions]: https://github.com/meu-caderno/caderno/discussions
