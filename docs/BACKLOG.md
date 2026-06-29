# Backlog do MVP — Caderno

> **Funcionalidades, fluxos e regras** do MVP1, extraídos do protótipo de design (Claude Design — projeto *"academic tasks"*: `MVP - Presença, Faltas & Atividades`, `Configurações`, `Mapa de navegação`, Wireframes) + [README](../README.md) e [Constituição](../CONSTITUTION.md). É a **fonte de verdade de produto**.
>
> Log de decisões de implementação: [DECISIONS.md](./DECISIONS.md) · Arquitetura: [ARCHITECTURE.md](./ARCHITECTURE.md).
>
> **Status (vs código atual):** ✅ feito · 🟡 parcial · ⬜ a fazer. As fases de UI estão em DECISIONS #12 (F0–F5).

---

## 0. Princípios (regras transversais — valem para tudo)

- **Local-first / offline-first** — dados no aparelho; funciona sem internet; sync é conveniência futura, nunca controle. ✅
- **Soberania** — o sistema aconselha/alerta, **nunca impõe/bloqueia/infantiliza**; **toda ação importante é reversível** (undo). 🟡 (undo de UI ⬜)
- **Liberdade progressivamente revelada** — a tela **nasce limpa**; todo poder pode existir desde o início, mas só é **exposto** quando o usuário pede (gesto/gatilho). Esconder por encapsulamento, nunca amputar. ⬜
- **Consentimento proporcional ao impacto** — nada relevante acontece sem consentimento (ex.: ativar gamificação, gatilhos de motivação). ⬜
- **Sem lock-in** — exportar/importar tudo em `.json`; os dados (e a chave, quando cifrado) são do usuário. 🟡 (cripto ✅; export/import UI ⬜)
- **Mesmo sistema em profundidades diferentes** — acolhedor pra iniciante, poderoso pra avançado; nunca dois apps.

---

## 1. Onboarding & revelação progressiva  🟡

**Fluxo (multi-etapa, com "Pular configuração" em qualquer ponto):**
1. **Boas-vindas** — "Suas faltas, presenças, atividades — do seu jeito, no seu aparelho". Dois caminhos: **"Explorar com um exemplo pronto"** (modo demo) ou **"Já quero criar o meu"**.
2. **"Pra que você vai usar?"** — escolher **um ou mais objetivos** (faculdade · concurso/ENEM · curso livre · estudo livre); o app liga os módulos certos. Mutável depois.
3. **Primeiro contexto** — nome + **natureza** (ex.: médio integrado → decisão de matrícula única vs duas matrículas, eixo base/técnico).
4. **Postura com faltas** — 🎯 foco em não faltar · 🗓 planejar faltas · 🌙 não gerenciar agora. Por contexto, mutável.
5. **Como começar a Home** — escolher um perfil/mood inicial.

**Regras:** modo exemplo é descartável ("Criar o meu"); "rever onboarding/boas-vindas" disponível em Configurações; gatilhos pedem consentimento.

- ✅ Criar 1º contexto (nome + objetivo) + ativar (F1).
- ⬜ Multi-etapa (objetivos múltiplos, natureza/eixo, postura, perfil inicial), "pular", **modo exemplo/demo**, "bem-vindo de volta", rever onboarding.

## 2. Contextos  🟡

**Funcionalidades:**
- **Por objetivo** (faculdade/concurso/curso/estudo livre) — cada um liga módulos: **faltas · notas · período · streak · horas · edital · certificado**.
- **Tipo:** 🏫 turma (de uma disciplina) · 👥 grupo (dividem várias) · 🧭 pessoal (só você).
- **Vocabulário** por contexto (como chama matéria/disciplina/módulo).
- **Postura com faltas** + **piso de frequência** (%) por contexto (com hint de impacto ao mexer).
- **Visão de futuro** (lembrete de por que começou).
- **Módulos** ligáveis (o que o contexto controla); alguns "em breve".
- **Multi-contexto** + **agenda unificada**; **agrupar por contexto**; **contextos fixos** (pin); **período arquivado** (somente leitura).
- **Plugins & dados do contexto** (onde moram, importações, integrações).
- **Detalhe do contexto:** frequência do período, nº disciplinas, pendentes, foco, módulos, membros, meta de estudo.

