<!--
SPDX-FileCopyrightText: 2026 Gabriel Rodrigues Antunes <gabrielrodantunes@gmail.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Arquitetura

Este documento dá uma visão geral de como o Caderno é organizado. Para rodar e
desenvolver, veja o [DEVELOPMENT.md](./DEVELOPMENT.md).

## Visão geral

O Caderno é um aplicativo **local-first**: ele funciona offline e os dados moram
no dispositivo do usuário. Hoje é entregue como uma **PWA** (Progressive Web App)
estática, sem servidor obrigatório. Sincronização, quando existir, será um recurso
**opcional** — essa decisão está ancorada na [Constituição](../CONSTITUTION.md).

## Monorepo

O código-fonte vive em [`src/`](../src), um monorepo gerenciado por:

- **[Bun](https://bun.sh)** — runtime e gerenciador de pacotes (workspaces).
- **[Nx](https://nx.dev)** — orquestração de tarefas (build, lint, etc.).
- **[Biome](https://biomejs.dev)** — lint e formatação (`biome check` / `biome ci`).

Estrutura dos workspaces (definida em [`src/package.json`](../src/package.json)):

```
src/
├── package.json          # raiz do workspace; scripts de qualidade/build
├── nx.json               # config do Nx (packageManager: bun)
├── biome.json            # regras de lint/format
├── bunfig.toml           # config do Bun
└── pkgs/
    ├── core/             # @meu-caderno/core  — domínio, sem UI
    └── apps/
        └── pwa/          # @meu-caderno/apps.pwa — aplicação Nuxt (PWA)
```

## Pacotes

### `@meu-caderno/core` ([`src/pkgs/core`](../src/pkgs/core))

O **núcleo de domínio**, independente de interface. Define os tipos e esquemas do
Caderno usando [Zod](https://zod.dev) para validação. Organizado por área do
domínio em `src/types/`, por exemplo:

- `subject/` — disciplinas: horários, turnos, presença, avaliações, registros.
- `activity/` — atividades: status, recorrência, subtarefas.
- `context/` — contexto de estudo: metas, módulos, termos, vocabulário, buckets.
- `library/` — itens de biblioteca/material de estudo.

Manter o domínio separado da UI permite reaproveitá-lo no futuro (por exemplo, em
uma eventual camada de sincronização) sem acoplar regras de negócio à camada de
apresentação.

### `@meu-caderno/apps.pwa` ([`src/pkgs/apps/pwa`](../src/pkgs/apps/pwa))

A **aplicação** que o usuário usa, construída com
**[Nuxt](https://nuxt.com)** + **Vue 3**. Configuração relevante em
[`nuxt.config.ts`](../src/pkgs/apps/pwa/nuxt.config.ts):

- `ssr: false` + `nitro.preset: "static"` — gera um site estático (sem servidor),
  coerente com o modelo local-first.
- **PWA** via `@vite-pwa/nuxt` — instalável e com suporte offline.
- **i18n** via `@nuxtjs/i18n` — idioma padrão `pt-BR`, com `en` disponível
  (`app/i18n/locales/`).
- Outros módulos: `@nuxt/image`, `@nuxt/icon`, `@nuxt/a11y`, `@nuxt/hints`,
  `@nuxtjs/color-mode`, `@vueuse/nuxt`.
- Dados/assíncrono: `@tanstack/vue-query`.
- UI: componentes próprios (`app/components/`) sobre `reka-ui`.

Estrutura do app em `app/`:

```
app/
├── app.vue               # raiz da aplicação
├── pages/                # rotas (vue-router)
├── components/           # componentes de UI
└── plugins/              # plugins Nuxt (ex.: vue-query)
```

## Build e deploy

- **Build:** `nuxt build` (via Nx) gera a saída estática em `.output/`.
- **Deploy:** publicado no **GitHub Pages** pelo workflow
  [`deploy.yml`](../.github/workflows/deploy.yml), com **build attestation
  (SLSA)** para proveniência verificável dos artefatos.

## Qualidade e segurança

- **CI de qualidade** ([`quality.yml`](../.github/workflows/quality.yml)):
  lint + format + typecheck (`biome ci`), build de tudo e `reuse lint`.
- **Segurança automatizada**: CodeQL, Dependabot, zizmor e actionlint — detalhes
  no [SECURITY.md](../SECURITY.md).

## Princípios que moldam a arquitetura

As escolhas acima não são acidentais — elas seguem a
[Constituição](../CONSTITUTION.md):

- **Local-first / offline** → app estático, dados no dispositivo, sync opcional.
- **Sem lock-in** → exportação/importação como recurso de primeira classe.
- **Dados do usuário** → o domínio (core) é desacoplado e portável.
