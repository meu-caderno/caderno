<!--
SPDX-FileCopyrightText: 2026 Gabriel Rodrigues Antunes <gabrielrodantunes@gmail.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Guia de desenvolvimento

Como configurar o ambiente e trabalhar no Caderno no dia a dia. Para entender como
o projeto é organizado, veja o [ARCHITECTURE.md](./ARCHITECTURE.md). Para o fluxo
de contribuição (PRs, commits, revisão), veja o
[CONTRIBUTING.md](../CONTRIBUTING.md).

## Pré-requisitos

A forma **recomendada** de desenvolver é via **DevContainer**, que já traz tudo
configurado (Bun, Nx e dependências) — você não precisa instalar nada na sua
máquina além do editor e do Docker.

- [VSCode](https://code.visualstudio.com) com a extensão
  **Dev Containers**, ou uma **IDE JetBrains** com suporte a DevContainer.
- [Docker](https://www.docker.com) (ou compatível) em execução.

## Começando

```sh
git clone https://github.com/meu-caderno/caderno.git
cd caderno
```

Abra a pasta no VSCode/JetBrains e **reabra no container** (Dev Container /
Caderno SDK). O container instala as dependências automaticamente.

> O DevContainer é a fonte de verdade do ambiente — é o mesmo usado pela CI
> (veja [`.github/actions/`](../.github/actions/) e os workflows). Isso mantém
> "funciona na minha máquina" alinhado com "funciona no CI".

## Comandos do dia a dia

Todos os comandos rodam de dentro de [`src/`](../src):

```sh
cd src
```

| Comando | O que faz |
| --- | --- |
| `bun run quality:check` | Lint + format check (`biome check .`) |
| `bun run quality:fix` | Corrige automaticamente o que dá (`biome check --fix --unsafe .`) |
| `bun run lint:check` / `lint:fix` | Apenas lint |
| `bun run format:check` / `format:fix` | Apenas formatação |
| `bun run all:typecheck` | Checagem de tipos (PWA via `nuxt typecheck`, core via `tsc`) |
| `bun run all:test` | Testes unitários/componente (Vitest) de todos os pacotes |
| `bun run all:coverage` | Testes com relatório de cobertura |
| `bun run all:e2e` | Testes end-to-end (Playwright) — gera o build e roda no Chromium |
| `bun run all:build` | Builda tudo (PWA) |

> **Testes:** o ambiente de Vitest (unit/componente) e Playwright (e2e) já está
> configurado, mas **sem testes de exemplo** — adicione `*.spec.ts` em
> `pkgs/*/src` ou `pkgs/apps/pwa/app/` (Vitest) e em `pkgs/apps/pwa/e2e/`
> (Playwright). Para rodar o e2e localmente, instale o browser uma vez com
> `bunx playwright install chromium` (as libs de sistema já vêm na imagem do
> DevContainer).

### Rodando o app (PWA)

Dentro de [`src/pkgs/apps/pwa`](../src/pkgs/apps/pwa):

```sh
cd src/pkgs/apps/pwa
bun run dev        # servidor de desenvolvimento (http://localhost:3000)
bun run build      # build de produção (saída em .output/)
bun run preview    # pré-visualiza o build de produção
bun run cleanup    # remove .nuxt, .output e dist
```

## Antes de abrir um PR

Rode localmente os **mesmos checks da CI** (workflow
[`quality.yml`](../.github/workflows/quality.yml)) para evitar idas e vindas:

```sh
cd src
bun run quality:check:ci   # biome ci . (lint + format + checagens)
bun run all:typecheck      # tipos precisam passar
bun run all:test           # testes unitários/componente
bun run all:build          # tudo precisa buildar
bun run all:e2e            # testes end-to-end (precisa do browser instalado)
reuse lint                 # arquivos cobertos por licença (SPDX/REUSE)
```

Se algum arquivo novo não estiver coberto, ajuste o cabeçalho SPDX do arquivo ou o
[`REUSE.toml`](../REUSE.toml).

## Convenções

- **Lint/format:** Biome (config em [`src/biome.json`](../src/biome.json)).
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/)
  (`feat:`, `fix:`, `docs:`, `chore:`…).
- **Licença:** todo arquivo precisa de cabeçalho/cobertura SPDX — veja
  [REUSE.toml](../REUSE.toml).
- **i18n:** textos de UI vão para `app/i18n/locales/` (`pt-BR` é o padrão).

## Dúvidas?

Veja o [SUPPORT.md](../SUPPORT.md) para os canais de ajuda.