- ✅ Criar contexto (nome+objetivo), **multi-contexto + switcher**, contexto ativo persistido (F1).
- ⬜ Tipo (turma/grupo/pessoal), natureza/eixo, vocabulário, postura, piso editável, visão, módulos toggláveis, agrupar, fixar, arquivar, detalhe do contexto.

## 3. Disciplinas (subjects)  🟡

**Criar disciplina (form):** nome · contexto · **cor** · **créditos → carga** (ou carga em horas-aula) · **horas por aula** · **dias de aula** · **modelo de grade** (semanal/rotativa/blocos/avulsa) · **forma de presença** · **eixo** (médio integrado) · **regra de faltas** (piso %, **atestado abona**, **atraso = ½ falta**, modelos de regra).

**Detalhe da disciplina:** margem de faltas (aulas que ainda pode faltar) · frequência atual (piso) · **orçamento de faltas** (presente/falta/atraso/atestado) · **ritmo de presença** (heatmap) · **notas & média** · **grade & presença** · **regra de faltas** (cada aula = N horas-aula; atestado/atraso; cancelada/feriado não contam) · **histórico** · **promover a conceito** (vira nó no Caderno).

- ✅ Card de disciplina com stats (frequência, risco, heatmap, média) na Home (F1).
- ⬜ **Form de criar/editar disciplina** (F2), tela de **detalhe**, promover a conceito.

## 4. Presença & Faltas  🟡

**Fluxo:** **Chamada de hoje** montada da grade → marcar em **1 toque** (✓ presente · falta · atraso · atestado) · "registrar ausência" · "alterar". "Nenhuma aula hoje 🌿". "Fazer chamada de hoje" no menu rápido.

**Regras (motor de faltas):**
- **hora-aula × hora-relógio**; **créditos → carga**; **aula dupla** (classesPerSession).
- **Feriado / aula cancelada não contam** (reduzem carga efetiva).
- Tipos: **atestado abona** a falta; **atraso conta como ½ falta** (configurável).
- **Risco por disciplina E agregado por período**; **piso de frequência**.
- Marcação **idempotente por dia** (re-marcar atualiza).

- ✅ Motor de faltas (`computeAttendance`, risco, simulador), marcar presença na Home via serviço (F1), upsert por dia.
- ⬜ Modal "registrar ausência" (tipos), marcar dia passado/avulso, "ver todas".

## 5. Notas & média  🟡

**Funcionalidades:** **avaliações** (nome · **peso** · nota 0–10 opcional) · **média parcial** · **mínimo** · **tendência** · **"quanto preciso na prova pra passar"** (nota em branco = "o que falta") · adicionar/excluir avaliação · promover a conceito.

**Regras:** Σpesos ≈ 1 (**aviso soft**, não bloqueia); nota em branco entra como pendente no cálculo.

- ✅ Motor de notas (`weightedAverage`), `setGrade`, invariante Σpesos (soft).
- ⬜ Form de avaliação, tela de média/"quanto preciso", `addAssessment` (F3).

## 6. Atividades & Inbox  🟡

**Funcionalidades:**
- **Nova atividade:** título · disciplina · **tipo** (prova/lista/trabalho/leitura/captura) · **data de entrega** · **recorrência** ("repete").
- **Preparação:** estudo que não vale nota (lista/leitura/PDF/vídeo); **vínculo a uma atividade-alvo** + **"quantos dias antes"** → o **prazo nasce N dias do alvo e acompanha** se ele mudar (prazo vinculado).
- **Captura rápida (⌘K)** → **Inbox** ("solte o que estiver na cabeça"; Enter salva, Shift+Enter quebra linha; offline).
- **Inbox:** organizar depois → **virar tarefa** (escolher disciplina) ou **descartar**.
- **Visualização:** lista **ou** board (colunas por status/prazo); subtarefas (x/y); "atividade recente"; rearranjo inteligente.

