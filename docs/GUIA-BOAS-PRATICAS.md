# Guia de boas práticas de código — Caderno (`@meu-caderno/*`)

> Régua de **correção e refatoração** para todo o repositório. Inspirado em SonarQube (bugs,
> vulnerabilidades, _code smells_, complexidade cognitiva, duplicação), Clean Code e componentização —
> mas **calibrado ao que este repo já é e já impõe**.
>
> Para o **processo** de contribuição (issues, fluxo de PR, commits, ambiente), veja
> [CONTRIBUTING.md](../CONTRIBUTING.md). Este documento é sobre **como escrever o código**.

---

## 1. Como usar este guia

- É um **catálogo de referência**: consulte a categoria do problema, veja `❌ ruim` / `✅ bom`, aplique a
  correção. Use em revisões de PR e antes de abrir refatorações.
- Cada regra diz **quem a pega**: `[Biome]`, `[tsc]`, `[purity.spec]`, `[teste]` ou `[convenção]`
  (não automatizada — depende de você e da revisão).
- Hierarquia de autoridade: **`CONSTITUTION.md` (raiz) > `docs/ARCHITECTURE.md` > `docs/DECISIONS.md` >
  este guia**. Se algo aqui conflitar com a Constituição, a Constituição ganha.
- Não duplica os docs: a Constituição diz **o quê/por quê**; este guia diz **como escrever o código**.

> Nota de docs: `CONSTITUTION.md` está na **raiz** (não em `docs/`). O log de decisões é
> `docs/DECISIONS.md` (não existe `BACKLOG.md`). Há também `docs/DEVELOPMENT.md`.

---

## 2. Princípios

1. **Dependências apontam para dentro.** `apps → adapters/validation → core`; dentro do core
   `application → engine → domain`. Camada interna **nunca** importa externa.
2. **Domínio puro e determinístico.** `domain/` e `engine/` não tocam infra (zod/dexie/vue/crypto) nem
   fontes de não-determinismo (`Date.now`, `Math.random`). Tempo e ids são **injetados** (`Clock`,
   `IdGenerator`).
3. **Reversibilidade é mandato da Constituição.** Antes de qualquer ação que pese, pergunte: **"dá pra
   desfazer isso?"** Se não dá, o design está errado. Toda mutação passa pelo funil único e é registrada
   no _oplog_; ações de UI oferecem **desfazer**.
4. **Erro é dado, não texto.** O domínio retorna `Result<T, DomainError>` com `DomainErrorCode` + `params`;
   a tradução para humano é da UI (i18n). Nunca acople string de mensagem ao domínio.
5. **Funcional, não OO.** Entidades são `interface` de dados; comportamento vive em **funções puras** do
   engine. Sem classe-por-caso-de-uso, sem lógica de negócio vazando para componentes/composables.
6. **Nomes limpos, baixa complexidade, componentizar ao máximo.** Função/clausula curta, nome descritivo,
   uma responsabilidade. Telas viram seções em `Section/<Tela>/`.

---

## 3. Arquitetura e fronteiras (o que o lint já impõe)

```
            ┌───────────────────────────── apps/pwa (composition root) ─────────────────────────────┐
            │  conhece TODOS os concretos; injeta adapters; UI sobre reka-ui                          │
            └───────────────┬───────────────────────────────┬───────────────────────────────────────┘
                            │                                │
                    @meu-caderno/validation          @meu-caderno/adapter-*
                       (zod conforma ao core)        (dexie, crypto, browser)
                            │                                │
                            └──────────────┬─────────────────┘
                                           ▼
                                   @meu-caderno/core
                          application → engine → domain   (sempre para dentro)
```

**Tabela de fronteiras** (imposta por `noRestrictedImports` em `src/biome.json`):

