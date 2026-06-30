# Revisão exaustiva de código — checklist de correção

> Auditoria de todo o monorepo aplicando o [Guia de boas práticas](./GUIA-BOAS-PRATICAS.md).
> Data: 2026-06-29. Método: 5 revisores paralelos (1 por área), somente leitura.
>
> **Veredito:** nenhum 🔴 bloqueador — sem violação de fronteira, sem `any`, sem segredo, sem quebra de
> pureza; funil único íntegro. A dívida é estrutural (duplicação/SRP) + duas decisões de arquitetura +
> alguns ajustes de acessibilidade. Marque `- [x]` ao corrigir; rode o gate (biome ci · typecheck · test ·
> build) a cada item.

## ✅ Concluído (rodadas de refatoração — gate verde em cada commit)
- **Nomes descritivos** (`f03a8a9`): ~202 identificadores de uma letra eliminados.
- **Tipos nomeados** (`5f43a3e`): 7 tipos anônimos nomeados; 11 generics `{ id: Id }` → `Identified`;
  removido `as unknown as`.
- **Ganhos rápidos** (`92d0a80`): removido `vue-query` morto (plugin + dep); `Grade` brandado (+ type
  predicate em `grades.ts`, sem `as number`); `commitDelete` extraído; cores de domínio tokenizadas
  (`AttendanceSimulator`, `ActivityItem`); constantes nomeadas (gamification thresholds, `nextRecurrence`
  7/14, `soonDays`, `presets` 0.75→`DEFAULT_ATTENDANCE_FLOOR`); `gamification` via `math.ts` (+ `remainder`);
  comentários do `NavItem` removidos; dead code `ClockTime` removido.
- **Sem abreviação** (`12e2573`): `ts`→`timestamp`, `num`→`numeric`, `ctx`→`context`, `seq`→`sequence`,
  `el`→`elementRef`, `init`→`initialize`, `dir`→`directory`, `src`→`source` (locais/params).
- **`usePreferences()`** (`2d81067`): `persist`/`PREF_ID` duplicado removido de 7 composables.
- **`SectionSettingsCard`** (`9cd7419`): boilerplate de cabeçalho eliminado dos 12 cards de Ajustes.

> Pendente de decisão: o **campo público `OpLogEntry.ts`** (e `RemoteChange.ts`) segue como `ts` — renomear
> para `timestamp` é mudança coordenada de tipo de domínio + zod schema + mapeamento Dexie + serialização.
> Avise se quer expandir também.

## Estado por camada

| Camada | Estado | Pior achado |
| --- | --- | --- |
| domain + engine | 🟢 sólido | `Grade` sem brand; aritmética crua em `gamification.ts` |
| application + testing | 🟢 sólido | `Subject.records` derivado-como-fonte; oplog desconectado do undo |
| adapters + validation | 🟢 saudável | nomes de coleção paralelos; `s` p/ libsodium |
| PWA composables/utils | 🟡 dívida concentrada | `persist`/`PREF_ID` ×7; god-composable; `vue-query` morto |
| PWA componentes/pages | 🟡 estrutural | boilerplate de 13 cards; `index.vue` gorda; a11y |

---

## 🔗 Temas transversais (atacar 1× resolve em várias camadas)

- [ ] **Fonte única de nomes de coleção** (§4.2) — duplicada em ≥6 lugares: `core/src/domain/storage.ts`,
  `application/observable-store.ts:8` (`ENTITY_KEYS`), `adapters/persistence-dexie/src/dexie-store.ts`
  (3 formas: `:70-79`, `:125`, `:147-155`), `core/src/testing/in-memory-store.ts:60-67` +
  `in-memory-blob-store.ts:64-72`, `app/composables/useBackup.ts:30-63,91-105`,
  `validation/src/backup.ts:16` → **uma constante única exportada pelo core**, consumida por todos.
- [ ] **`usePreferences()`** (§4.2) — extrair `read()`/`patch()` + dono único de `PREF_ID`, eliminando o
  par `persist(patch: Partial<Preferences>)` + `const PREF_ID = "default" as Id` repetido em 7
  composables: `useTheme.ts:4,256`, `useLayout.ts:3,39`, `useConsent.ts:3,55`, `usePomodoro.ts:3,103`,
  `useWorkbenches.ts:3,22`, `useActiveContext.ts:3,24-40`, `useWelcomeBack.ts:3,14-17`.
- [x] **Tipos anônimos → alias nomeado** (§4.6, regra 2026-06-29) — **FEITO** (commit `5f43a3e`): nomeados
  `UndoResult`/`CollectionMergeResult`/`TriagePatch`/`SubjectCounts`/`DueBadgeView`/`SodiumContext`/
  `VersionedPayload`; `blocks: TimeBlock[]`, `row: BlobRow`; 11 generics `{ id: Id }` → `Identified`;
  removido o `as unknown as` de `merge.ts:123`. `any` já era 0. Gate verde.
