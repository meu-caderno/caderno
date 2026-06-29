# Roadmap de design — `@meu-caderno/core`

Plano de evolução do núcleo de domínio, derivado de uma força-tarefa que cruzou o
projeto do Claude Design (modelo `caderno.ts`, protótipo MVP, README) com a
[Constituição](../CONSTITUTION.md), a decisão de Arquitetura MVP1 e os princípios de
**DDD + Ports & Adapters + Clean Architecture**. É um documento de design: define
**o que** falta, **as camadas**, **as assinaturas**, **os invariantes**, **os edge
cases**, **as garantias** e **a ordem**.

> **Atualização (status):** grande parte deste roadmap já foi implementada — domínio
> puro com `validation` (Zod) em pacote separado, **ports assíncronos**, `encrypted
> store` + `observable store` (write-through), criptografia (**libsodium** / DEK),
> injeção de dependência + **plugins**/**hooks**, **invariantes** de escrita e
> **boundary enforcement** no lint. O log de decisões recentes e o que segue pendente
> estão em [BACKLOG.md](./BACKLOG.md); a estrutura atual, em
> [ARCHITECTURE.md](./ARCHITECTURE.md). As seções abaixo permanecem como referência de
> design e justificativa.

## Estado atual e o pivô deste roadmap

> O pivô abaixo **já foi concluído**: o `schema/` Zod-como-fonte deu lugar ao domínio
> puro em `domain/` + o pacote `@meu-caderno/validation`. O texto segue como registro
> da decisão.

**Pivô (decisão, ver §8):** Zod é um detalhe de **implementação**, não domínio.
O coração da Clean/Hexagonal não pode depender de um framework de validação. Logo o
core passa a **exportar abstrações de domínio** (interfaces, value objects, enums,
serviços) em TS puro, e o Zod desce para uma **camada de validação** (pacote próprio)
que *conforma* ao domínio e roda só nas **fronteiras** (import `.json`, leitura
defensiva). Isso reverte o "eleger Zod como fonte única" da Arquitetura MVP1 — sem
reintroduzir o *drift* que aquela decisão temia (ver "Conformância" em §1).

---

## 1. Vocabulário arquitetural — DDD × Hexagonal × Clean

Os três compõem: **DDD** diz *o que* modelar; **Ports & Adapters** diz *como* isolar o
núcleo da infra; **Clean** dá o mapa de camadas e a regra "dependa para dentro".

| Pergunta | Vocabulário | No core |
|---|---|---|
| *O quê* modelar | DDD (tático/estratégico) | `domain/model` + `domain/values` + `domain/engine` |
| *Como* isolar da infra | Ports & Adapters | `domain/ports` (outbound) + `application/` (inbound) ; adapters em pacotes |
| *Como* organizar dependências | Clean | regra única: dependa sempre **para dentro** |

### Camadas (Clean ↔ Hexagonal ↔ pacote)

```
Enterprise rules   →  domain/model    entities + value objects (TS puro, SEM Zod)  ┐
Value objects      →  domain/values   brands + factories                           │ @meu-caderno/core
Domain services    →  domain/engine   funções puras sobre o domínio                │ (puro: sem zod/dexie/vue)
Outbound ports     →  domain/ports    Storage, Clock, IdGenerator (interfaces)     │
Use cases          →  application/    CadernoService (orquestra domínio + ports)   ┘
Validation (impl)  →  @meu-caderno/validation     schemas Zod conformes ao domínio
Driven adapters    →  @meu-caderno/adapter-*       DexieStore, BrowserClock, UuidGen
Driving adapter    →  apps/pwa                     UI Vue + composition root (injeta tudo)
```

A **regra de dependência** aponta sempre para dentro: `validation → core`,
`adapter-* → core`, `pwa → tudo`. **O `core` não declara `zod`, `dexie` nem `vue`
como dependência** — a fronteira de pacote torna a regra impossível de violar. O port
é declarado no `core` e implementado nos pacotes de fora. O *enforcement* mecânico
disso está em §10.

### Topologia de pacotes (Clean por fronteira de pacote)

As implementações de serviços externos (adapters) ficam, preferencialmente, em
**pacotes próprios** — assim o boundary do pacote *impõe* a Dependency Rule, não só a
convenção. Supera a orientação "2 pacotes / resista ao terceiro" da Arquitetura MVP1:
ali o risco era pacote-de-tipagens sem consumidor; aqui cada pacote tem fronteira
semântica real (um adapter trocável) e um consumidor (o PWA).

```
pkgs/
  core/                       @meu-caderno/core            domínio + application + ports (puro)
  validation/                 @meu-caderno/validation      schemas Zod + testes de conformância
  adapters/
    persistence-dexie/        @meu-caderno/adapter-dexie   implementa Store (IndexedDB/Dexie) + oplog
    platform-browser/         @meu-caderno/adapter-browser Clock (Date/Intl) + IdGenerator (crypto.randomUUID)
  apps/
    pwa/                      @meu-caderno/apps.pwa        composition root + UI Vue
```

Grafo de dependência (setas = "depende de"):

```
adapter-dexie ─┐
adapter-browser┤→ core ←─ validation
apps/pwa ──────┴────────────┘   (pwa depende de core, validation e dos adapters; injeta nos ports)
```

Regras: **só o `apps/pwa` (composition root) conhece concretos** e faz a fiação
porta→adapter. Cada adapter depende **apenas** de `core` (pelas interfaces de port) +
sua lib. Nenhum adapter depende de outro. Cada pacote: `package.json` com `exports`,
`tsconfig`, projeto Nx e entrada em `workspaces`. Adapters de plataforma triviais
(clock/id) podem coabitar `adapter-browser`; persistência fica isolada por ter
superfície e risco maiores. O adapter de teste (in-memory store, clock fixo) vive em
`core/testing` (subpath) para os testes do domínio não dependerem de outro pacote.

### Zod é implementação, não domínio — e como evitar o *drift*

A interface de domínio é a **fonte**; o schema Zod *conforma* a ela. Direção:
`validation → domain`.

```ts
export interface Subject { id: Id; contextId: Id; name: string; color: Color; }
export const SubjectSchema = z.object({ /* ... */ });
type _SubjectConforms = Expect<Equal<z.infer<typeof SubjectSchema>, Subject>>;
```

O `_SubjectConforms` (asserção de tipo num `*.spec`) faz o **compilador falhar** se o
schema e a interface divergirem. É assim que ganhamos pureza de domínio **e** a
garantia anti-drift que motivou o "Zod único" — sem `z.infer` vazar para o contrato.
Preferimos o teste de conformância a anotar `z.ZodType<Subject>` (que briga com
branded/optionals). Custo: escreve-se a interface **e** o schema (espelhos), mas o
teste garante que nunca dessincronizam.

### Sabor de DDD: funcional, não OO

As entities são dados (interfaces TS); o comportamento vive em funções puras
(`domain/engine`) e em *smart constructors* (factories que garantem invariantes na
construção). **Não** é o anti-padrão anêmico — a lógica é coesa em engine/factories,
não na UI. O anti-padrão a evitar é o oposto: regra de negócio vazando para
composables Vue, ou validação (Zod) infiltrando o domínio.

---

## 2. Modelo tático (DDD) do Caderno

### Bounded contexts

No MVP1 o core é **um** bounded context. Módulos coesos: **Presença/Faltas**, **Notas**,
**Atividades/Agenda**, **Caderno/Conhecimento** (grafo), **Acervo**, **Aparência**
(profiles/moods — voltado à UI, candidato a contexto à parte), **Soberania**
(backup/oplog/import). **Comunidade** e **Federação** são contextos futuros (já isolados
em `_future/`).

### Agregados, raízes e invariantes

| Agregado (raiz) | Contém | Invariantes (além do shape) |
|---|---|---|
| **Context** | `terms[]`, `buckets[]` | `attendanceFloor ∈ [0,1]`; `minAverage ∈ [0,10]`; termos sem sobreposição (ou política); `bucket.done ≤ goal` |
| **Subject** | `records[]`, `assessments[]` | todo `Record.subjectId === Subject.id`; **Σ `assessment.weight` = 1**; `floor ∈ [0,1]`; `totalClassHours`/`credits` coerentes |
| **Activity** | `subtasks[]` | cadeia `preparesId` **acíclica**; `gapDays ≥ 0` (ou negativo deliberado); ocorrências compartilham `seriesId` |
| **Node (grafo)** | `aspects[]`, `Edge[]` | árvore `parentId` **acíclica**; `aspects` não vazio; `Edge.from/to` existem |
| **LibraryItem** | — | `progress ∈ [0,1]`; `stars ∈ [1,5]` |
| **Profile / Mood** | `widgets[]` | mood muda exposição, nunca capacidade |

> **Lacuna central:** nada disso é garantido hoje. No nosso sabor funcional, invariantes
> **inter-campos baratos** → factory de domínio (pura) e/ou `.superRefine()` no schema de
> validação; invariantes que **cruzam agregados** (FK, cascata) → factory na
> `application/` com acesso ao `Store`. Ver §6.

### Value objects (sem identidade, imutáveis) — abstrações de domínio puras

Brands em TS puro, **sem Zod**:

```ts
export type Id = string & { readonly __brand: "Id" };
export type DayIso = string & { readonly __brand: "DayIso" };
export type Timestamp = number & { readonly __brand: "Timestamp" };
export type Color = string & { readonly __brand: "Color" };
```

A *criação* validada (string → `Id`) é da camada de validação (Zod no import) ou do
port `IdGenerator` (geração). O domínio define o **tipo**; quem cunha o valor é a
implementação. VOs compostos (`TimeBlock`, `Schedule`, `Vocabulary`, `Modules`,
`Origin`) também são interfaces puras. Nunca mutar — derivar novos.

### Entities internas, domain services, repositories

- **Entities internas** (identidade dentro do agregado): `Record`, `Assessment`,
  `Term`, `Bucket`, `Edge`.
- **Domain services** = nossos engines — puros, sobre tipos de domínio (não sobre Zod).
- **Repository (DDD) = outbound port (Hexagonal) — um conceito só.** Por raiz de
  agregado. Exceção pragmática: `Record` (§5).

### Linguagem ubíqua (código ↔ negócio)

O VO `Vocabulary` é a UL **configurável por contexto** (renomear "disciplina").

| Negócio (pt-BR) | Código |
|---|---|
| disciplina / matéria | `Subject` |
| presença / falta / atraso / atestado | `Record` (`AttendanceStatus.*`) |
| frequência / piso / orçamento de faltas | `frequencyPct` / `floor` / `remaining` |
| avaliação / média | `Assessment` / `weightedAverage` |
| atividade / prazo / preparação | `Activity` / `dueDate` / `preparesId`+`gapDays` |
| contexto / período | `Context` / `Term` |
| caderno / conceito / aresta | `Node` / `Edge` |
| acervo / backup / desfazer | `LibraryItem` / `Backup` / `oplog` |

---

## 3. Convenções

- **Domínio puro:** módulos em `domain/**` **nunca** `import { z }` (nem Vue/Dexie).
  Interfaces/VOs/enums são a fonte de verdade.
- **Validação conforma:** cada schema Zod vem com um teste de conformância
  (`Expect<Equal<z.infer<typeof S>, T>>`). Zod só na `validation/` e nos adapters.
- Enums = `enum X { MEMBRO = "MEMBRO" }` no domínio; `z.enum(X)` só na validação.
- **Sem comentários no código.** Funções puras: **sem `Date.now()`/`Math.random()`**.
- Teste Vitest para tudo (estratégia em §10). Reusar `daysBetween`, `weekdayOf`,
  `expandSchedule`, `computeAttendance`, `absenceWeight`, `CLASS_HOURS_PER_CREDIT`.

---

## 4. Ondas de implementação

### Onda 0 — reestruturar fonte de verdade + pré-requisitos

1. Mover `schema/` → `domain/model` (interfaces puras), `domain/values` (brands),
   enums para o domínio; extrair o pacote **`@meu-caderno/validation`** com os schemas
   Zod + testes de conformância (sai do `core`, que perde a dep de `zod`). `engine/`
   passa a importar de `domain/model`. Subir o *enforcement* de boundary (§10) já aqui.
2. `domain/values`/`domain/ports`:

```ts
export function addDays(day: DayIso, days: number): DayIso;
export interface Clock { now(): Timestamp; today(zone?: string): DayIso }
export interface IdGenerator { newId(): Id }
```

> `Clock.today()` recebe a zona porque **"hoje" é local, não UTC** (§7, timezone).

### Onda 1 — fundação (ports/DI + use cases)

No `core`: `domain/ports/storage.ts` (`Store`, `Repository<T>`, `graph`,
`transaction`, `EntityName`); `application/` (`Result`/`DomainError` + `CadernoService`);
`testing/in-memory-store.ts`. Nos pacotes de fora: impl Dexie do `Store` em
**`@meu-caderno/adapter-dexie`**, `Clock`/`IdGenerator` em **`@meu-caderno/adapter-browser`**.
Detalhe em §5; semântica transacional em §11; migração dos consumidores atuais em §17.

### Onda 2 — domain services (engines puros)

`attendance` (estende: `simulateAbsences`, `absencesUntilFloor`, `projectFrequency`,
`attendanceRisk`, `aggregateAttendance`, `AttendanceRiskLevel`); `rollcall`
(`sessionsOn`, `nextOccurrences`, `effectiveLoad`); `activities` (`expandRecurrence`,
`derivePrepDueDate`, `syncPreparesLinks`, `inboxItems`, `triage`,
`dueBucket`/`groupByDue`/`sortByDue`, `DueBucket`); `progress` (`creditsToClassHours`,
`degreeProgress`, `termRange`, `activeTerm`, `termProgress`); `presets`
(`presetForGoal`, `applyPreset`); `notebook` (traversals + `canReparent`/`reparent` +
`orphans`/`deOrphan`). Selectors de leitura em §16.

### Onda 3 — seams (extensibilidade / import / undo)

`Origin` + `Node.origin` (bump backup v2→v3); registry de capacidades (**só tipos** +
`emptyRegistry`); `merge.ts` (`mergeBackup`/`mergeCollection`, `MergeStrategy`, merge
por id, LWW, idempotente, **checa FK**); `undo.ts` (stack de sessão volátil — **não**
estende `OpLogEntry`). Framework de migração em §12.

---

## 5. Ports da Onda 1 — detalhe e a tensão de granularidade

```ts
export enum EntityName { CONTEXT="CONTEXT", SUBJECT="SUBJECT", RECORD="RECORD", ACTIVITY="ACTIVITY", NODE="NODE", EDGE="EDGE", LIBRARY="LIBRARY", PROFILE="PROFILE", MOOD="MOOD" }

export interface Repository<T extends { id: Id }> {
  get(id: Id): Promise<T | undefined>;
  list(): Promise<T[]>;
  where(predicate: (e: T) => boolean): Promise<T[]>;
  put(entity: T): Promise<void>;
  delete(id: Id): Promise<void>;
}
export interface Store {
  contexts: Repository<Context>; subjects: Repository<Subject>;
  records: Repository<Record>; activities: Repository<Activity>;
  library: Repository<LibraryItem>; profiles: Repository<Profile>; moods: Repository<Mood>;
  graph: { nodes: Repository<Node>; edges: Repository<Edge>;
    childrenOf(parentId: Id): Promise<Node[]>; edgesFrom(id: Id): Promise<Edge[]>; edgesTo(id: Id): Promise<Edge[]> };
  oplog: { append(e: OpLogEntry): Promise<void>; since(ts: Timestamp): Promise<OpLogEntry[]>; forId(id: Id): Promise<OpLogEntry[]> };
  transaction<R>(work: (tx: Store) => Promise<R>): Promise<R>;
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export interface CadernoDeps { store: Store; clock: Clock; ids: IdGenerator }
export function createCadernoService(deps: CadernoDeps): CadernoService;
```

`Store`/`Repository` são interfaces de domínio (`domain/ports`) — o Dexie as implementa
no pacote `adapter-dexie`. **Onde a validação entra:** o `CadernoService` confia em
entradas já tipadas; a validação Zod roda na fronteira (o adapter importador valida o
`.json` *antes* de chamar o serviço), e o serviço só impõe **invariantes de negócio**
via factories puras. Erros: §15. Transação: §11.

**Tensão DDD vs persistência:** o purismo manda o repo retornar o agregado inteiro
(`Subject` com `records`/`assessments`). Mas *marcar presença* é a operação de maior
frequência (1 toque) — regravar o `Subject` inteiro a cada toque é caro e propenso a
corrida entre abas. Por isso `Record` ganha repositório próprio (`store.records`):
continua *conceitualmente* no agregado `Subject` (a invariante
`record.subjectId === subject.id` é do `Subject`), mas com caminho de escrita granular.
`Assessment` fica embutido.

---

## 6. Invariantes por agregado (onde impor)

| Invariante | Camada/onde | Observação |
|---|---|---|
| `record.subjectId === subject.id` | factory `markAttendance` (application) | merge de import também (FK) |
| Σ `assessment.weight === 1` | factory de domínio + `validation` `.superRefine` | resolve a inconsistência de denominador (§7) |
| cadeia `preparesId` acíclica | factory `upsertActivity` + `syncPreparesLinks` | guard A→B→A |
| árvore `parentId` acíclica | `canReparent` antes de `reparent` | engine notebook |
| `Edge.from/to` existem | factory de aresta + limpeza de arestas | **arestas órfãs** não tratadas (§7) |
| termos sem sobreposição | `validation` `.superRefine` ou política | `activeTerm` precisa de desempate |
| faixas (`floor`,`progress`,`stars`) | `validation` (shape) | ok |

Regra: invariante **inter-campos barato** → factory de domínio (sempre roda) + opcional
`.superRefine` no schema; invariante que **cruza agregados** (FK, cascata) → factory na
`application/`.

---

## 7. Edge cases e lacunas ainda não cobertos

### Faltas / frequência

- **Arredondamento mascara o piso (bug-class):** `meetsFloor = frequencyPct >= floor*100`
  usa a frequência **arredondada** — 74,8% com piso 75% reporta "em dia" estando abaixo.
  Comparar a **razão exata**: `(held - absencesUsed) / held >= floor`.
- **Regras de falta não configuráveis:** o engine fixa `LATE = 0.5` e abona
  `MEDICAL`/`WAIVED`. `lateIsHalf`/`medicalExcuses` **não existem no `Subject`** (§20).
- **Orçamento estático vs carga efetiva:** `maxAbsences` vem de `totalClassHours` fixo;
  `HOLIDAY`/`CANCELED` reduzem a carga real (`effectiveLoad`) → "quantas posso faltar"
  mente se muitas aulas caem. Reconciliar.
- **Aula dupla:** `classesPerSession` pesa a sessão, mas uma falta é 1 `Record` — faltar
  aula dupla custa 1 ou 2 faltas? Indefinido. **Presença por bloco:** `Record.block`
  ignorado. **Sem calendário de feriados** para prever carga futura.

### Notas

- **Denominadores inconsistentes:** `weightedAverage` normaliza pelo peso **avaliado**;
  `neededGrade` pelo peso **total**. Se Σpesos ≠ 1, bases divergem. Impor Σpesos = 1 (§6).
- **Descarte de menor nota / substitutiva / recuperação** e **arredondamento de média**
  (6,0 vs 5,95) — não modelados.

### Agenda / atividades

- **Recorrência sem fim:** sem "até"/"contagem" (§20). Editar/destacar uma ocorrência da
  série não modelado. Concluir recorrente não gera a próxima.
- **`prepares` em alvo recorrente:** qual ocorrência? Múltiplas prep para o mesmo alvo.

### Período / progresso

- **Termos sobrepostos** ou **hoje no vão** → `activeTerm` precisa de política; termo
  semiaberto (só `start` ou só `end`). **`Bucket.unit` heterogêneo** → agregar como
  contagem, não soma de unidades.

### Caderno / grafo

- **Arestas órfãs:** `deOrphan` trata nós; arestas para nós deletados ficam soltas. **Nó
  sem aspecto** (`aspects` vazio) — proibir ou permitir?

### Backup / import / merge

- **Integridade referencial:** importar `Record` cujo `subjectId` não existe (FK). UPSERT
  por id não checa. **`REPLACE` com backup parcial** apaga o resto — restringir a backup
  completo. **Escopo do `Id`** (por coleção vs global). Migração total e forward-only (§12).

### Undo / sessão

- **Undo de cascata:** `deleteSubject` remove records/assessments junto → undo restaura o
  agregado inteiro (before-image completo). **Import em lote** = 1 passo de undo?

### Transversal

- **Timezone do `DayIso`:** derivá-lo de `Timestamp` exige a zona — 1 toque às 23h pode
  gravar o dia UTC seguinte. `Clock.today(zone)` resolve.
- **Cascata entre agregados:** apagar `Context` cascateia para `Subject`s e `Activity`s
  que o referenciam — regra em factory da `application/`.
- **Concorrência multi-aba** (IndexedDB) — fora do MVP1; oplog append-only + ids estáveis
  deixam o caminho aberto.

---

## 8. Decisões de design (resolvidas)

- **Fonte de verdade = domínio (interfaces TS), não Zod.** Zod é validação de fronteira,
  conforme via teste `Expect<Equal<…>>`. Inverte e supera o "Zod único" da Arquitetura
  MVP1; o anti-drift é do compilador, não da ausência de duplicação.
- **Adapters em pacotes próprios.** `core` (puro) + `validation` + `adapter-dexie` +
  `adapter-browser`; só o `apps/pwa` (composition root) conhece concretos e injeta nos
  ports. A fronteira de pacote impõe a Dependency Rule. Supera o "2 pacotes" da
  Arquitetura MVP1.
- **Sabor funcional de DDD** (dados + funções puras + smart constructors).
- **Repository = outbound port** (um conceito), por raiz de agregado; exceção `Record`.
- **Serviço fino = use cases**; `Result` só na borda; validação na fronteira.
- **Undo é de sessão**; `OpLogEntry` fica enxuto e append-only.

## 9. Guard-rails contra over-engineering

Contexto: **local-first, cliente único, um bounded context, MVP1**.

- **Sem classe-por-use-case nem DTO/mapper** — métodos do `CadernoService` *são* os use
  cases; tipos de domínio cruzam a fronteira direto (monorepo TS).
- **Sem inbound port formal** enquanto há um app só.
- **Não duplicar Repository e port de saída** — mesma coisa.
- **Custo da pureza é real:** interface + schema espelhados. Vale pela independência de
  framework e domínio testável sem Zod; o teste de conformância paga o seguro do drift.
- **Evitar o anêmico de verdade:** invariante/cálculo em engine/factory, nunca em
  composable Vue; e **não deixar Zod vazar para `domain/`**.
- **DDD tático só onde há invariante real:** Faltas/Notas/Atividades/Grafo merecem
  agregado; `LibraryItem`/`Profile` são quase CRUD — não inventar agregado sem invariante.

---

## 10. Garantia: enforcement do boundary, testes & DoD

O doc prega a Dependency Rule — esta seção a torna **executável**.

### Enforcement mecânico do boundary

- **Nx module boundaries** (`@nx/enforce-module-boundaries`): tags por projeto
  `scope:domain` / `scope:validation` / `scope:adapter` / `scope:app`, com regras
  permitindo só `app → *`, `validation → domain`, `adapter → domain`, e `domain → domain`.
- **Lint de pureza** (Biome/regra dedicada ou dependency-cruiser): proibir em `domain/**`
  qualquer `import` de `zod`/`dexie`/`vue` e os globais `Date.now`/`Math.random`/`crypto`.
- Falha de qualquer um quebra o `quality:check:ci`.

### Estratégia de testes (além do "Vitest pra tudo")

- **Contract test de port** — uma suíte única parametrizada pelo construtor do adapter,
  que *todo* `Store` precisa passar (in-memory e Dexie provam equivalência):

```ts
export function runStoreContract(makeStore: () => Promise<Store>): void;
```

  Roda no `core` (com in-memory) e no `adapter-dexie` (com fake-indexeddb).
- **Property-based** (`fast-check`) para os engines puros — invariantes em vez de
  exemplos: `frequencyPct ∈ [0,100]`; `expandSchedule(...) ⊆ range`;
  `addDays(d, n)` é inverso de `addDays(_, -n)`; `weightedAverage ∈ [0,10]`;
  `reparent` nunca cria ciclo.
- **Conformância de schema** — `Expect<Equal<z.infer<typeof S>, T>>` por entidade (§1).

### Definition of Done por onda

Typecheck 0 · biome/boundaries verde · contract test do port verde (quando aplicável) ·
property-based dos engines tocados · conformância dos schemas tocados · cobertura mínima
do pacote mantida.

---

## 11. Semântica transacional & consistência

`transaction(work)` é o único caminho de escrita dos use cases. Garantias:

- **Atômico:** a escrita das entidades **e** o `oplog.append` correspondente entram no
  mesmo commit; falha em qualquer passo → **rollback total**, nada persistido.
- **Isolado:** leituras dentro da tx enxergam as próprias escritas; efeitos colaterais
  (id/now) são resolvidos *antes* de abrir a tx (valores capturados), nunca dentro.
- **Sem aninhamento:** uma transação por use case; o serviço não abre tx dentro de tx.
- **Idempotente por id:** reexecutar o mesmo use case (mesmo id) não duplica entidade nem
  entrada de oplog.

O `adapter-dexie` mapeia para uma transação IndexedDB `readwrite` cobrindo as tabelas
tocadas **+** a tabela `oplog`. O contract test de port (§10) inclui um caso de falha no
meio da `work` e verifica que nada foi escrito.

---

## 12. Migração, versionamento & estratégia de Id

### Migração de backup (framework, não ad-hoc)

```ts
export interface Migration { from: number; to: number; up(data: unknown): unknown }
export const migrations: Migration[];
export function migrateBackup(data: unknown): Backup;
```

`migrateBackup` aplica a cadeia `from→to` em ordem até a versão atual; **forward-only e
total**; cada salto tem fixture de teste da versão de origem. Aditivo (campo opcional
novo) é seguro; remover/renomear campo **exige** uma `Migration`.

### Duas linhas de versão (relacionadas, independentes)

- **`Backup.version`** — formato de fio do `.json` (hoje 2; vai a 3 com `Origin`).
- **Schema do Dexie** (`db.version(n)` no `adapter-dexie`) — layout das tabelas locais.

Uma tabela no `adapter-dexie` mapeia "Backup vN ⇒ db vM". O domínio não conhece nenhuma
das duas; quem versiona é validação (fio) e adapter (local).

### Estratégia de `Id`

- **UUID v7** (ordenável no tempo): dá ordenação causal barata ao oplog e ao sort, e
  prepara o futuro sync sem relógio vetorial. Gerado no `adapter-browser`; o
  `IdGenerator` é a interface no domínio.
- **Teste:** gerador determinístico (contador) injetado.
- **Formato:** opaco, **global único** (merge por id, §7), sem prefixo por tipo.

---

## 13. API pública, exports & estabilidade

- **`@meu-caderno/core`** exporta: `domain/model` (tipos), `domain/values`, enums,
  `domain/engine` (funções), `domain/ports`, `application` (`createCadernoService`,
  `Result`, erros). Subpath **`@meu-caderno/core/testing`** (in-memory store, fakes de
  clock/id). **Nada de Zod** no barrel.
- **`@meu-caderno/validation`** exporta os `*Schema`, `parseBackup`, `migrateBackup`.
- **`@internal`:** helpers privados (ex.: aritmética de data interna) não entram no barrel.
- **Estabilidade:** tipos/enums de domínio são superfície estável — mudança quebra wire e
  **exige migração** (§12); engines crescem aditivamente. Semver **por pacote**; o
  `exports` map é o contrato.

---

## 14. Catálogo de casos de uso (application)

Inventário MVP1 dos métodos do `CadernoService` (cada um: valida na fronteira → factory
de invariante → `transaction` escrita+oplog → `Result`):

- **Contexto:** criar / editar / arquivar; `aplicarPreset(goal)`.
- **Disciplina:** criar / editar / **excluir (cascata)** records+assessments.
- **Presença:** marcar / retificar / desfazer (1 toque).
- **Notas:** definir/editar nota de avaliação; adicionar/remover avaliação.
- **Atividade:** capturar (→ inbox) / triar / upsert / expandir recorrência / concluir.
- **Agenda:** chamada do dia (roll call) / próximas ocorrências.
- **Caderno:** criar nó / reparentar / ligar e remover aresta.
- **Acervo:** upsert item / avaliar (estrelas) / progresso.
- **Soberania:** exportar `.json` / importar (→ merge) / **desfazer-refazer** (sessão).

Não vira classe-por-use-case (§9) — são métodos do serviço.

---

## 15. Erros: taxonomia & i18n por código

```ts
export enum DomainErrorCode {
  VALIDATION="VALIDATION", NOT_FOUND="NOT_FOUND", CONFLICT="CONFLICT",
  INVARIANT_WEIGHTS_SUM="INVARIANT_WEIGHTS_SUM", INVARIANT_CYCLE="INVARIANT_CYCLE",
  INVARIANT_FK_MISSING="INVARIANT_FK_MISSING", INVARIANT_RANGE="INVARIANT_RANGE",
}
export interface DomainError { code: DomainErrorCode; params?: Record<string, unknown>; entity?: EntityName }
```

- **Sem mensagem em string no domínio** — só `code` + `params`. A **UI traduz** (já há
  i18n pt-BR/en); a mensagem é dado, não texto acoplado (soberania).
- `parse` lança `ZodError` **só** na `validation/`; a fronteira o converte para
  `DomainError` (`VALIDATION` + issues). Factories de invariante retornam/erram com os
  códigos `INVARIANT_*`.
- O `Result<T, DomainError>` carrega isso até a borda; a UI mapeia `code`→string.

---

## 16. Read-side: reatividade, selectors & escala

- **Selectors puros** (domínio, em `domain/engine` ou `domain/select`): derivação sobre
  coleções já carregadas, sem I/O — `selectTodayAgenda`, `selectAtRiskSubjects`,
  `selectInbox`, `selectDueBuckets`. Testáveis como qualquer função pura; distintos de
  *query* (que é I/O do adapter).
- **Reatividade:** o `Store` expõe um seam opcional de observação que o adapter implementa
  (Dexie `liveQuery`); o domínio não conhece reatividade.

```ts
export interface Observable { watch(entity: EntityName): AsyncIterable<void> }
```

  O PWA combina isso com `@tanstack/vue-query` para invalidar/recarregar.
- **Escala:** `list()` é O(n) — ok para um semestre, mas `records` crescem. Reservar (no
  adapter, não no domínio) índices por `subjectId`/`day` e paginação quando necessário.
  Orçamento "1 toque": ler só a coleção tocada, nunca tudo.

---

## 17. Migração dos consumidores atuais

Hoje o PWA (`app/composables/useCaderno.ts`, componentes) importa os `*Schema` e tipos
`z.infer` direto de `@meu-caderno/core`. Ao dividir domínio/validação/pacotes:

1. Trocar imports de **tipo** para `@meu-caderno/core` (domínio puro); imports de
   **schema** (`.parse`) passam a vir de `@meu-caderno/validation`.
2. Mover a validação da semente (`SubjectSchema.parse(...)`) para a fronteira de
   `validation`, ou aceitar dados já tipados.
3. Substituir o `reactive` singleton de `useCaderno` por **injeção do `CadernoService`**
   + adapters, montados no composition root (plugin Nuxt / `app.vue`).

Ordem: na **Onda 1**, depois que os ports existirem; manter a tela funcionando a cada
passo (migração incremental, não big-bang).

---

## 18. NOW vs DEFER

| Área | NOW (MVP1) | DEFER |
|---|---|---|
| Estrutura | `core` puro + pacotes `validation` / `adapter-dexie` / `adapter-browser`; PWA = composition root; conformância | adapter de sync/federação (pacote futuro) |
| Garantia | enforcement de boundary (Nx tags/lint) + contract test de port + property-based + DoD por onda | mutation testing, fuzzing pesado |
| Ports | Clock(+today/zone), IdGenerator, Storage, Tx | repos reativos avançados, query DSL |
| Dados | semântica transacional (atômico escrita+oplog) + framework de migração + Id v7 | — |
| Use cases | catálogo do §14 + Result/erros por código (i18n) + cascata + in-memory store | classe-por-use-case, CQRS |
| Engines | simulador, rollcall, atividades, progresso, presets, grafo + selectors puros | — |
| Invariantes | factories (acíclico, FK, cascata) + `.superRefine` (Σpesos, termos) | — |
| Superfície | API/`exports`/semver por pacote | — |
| Read-side | selectors puros + seam de observação (liveQuery) | índice/paginação no adapter, projeções |
| Seams | Origin+Node.origin (v2→v3), registry só-tipos, mergeBackup, undo de sessão | loader de plugin, schema contribuído, CRDT |
| Sync | invariantes preservados (id estável v7, oplog append-only, export agnóstico) | clocks/vetores, federação |
| Futuro (reservar) | — | context map estratégico, domain events ricos, cripto/e2ee, observabilidade/logging |

## 19. Ordem de build recomendada

0. **Transversal (desde já):** enforcement de boundary + harness de contract/property +
   DoD por onda (§10) — o trilho que segura todo o resto.
1. **Onda 0** — reestruturar `domain/` ↔ pacote `validation/` + conformância; `addDays`,
   `Clock`(com `today/zone`), `IdGenerator` (v7 no adapter).
2. **Onda 2 engines** — simulador → rollcall → atividades → progresso → presets → grafo
   (independentes do storage; valor cedo) + selectors (§16). Corrigir os edge cases de
   engine (§7: arredondamento de frequência, denominador de notas) junto.
3. **Onda 1 fundação** — `domain/ports/storage.ts` + semântica transacional (§11),
   `application/` + erros por código (§15) + cascata, `adapter-dexie`/`adapter-browser`,
   `testing/in-memory-store.ts`, e a **migração dos consumidores** (§17).
4. **Onda 3 seams** — `Origin`/`Node.origin` + framework de migração v2→v3 (§12),
   `merge.ts` (FK), `undo.ts`, registry de capacidades.

## 20. Follow-ups de schema/domínio

- **Regras de falta por disciplina:** `lateIsHalf`/`medicalExcuses` (e peso de atraso) em
  `Subject` — destrava faltas configuráveis (§7).
- **Σ pesos de avaliação = 1** (§6/§7). **Recorrência com fim** (`until`/`count`).
- **`Schedule` sem ciclo:** `ROTATING_CYCLE`/`BLOCK_INTENSIVE` precisam de comprimento de
  ciclo / faixa de bloco; até lá, tratar como ad-hoc.
- **Calendário de feriados** (prever carga futura). **`Origin` estruturado** + `Node.origin`.
- **Enums derivados** (`AttendanceRiskLevel`, `DueBucket`): não persistidos → ficam em
  `domain/engine`, não viram schema.