| Camada | NÃO pode importar | Mensagem do lint |
| --- | --- | --- |
| `core/src/domain/**` | `zod, dexie, vue, hookable, decimal.js, rrule, date-fns, uuid, fake-indexeddb, @meu-caderno/*, ../engine*, ../application*` | _"domain deve ser puro"_ |
| `core/src/engine/**` | `zod, dexie, vue, hookable, @meu-caderno/adapter-*, @meu-caderno/validation, ../application*` | _"engine não depende de application/persistência/UI"_ |
| `core/src/**` (fora domain/engine) | `@meu-caderno/adapter-*, @meu-caderno/validation, vue, dexie` | _"core não depende de adapters/validation/UI"_ |

Além do lint, **`pkgs/core/src/domain/purity.spec.ts`** é uma guarda executável: lê todo `.ts` de
`domain/` e falha se encontrar import proibido **ou** `Date.now`/`Math.random`. `[Biome]` pega os imports;
`[purity.spec]` pega também o não-determinismo (que o Biome não vê).

**Regra prática:** se você precisa de uma lib (data, decimal, dexie, vue) dentro de `domain/` ou `engine/`,
**o desenho está errado** — mova o cálculo para o engine recebendo valores prontos, ou injete uma porta.

---

## 4. Catálogo de _code smells_

Cada item: **definição → por que dói → ❌/✅ → como refatorar → quem pega**.

### 4.1 Complexidade cognitiva `[convenção]`
Alvo: funções rasas e curtas. Evite aninhamento profundo, `if/else` longos, ternário encadeado, condições
compostas ilegíveis. _(Não imposto hoje pelo Biome — ver §8.)_

```ts
// ❌ aninhamento + condição composta ilegível
function weight(status, rule) {
  if (status === ABSENT) { return 1; } else {
    if (status === LATE) { if (rule.lateIsHalf ?? true) { return 0.5 } else { return 0 } }
    else { if (status === MEDICAL || status === WAIVED) { return (rule.medicalExcuses ?? true) ? 0 : 1 } else { return 0 } }
  }
}

// ✅ guard clauses, retorno cedo, sem else
function absenceWeight(status: AttendanceStatus, rule: AbsenceRule = {}): number {
  if (status === AttendanceStatus.ABSENT) return 1;
  if (status === AttendanceStatus.LATE) return (rule.lateIsHalf ?? true) ? LATE_WEIGHT : 0;
  if (status === AttendanceStatus.MEDICAL || status === AttendanceStatus.WAIVED) {
    return (rule.medicalExcuses ?? true) ? 0 : 1;
  }
  return 0;
}
```
**Como refatorar:** _guard clauses_; extrair sub-função nomeada; mapa/objeto no lugar de `switch` longo;
inverter condição para sair cedo.

### 4.2 Duplicação `[convenção]`
Trecho repetido ≥ 2–3× = extraia. Duplicação espalha bugs e desvia comportamentos.

Casos reais neste repo (refatorar quando tocar):
- `async function persist(patch: Partial<Preferences>)` + `const PREF_ID = "default" as Id` repetidos em
  ~5–7 composables (`useTheme`, `useLayout`, `useConsent`, `useWorkbenches`, `usePomodoro`,
  `useActiveContext`, `useWelcomeBack`) → **extrair `usePreferences()`** com `read()`/`patch()`.
- `useLayout.ts`: `toggle*/move*/reorder*` triplicados por `{homeWidgets, tabItems, railItems}` →
  **parametrizar** por uma chave de lista.
- `useBackup.collect()`/`writeBackup()` enumeram 9 coleções à mão (lista paralela a
  `observable-store.ENTITY_KEYS` e `domain/storage.ts`) → **uma fonte única** de nomes de coleção.

```ts
// ✅ helper único reutilizado pelo service inteiro
const commitPut = async <T extends { id: Id }>(
  select: (tx: ContextTx) => Repository<T>, entity: EntityName, value: T,
): Promise<void> => {
  const ts = await clock.now();
  await store.transaction(async (tx) => {
    await select(tx).put(value);
    await tx.oplog.append(makeOp(entity, OpKind.PUT, value.id, ts));
  });
};
```

