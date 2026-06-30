import { AchievementKey } from "@meu-caderno/core";

export interface AchievementPresentation {
  label: string;
  icon: string;
}

export const ACHIEVEMENT_PRESENTATION: Record<
  AchievementKey,
  AchievementPresentation
> = {
  [AchievementKey.FIRST_STEP]: { label: "Primeiro passo", icon: "👣" },
  [AchievementKey.SHORT_STREAK]: { label: "3 dias seguidos", icon: "🔥" },
  [AchievementKey.WEEK_STREAK]: { label: "Uma semana", icon: "⚡" },
  [AchievementKey.TEN_TASKS]: { label: "10 tarefas", icon: "✅" },
  [AchievementKey.LEVEL_FIVE]: { label: "Nível 5", icon: "🏅" },
};