- [ ] **`as` no miolo** (§4.6 — `as` só na fronteira): `engine/merge.ts:117` (`as unknown as`),
  `engine/grades.ts:12,35`, `application/caderno-service.ts:252` (`preparesId as Id`),
  `Section/Home/ContextDetail.vue:19,22,26,45,48` + `Section/Onboarding/Wizard.vue:16-20,77-78`
  (round-trip enum→string→enum), `Section/Home/Assessments.vue:29,40` (`Number(v) as Grade`).
- [x] **Nomes de uma letra → descritivos** (§4.4, regra endurecida 2026-06-29) — **FEITO** (commit `f03a8a9`):
  ~202 sites renomeados em todo o repo (core ~130, PWA ~58, adapters/validation ~14); 0 resíduo de
  uma-letra; gate verde.
- [ ] **Números mágicos → constantes nomeadas** (§4.5): `engine/gamification.ts:81,87,93,99` (3/7/10/5),
  `engine/activities.ts:69,121` (7/14, soonDays 3), `engine/presets.ts:44` (`0.75` duplica
  `DEFAULT_ATTENDANCE_FLOOR`), `app/composables/usePomodoro.ts:17-19,23,39,40,79` (25/5/15, 60, 1000),
  sentinela `"1970-01-01"` em `useCaderno.ts:132` + `useWelcomeBack.ts:11,16`.

---

## 🟠 Major

### Decisões de arquitetura (discutir + registrar em `DECISIONS.md`)
- [ ] **`Subject.records`/`assessments` derivado-como-fonte** — `application/caderno-service.ts:148`
  (`updateSubject` faz `records: subject.records ?? existing.records`), mas o repositório canônico é
  `store.records` (top-level); `markAttendance` grava lá, nunca no `Subject`. Campo embarcado pode
  dessincronizar → não persistir `records` no `Subject`; derivar via `recordsOf` quando precisar.
- [ ] **Oplog sem payload nem leitor real** — `caderno-service.ts:90` apenda `{ts,entity,op,id}` (sem
  `before/after`); único consumidor é `Section/Settings/OplogCard.vue` (exibição); o undo real vive em
  `engine/undo.ts` (com `before/after`) e **não** é alimentado pelo service. Decidir: oplog grava payload
  e vira fonte de undo/sync **ou** service registra `Reversible` do `engine/undo.ts`.

### Duplicação / SRP (refactor mecânico, baixo risco)
- [ ] **Boilerplate de card** nos 13 `Section/Settings/*Card.vue` — cabeçalho `__head` + `h2.pt-hand`
  (`calc(19px*…)`, 700, m0) + `p.__sub` (13px, `--pt-ink-muted`) reimplementados localmente, ignorando o
  `.block`/`.block__head`/`.block__title` global de `papel-tinta.css`. `Gamification.vue:15-18` já usa o
  padrão certo. → extrair `SectionSettingsCard` (slots título/subtítulo/corpo) ou reusar `.block`.
  Representativos: `GeneralCard`, `DisplayCard`, `TypographyCard`, `PomodoroCard`, `BackupCard`,
  `ConsentCard`, `ContextProfileCard`, `WorkbenchesCard`, `PluginsCard`, `MoodsCard`, `OplogCard`,
  `LayoutCard`.
- [ ] **`useLayout.ts:81-130`** — `toggle*/move*/reorder*` triplicados por `{homeWidgets,tabItems,railItems}`
  (9 funções quase idênticas) → parametrizar por `(listRef, prefKey)`, reduzindo a 3 genéricas.
- [ ] **`useCaderno.ts` (308 l) god-composable** — mistura presença, gamificação (`:234-263`), atividades,
  roll (`:201-219`), `mark`/`completeActivity` (`:265-288`), contexto, + helpers puros exportados
  (`deriveStats`, `STATUS_BY_RISK`, `HEAT_BY_STATUS`, `formatDay`) → quebrar em
  `useAttendanceStats`/`useGamification`/`useActivities`; mover helpers puros para `utils/`.
- [ ] **`pages/index.vue` (304 l) página gorda** — ~13 flags de modal (`:40-52`), mapa `quickActions`
  (`:87-109`), handlers de subject (`:65-85`), atalho de teclado (`:111-118`), computeds
  `headerMeta`/`period` (`:120-135`) → extrair `useHomeDialogs()` e mover `period`/`headerMeta` p/ o
  composable; página só despacha.

### Código morto
- [ ] **`plugins/vue-query.ts` + dependência `@tanstack/vue-query`** (`pwa/package.json`) — nenhum
  `useQuery`/`useMutation` no app (reatividade é `useLiveQuery`) → remover plugin + dependência.