### 4.3 Funções/Componentes grandes (SRP) `[convenção]`
Uma unidade = uma responsabilidade. Componente longo, composable "deus" e página gorda escondem bugs.

Alvos reais: `pages/index.vue` (~304 l, ~12 flags de modal + `quickActions`), `composables/useCaderno.ts`
(~308 l, mistura presença/gamificação/atividades/roll/contexto), `Section/Home/SubjectCard.vue` (317),
`SubjectForm.vue` (284), `Section/Settings/LayoutCard.vue` (279).

**Como refatorar:**
- **Componentizar** em `Section/<Tela>/` (subseção = componente). Páginas só orquestram.
- Quebrar god-composable em composables focados (`useAttendanceStats`, `useGamification`, …).
- Boilerplate de card (13 `Section/Settings/*Card.vue` repetem `UICard` + cabeçalho `pt-hand` + `__sub`)
  → extrair `SectionSettingsCard`/cabeçalho reutilizável.

### 4.4 Nomes `[convenção]`
**Nomes sempre longos e descritivos — sem abreviação, sem uma-letra.** Nada de `ts`→`timestamp`,
`acc`→`accumulator`/`total`, `idx`→`index`, `el`→`element`, `cfg`→`config`, `msg`→`message`,
`prev`/`curr`→`previous`/`current`, `wd`→`weekdayLabels`. Vale para **tudo**, inclusive
parâmetros de `arrow`/predicado e contadores de loop: escreva `(record) =>`, `(activity) =>`,
`(subject) =>`, `for (const index of …)` — **nunca** `(r) =>`, `(a) =>`, `(s) =>`, `i`. Booleano com
`is/has/should/can`. Constante nomeada em vez de número/string mágica. Única exceção: `_` para argumento
deliberadamente ignorado.

```ts
// ❌                                          // ✅
const r = computeAttendance(s);                const summary = computeAttendance(subject);
records.filter((r) => r.subjectId === id);     records.filter((record) => record.subjectId === id);
items.map((a, i) => …);                         items.map((activity, index) => …);
if (x > 0.75) …                                 if (frequency >= DEFAULT_ATTENDANCE_FLOOR) …
```

### 4.5 Números e strings mágicas `[convenção]`
Todo literal com significado vira **constante nomeada e exportada** perto do domínio que a usa.

```ts
// ✅ engine/attendance.ts
export const CLASS_HOURS_PER_CREDIT = 15;
const LATE_WEIGHT = 0.5;
```

### 4.6 Tipos `[tsc]`
- **Sem `any`** (nem `as any`, nem `: any`). Use `unknown` + estreitamento, ou um tipo real.
- **Todo tipo de objeto é um alias NOMEADO** — `interface`/`type` com nome, nunca tipo anônimo inline em
  assinatura de função, retorno, `ref<…>`, parâmetro ou variável reutilizada. Dê nome à forma.
- **VOs com brand** para identificadores/valores: `Id`, `DayIso`, `Timestamp`, `Color`
  (`domain/values.ts`). `❌ const Grade = number` sem brand diverge dos irmãos — prefira branded em VOs.
- **`as` só na fronteira** (entrada externa, casts de IO). No miolo, modele o tipo certo.
- **Discriminated unions** > flags soltas (ex.: `Result` discrimina por `ok`).
- `strict: true` + `verbatimModuleSyntax` + `isolatedModules` já valem; respeite `import type`.

```ts
// ❌ tipo de objeto anônimo na assinatura/retorno
function triage(activity: Activity, patch: { contextId?: Id; kind: ActivityKind }): Activity { … }
const cursor = ref<{ x: number; y: number } | null>(null);

// ✅ alias nomeado
interface TriagePatch { contextId?: Id; subjectId?: Id; kind: ActivityKind; }
function triage(activity: Activity, patch: TriagePatch): Activity { … }
interface Point { x: number; y: number; }
const cursor = ref<Point | null>(null);
```

