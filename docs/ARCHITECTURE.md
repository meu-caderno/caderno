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
├── biome.json            # regras de lint/format + boundary enforcement
├── bunfig.toml           # config do Bun
└── pkgs/
    ├── core/             # @meu-caderno/core — domínio puro (sem UI, Zod, Dexie ou cripto)
    ├── validation/       # @meu-caderno/validation — schemas Zod conformes ao domínio
    ├── adapters/
    │   ├── platform-browser/   # @meu-caderno/adapter-browser — Clock, IdGenerator, KeyStore
    │   ├── persistence-dexie/  # @meu-caderno/adapter-dexie — ContextStore/ConfigStore/BlobStore (IndexedDB)
    │   └── crypto/             # @meu-caderno/adapter-crypto — Cipher (libsodium / XSalsa20-Poly1305)
    └── apps/
        └── pwa/          # @meu-caderno/apps.pwa — aplicação Nuxt (PWA) + composition root
```

## Pacotes

A organização segue **DDD + Ports & Adapters + Clean Architecture**: o domínio é
puro e declara *ports* (interfaces); as implementações de serviços externos vivem em
pacotes separados que dependem do core, nunca o contrário. **Todos os ports são
assíncronos** (`Promise`), para uma fronteira uniforme que acomoda IndexedDB,
WebCrypto/wasm e — no futuro — rede, sem mudar a assinatura.

### `@meu-caderno/core` ([`src/pkgs/core`](../src/pkgs/core))

O **núcleo de domínio**, em TypeScript puro — **sem dependência de Zod, Dexie, Vue
ou libs de criptografia** (garantido por boundary enforcement no lint; ver abaixo).
Camadas internas:

- `domain/` — entidades e value objects (interfaces + enums + brands) e os *ports*
  de saída, todos assíncronos: `Clock`, `IdGenerator`, `Cipher`/`KeyStore`,
  `ConfigStore`/`ContextStore`/`StorageProvider` (+ `ReadonlyContextStore`),
  `BlobStore`, e a porta reservada `SyncTransport` (sync futuro).
- `engine/` — *domain services* puros: faltas (com simulador), notas, agenda
  (`schedule`/`rollcall`), atividades, progresso, presets, grafo do caderno,
  `merge` (import), `undo`, `oplog` e `invariants` (Σpesos, sobreposição de termos,
  detecção de ciclo). Precisão numérica via `decimal.js`.
- `application/` — casos de uso (`CadernoService`) com `Result`/`DomainError`; o
  composition root (`createCaderno`, injeção de dependência); o **observable store**
  (write-through) e o **encrypted store**; sistema de **plugins** (capability
  registry + consentimento por impacto) e **hooks** (event bus tipado).
- `testing/` (subpath `@meu-caderno/core/testing`) — stores in-memory, fakes de
  clock/id/cipher e o `runStoreContract` que todo adapter de store deve passar.

### `@meu-caderno/validation` ([`src/pkgs/validation`](../src/pkgs/validation))

Os **schemas [Zod](https://zod.dev)** que *conformam* às interfaces do domínio (com
testes de conformância em tempo de compilação) e validam dados nas fronteiras
(`parseBackup`/`migrateBackup`). Zod é detalhe de implementação — fica aqui, fora do core.

### Adapters ([`src/pkgs/adapters`](../src/pkgs/adapters))

Implementações concretas dos ports do domínio, trocáveis sem tocar o núcleo:

- **`adapter-dexie`** — `ContextStore`, `ConfigStore` e `BlobStore` sobre
  IndexedDB/Dexie, e os `StorageProvider` (incl. o cifrado, montado sobre o `BlobStore`).
- **`adapter-browser`** — `Clock` (via `Intl`), `IdGenerator` (UUID v7) e `KeyStore`
  (chave local).
- **`adapter-crypto`** — a porta `Cipher` via **libsodium** (`crypto_secretbox`,
  XSalsa20-Poly1305) com nonce aleatório por mensagem.

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
- UI: componentes próprios (`app/components/`) sobre `reka-ui`.

O **composition root** vive em `app/plugins/caderno.client.ts`: monta o `Caderno`
via `createCaderno(...)`, injetando o `ConfigStore` (Dexie) + o `StorageProvider`
cifrado (Dexie `BlobStore` + `Cipher` libsodium) + `Clock`/`IdGenerator`/`KeyStore`
do browser. A reatividade da UI usa o *observable seam* do store (`subscribe`) — a
integração dos componentes (ViewModels via composables) está em andamento.

## Camada de dados: storage, criptografia e reatividade

O dado de estudo é gravado atrás de uma única porta (`ContextStore`), composta como
uma **pilha de decorators**:

1. **Persistência local** (`adapter-dexie`) — `BlobStore` sobre IndexedDB, durável.
2. **Criptografia em repouso** (`encrypted store` + `Cipher`) — cada entidade é
   serializada e cifrada; a chave de dados (DEK) é simétrica e local (modo "sem
   senha"), com evolução prevista para DEK protegida por senha (KEK via **Argon2id**,
   modelo envelope).
3. **Observable write-through** — a escrita só confirma **após** o commit durável
   (zero perda local); o store emite as coleções alteradas (`subscribe`), que
   alimentam a reatividade da UI e, no futuro, o motor de sincronização.

Configuração/perfil ficam em um storage **separado** (`ConfigStore`). Um storage
**remoto** futuro entra como outro `StorageProvider` (cache local + sync) atrás da
mesma porta — o boundary de rede é a porta reservada `SyncTransport`, e o `oplog`
append-only é o substrato de push.

Invariantes de escrita (FK, ciclo em `prepares`, cascata) são impostos no funil único
dos casos de uso (`CadernoService`); plugins recebem o store **read-only** e mutam só
via serviço. Regras "soft" (Σpesos, termos) são diagnósticos puros que a UI exibe como
aviso, sem bloquear.

## Build e deploy

- **Build:** `nuxt build` (via Nx) gera a saída estática em `.output/`.
- **Deploy:** publicado no **GitHub Pages** pelo workflow
  [`deploy.yml`](../.github/workflows/deploy.yml), com **build attestation
  (SLSA)** para proveniência verificável dos artefatos.

## Qualidade e segurança

- **CI de qualidade** ([`quality.yml`](../.github/workflows/quality.yml)):
  `biome ci` (lint + format), **typecheck e testes de todos os pacotes**
  (`nx run-many`), build e `reuse lint`.
- **Boundary enforcement**: o [`biome.json`](../src/biome.json) barra no lint imports
  proibidos por camada (`domain` puro, `engine` sem `application`, `core` sem
  adapters/validation/UI); `domain/purity.spec.ts` garante ausência de
  `Date.now`/`Math.random` no domínio.
- **Segurança automatizada**: CodeQL, Dependabot, zizmor e actionlint — detalhes
  no [SECURITY.md](../SECURITY.md).

## Princípios que moldam a arquitetura

As escolhas acima não são acidentais — elas seguem a
[Constituição](../CONSTITUTION.md):

- **Local-first / offline** → app estático, dados no dispositivo, sync opcional.
- **Sem lock-in** → exportação/importação como recurso de primeira classe.
- **Dados do usuário** → o domínio (core) é desacoplado e portável; criptografia em
  repouso por padrão.