- ✅ Engine de atividades (`sortByDue`, inbox, due buckets), `upsertActivity` + ciclo `prepares`, lista pendente na Home.
- ⬜ Form de atividade, captura ⌘K, Inbox UI, board, preparação/prazo vinculado, recorrência UI (F3).

## 7. Agenda unificada  ⬜

**Funcionalidades:** dia/semana/mês · por horário · **vários contextos num calendário só** · aula + atividade · "fora da grade" · "nada na agenda 🌤". Expansão de `Schedule`→ocorrências.

- ✅ Engine de schedule/rollcall (expansão de grade, sessões do dia).
- ⬜ Telas de agenda (dia/semana/mês/horário).

## 8. Caderno & Conhecimento  ⬜  *(F4 — grafo completo)*

**Notas (árvore):** páginas + **subpáginas** + índice; **editor** (H1/H2/code, "salvando…/salvo"); **ancoragem** ("pertence a" disciplina/contexto) · criar disciplina e ancorar.

**Conhecimento (grafo):** **conceitos em rede** (conceito · prova/acervo · **ponte entre contextos**); **domínio** por nó (não sei/estudando/domino); **ligar conceito**; **foco/vizinhança** ("toque um nó pra focar"); **detecção de ciclo de pré-requisitos** (⚠️ ordem ambígua); relações (aponta pra cá / aponta pra lá); lentes salvas.

**Mapas (ordem de estudo autoral):** sequência com **seções** e **repetição**; **cobertura**; **"gerar plano a partir do grafo"** (rascunho ordenado por pré-requisitos); "compor a partir do grafo".

**Revisão:** "🎯 o que cai e você ainda não sabe"; lacunas por domínio; "✓ avancei"; "tudo dominado 🙂".

- ✅ Engine de grafo (nós/arestas no domínio) + invariante `createsCycle` (pronto).
- ⬜ Use-cases de grafo (`createNode`/`linkNodes`/`moveNode`), editor, grafo visual, mapas, revisão.

## 9. Acervo (biblioteca pessoal)  ⬜

**Funcionalidades:** obras (livros/filmes/artigos) · tipo · **progresso** · **estrelas** · **nota pessoal privada** (estilo Letterboxd) · **resenhas por contexto** (formais, compartilháveis quando a Comunidade existir) · **Catálogo de obras** (plugin: busca capa+sinopse) · "vira fonte no Conhecimento" · remover do acervo.

- ⬜ Tudo (modelo `LibraryItem` existe; sem use-cases nem UI).

## 10. Personalização — Perfis (moods) & aparência  ⬜

**Perfil da Home / moods:** 🌱 Survival · 🌿 Calmo · 🎯 Foco · 🎉 Dopamina · 🎨 Meu jeito — cada um muda foco/widgets/navegação/visual. Trocar de perfil; salvar/criar perfil; perfil padrão.

**Aparência:** **densidade da tela** (essencial/equilíbrio/tudo à mostra) · **cor de destaque** · **fundo** (papel/creme/linho) · **densidade de espaçamento** (compacto/normal/espaçoso) · **fonte de título** · **tamanho do texto** · **visualização de atividades** (lista/board) · **ambiente** (foco/zen recolhe a moldura).

**Widgets da Home** (toggláveis, com locks/hints) · **barra do celular** (tabs, ordem, ＋ central fixo) · **sidebar do desktop** (independente do celular) · **perfil de contexto** (guarda seleção de contextos) · **restaurar padrões**.

**Atalhos & telas:** rever onboarding · "bem-vindo de volta" · rever consentimento de gatilhos.

- ⬜ Tudo (modelos `Profile`/`Mood`/`WidgetPref` existem; sem UI). *(F5 — Ajustes)*

