import { describe, expect, it } from "vitest";
import type {
  Record as AttendanceRecord,
  Color,
  Context,
  DayIso,
  Id,
  Timestamp,
} from "../domain";
import {
  AbsenceStance,
  AttendanceStatus,
  CapabilityImpact,
  Goal,
  Link,
  OriginKind,
} from "../domain";
import {
  counterIds,
  createInMemoryConfigStore,
  fixedClock,
  inMemoryStorageProvider,
} from "../testing";
import { createCaderno } from "./caderno";
import type { Plugin } from "./plugins";

const sampleContext = (): Context => ({
  id: "ctx" as Id,
  name: "Faculdade",
  goal: Goal.UNIVERSITY,
  link: Link.PERSONAL,
  absenceStance: AbsenceStance.PLAN_ABSENCES,
  modules: {
    attendance: true,
    grades: true,
    term: true,
    streak: false,
    hours: false,
    syllabus: false,
    certificate: false,
  },
});

const numbersPlugin: Plugin = {
  manifest: {
    id: "numbers",
    title: "Numbers",
    impact: CapabilityImpact.LOW,
    origin: OriginKind.PLUGIN,
  },
  setup(context) {
    context.registry.register({
      manifest: this.manifest,
      list: () => [1, 2, 3],
    });
  },
};

function config() {
  return {
    configStore: createInMemoryConfigStore(),
    storage: inMemoryStorageProvider(),
    clock: fixedClock(1 as Timestamp, "2026-01-01" as DayIso),
    ids: counterIds(),
  };
}

describe("createCaderno", () => {
  it("wires the service and loads plugins into the registry", async () => {
    const caderno = await createCaderno({
      ...config(),
      plugins: [numbersPlugin],
    });
    expect(caderno.plugins).toHaveLength(1);
    expect(caderno.capabilities.source<number>("numbers")?.list()).toEqual([
      1, 2, 3,
    ]);

    await caderno.store.contexts.put(sampleContext());
    const created = await caderno.service.createSubject({
      contextId: "ctx" as Id,
      name: "Cálculo",
      color: "#c0392b" as Color,
      hoursPerClass: 1,
      classesPerSession: 2,
    });
    expect(created.ok).toBe(true);
  });

  it("starts with no plugins by default", async () => {
    const caderno = await createCaderno(config());
    expect(caderno.plugins).toHaveLength(0);
    expect(caderno.capabilities.manifests()).toHaveLength(0);
  });

  it("invokes lifecycle hooks that plugins subscribe to", async () => {
    const marked: AttendanceRecord[] = [];
    const tracker: Plugin = {
      manifest: {
        id: "tracker",
        title: "Tracker",
        impact: CapabilityImpact.LOW,
        origin: OriginKind.PLUGIN,
      },
      setup(ctx) {
        ctx.hooks.hook("attendance:marked", (record) => {
          marked.push(record);
        });
      },
    };
    const caderno = await createCaderno({ ...config(), plugins: [tracker] });
    await caderno.store.contexts.put(sampleContext());
    const subject = await caderno.service.createSubject({
      contextId: "ctx" as Id,
      name: "Cálculo",
      color: "#c0392b" as Color,
      hoursPerClass: 1,
      classesPerSession: 2,
    });
    if (subject.ok) {
      await caderno.service.markAttendance({
        subjectId: subject.value.id,
        day: "2026-03-01" as DayIso,
        status: AttendanceStatus.PRESENT,
      });
    }
    expect(marked).toHaveLength(1);
  });
});