> Exceção pragmática: as **macros do Vue** `defineProps<{…}>()` / `defineEmits<{…}>()` são idiomaticamente
> inline — manter assim. O alvo da regra é tipo de objeto **reutilizável ou de domínio** em código TS.

### 4.7 Tratamento de erros `[convenção]`
Fluxo esperado (FK ausente, não encontrado, ciclo) → **`Result` + `DomainErrorCode`**, nunca `throw` de
string. `throw` só para _bug_ programático irrecuperável.

```ts
// ✅ application/caderno-service.ts
if (!(await store.contexts.get(input.contextId))) {
  return fail(DomainErrorCode.INVARIANT_FK_MISSING, { contextId: input.contextId }, EntityName.SUBJECT);
}
return ok(subject);
```

### 4.8 Efeitos colaterais e pureza `[purity.spec]` `[Biome]`
- `domain/`+`engine/` são **puros**: sem IO, sem `Date.now`/`Math.random`. Receba `now`/`id` por parâmetro
  ou injete `Clock`/`IdGenerator`.
- **Toda aritmética de domínio passa por `engine/math.ts`** (decimal.js): `import * as num` e use
  `num.add/multiply/divide/round/…`. Nunca `+`/`*` cru em números de domínio (precisão).
- No `application`, **resolva efeitos antes da transação** (`await ids.newId()`, `await clock.now()` antes
  de `store.transaction`).

### 4.9 Imutabilidade `[convenção]`
Não mute `props`, argumentos nem coleções compartilhadas. Retorne **novo** array/objeto.

```ts
// ✅ funções que retornam cópia (append-only / reorder)
export function appendOp(log: readonly OpLogEntry[], entry: OpLogEntry): OpLogEntry[] { return [...log, entry]; }
export function reorderByEdge<T>(items: readonly T[], …): T[] { const next = items.slice(); /* … */ return next; }
```

### 4.10 Comentários `[convenção]`
**Zero comentários.** Código autoexplicativo: extraia função nomeada em vez de comentar um bloco.
Única exceção: diretivas de ferramenta (`// biome-ignore lint/...: motivo`) — ex. o reset de
`prefers-reduced-motion`. Comentário que explica _o quê_ o código faz é _smell_ → renomeie/extraia.

### 4.11 Enums `[convenção]`
Enum **nativo** TS, valores `SCREAMING_SNAKE`, no `domain/`. `z.enum(X)` só na `@meu-caderno/validation`.
Enums **derivados** de cálculo (ex.: `AttendanceRiskLevel`) moram no **engine**, não no schema.

```ts
export enum AttendanceStatus { PRESENT = "PRESENT", ABSENT = "ABSENT", LATE = "LATE" /* … */ }
```

### 4.12 Acoplamento / DIP `[Biome]`
Dependa de **portas** (`Repository`, `StorageProvider`, `Cipher`, `Clock`), não de implementações. Só o
_composition root_ (`apps/pwa/plugins/caderno.client.ts`) conhece concretos. Plugins recebem
**`ReadonlyContextStore`** (escrita só via `service`).

### 4.13 Código morto / variável não usada `[Biome]`
`correctness.noUnusedVariables: error`. Apague export/braço/parâmetro sem uso. Sem "código comentado para
depois" (o git lembra).

### 4.14 Invariantes `[teste]` `[convenção]`
- **Funções puras de invariante** no engine (`engine/invariants.ts`: `createsCycle`, `weightsBalanced`,
  `overlappingTerms`). **Duras** (FK, ciclo, cascata) **bloqueiam** no use-case; **suaves** (Σpesos,
  sobreposição de período) são **diagnósticos** que a UI mostra como aviso — nunca travam.