### CSS / tokens (§4.17)
- [ ] **Cor de domínio hardcoded em lógica:** `Section/Home/AttendanceSimulator.vue:14-15`
  (`#2f7d4f`/`#c0392b` → `var(--pt-ok)`/`var(--pt-danger)`), `Section/Home/ActivityItem.vue:62`
  (fallback `#c4beb0` → token neutro).

### Pureza / aritmética (§4.8)
- [ ] **`engine/gamification.ts:30,31,35`** — `+1`, `% XP_PER_LEVEL`, `XP_PER_LEVEL - intoLevel` crus
  (único engine que escapa do `* as num`) → `num.add`/`num.subtract` + adicionar `mod`/`remainder` em
  `engine/math.ts`.

### Acessibilidade (§4.18)
- [ ] **`Section/Home/MoodsCard.vue:44-54`** — `<span role="button" tabindex="0">` (remover perfil)
  **dentro** do `<button class="moods-card__mood">` (`:32`): botão-dentro-de-botão é HTML inválido e quebra
  teclado/AT → tornar irmãos com `position`.
- [ ] **DnD sem alternativa de teclado** — `UI/SortableItem.vue:82-88` (alça sem `tabindex`/handler);
  `Section/Home/GoalsManager.vue:85-131`, `Section/Home/ActivityForm.vue:130-152` e
  `Section/Caderno/NoteRow.vue` usam o Sortable **sem** ↑/↓ (o `LayoutCard` tem — replicar).

### Tipos (§4.6)
- [ ] **`Grade = number` sem brand** (`domain/values.ts:5`) diverge dos VOs irmãos →
  `number & { readonly __brand: "Grade" }`.

### Texto de UI no engine (§4.7)
- [ ] **`engine/gamification.ts:70-101`** — `label` pt-BR + `icon` emoji acoplados ao engine puro →
  engine devolve só `key`/`unlocked`; UI resolve label/ícone via i18n.

---

## 🟡 Minor

- [ ] **`commitDelete` faltando** — `caderno-service.ts:271-278,338-344,459-463` repetem
  `clock.now()` + `transaction{ delete + oplog.append }` → extrair simétrico a `commitPut`.
- [ ] **Hook semanticamente errado** — `caderno-service.ts:196` (`addAssessment` dispara `"grade:set"` ao
  **adicionar** avaliação) → criar `assessment:added` ou renomear.
- [ ] **Hooks de delete faltantes** — sem `activity:deleted`/`library:deleted`/`edge:deleted`
  (`hooks.ts` vs `caderno-service.ts:266,333,455`); plugins não conseguem reagir.
- [ ] **`upsertActivity` complexo** — `caderno-service.ts:228-264` acumula 3 validações inline (FK ctx, FK
  subject, ciclo) → extrair `assertNoActivityCycle`/checagens nomeadas (§4.1).
- [ ] **`merge.ts:47-48`** — `sameValue` via `JSON.stringify` (sensível à ordem de chaves → `PUT` espúrio)
  → comparação estrutural estável.
- [ ] **Colisão de nomes** — `domain/model.ts:117,206` `interface Record`/`Node` sombreiam globais
  (`Record<K,V>`/DOM `Node`), forçando `Record as AttendanceRecord` → renomear (`AttendanceRecord`,
  `NotebookNode`).
- [ ] **`cor/sombra rgba(44,42,39,…)` repetida ~13×** nos overlays UI (`Modal`, `Confirm`, `Toaster`,
  `Menu`, `Select`, `Popover`, `Tooltip`, `Tabs`, `Slider`, `QuickMenu`) → token `--pt-scrim`/`--pt-shadow-*`.
- [ ] **Invólucro de página + header repetidos** nas 5 pages (`index/ajustes/caderno/acervo/agenda`:
  `max-width:720px;…;padding: var(--pt-pad-screen) …` + header `h1.pt-hand` 26px/800 + `__sub`) → extrair
  `SectionPageHeader`/layout.
- [ ] **Comentários** em `Section/Shell/NavItem.vue:38,53` (únicos não-`biome-ignore` nos componentes) →
  remover (§4.10).
- [ ] **`SubjectCard.vue` nomes `s`/`wd`** (`:12,17`; `wd` recriado no computed) → constante de módulo; é o
  maior arquivo (317 l), candidato a subseções (`sc-budget`/`sc-counts`/`sc-media`).
- [ ] **Aritmética crua de datas/contagens** — `engine/schedule.ts:21,25,51,54-55`, `engine/rollcall.ts:74`
  (`scheduled - canceled`) → `num.subtract` ou isolar helper de datas e documentar a exceção.
- [ ] **`usePomodoro.ts:36`** — `const clock = computed(...)` (rótulo `mm:ss`) colide com a porta `Clock` →
  `timeLabel`/`display`.
