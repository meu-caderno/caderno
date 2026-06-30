# Backlog de implementação — paridade com o Claude Design

> Checklist técnico e acionável das **lacunas do PWA** (`src/pkgs/apps/pwa`) frente ao MVP de referência
> (`Caderno/MVP - Presença, Faltas & Atividades.dc.html`), derivado da comparação 1:1.
> Produto/fonte de verdade: [BACKLOG.md](./BACKLOG.md) · Decisões: [DECISIONS.md](./DECISIONS.md) ·
> Arquitetura: [ARCHITECTURE.md](./ARCHITECTURE.md) · Boas práticas: [GUIA-BOAS-PRATICAS.md](./GUIA-BOAS-PRATICAS.md).
>
> Status: ⬜ a fazer · 🟡 parcial · ✅ feito · 🔒 decisão necessária · 🚫 fora de escopo (local-first mono-usuário).
> Cada tarefa lista o **alvo** (arquivos a criar/editar) e mudanças de **core** (`@meu-caderno/core`) quando houver.
> Regra de ouro do repo: cada item entra com **gate verde** (biome ci · typecheck · test · build · reuse) e
> commit pequeno; mutações sempre pelo `CadernoService` (funil único + oplog + hook); domínio puro.

---

## ✅ Ordem por quick win (ROI: valor alto × esforço/risco baixo primeiro)

Esforço: **P** (horas) · **M** (1–2 dias) · **G** (vários dias). Valor: **A**lto · **M**édio · **B**aixo.
"Bloqueio" = depende de decisão (🔒) ou mudança de core não-trivial. Os códigos linkam para o detalhe do
épico abaixo.

### 🟢 Tier 1 — Quick wins (horas, sem core, sem decisão)
1. [x] **H4 · Tokens** `--pt-purple` + tema escuro do Pomodoro — feito: tokens roxos + `PomodoroOverlay` fullscreen escuro (`#1b1916`).
2. [x] **H1 · ActivityForm "é preparação 📚"** — feito: switch + alvo (atividades com prazo) + `gapDays` (`NumberField`), grava `preparesId`/`gapDays`.
3. [x] **H5 · Widget de Pomodoro na Home** — feito: `Section/Home/PomodoroWidget.vue` + widget `pomodoro` em `HOME_WIDGETS`.
4. [x] **H6 · Grid de stats + acesso rápido na Home** — feito: `Section/Home/QuickStats.vue` (frequência/risco/pendentes/aulas + atalhos) + widget `stats`.
5. [ ] **H2 · SubjectForm campos avançados** (modelo de grade, forma de presença, eixo) — **adiado**: exige campos novos no `Subject` (core); não é quick win. Move p/ a camada de core.

### 🟡 Tier 2 — Wins médios (1–2 dias, pouco/zero core)
6. [x] **E1 · Página Disciplinas** — feito (`useSubjects` + `pages/disciplinas.vue`, agrupada por contexto).
7. [x] **E4 · Página Contextos** — feito (`Section/Contextos/ContextCard` + `pages/contextos.vue`).
8. [x] **E2 · Página Presenças & Faltas** — feito (`usePresences` + `utils/presences.ts` (+spec) + `pages/presencas.vue`).
9. [x] **E3 · Página Atividades + lote** — feito (`utils/activities-filter.ts` (+spec) + `pages/atividades.vue`, seleção + barra de lote).
10. [x] **E5 · Nav das telas novas** — feito (4 rotas em `NAV_ITEMS`; `DEFAULT_TAB_KEYS` mantém a tab bar enxuta; rail mostra todas).
11. [x] **B0–B4 · Conhecimento sem canvas** — feito: core `Mastery` + `Node.mastery`; `pages/caderno.vue` com Árvore/Lista/Board/Tabela; `utils/concepts.ts` (+spec) + `ConceptList/Board/Table`.
12. [x] **G1+G2 · Dashboard de contexto** — feito: `pages/contexto/[id].vue` (stats/módulos/integralização/edital/atalhos) + `Section/Contexto/{StatsRow,ModulesRow}`.
13. [x] **D1–D4 · Agenda multi-visão** — feito: `useAgenda.daysInRange` + `pages/agenda.vue` (Lista/Dia/Semana/Mês) + `Section/Agenda/{DayPills,DayView,WeekView,MonthGrid,MonthCell}`.

