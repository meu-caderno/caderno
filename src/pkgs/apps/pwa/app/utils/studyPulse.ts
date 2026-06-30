import {
  ActivityStatus,
  CapabilityImpact,
  OriginKind,
  type Plugin,
} from "@meu-caderno/core";

export interface PulseStat {
  label: string;
  value: number;
}

export const STUDY_PULSE_ID = "example.study-pulse";

export function studyPulsePlugin(): Plugin {
  const manifest = {
    id: STUDY_PULSE_ID,
    title: "Pulso de estudo",
    impact: CapabilityImpact.LOW,
    origin: OriginKind.PLUGIN,
  };
  return {
    manifest,
    setup({ registry, hooks }) {
      const tally = { presences: 0, completed: 0 };
      hooks.hook("attendance:marked", () => {
        tally.presences += 1;
      });
      hooks.hook("activity:upserted", (activity) => {
        if (activity.status === ActivityStatus.DONE) tally.completed += 1;
      });
      registry.register({
        manifest,
        list: (): PulseStat[] => [
          { label: "Presenças nesta sessão", value: tally.presences },
          {
            label: "Atividades concluídas nesta sessão",
            value: tally.completed,
          },
        ],
      });
    },
  };
}