## 11. Gamificação (opt-in)  ⬜

Ofensiva (**streak**) · **XP/nível** · **conquistas** (badges). **Consentimento explícito** ("Ativar ofensiva & XP?" → Ativar / Manter discreto). Combina com qualquer densidade.

- ⬜ Tudo (depende de consentimento; MVP1 opcional).

## 12. Foco — Pomodoro & imersão  ⬜

Timer **foco/pausa/ciclos** (durações configuráveis) · **modo imersão** ("🌌 entrar neste mundo" / "sair") que recolhe o app pra uma coluna só.

- ⬜ Tudo.

## 13. Metas, edital, certificado & integralização  ⬜

- **Meta de estudo** (valor/janela/%).
- **Edital** (concurso): prova, "faltam N dias", checklist do edital.
- **Certificado** (curso): progresso, "emitir".
- **Integralização** (faculdade): **baldes** (obrigatórias/optativas/estágio/horas complementares/TCC) com meta+progresso; **plano de longo prazo**; "acompanhar integralização".

- ✅ Engine de presets por objetivo + buckets no modelo.
- ⬜ UI de metas/edital/certificado/integralização.

## 14. Soberania & dados  🟡

- **Exportar/importar `.json`** (backup completo) · "tudo neste aparelho" · "exportar". ⬜ (engine `exportBackup`/`migrateBackup` ✅; **UI + cifrar arquivo** ⬜) → **F5**.
- **Plugins & dados do contexto** (onde moram, importações, integrações). ⬜
- **Undo / desfazer** (toast "↺ desfazer") sobre o oplog. 🟡 (oplog ✅; undo UI ⬜)
- **Cripto em repouso** (DEK local; senha/Argon2id depois). ✅ (DECISIONS #6/#7)

## 15. Bancadas (workbenches)  ⬜

Guardam **quais abas e o split** da mesa de trabalho (como um marcador); invocáveis; não se sobrescrevem sozinhas. "Mesa atual"; salvar nova / em existente. *(superfície desktop)*

- ⬜ Tudo.

## 16. App shell & navegação  🟡

- **Mobile-first:** coluna central; barra de tabs (＋ central fixo). 🟡 (home ✅)
- **Desktop:** **rail/sidebar (208px) + painel contextual (236px) + tabstrip** (abas), com split de painéis; ⌘K global. ⬜
- **Busca/criação global (⌘K):** buscar ou **criar** disciplina/atividade/contexto/captura. ⬜
- **Menu rápido (＋):** captura rápida · fazer chamada · nova atividade · nova disciplina · novo contexto. ⬜

---

## 17. Comunidade & Federação — **MVP2** (fora do MVP1) ⬜

Turmas · grupos · **membros/papéis** · convidar/entrar · divisão de trabalhos · chat · resenhas compartilháveis. **Federação:** sync descentralizado, e2ee, CRDT. *Dependem de servidor.* Seams reservados (`SyncTransport`, oplog) — DECISIONS #14.

---

## Mapa funcionalidade → implementação (resumo)

| Área | Status | Onde |
|---|---|---|
| Núcleo (domínio/engines/storage/cripto/invariantes/DI) | ✅ | DECISIONS #1–#11, #14 |
| Onboarding (1º contexto) + multi-contexto + switcher + Home | ✅ | F1 |
| Presença (marcar, motor de faltas, risco) | 🟡 | F1 + F2 |
| Disciplinas (form/detalhe) · Notas (form/quanto-preciso) | ⬜ | F2 / F3 |
| Atividades (form/inbox/board/preparação) · Agenda | ⬜ | F3 / F7 |
| Caderno (grafo/mapas/revisão) · Acervo | ⬜ | F4 |
| Personalização/moods · Foco · Gamificação · Bancadas | ⬜ | F5+ |
| Metas/edital/certificado/integralização | ⬜ | F5+ |
| Export/import · plugins · undo | 🟡 | F5 |
| Comunidade/federação | ⬜ | MVP2 |