### 🟠 Tier 3 — Núcleo (alto valor, esforço médio-alto)
14. [x] **A1–A6 · Editor de Notas rich-text** — feito: `UI/RichTextEditor.vue` (TipTap StarterKit + Link + Placeholder + TaskList) + toolbar + `assets/css/tiptap.css`; `NoteForm` usa o editor, `NoteDetail` renderiza o HTML.
15. [x] **F · Command palette ⌘K** — feito: `useSearch` (contextos/disciplinas/atividades/notas/acervo) + `UI/CommandPalette.vue` (teclado ↑/↓/enter/esc); ⌘K global no layout (a captura saiu do ⌘K — segue no QuickMenu/QuickStats). _(F0: ⌘K = busca.)_
16. [x] **B6 · Modo Revisão** — feito: `engine/notebook.reviewQueue` (+spec, core 136) + `Section/Caderno/ReviewMode.vue` + chip "Revisão".
17. [x] **D5 · Horário (timetable)** — feito: `Section/Agenda/{Timetable,TimetableCell}.vue` + visão "Horário".
18. [x] **A7+A8 · Âncora "pertence a" + promover-tarefa** — feito: `Node.subjectId?/contextId?` (core); NoteForm "Pertence a (disciplina)"; NoteDetail "Virar atividade".
19. [x] **H3 · Acervo: estado + resenhas** — feito: core `LibraryState`/`LibraryReview` + zod; `useLibrary.groups`; `ItemForm`/`ItemCard`/`acervo.vue` por estado + resenha do contexto.

### 🔴 Tier 4 — Pesado e/ou bloqueado por decisão (🔒)
20. [x] **B5 · Grafo visual (Cytoscape lazy)** — feito: `ConceptGraph.vue` + `utils/graph.ts`, import dinâmico.
21. [x] **B7 · Mapas (StudyMap)** — feito: entidade `StudyMap` no core (coleção `maps`) + `MapEditor.vue`; fora do backup por ora.
22. [~] **C · Moldura desktop / workbench** — **Stages 1–2 feitos**: split desktop (reka-ui `Splitter`) +
    painel contextual de Notas dockável (`Section/Shell/NotesPanel`, toggle no Rail, ≥1100px); **sidebar em
    árvore** contextos→disciplinas (`Section/Shell/ContextTree`). **Restante** (continuação): abas de **rota**
    lado a lado (route-in-pane — exige gerência de abas/keep-alive) e **bancadas com layout salvo** (estender
    `Workbench` no core) — peças arquiteturais maiores, para sessão dedicada.
+ [x] **Rename `Record`/`Node`** → `AttendanceRecord`/`NotebookNode` — feito (43 arquivos; gate verde).

### 🚫 Fora de escopo (local-first mono-usuário)
- **G4 · Membros / convidar / backend remoto** — placeholder visual apenas, até existir a camada de sync.

