import type { Color, DayIso, Grade } from "@meu-caderno/core";
import {
  AbsenceStance,
  ActivityKind,
  ActivityStatus,
  AttendanceStatus,
  Goal,
  Link,
  Root,
  ScheduleKind,
} from "@meu-caderno/core";

const FULL_MODULES = {
  attendance: true,
  grades: true,
  term: true,
  streak: false,
  hours: false,
  syllabus: false,
  certificate: false,
};

export function useDemoSeed() {
  const { service, ids } = useCadernoService();
  const { setActive } = useActiveContext();

  async function seedDemo() {
    const context = await service.createContext({
      name: "Faculdade (exemplo)",
      goal: Goal.UNIVERSITY,
      link: Link.PERSONAL,
      absenceStance: AbsenceStance.PLAN_ABSENCES,
      attendanceFloor: 0.75,
      modules: FULL_MODULES,
    });
    if (!context.ok) return;
    const contextId = context.value.id;

    const calculus = await service.createSubject({
      contextId,
      name: "Cálculo II",
      color: "#c0392b" as Color,
      hoursPerClass: 1,
      classesPerSession: 2,
      credits: 6,
      schedule: {
        kind: ScheduleKind.WEEKLY,
        weekdays: [1, 3],
        blocks: [{ start: "08:00", end: "09:40" }],
      },
    });
    await service.createSubject({
      contextId,
      name: "Algoritmos",
      color: "#3f6fb0" as Color,
      hoursPerClass: 1,
      classesPerSession: 2,
      credits: 4,
      schedule: {
        kind: ScheduleKind.WEEKLY,
        weekdays: [2, 4],
        blocks: [{ start: "10:00", end: "11:40" }],
      },
    });

    if (calculus.ok) {
      const subjectId = calculus.value.id;
      await service.addAssessment(subjectId, {
        name: "P1",
        weight: 0.5,
        grade: 6.5 as Grade,
      });
      const presentDays = ["2026-06-15", "2026-06-17", "2026-06-22"];
      for (const day of presentDays) {
        await service.markAttendance({
          subjectId,
          day: day as DayIso,
          status: AttendanceStatus.PRESENT,
        });
      }
      await service.markAttendance({
        subjectId,
        day: "2026-06-24" as DayIso,
        status: AttendanceStatus.ABSENT,
      });
      await service.upsertActivity({
        id: await ids.newId(),
        title: "Entregar Lista 4 de Cálculo",
        contextId,
        subjectId,
        kind: ActivityKind.ASSIGNMENT,
        status: ActivityStatus.OPEN,
        root: Root.CONTEXT,
        dueDate: "2026-06-30" as DayIso,
      });
    }

    await setActive(contextId);
  }

  return { seedDemo };
}
