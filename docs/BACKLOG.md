<!--
Backlog de refinamento — pendências levantadas na auditoria de 2026-06-29.
Cada item tem: Estado · Por que importa · A debater · Decisão (preencher).
Status: [ ] aberto · [~] em debate · [x] decidido · [-] descartado
-->

# Backlog de refinamento

> Fluxo: debater e refinar cada item até o último. Preencher **Decisão** ao fechar.
>
> **Ordem de debate:** #1 ✓ → #6 → #7 → #8 → #9 → #10 → #11 → #12 → #13 → **(por último: #5 → #4 → #3 → #2)**.

## 🔴 Buracos reais

### [x] #1 — Ligar a UI ao domínio
- **Estado:** `index.vue → useCaderno.ts` usa seed em memória; nenhum componente consome `useCadernoService`. Toda a stack (serviço, storage cifrado, write-behind, plugins, hooks) está montada mas a UI não toca.
- **Por que importa:** sem isso, nada do que foi construído roda de verdade.
- **A debater:** reatividade (port observável/liveQuery vs refetch via hooks); escopo de telas; destino do seed.
- **Decisão:** **Reatividade = B (seam observável).** O write-behind store ganha `subscribe(listener)` Observable-shaped (sem dependência de RxJS), emitido no `commitBatch` com o conjunto de coleções alteradas (extensível a ids). No PWA, um composable `useLiveQuery(keys, run)` re-roda a query nas mudanças relevantes, com coalescing por microtask; emitir só no commit, não no drain.
  - **MVVM idiomático:** ViewModels = composables (View burra, adaptação DTO→view-model). Descartado C (duplica o overlay; dois donos da verdade) e A (refetch via hooks = invalidação parcial/manual, não pega escrita de plugin/seed/import/sync).
  - **Hooks de domínio** permanecem para reações de negócio, **não** para invalidação de cache.
  - **RxJS reservado** para a futura camada de sync/federação (merge local+remoto, retry/backoff de rede); não entra no core nem no PWA agora. O seam fica Observable-shaped (e pode expor `[Symbol.observable]`) para upgrade barato depois.
  - **Aberto (decidir na implementação):** destino do seed — descartar (UI começa vazia + `EmptyState`) vs converter em seed real via `service.createSubject(...)` na 1ª execução.

### [x] #2 — CI cobrir todos os pacotes
- **Estado:** `all:test`/`all:typecheck` listavam só pwa+core na mão.
- **Decisão:** trocar a lista explícita por **`nx run-many -t <target>`** (auto-inclui qualquer pacote, manutenção zero). `affected` fica pra quando o CI incomodar.
- **Implementado** (root `package.json`, targets `all:*`): `all:typecheck`/`all:test`/`all:coverage` → `nx run-many -t …`; `all:build`/`all:e2e` → `run-many` também (só pwa tem esses targets, mas future-proof).
- **Verificado:** `bun run all:test` e `all:typecheck` agora rodam **6 projetos** (core, validation, adapter-dexie/browser/crypto, pwa) — ambos **PASS**. O workflow não muda (já chama `bun run all:*`).
- **e2e:** `pwa:e2e` usa `playwright test --pass-with-no-tests` → não quebra; e2e real vem com #12.

### [ ] #3 — Docs desatualizados
- **Estado:** `ARCHITECTURE.md` e `CORE-ROADMAP.md` não mencionam crypto, encrypted store, write-behind, split de storage, ports async. Sem doc de DI/plugins/hooks.
- **Por que importa:** a fonte de verdade diverge do código.
- **A debater:** atualizar docs existentes vs novo ADR/decision-log; granularidade.
- **Decisão:** _(pendente)_

### [ ] #4 — Oplog sem leitor
- **Estado:** serviço gera oplog append-only; nada consome (sem sync/replay/backup que use).
- **Por que importa:** custo de manutenção sem valor até existir um consumidor.
- **A debater:** manter como seam de futuro vs ligar a backup/undo agora vs remover.
- **Decisão:** _(pendente)_

### [ ] #5 — Estado de git solto
- **Estado:** 117 deletions (zod) + ~50 arquivos novos misturados (`A`/`??`), nada commitado.
- **Por que importa:** sem commit coerente, difícil revisar/reverter.
- **A debater:** estratégia de commits (um grande vs fatiado por camada/feature); quando.
- **Decisão:** _(pendente)_

## 🟡 Pedidos parcialmente atendidos

