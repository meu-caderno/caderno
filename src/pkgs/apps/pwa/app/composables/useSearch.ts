import type {
  Activity,
  Color,
  Context,
  LibraryItem,
  NotebookNode,
  Result,
  Subject,
} from "@meu-caderno/core";
import {
  ActivityKind,
  ActivityStatus,
  type DomainError,
  Root,
} from "@meu-caderno/core";
import { NAV_ITEMS } from "~/composables/useNav";

export interface SearchHit {
  id: string;
  kind: string;
  label: string;
  to: string;
}

export interface SearchCommand {
  id: string;
  label: string;
  to: string;
}

export const SEARCH_COMMANDS: SearchCommand[] = [
  { id: "capture", label: "Capturar", to: "/atividades" },
  { id: "new-activity", label: "Nova atividade", to: "/atividades" },
  { id: "new-subject", label: "Nova disciplina", to: "/disciplinas" },
];

const MAX_PER_KIND = 4;
const MAX_TOTAL = 16;
const DEFAULT_SUBJECT_COLOR = "#3f6fb0" as Color;

function matches(text: string, query: string): boolean {
  return text.toLowerCase().includes(query);
}

export function useSearch() {
  const { store, service, ids } = useCadernoService();
  const { effectiveId } = useActiveContext();
  const contexts = useLiveQuery(
    ["contexts"],
    () => store.contexts.list(),
    [] as Context[],
  );
  const subjects = useLiveQuery(
    ["subjects"],
    () => store.subjects.list(),
    [] as Subject[],
  );
  const activities = useLiveQuery(
    ["activities"],
    () => store.activities.list(),
    [] as Activity[],
  );
  const nodes = useLiveQuery(
    ["nodes"],
    () => store.graph.nodes.list(),
    [] as NotebookNode[],
  );
  const library = useLiveQuery(
    ["library"],
    () => store.library.list(),
    [] as LibraryItem[],
  );

  function search(rawQuery: string): SearchHit[] {
    const query = rawQuery.trim().toLowerCase();
    const screens: SearchHit[] = NAV_ITEMS.filter(
      (item) => !query || matches(item.label, query),
    ).map((item) => ({
      id: item.key,
      kind: "Tela",
      label: item.label,
      to: item.to,
    }));
    if (!query) return screens;
    const hits: SearchHit[] = [...screens];
    const push = (
      source: { id: string; label: string }[],
      kind: string,
      to: string,
    ) => {
      for (const entry of source.slice(0, MAX_PER_KIND)) {
        hits.push({ id: entry.id, kind, label: entry.label, to });
      }
    };
    push(
      contexts.value
        .filter((context) => matches(context.name, query))
        .map((context) => ({ id: context.id, label: context.name })),
      "Contexto",
      "/contextos",
    );
    push(
      subjects.value
        .filter((subject) => matches(subject.name, query))
        .map((subject) => ({ id: subject.id, label: subject.name })),
      "Disciplina",
      "/disciplinas",
    );
    push(
      activities.value
        .filter((activity) => matches(activity.title, query))
        .map((activity) => ({ id: activity.id, label: activity.title })),
      "Atividade",
      "/atividades",
    );
    push(
      nodes.value
        .filter((node) => matches(node.title, query))
        .map((node) => ({ id: node.id, label: node.title })),
      "Nota",
      "/caderno",
    );
    push(
      library.value
        .filter((item) => matches(item.title, query))
        .map((item) => ({ id: item.id, label: item.title })),
      "Acervo",
      "/acervo",
    );
    return hits.slice(0, MAX_TOTAL);
  }

  function createSubject(
    name: string,
  ): Promise<Result<Subject, DomainError>> | null {
    const contextId = effectiveId.value;
    const trimmed = name.trim();
    if (!contextId || !trimmed) return null;
    return service.createSubject({
      contextId,
      name: trimmed,
      color: DEFAULT_SUBJECT_COLOR,
      hoursPerClass: 1,
      classesPerSession: 2,
    });
  }

  async function createActivity(
    title: string,
  ): Promise<Result<Activity, DomainError> | null> {
    const trimmed = title.trim();
    if (!trimmed) return null;
    return service.upsertActivity({
      id: await ids.newId(),
      title: trimmed,
      contextId: effectiveId.value ?? undefined,
      kind: ActivityKind.TASK,
      status: ActivityStatus.OPEN,
      root: Root.CONTEXT,
    });
  }

  return { search, commands: SEARCH_COMMANDS, createSubject, createActivity };
}
