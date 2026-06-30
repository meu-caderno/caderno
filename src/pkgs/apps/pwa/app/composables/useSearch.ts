import type {
  Activity,
  Context,
  LibraryItem,
  NotebookNode,
  Subject,
} from "@meu-caderno/core";

export interface SearchHit {
  id: string;
  kind: string;
  label: string;
  to: string;
}

const MAX_PER_KIND = 4;
const MAX_TOTAL = 16;

function matches(text: string, query: string): boolean {
  return text.toLowerCase().includes(query);
}

export function useSearch() {
  const { store } = useCadernoService();
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
    if (!query) return [];
    const hits: SearchHit[] = [];
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

  return { search };
}
