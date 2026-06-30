import type { Id } from "@meu-caderno/core";

export function pickEffectiveContextId(
  availableIds: readonly Id[],
  activeId: Id | null,
): Id | null {
  if (activeId && availableIds.includes(activeId)) return activeId;
  return availableIds[0] ?? null;
}
