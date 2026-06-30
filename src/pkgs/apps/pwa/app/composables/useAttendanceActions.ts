import type { Activity, AttendanceStatus, DayIso, Id } from "@meu-caderno/core";
import { ActivityStatus, nextRecurrence } from "@meu-caderno/core";
import type { Ref } from "vue";

export interface AttendanceActionsInput {
  today: Ref<string>;
}

export function useAttendanceActions(input: AttendanceActionsInput) {
  const { service, ids } = useCadernoService();
  const { toast } = useToast();
  const { hasConsent } = useConsent();

  async function mark(subjectId: string, status: AttendanceStatus) {
    await service.markAttendance({
      subjectId: subjectId as Id,
      day: input.today.value as DayIso,
      status,
    });
  }

  async function completeActivity(activity: Activity) {
    await service.upsertActivity({ ...activity, status: ActivityStatus.DONE });
    const next = nextRecurrence(activity, await ids.newId());
    if (next) await service.upsertActivity(next);
    if (!hasConsent("tips")) return;
    toast({
      title: next ? "Concluída · próxima agendada" : "Atividade concluída",
      actionLabel: "desfazer",
      onAction: () => {
        void service.upsertActivity({
          ...activity,
          status: ActivityStatus.OPEN,
        });
        if (next) void service.deleteActivity(next.id);
      },
    });
  }

  return { mark, completeActivity };
}