- Toda mutação passa pelo **funil único** (`CadernoService`).

### 4.15 Async `[convenção]`
- **Todas as portas retornam `Promise`** (uniformiza IndexedDB / wasm-crypto / rede futura).
- Dentro de `store.transaction` do Dexie, mantenha os `await` **na zona** (só ops do Dexie; nada de
  `Promise` externa no meio) para não cair em `PrematureCommitError`.
- Sem `await` inútil; `Promise.all` para paralelizar leituras independentes.

### 4.16 Reatividade Vue `[convenção]`
- Derivados via **`computed`**, não `watch`. `watch`/`watchEffect` só para efeitos.
- **Não mute `props`.** Emita evento ou use `defineModel`.
- `v-if` (monta/desmonta) vs `v-show` (esconde) conforme custo. `:key` **estável** em listas.
- Reatividade de dados de domínio = **`useLiveQuery`** (seam observável). Não consulte o store "na mão"
  dentro do componente.

### 4.17 CSS e tokens `[convenção]`
- Use os tokens `--pt-*`; **sem cor/raio/sombra hardcoded** fora deles.
- Tamanho de fonte com escala: `font-size: calc(Npx * var(--pt-text-scale))`. Espaçamento de tela com
  `var(--pt-density)`. Sem `font-size` em px cru novo.
- `<style scoped>` sempre; classes BEM-ish por componente.

### 4.18 Acessibilidade `[convenção]`
`aria-label` em ícones/botões sem texto; foco visível (`:focus-visible`); alternativa de **teclado** para
interações de ponteiro (ex.: o DnD mantém `↑/↓`). Há `@nuxt/a11y` no projeto — respeite os avisos.

### 4.19 Segurança e dados `[convenção]`
- **Cripto em repouso** (libsodium DEK) é o caminho do dado de contexto; backup pode ser exportado
  **cifrado**. Nada de segredo/credencial hardcoded; sem `eval`/`new Function`.
- Todo arquivo novo entra na cobertura **REUSE** (`reuse lint`): `.ts/.vue/.css/.json` → `AGPL-3.0-or-later`,
  assets → `CC-BY-SA-4.0` (os globs da `REUSE.toml` já cobrem; não invente header divergente).

---

## 5. Checklists por camada

**`domain/`** — só `interface`/`enum`/portas; sem libs; sem `Date.now`/`Math.random`; VOs branded; enums
SCREAMING_SNAKE. `[purity.spec]` `[Biome]`

**`engine/`** — funções puras + `*.spec.ts`; aritmética via `math.ts`; enums derivados aqui; sem
application/persistência. Property-based (`fast-check`) para invariantes.

**`application/`** — funil único; `fail()`/`ok()`/`err()`; `commitPut`/`makeOp`; efeitos antes da tx;
`hooks` depois do commit; cascata em transação única; sem string de UI.

**`adapters/`** — implementam portas; passam **`runStoreContract`**; só aqui moram dexie/crypto/browser.

**`validation/`** — `zod` conforma ao core via `Expect<Equal<z.infer<S>, T>>`; nunca o contrário.

**`composables/`** — `useState` namespeado + `hydrate()`/`hydrated`; persistência via `Preferences`;
ViewModel adapta domínio→view; escrita só por `service.*`.

**componentes** — `UI/*` envolvem reka-ui; `Section/<Tela>/*` são seções; `defineProps`/`defineEmits`
tipados; sem lógica de negócio; tokens `--pt-*`.

**`pages/`** — finas: pegam um composable, seguram flags de UI, despacham para `Section*`.

---

## 6. Padrões reutilizáveis (não reinvente)