### [x] #6 — Cipher backed por libsodium 0.8
- **Estado:** pedido era libsodium-wasm; eu havia trocado por @noble/ciphers porque o `libsodium-wrappers` 0.7.x tinha bug de empacotamento ESM.
- **Decisão:** **voltar para `libsodium-wrappers@^0.8.4`** — a 0.8 corrigiu o ESM (verificado: round-trip no Node puro + **build do PWA no Vite passa**). Adapter usa `crypto_secretbox` (XSalsa20-Poly1305) com nonce aleatório por mensagem. `@noble/ciphers` removido (0 refs no lock).
  - Porta `Cipher` segue **async**; o adapter faz `await sodium.ready` internamente (memoizado) e cacheia a chave decodificada por instância.
  - **Bônus para #7:** libsodium 0.8 traz `crypto_pwhash` (**Argon2id**) — cobre o KDF de senha sem dependência extra.
  - Nome do pacote segue `@meu-caderno/adapter-crypto` (agnóstico de impl). WebCrypto (AES-GCM) fica registrado como alternativa zero-dep, mas descartado por não ter Argon2.

### [x] #7 — Chave de cripto: modelo envelope (DEK + KEK-Argon2id)
- **Estado:** chave em `localStorage` texto puro (o "temporário"). Sem `passphraseKeyStore`, sem rotação.
- **Decisão:** **modelo envelope (2 camadas):**
  - **DEK** (Data Encryption Key) aleatória de 32 bytes criptografa os dados — é a chave que o `Cipher` (secretbox) já usa hoje.
  - Senha → **KEK** via **Argon2id** (`crypto_pwhash` do libsodium 0.8) criptografa **só a DEK**.
  - Persistir o **envelope** (não-secreto): `{ version, salt, argon2:{opslimit,memlimit,alg}, nonce, wrappedDek }` no **IndexedDB (ConfigStore)**, não no `localStorage`.
  - **Trocar senha = re-cifrar só a DEK** (unwrap com KEK antiga → wrap com KEK nova); barato. **Modo sem senha = DEK em claro** (o `localStorageKeyStore` atual).
  - **Forma no código:** novo `envelopeKeyStore({ password, storage })` que **implementa a porta `KeyStore` existente** (`load` desembrulha a DEK; `load→null` faz o `loadOrCreateCipher` gerar a DEK e o `save` embrulhar; senha errada → MAC falha → erro distinguível). Troca de senha = método à parte `rewrap(old,new)`.
  - **Quando:** desenhar a peça agora, **plugar na UI depois** (onboarding, atrelado a #1/#12); modo "sem senha" continua default.
  - **Modelo de ameaça (registrado):** sem senha = só contra inspeção casual do IndexedDB; com senha = repouso real, mas a **DEK fica em memória durante a sessão** (necessária pro write-behind/leitura) → **XSS fora de escopo no MVP**.
  - **Aberto (impl):** parâmetros do Argon2 (INTERACTIVE vs MODERATE — provável MODERATE com fallback mobile).

### [x] #8 — "Storage de contexto como plugin"
- **Estado:** virou `StorageProvider` dedicado (resolvido antes dos plugins), não via `Plugin.setup`.
- **Decisão:** **(c) — manter o `StorageProvider` dedicado (fundacional, resolvido na fase 0) e registrar o `manifest` dele no `CapabilityRegistry`**, para o storage aparecer como capability visível (mesmo vocabulário `impact`/`origin` dos plugins) sem a fragilidade de ordem do "storage como `Plugin.setup`". Ver também #14 (revisão do modelo de storage / future-proof).

### [x] #9 — Durabilidade: write-through local (não mais write-behind)
- **Estado:** janela de perda se a aba morrer antes do flush; sem modo "await persist".
- **Tensão:** ack instantâneo ⟺ durável são mutuamente exclusivos (durável = tocou o disco). Reframe: **deferir é problema de REMOTO**; escrita local (IndexedDB + secretbox) é rápida e durável.
- **Decisão: (A) write-through local.** O ack só acontece **após o commit durável** no encrypted Dexie. **Zero perda local** (provado no teste: o inner tem o dado sem nenhum flush).
  - `createWriteBehindStore` → **`createObservableStore`** (write-through + observable seam). Removidos `flush`/`pending`/`onError`/fila/overlay.
  - **Overlay removido** (não é mais necessário p/ correção); um read-cache vira **otimização futura opcional** (o `liveQuery` memoiza no ViewModel).
  - **Entrega o lado-store do #1:** `store.subscribe(listener)` emite o conjunto de coleções tocadas **após o commit** (e **não** emite em rollback). Falta só o `useLiveQuery` + UI (#1/#12).
  - **Deferral fica reservado pro remoto (#14):** cache local durável + outbox/oplog como fila de push.
  - **PWA:** removidos os handlers de `flush` em `visibilitychange`/`pagehide` (não há mais pendência em RAM).

## 🟠 Roadmap diz "NOW" mas não foi feito

### [x] #10 — Invariantes de escrita
- **Estado:** só FK básico no serviço.
- **Decisão:** **(i) funil único** (escrita só via use-case) + **plugin read-only**; **camadas D2** (funções puras no engine + use-case autoritativo + Zod refine de boundary); **tudo NOW**; **soft = avisar / hard = bloquear**.
- **Implementado:**
  - **`engine/invariants.ts` (puro, testado):** `weightTotal`/`weightsBalanced` (soft), `overlappingTerms` (soft), `createsCycle` (hard). Exportado no barrel → diagnósticos prontos pra UI.
  - **Hard nos use-cases:** FK em `createSubject` (context) e `upsertActivity` (context+subject); **ciclo** em `upsertActivity` via `preparesId` (`createsCycle`); **cascata** em `deleteSubject` (records **+ activities**). Erros: `INVARIANT_FK_MISSING`/`INVARIANT_CYCLE`.
  - **Plugin read-only:** novo `ReadonlyContextStore`/`ReadonlyRepository` no domínio; `PluginContext.store` agora é read-only (plugin escreve só pelo `service`). Mudança só de tipo (estrutural).
  - **Soft = avisar:** Σpesos/termos **não** são gate de escrita — são **diagnósticos puros** que a UI lê (`weightsBalanced`/`overlappingTerms`) e mostra como aviso, sem bloquear.
- **Pendente (wire quando existir o consumidor):** ciclo de `Edge PREPARES`/`Node.parentId` (precisa de use-cases de grafo, parte do #12); Zod `.superRefine` de boundary no `validation`; surfacing dos avisos soft na UI (#1/#12).

### [x] #11 — Boundary enforcement
- **Estado:** pureza garantida só por `purity.spec.ts` (lê arquivos), em test-time, só `domain`.
- **Decisão: (a) Biome `noRestrictedImports` via `overrides`** (lint-time, ferramenta existente; sem segundo linter). Rejeitado Nx-ESLint (2º linter); dependency-cruiser **DEFER** (só se quisermos grafo/órfãos/visualização).
- **Implementado** (3 overrides em `biome.json`, grupo `style`):
  - **`**/core/src/domain/**`** → proíbe zod/dexie/vue/hookable/decimal.js/rrule/date-fns/uuid/fake-indexeddb/`@meu-caderno/*` + imports "pra fora" (`../engine`, `../application`).
  - **`**/core/src/engine/**`** → proíbe persistência/UI + `@meu-caderno/adapter-*`/`validation` + `../application`.
  - **resto de `core`** (`**/core/src/**` menos domain/engine) → proíbe `@meu-caderno/adapter-*`/`validation`/vue/dexie.
  - **`purity.spec.ts` mantido** só para `Date.now`/`Math.random` (Biome não pega — não é import).
- **Verificado:** `biome ci` verde (zero violação atual); violações plantadas (domain→dexie, engine→application) **bloqueadas** no lint.
- **Extensível:** regras p/ adapters não se importarem entre si ficam fáceis de adicionar depois.

### [~] #12 — Telas do MVP (épico) — PLANEJADO
- **Decisões (interview):** escopo = **MVP completo** (Home + presença + matéria + atividades + notas + **Caderno** + **Ajustes**); 1ª execução = **vazio + onboarding**; **multi-contexto** com seletor; **sem senha** por padrão (envelopeKeyStore pluga depois); **Caderno = grafo completo** (árvore + `PREPARES` + guarda de ciclo); **design importado do claude_design** (`97eadd65…` via DesignSync); **export/import (backup) incluído** nos Ajustes.
- **Núcleo a adicionar (application):** `createContext`/`updateContext` + **contexto ativo** no `ConfigStore` (`setActiveContext`); grafo do caderno (`createNode`/`updateNode`/`moveNode` + `linkNodes` com `createsCycle` — fecha a cauda de grafo do #10); `completeActivity`/`reopenActivity`; `addAssessment` (+`setGrade`) com aviso soft de Σpesos. Caudas: **#8** (registrar manifest), **#15** (normalizar `Subject.records?`→view).
- **Reatividade:** `useLiveQuery` (Vue-nativo, decisão #1) sobre `store.subscribe`; ViewModels (composables) por tela; reescrever `useCaderno` mantendo `deriveStats`/`statusFromSummary`; `clock` real.
- **Fases (cada uma verde):**
  - **F0 — Fundação:** `useLiveQuery` + `createContext`/`setActiveContext` + #8 + #15 (core, sem UI).
  - **F1 — Onboarding + switcher + Home religada.**
  - **F2 — Matéria + presença.**
  - **F3 — Atividades + notas.**
  - **F4 — Caderno (grafo: nós + links `PREPARES` + ciclo).**
  - **F5 — Ajustes + export/import (backup).**
- **Design:** importar telas do projeto claude_design via **DesignSync** nas fases de UI (pode exigir `/design-login`).

## 🟢 DEFER consciente (confirmar que seguem adiados)

### [ ] #13 — Bucket de adiados
- Schema follow-ups (lateIsHalf, medicalExcuses, recurrence until/count, feriados, ROTATING_CYCLE/BLOCK_INTENSIVE, backup v3); federação/sync; CRDT; mutation testing; plugin de exemplo real (`plugins: []`).
- **A debater:** algum deve subir para NOW?
- **Decisão:** _(pendente)_

## 🧭 Transversais (arquitetura)

### [x] #14 — Revisão do modelo de storage (future-proof)
- **Modelo travado:** dois domínios — **`ConfigStore`** (perfil/prefs/envelope da chave, local-first) e **`ContextStore`** (dados de estudo). O `ContextStore` é uma **pilha de decorators**: `Dexie/BlobStore` (cache local durável) → `encrypted` (repouso) → `write-behind` (otimista + fila + observable seam) → **[futuro] sync engine**.
- **Remoto = cache local + sync atrás da MESMA porta `ContextStore`** (transparente pro serviço/UI). O boundary novo é a porta **`SyncTransport`** (rede), não o `ContextStore`. A "versão local" é a camada de cache [1] do provider remoto.
- **`oplog`** = journal de mudanças (substrato de push). O **observable seam (#1)** é **dual-use**: dispara a UI *e* avisa o sync engine que há ops sujas; aplicar ops remotas = escrever no store → emite mudança → UI atualiza pelo mesmo seam.
- **Feito agora (seams baratos):**
  1. **`StorageProvider.createContextStore()` é async** (`Promise<ContextStore>`) → consistência com "tudo async" e destrava init remoto (conectar/hidratar/desembrulhar). `createCaderno` virou **async**.
  2. **Porta `SyncTransport` reservada** em `domain/sync.ts` (`RemoteChange`, `SyncCursor`, `SyncPull`, `SyncState`, `SyncTransport`) — não exportada do barrel (convenção "reservado", como `future.ts`).
- **Adiado (DEFER #13), com seams já no lugar:** a sync engine; cursor monotônico/HLC no `oplog` (hoje `since(ts)`/`forId` + `++seq` no Dexie); CRDT/merge; `ConfigStore` remoto.

### [ ] #15 — Disciplina de dados derivados (view vs materialized)
- **Princípio:** fonte normalizada (FK por id); agregado dono de VOs; **derivado = selector puro (view)**; **materialized view (cache)** só se quente/caro, **reconstruível**, invalidado pelo observable seam. **Nunca guardar derivado como fonte.**
- **Smell concreto:** `Subject.records?` é embutido **mas** a fonte é a coleção `records` (o serviço grava lá). Deveria virar **view** (`recordsOf = records.where(subjectId)`).
- **Decisão:** princípio aceito. **Normalizar `Subject.records?` → view** é o passo pequeno NOW (resto adiado). _(implementação pendente)_

### [ ] #16 — Notebook cifrado escalável (ÉPICO, DEFER — só quando o notebook crescer)
- **Problema real (presente quando há muitas notas):** o full-blob encrypted store faz `decrypt-all` por query na main thread → trava. MVP1 segue com full-blob (notebook pequeno).
- **Design decidido (não implementado):**
  - **Índice cifrado + conteúdo lazy:** um índice salvo como blob **cifrado**; decifra 1× ao abrir → resumos + ponteiros na RAM; corpo de cada nota é blob cifrado decifrado só ao abrir. Índice = **materialized view reconstruível** → persistência **eventual/debounced** (≠ write-through do #9).
  - **Lib pronta:** **Orama** (ou MiniSearch) atrás de uma porta **`SearchIndex`**; `serialize → cipher.encrypt → blob`; full-text **escopado ao contexto ativo** (índice por contexto = pequeno); PT stemmer; build inicial no **Web Worker**; nav-index (barato, sempre) separado do full-text (caro, esquenta).
  - **Partição por contexto (sharding):** `StorageProvider.openContext(contextId)`; DEK/cursor por contexto; alinha com federação (`future.ts`).
  - **Escala extrema / estrutura cifrada:** árvore de manifestos cifrada content-addressed ("mapa → mapas") **ou** **SQLCipher-WASM + FTS5** (banco cifrado com índice em disco, sem decrypt-all) atrás do mesmo `StorageProvider`.
- **Seams já reservados:** observable seam (#1), `StorageProvider` async + `SyncTransport` (#14), porta `Cipher` (#6/#7). Falta reservar (quando entrar): `SearchIndex`, `openContext`, ponteiro de manifesto.

---

### Saúde atual (verde, sem ação)
0 TODO/FIXME no código · 0 refs dangling ao zod · libsodium fora do lockfile · REUSE cobre os novos arquivos · `nx` enxerga `adapter-crypto`.
