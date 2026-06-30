<script setup lang="ts">
import type { NotebookNode } from "@meu-caderno/core";
import { ancestors } from "@meu-caderno/core";
import { MASTERY_COLOR, MASTERY_LABEL, masteryOf } from "~/utils/concepts";

const props = defineProps<{ concepts: NotebookNode[] }>();
const emit = defineEmits<{ select: [node: NotebookNode] }>();

const { nodes, linksOf } = useNotebook();

interface ConceptRow {
  node: NotebookNode;
  domain: string;
  links: number;
}

function domainOf(node: NotebookNode): string {
  const chain = ancestors(nodes.value, node.id);
  return chain[chain.length - 1]?.title ?? "—";
}

const rows = computed<ConceptRow[]>(() =>
  props.concepts.map((node) => ({
    node,
    domain: domainOf(node),
    links: linksOf(node.id).length,
  })),
);
</script>

<template>
  <div class="concept-table">
    <table class="concept-table__table">
      <thead>
        <tr>
          <th class="concept-table__th">Conceito</th>
          <th class="concept-table__th">Maestria</th>
          <th class="concept-table__th concept-table__th--num">Ligações</th>
          <th class="concept-table__th concept-table__th--hide">Domínio</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.node.id"
          class="concept-table__row"
          @click="emit('select', row.node)"
        >
          <td class="concept-table__td concept-table__td--title">
            {{ row.node.title }}
          </td>
          <td class="concept-table__td">
            <UIBadge
              tone="custom"
              :color="MASTERY_COLOR[masteryOf(row.node)]"
              bordered
              dot
              :label="MASTERY_LABEL[masteryOf(row.node)]"
            />
          </td>
          <td class="concept-table__td concept-table__td--num">{{ row.links }}</td>
          <td class="concept-table__td concept-table__td--hide">{{ row.domain }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.concept-table {
  overflow-x: auto;
}
.concept-table__table {
  width: 100%;
  border-collapse: collapse;
  font-size: calc(14px * var(--pt-text-scale));
}
.concept-table__th {
  text-align: left;
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--pt-ink-muted);
  padding: 6px 10px;
  border-bottom: 1.5px solid var(--pt-border-faint);
}
.concept-table__th--num {
  text-align: right;
}
.concept-table__row {
  cursor: pointer;
}
.concept-table__row:hover {
  background: var(--pt-card);
}
.concept-table__td {
  padding: 10px;
  border-bottom: 1.5px solid var(--pt-border-faint);
  vertical-align: middle;
}
.concept-table__td--title {
  font-weight: 600;
  color: var(--pt-ink);
}
.concept-table__td--num {
  text-align: right;
  font-weight: 700;
  color: var(--pt-ink-muted);
}
@media (max-width: 480px) {
  .concept-table__th--hide,
  .concept-table__td--hide {
    display: none;
  }
}
</style>