> **Regra de leitura:** comece de cima. Tier 1–2 entrega a maior parte da paridade *percebida* com baixo
> risco; o editor (#14) é o maior salto de valor isolado e deve vir logo após os wins baratos; Tier 4 só
> depois de destravar as decisões em DECISIONS.md.

---

## EPIC A — Editor de Notas rich-text  ⬜

Design: editor estilo Notion (TipTap) com toolbar, headings, listas, checklist, citação, código, link,
"promover tarefa", âncora "pertence a", Página/Índice, autosave. PWA hoje: `<textarea>` de texto plano
(`components/Section/Caderno/NoteForm.vue`, `NoteDetail.vue` renderiza `pre-wrap`).

- [ ] **A0 · Decisão de formato de `Node.body`** — hoje `body?: string` (texto plano). Escolher: armazenar
  **HTML serializado** ou **JSON do ProseMirror** (recomendado: JSON, reversível e estável).
  - Core: manter `body?: string` (serializado) — sem mudança de tipo; **documentar o formato** em
    `domain/model.ts` e em DECISIONS. Avaliar campo `bodyFormat?: "text" | "doc"` para migração suave de
    notas antigas (texto plano vira parágrafo). Alvo: `pkgs/core/src/domain/model.ts`, `validation/schemas.ts`.
- [ ] **A1 · Dependências** — adicionar `@tiptap/core` + `@tiptap/starter-kit` + extensões
  `task-list`/`task-item`/`placeholder`/`link` ao `pkgs/apps/pwa/package.json` (o design usa estas mesmas).
- [ ] **A2 · `components/UI/RichTextEditor.vue`** — wrapper headless do TipTap: `v-model` (doc JSON),
  `placeholder`, eventos de update. Sem chrome — só a área editável + estilos `papel-tinta`.
- [ ] **A3 · Toolbar** (`components/UI/RichTextToolbar.vue` ou slot) — B / I / H1-H3 / lista / lista ordenada /
  checklist / citação / código / link, com `is-active` por marca (espelhar `.tt-tool` do design).
- [ ] **A4 · Estilos de conteúdo** — replicar `.tiptap-host` do design (corpo `Literata` 17px/1.62, headings
  `Shantell`, blockquote itálico, code `--pt-linen`, pre tinta, checklist com accent). Alvo:
  `app/assets/css/` (novo `tiptap.css`) ou `<style>` do componente.
- [ ] **A5 · Integrar no fluxo de nota** — substituir o `<textarea>` em `NoteForm.vue` pelo editor; novo
  `Section/Caderno/NoteEditor.vue` (página/painel de leitura+edição) com título manuscrito + meta-pills
  (aspects) + editor. `NoteDetail.vue` passa a renderizar o doc (read-only).
- [ ] **A6 · Autosave** — debounce (~600ms) → `service.updateNode`; indicador "✍ salvando… / ✓ salvo {quando}"
  (espelha o design). Reusar `useToast`? Não — indicador inline no header da nota.
- [ ] **A7 · Âncora "Pertence a…"** — autocomplete de disciplina/contexto que cria vínculo (edge `PART_OF`
  ou campo no Node). Depende de seletor de disciplinas. (Pode ficar para B.)
- [ ] **A8 · Promover item de checklist → Atividade** — ação que cria `Activity` (kind TASK) a partir de um
  task-item. Usa `service.upsertActivity`. (Opcional/avançado.)
- [ ] **A9 · Testes + a11y** — foco por teclado na toolbar, `aria` nos botões; spec do RichTextEditor
  (serialização ida/volta). Gate verde.

**Aceite:** criar/editar uma nota com headings/listas/checklist/link, salvar e reabrir preservando o conteúdo.

---

## EPIC B — Caderno de Conhecimento (grafo + modos)  ⬜

Design (`isConhecimento`): modos **Revisão / Lista / Board / Tabela / Grafo (Cytoscape) / Mapas**, domínio de
maestria por conceito (não sei / estudando / domino), lentes, foco/vizinhança, legenda, relações, grupos.
PWA hoje: `pages/caderno.vue` = **árvore recursiva** (`NoteRow`) + edges como texto (`NoteLinks`).

- [ ] **B0 · Core: maestria do conceito** — adicionar ao `Node` um campo de domínio
  `mastery?: Mastery` (enum `UNKNOWN | STUDYING | MASTERED`). Alvo: `domain/model.ts` (+ enum),
  `validation/schemas.ts`, `engine/notebook.ts` (helpers). Mutator via `service.updateNode`.
- [ ] **B1 · Seletor de visão** — `pages/caderno.vue`: Chip tabs Árvore (atual) / Lista / Board / Tabela /
  Grafo / Mapas, persistido em `Preferences` (via `useLayout`/`usePreferences`).
- [ ] **B2 · Lista** — `Section/Caderno/ConceptList.vue`: conceitos com ciclo de maestria (clicar cicla
  UNKNOWN→STUDYING→MASTERED) e contagem de ligações. Selector de engine: `concepts(nodes)`.
- [ ] **B3 · Board** — `Section/Caderno/ConceptBoard.vue`: colunas por maestria (ou por domínio). Reusar o
  padrão kanban de `Section/Home/ActivityBoard.vue` (`groupBy`).
- [ ] **B4 · Tabela** — `Section/Caderno/ConceptTable.vue`: Nome / Tipo / Domínio / Matéria / Modificado;
  drill em mobile.
- [ ] **B5 · Grafo visual** 🔒 — integrar lib de grafo. Design usa **Cytoscape + dagre**. Decidir:
  Cytoscape (igual ao design, pesado) vs alternativa Vue/SVG mais leve. Renderizar nós (cor por aspecto) +
  arestas (estilo por `EdgeKind`: PART_OF/PREPARES/ASSESSES/SOURCE_OF), busca, foco/vizinhança, aviso de
  ciclo (já há `createsCycle` no engine), legenda, toggles de relação, ocultar/mostrar grupos.
  Alvo: `Section/Caderno/ConceptGraph.vue` + dep no `package.json`.
- [ ] **B6 · Revisão** — `Section/Caderno/ReviewMode.vue`: "o que cai e não sabe" — selector de engine que
  cruza `mastery=UNKNOWN/STUDYING` com edges `ASSESSES`/`PREPARES` e prazos de atividades. Ação "✓ avancei"
  (sobe maestria). Engine puro: `pkgs/core/src/engine/notebook.ts` (novo `reviewQueue`).
- [ ] **B7 · Mapas (compor do grafo)** 🔒 — **nova entidade de domínio**. Core: `Map { id, name, items[] }`
  onde item é seção ou referência a Node (`{ kind: "section" | "ref", label?, nodeId? }`). Adicionar coleção
  `maps` ao `ContextStore`/Dexie (atualiza `ENTITY_COLLECTIONS`), CRUD no `CadernoService`
  (`createMap`/`updateMap`/`deleteMap`) com oplog+hook, e zod schema. UI: `Section/Caderno/MapEditor.vue`
  (nome, itens ▲▼/✕, cobertura, "gerar plano do grafo"). Inclui no backup.
- [ ] **B8 · Backlinks** — surgir "apontam pra cá" no `NoteDetail`/grafo (já há `store.graph.edgesTo`).
- [ ] **B9 · Testes** — selectors (`concepts`/`reviewQueue`), CRUD de Map (store-contract), maestria. Gate verde.

**Aceite:** alternar entre os 6 modos; ciclar maestria; ver o grafo de um contexto; criar um mapa a partir
de conceitos.

> **Nota de escopo:** B5 (Cytoscape) e B7 (Mapas) são os pedaços mais pesados — podem virar sub-fases
> próprias. B0–B4 e B6 entregam ~70% do valor sem o canvas.

---

## EPIC C — Moldura desktop / workbench multi-painel  🔒

Design: sidebar com árvore de pilares/contextos + "minhas disciplinas", **abas reordenáveis**, **bancadas
com tiling**, **split view (2 painéis)**, **painel contextual de Notas** (ctxpanel). PWA: coluna única
`max-width:720px`, rail/tabbar, `Workbench` = bookmark (rota+contexto).

> **Decisão necessária antes de qualquer tarefa:** isso **contraria a decisão atual "mobile-first coluna
> única"**. Implementar exige uma camada de layout desktop nova e paralela. Registrar em DECISIONS como
> bifurcação (manter coluna única vs adicionar modo workbench desktop opcional).

- [ ] **C0 · Decisão registrada** em DECISIONS.md (escopo, breakpoint, persistência de layout). 🔒
- [ ] **C1 · Sidebar desktop** com árvore de contextos + "minhas disciplinas" (≥ um breakpoint largo).
  Alvo: `Section/Shell/Rail.vue` evolui para `SidebarTree` ou novo componente.
- [ ] **C2 · Sistema de abas** — abrir várias telas como abas (estado de abas em `useWorkbenches`/novo
  `useTabs`). Tira de abas + fechar/reordenar (reusar `Sortable`).
- [ ] **C3 · Split view** — dividir a área em 2 painéis (esquerda/direita), trocar lados, fechar.
- [ ] **C4 · Bancadas com layout** — estender `Workbench` (core `model.ts`) para guardar **layout de abas +
  split**, não só rota+contexto. `WorkbenchesCard` salva/invoca o layout.
- [ ] **C5 · Painel contextual de Notas** (ctxpanel) — árvore do caderno do contexto ativo, dockável.

**Aceite:** abrir 2 telas lado a lado, salvar como bancada, reabrir o layout.

---

## EPIC D — Calendário multi-visão  🟡→⬜

Design (`isCal`): **Lista / Dia / Semana / Mês / Horário** (grade semanal). PWA: `pages/agenda.vue` = só
**lista de 7 dias** (`useAgenda` → `days`, `Section/Agenda/DayRow`).

- [ ] **D0 · Engine: expandir horizonte** — generalizar `useAgenda`/engine para um intervalo arbitrário
  (mês/semana). Já existe `expandSchedule(schedule, range)` em `engine/schedule.ts` — reusar. Mapear
  atividades por `dueDate` no intervalo. Sem mudança de core além de selectors.
- [ ] **D1 · Seletor de visão** — `pages/agenda.vue`: Chip Lista/Dia/Semana/Mês/Horário (persistir prefs).
- [ ] **D2 · Mês** — `Section/Agenda/MonthGrid.vue`: grid 7 col, células com dots por disciplina + marcador
  de atividade, navegação ‹›, detalhe do dia selecionado.
- [ ] **D3 · Semana** — `Section/Agenda/WeekView.vue`: 7 cards com pills de aula/atividade.
- [ ] **D4 · Dia** — `Section/Agenda/DayView.vue`: navegação ‹›, itens do dia.
- [ ] **D5 · Horário** — `Section/Agenda/Timetable.vue`: grade 5 dias × blocos a partir de
  `Subject.schedule.blocks`; "fora da grade" para rotativas/ad-hoc.
- [ ] **D6 · Testes** — selectors de mês/semana/horário (engine puro). Gate verde.

**Aceite:** alternar visões; ver o mês com marcadores; ver a grade de horário da semana.

---

## EPIC E — Telas dedicadas (extrair da Home / novas rotas)  ⬜

Design tem telas próprias; o PWA agrega tudo na Home + modais. Atenção: **não inflar a Home** e respeitar o
limite de itens da nav mobile (`PINNED_NAV_KEYS`).

- [ ] **E1 · Disciplinas** — página `/disciplinas` agrupada por contexto (cabeçalho de grupo + cards). Novo
  `useSubjects` (lista + agrupamento) reusando `deriveStats`. Alvo: `pages/disciplinas.vue` +
  `Section/Subjects/*`. Reusa `SubjectCard`.
- [ ] **E2 · Presenças & Faltas** — página `/presencas` com **filtros** (Tudo / Faltas&atrasos / Presenças) +
  **agrupar** (data / disciplina / situação). Selector de engine sobre `store.records`. Alvo:
  `pages/presencas.vue` + `Section/Presenca/*` (reusa `Badge`, `Heatmap`).
- [ ] **E3 · Atividades** — página `/atividades` com filtros (Todas/Pendentes/Entregues) + agrupar
  (prazo/grupo/disciplina) + **modo seleção múltipla + barra de lote** (Concluir/Excluir/Cancelar). Reusa
  `ActivityItem`/`ActivityBoard`. Core: `deleteActivity`/`upsertActivity` em lote (loop pelo service).
- [ ] **E4 · Contextos** — página/grade de cards de contexto (kind, padrão, meta, foco). Alvo:
  `pages/contextos.vue` + `Section/Contextos/ContextCard.vue`. Reusa `ContextSwitcher`/`ContextDetail`.
- [ ] **E5 · Navegação** — decidir como expor as novas rotas sem estourar a tab bar mobile: provavelmente
  via **rail desktop** + **acesso pela Home** (cards/atalhos), não como abas fixas. Atualizar `NAV_ITEMS`/
  `useLayout` com itens **ocultáveis** (não-pinned). Alvo: `composables/useNav.ts`, `useLayout.ts`.
- [ ] **E6 · Testes/gate** por página.

**Aceite:** abrir cada tela dedicada com seus filtros/agrupamentos; lote em Atividades.

---

## EPIC F — Busca global / command palette (⌘K)  ⬜

Design (`mBusca`): paleta ⌘K com **resultados por seção** (Contextos/Disciplinas/Atividades/Notas) +
"criar agora". PWA hoje: ⌘K abre **QuickCapture** (`pages/index.vue:58-65`).

- [ ] **F0 · Decisão de atalho** — hoje ⌘K = captura. Opções: paleta vira ⌘K e captura ganha outro atalho;
  ou paleta inclui "capturar" como primeiro comando. (Recomendado: paleta em ⌘K, captura como comando.)
- [ ] **F1 · `useSearch`** — indexar contexts/subjects/activities/nodes/library a partir das live queries;
  filtro fuzzy (sem dep nova se possível; senão `fuse.js` leve). Puro/derivado, sem core novo.
- [ ] **F2 · `components/UI/CommandPalette.vue`** — Dialog reka-ui + lista filtrável navegável por teclado
  (↑/↓/Enter), grupos por seção, estado vazio "criar agora".
- [ ] **F3 · Comandos** — navegar (ir para tela/contexto), criar (contexto/disciplina/atividade/nota),
  capturar. Reaproveita `useHomeDialogs`/`service`.
- [ ] **F4 · Wiring** — registrar atalho global (substitui o handler de `index.vue`), disponível em todas as
  páginas (mover para o layout). a11y (foco, `role="dialog"`, trap). Gate verde.

**Aceite:** ⌘K abre a paleta em qualquer tela; buscar e abrir um item; criar via comando.

---

## EPIC G — Visão do Contexto (dashboard)  🟡→⬜

Design (`isCtx`): dashboard do "mundo" do contexto — módulos, stats, atalhos, **edital/plano/integralização
(baldes)**, **membros**. PWA: `ContextDetail` (modal) + `GoalsManager` (baldes) + `ContextModules`.

- [ ] **G1 · Página de contexto** — `/contexto/[id]` (ou expandir `ContextDetail` em dashboard): cabeçalho
  (kind, postura, piso, módulos), 3 stats (freq/disciplinas/pendentes), atalhos (disciplinas/atividades/
  agenda). Alvo: `pages/contexto/[id].vue` (typed pages já ligado) + `Section/Contexto/*`.
- [ ] **G2 · Integralização** — superfície dos `buckets` (já em `GoalsManager`) como seção do dashboard
  (barras por balde + total). Sem core novo.
- [ ] **G3 · Edital/Plano** 🟡 — countdown de `Term` (start/end já existem) + matérias do edital. Avaliar se
  precisa de core (provável: só UI sobre `terms`+`buckets`+`subjects`). Registrar se virar entidade.
- [ ] **G4 · Membros / convidar / backend** 🚫 — **fora de escopo** (local-first mono-usuário). Marcar como
  "em breve" visual apenas, sem implementação de federação.
- [ ] **G5 · Testes/gate.**

**Aceite:** abrir o dashboard de um contexto com módulos, stats e integralização.

---

## EPIC H — Polimento / fidelidade  ⬜

- [ ] **H1 · ActivityForm — preparação** — expor toggle "📚 é preparação" (`preparesId` + `gapDays` já
  existem no `Activity`): tipo de preparação, "para qual atividade" (alvo), "dias antes". Alvo:
  `Section/Home/ActivityForm.vue`.
- [ ] **H2 · SubjectForm — campos avançados** — modelo de grade, forma de presença, eixo (médio integrado).
  Avaliar quais precisam de core (schedule já cobre boa parte). Alvo: `Section/Home/SubjectForm.vue`.
- [ ] **H3 · Acervo — estado e resenhas** — core: `LibraryItem` ganha `state?: LibraryState`
  (`WANT | CONSUMING | DONE`) e `reviews?` (por contexto). UI: colunas por estado em `pages/acervo.vue`,
  busca de catálogo (stub/local), resenhas-por-contexto, "promover a conceito". Alvo:
  `domain/model.ts`, `validation/schemas.ts`, `Section/Acervo/*`.
- [ ] **H4 · Tokens** — adicionar `--pt-purple`/soft (domínio Caderno/conceito/ponte, hex `#7a4f96`) ao
  `papel-tinta.css`; **tema escuro** do Pomodoro fullscreen (`#1b1916`). Alvo: `app/assets/css/papel-tinta.css`,
  `PomodoroOverlay.vue`.
- [ ] **H5 · Widgets da Home** — adicionar **widget de Pomodoro** e **feed de atividade recente** ao
  `HOME_WIDGETS` (reordenáveis). Alvo: `composables/useLayout.ts`, `Section/Home/*`.
- [ ] **H6 · Grid de stats / acesso rápido na Home** — bloco de stats (Frequência/Pendentes/Próxima
  entrega/Chamada hoje) e acesso rápido (Atividade/Simular/Agenda/Contextos) como no design.
- [ ] **H7 · Gate** por item.

---

## Mudanças de domínio (`@meu-caderno/core`) resumidas

Tudo abaixo segue o funil único (`CadernoService` + oplog + hook), zod schema, e atualização de
`ENTITY_COLLECTIONS` quando há coleção nova. Cada um exige spec (`runStoreContract` p/ coleções).

- [ ] **`Node.mastery?: Mastery`** (B0) — enum `UNKNOWN|STUDYING|MASTERED`.
- [ ] **`Map`** (B7) — nova entidade + coleção `maps` + CRUD no service + backup.
- [ ] **`LibraryItem.state?` + `reviews?`** (H3).
- [ ] **`Node.bodyFormat?`** (A0) — opcional, p/ migração de notas texto→doc.
- [ ] **`Workbench` com layout de abas/split** (C4) — só se Epic C for aprovado.
- [ ] Selectors de engine novos (puros): `concepts`, `reviewQueue` (B), expansão de agenda por intervalo (D),
  filtros/agrupamentos de presença e atividade (E).

---

## Decisões necessárias (🔒) — registrar em DECISIONS.md antes de codar

1. **Epic C (workbench desktop)** — manter coluna única vs adicionar modo desktop multi-painel.
2. **B5 (grafo)** — Cytoscape (paridade, pesado) vs lib Vue/SVG leve.
3. **B7 (Mapas)** — entidade nova no domínio (coleção + sync/backup).
4. **A0 (formato de nota)** — JSON ProseMirror vs HTML; estratégia de migração de notas existentes.
5. **F0 (⌘K)** — realocar a captura para outro atalho.

## Fora de escopo (🚫) — local-first mono-usuário
- Membros, convidar, compartilhar, backend remoto, federação (Epic G4). O design marca "em breve"; manter
  apenas placeholder visual, sem implementação, até a camada de sync existir (ver DECISIONS #14/#16).

---

## Resumo de contagem

- **Épicos:** 8 (A,B,C,D,E,F,G,H) + camada de core.
- **Decisões a destravar:** 5.
- **Maior risco/peso:** A (editor), B5 (grafo), B7 (mapas), C (workbench).
- **Maior valor/menor risco para começar:** A (editor) e E (telas dedicadas) — entregam o "Caderno" e
  desafogam a Home sem mexer fundo no domínio.