- [ ] **`useCaderno.ts:153`** refetch manual (`allContexts.value = await store.contexts.list()`) redundante
  ao `useLiveQuery`; `:173-179` `watchEffect` muta `activeId` (estado derivado escondido em efeito) →
  modelar contexto efetivo como `computed`.
- [ ] **Snapshot/restore duplicado** — `testing/in-memory-store.ts:26-58,121-133` e
  `in-memory-blob-store.ts:10-39,78-89` (`Snapshotable` quase idêntico) → helper compartilhado.
- [ ] **`dexie-store.ts`** lista de coleções em 3 formas no mesmo arquivo (parte do tema transversal #1).
- [ ] **Nome `s`** para libsodium em `adapters/crypto/src/cipher.ts:20-45` → `sodium`.

---

## 🔵 Info / nits

- [ ] Possível andaime morto: `domain/future.ts`, `domain/sync.ts`, `type ClockTime` (`values.ts:6`) — não
  importados nem reexportados por `domain/index.ts` (§4.13) → remover ou usar.
- [ ] `localStorageKeyStore` sem spec próprio (`platform-browser`); `key-store.ts:12-14` `setItem` pode
  lançar (quota/modo privado) sem try/catch.
- [ ] `adapters/crypto/src/cipher.ts:39` — `decrypt` sem checar `indexOf(-1)` do separador (entrada
  corrompida → erro opaco).
- [ ] `OpLogEntry.entity: string` (`model.ts:329`/`oplog.ts:3`) perde o brand de `EntityName` →
  tipar como `EntityName`.
- [ ] TOCTOU check-then-act em `updateContext`/`updateLibraryItem` (`caderno-service.ts:103,321`) —
  aceitável em app local mono-usuário; não é atômico.
- [ ] `observable-store.ts:81-88` — `put`/`delete` top-level escrevem fora do funil (sem oplog); só
  bootstrap/seeds usam; manter ciente.
- [ ] Genérico inconsistente: `caderno-service.ts:82` usa `<T extends { id: Id }>` vs `Identified` em
  `observable-store.ts` → padronizar `Identified`.
- [ ] `engine/capabilities.ts:64,70` — `as DataSource<T>`/`as CapabilityEngine` após type-guards (erasure
  do registry; aceitável, mas é cast no miolo).
- [ ] `UI/Button.vue:4` — variante `"perigo"` possivelmente subutilizada (formulários usam `fantasma` para
  excluir) → confirmar se é dead code (§4.13).
- [ ] Dois fluxos de onboarding com nomes parecidos: `SectionHomeOnboarding` (195 l) vs
  `SectionOnboardingWizard` (194 l) — risco de confusão; documentar/renomear a distinção.
- [ ] `Section/Home/SubjectCard.vue:41` — `:pad="'17px'"`/`accent=""` (literais soltos/valor vazio) →
  padronizar com token/`undefined`.
- [ ] `platform-browser/src/id.ts:4` — `export { uuidv7 }` reexpõe símbolo de terceiros pela API pública
  (usado só pelo spec) → tornar interno.
- [ ] Variáveis de uma letra em specs (`cipher.spec.ts` `a`/`b`, `adapter.spec.ts` `u`/`n`).

---

## Lacuna de tooling reconfirmada

- [ ] Habilitar `complexity.noExcessiveCognitiveComplexity` (limite ~15) no `biome.json` — vários achados
  de tamanho/complexidade (`useCaderno`, `index.vue`, `SubjectCard`, `upsertActivity`) escapam hoje por não
  haver regra (§8 do guia).

---

## Plano de ação sugerido (por ROI / risco)

1. **Ganhos rápidos sem risco**
   - [ ] remover `vue-query` (morto) + dependência
   - [ ] `usePreferences()` (elimina 7 cópias de `persist`/`PREF_ID`)
   - [ ] `commitDelete` no service
   - [ ] tokenizar cores/sombras hardcoded
   - [ ] remover comentários do `NavItem`
   - [ ] brand em `Grade`
   - [ ] números mágicos → constantes
   - [ ] `gamification` via `math.ts`
2. **Refactor estrutural mecânico**
   - [ ] `SectionSettingsCard` (13 cards)
   - [ ] parametrizar `useLayout`
   - [ ] afinar `index.vue` / quebrar `useCaderno`
   - [ ] fonte única de nomes de coleção
3. **Acessibilidade pontual**
   - [ ] botão aninhado do `MoodsCard`
   - [ ] teclado no DnD de `GoalsManager`/`ActivityForm`/`NoteRow`
4. **Decisões (discutir antes de codar)**
   - [ ] `Subject.records` denormalizado
   - [ ] oplog × `engine/undo.ts` (reversibilidade)