| Precisa de… | Use | Onde |
| --- | --- | --- |
| Resultado de caso de uso | `Result` + `ok`/`err` | `application/result.ts` |
| Erro de domínio | `DomainErrorCode` + `domainError()` | `application/errors.ts` |
| Escrever com oplog | `commitPut`/`fail` | `application/caderno-service.ts` |
| Entrada de oplog | `makeOp`/`appendOp` | `engine/oplog.ts` |
| Aritmética precisa | `* as num` | `engine/math.ts` |
| Teste de adapter | `runStoreContract` + in-memory | `core/testing/` |
| Reatividade de dados | `useLiveQuery` | `app/composables/useLiveQuery.ts` |
| Preferência persistida | padrão `hydrate()/persist()` | `app/composables/useTheme.ts`, `useLayout.ts` |
| Reordenar (DnD) | `UISortable`/`reorderByEdge` | `app/components/UI/Sortable*`, `app/utils/sortable.ts` |

---

## 7. Testes

- `*.spec.ts` **colocado** ao lado do código (`src/`, ou `app/` na PWA).
- **Engine/domínio:** cobertura alta; **property-based** (`fast-check`) para invariantes (ex.
  `properties.spec.ts`).
- **Adapters:** passar `runStoreContract` (mesma suíte para in-memory e dexie/fake-indexeddb).
- **Pureza:** `domain/purity.spec.ts` é parte do gate — não a contorne.
- Teste **comportamento de use-case** (FK rejeitado, ciclo barrado, cascata) via `Result`, não detalhes
  internos.

---

## 8. Ferramentas e _enforcement_

**Gate (CI `quality.yml`, na ordem):**
1. `bun run quality:check:ci` → `biome ci .` (lint + format + imports)
2. `bun run all:typecheck` → `tsc --noEmit` / `nuxt typecheck`
3. `bun run all:test` → `vitest run`
4. `bun run all:build` → `nuxt build`
5. `bun run all:e2e` → Playwright
6. `reuse lint` (licenças SPDX)

**Local, antes do PR:** `bun run quality:check` · `bun run all:typecheck` · `bun run all:test` ·
`bun run all:build`. Use `bun run quality:fix` (Biome `--fix --unsafe`) com cuidado.

**Hoje é imposto:** preset `recommended` do Biome, `noUnusedVariables`, fronteiras `noRestrictedImports`,
`purity.spec.ts` (imports + não-determinismo no domínio), `strict`/`verbatimModuleSyntax`/`isolatedModules`,
REUSE, actionlint/zizmor + SHA-pin nos workflows.

**Lacunas e recomendações (ainda NÃO impostas — convenção até virarem regra):**
- **Complexidade cognitiva:** habilitar `complexity.noExcessiveCognitiveComplexity` (sugestão de limite
  ~15) no `biome.json`.
- **Duplicação / inúteis:** ligar regras `noUseless*` adicionais; avaliar relatório de duplicação.
- **Tipos:** avaliar `noUncheckedIndexedAccess` (pega acesso a índice possivelmente `undefined`).
- **Comentários:** transformar "sem comentários" em regra/checagem (hoje é só convenção).
- Manter o que já é forte: SHA-pin de actions, `zizmor`, _build attestation_.

---

## 9. Fluxo de refatoração

1. **Cubra com teste** o comportamento atual (se ainda não houver) — sua rede de segurança.
2. **Refatore em passos pequenos**, um _smell_ por vez; rode o gate a cada passo.
3. **Não misture** refatoração com feature/bugfix no mesmo commit.
4. **Commits pequenos**, título no padrão do repo (ex.: `refactor: extrai usePreferences`),
   **sem `Co-Authored-By`**.
5. **Regra do escoteiro:** deixe o arquivo um pouco melhor do que encontrou — sem reescrever o mundo.
6. Gate **verde** (biome ci · typecheck · test · build) antes de abrir o PR.

> Dúvida recorrente: "isto pode quebrar dados do usuário ou é irreversível?" Se sim, **pare** e reveja
> contra a Constituição (reversibilidade + soberania) antes de seguir.
