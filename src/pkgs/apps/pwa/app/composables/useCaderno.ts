import type { Activity, Context, Subject } from "@meu-caderno/core";
import {
  AbsenceStance,
  ActivityKind,
  ActivityStatus,
  AttendanceRiskLevel,
  AttendanceStatus,
  type AttendanceSummary,
  attendanceRisk,
  computeAttendance,
  Goal,
  Link,
  Root,
  ScheduleKind,
  sortByDue,
  weightedAverage,
} from "@meu-caderno/core";
import {
  ActivitySchema,
  ContextSchema,
  RecordSchema,
  SubjectSchema,
} from "@meu-caderno/validation";
import {
  addDays as addDaysFns,
  differenceInCalendarDays,
  format,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const TODAY = "2026-06-29";

function parse(iso: string): Date {
  return parseISO(iso);
}
function iso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
function addDays(date: Date, n: number): Date {
  return addDaysFns(date, n);
}
export function formatDay(isoStr: string): string {
  return format(parseISO(isoStr), "EEE, d MMM", { locale: ptBR });
}
export function daysFromToday(isoStr: string): number {
  return differenceInCalendarDays(parseISO(isoStr), parseISO(TODAY));
}

export interface StatusSpec {
  key: "ok" | "atencao" | "perigo";
  label: string;
  color: string;
  soft: string;
}
const STATUS_BY_RISK: Record<AttendanceRiskLevel, StatusSpec> = {
  [AttendanceRiskLevel.SAFE]: {
    key: "ok",
    label: "tranquilo",
    color: "#2f7d4f",
    soft: "#e3efe4",
  },
  [AttendanceRiskLevel.WARNING]: {
    key: "atencao",
    label: "atenção",
    color: "#b8862b",
    soft: "#fbf1d8",
  },
  [AttendanceRiskLevel.OVER]: {
    key: "perigo",
    label: "risco",
    color: "#c0392b",
    soft: "#f8e3df",
  },
};

function statusFromSummary(summary: AttendanceSummary): StatusSpec {
  return STATUS_BY_RISK[attendanceRisk(summary)];
}

const HEAT_BY_STATUS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "presente",
  [AttendanceStatus.ABSENT]: "falta",
  [AttendanceStatus.LATE]: "atraso",
  [AttendanceStatus.MEDICAL]: "atestado",
  [AttendanceStatus.WAIVED]: "atestado",
  [AttendanceStatus.HOLIDAY]: "none",
  [AttendanceStatus.CANCELED]: "none",
};

export interface SubjectStats {
  subject: Subject;
  summary: AttendanceSummary;
  status: StatusSpec;
  totalHours: number;
  maxFaltas: number;
  faltasUsadas: number;
  restantes: number;
  freqPct: number;
  floor: number;
  counts: { present: number; absent: number; late: number; medical: number };
  heat: string[];
  media: number | null;
}

export function deriveStats(
  subject: Subject,
  contextFloor?: number,
): SubjectStats {
  const summary = computeAttendance(subject, { floor: contextFloor });
  const heat = (subject.records ?? [])
    .slice(-24)
    .map((r) => HEAT_BY_STATUS[r.status]);
  return {
    subject,
    summary,
    status: statusFromSummary(summary),
    totalHours: summary.totalClassHours,
    maxFaltas: summary.maxAbsences,
    faltasUsadas: summary.absencesUsed,
    restantes: summary.remaining,
    freqPct: summary.frequencyPct,
    floor: summary.floor,
    counts: {
      present: summary.counts[AttendanceStatus.PRESENT],
      absent: summary.counts[AttendanceStatus.ABSENT],
      late: summary.counts[AttendanceStatus.LATE],
      medical: summary.counts[AttendanceStatus.MEDICAL],
    },
    heat,
    media: weightedAverage(subject.assessments ?? []),
  };
}

interface SeedRecord {
  id: string;
  subjectId: string;
  day: string;
  status: AttendanceStatus;
}

function genRecords(
  subjectId: string,
  weekdays: number[],
  faltaEvery: number,
): SeedRecord[] {
  const end = parse(TODAY);
  const out: SeedRecord[] = [];
  let i = 0;
  for (let d = parse("2026-02-09"); d < end; d = addDays(d, 1)) {
    if (!weekdays.includes(d.getDay())) continue;
    i += 1;
    let status: AttendanceStatus = AttendanceStatus.PRESENT;
    if (i % faltaEvery === 0) status = AttendanceStatus.ABSENT;
    else if (i % 11 === 0) status = AttendanceStatus.LATE;
    else if (i % 17 === 0) status = AttendanceStatus.MEDICAL;
    out.push({
      id: `r-${subjectId}-${iso(d)}`,
      subjectId,
      day: iso(d),
      status,
    });
  }
  return out;
}

function buildContext(): Context {
  return ContextSchema.parse({
    id: "ctx-fac",
    name: "Faculdade",
    goal: Goal.UNIVERSITY,
    link: Link.PERSONAL,
    absenceStance: AbsenceStance.PLAN_ABSENCES,
    attendanceFloor: 0.75,
    minAverage: 6,
    modules: {
      attendance: true,
      grades: true,
      term: true,
      streak: false,
      hours: false,
      syllabus: false,
      certificate: false,
    },
    vocabulary: {
      subject: "disciplina",
      activity: "atividade",
      attendance: "presença",
      term: "período",
    },
    terms: [
      {
        id: "t-2026-1",
        label: "2026.1",
        start: "2026-02-09",
        end: "2026-07-04",
      },
    ],
  });
}

function buildSubjects(): Subject[] {
  const raw = [
    {
      id: "subj-calc",
      contextId: "ctx-fac",
      name: "Cálculo II",
      color: "#c0392b",
      hoursPerClass: 1,
      classesPerSession: 2,
      credits: 6,
      schedule: {
        kind: ScheduleKind.WEEKLY,
        weekdays: [1, 3],
        blocks: [{ start: "08:00", end: "09:40" }],
      },
      records: genRecords("subj-calc", [1, 3], 4),
      assessments: [
        {
          id: "a-calc-p1",
          subjectId: "subj-calc",
          name: "P1",
          weight: 0.3,
          grade: 5.5,
        },
        {
          id: "a-calc-p2",
          subjectId: "subj-calc",
          name: "P2",
          weight: 0.3,
          grade: 7,
        },
        {
          id: "a-calc-p3",
          subjectId: "subj-calc",
          name: "P3 (final)",
          weight: 0.4,
        },
      ],
    },
    {
      id: "subj-algo",
      contextId: "ctx-fac",
      name: "Algoritmos e Estruturas de Dados",
      color: "#3f6fb0",
      hoursPerClass: 1,
      classesPerSession: 2,
      credits: 4,
      schedule: {
        kind: ScheduleKind.WEEKLY,
        weekdays: [2, 4],
        blocks: [{ start: "10:00", end: "11:40" }],
      },
      records: genRecords("subj-algo", [2, 4], 9),
      assessments: [
        {
          id: "a-algo-l1",
          subjectId: "subj-algo",
          name: "Lista 1",
          weight: 0.2,
          grade: 9,
        },
        {
          id: "a-algo-pj",
          subjectId: "subj-algo",
          name: "Projeto",
          weight: 0.4,
          grade: 8.5,
        },
        {
          id: "a-algo-pf",
          subjectId: "subj-algo",
          name: "Prova final",
          weight: 0.4,
        },
      ],
    },
    {
      id: "subj-filo",
      contextId: "ctx-fac",
      name: "Filosofia da Ciência",
      color: "#2f7d4f",
      hoursPerClass: 2,
      classesPerSession: 1,
      credits: 2,
      schedule: {
        kind: ScheduleKind.WEEKLY,
        weekdays: [1],
        blocks: [{ start: "19:00", end: "20:40" }],
      },
      records: genRecords("subj-filo", [1], 7),
      assessments: [
        {
          id: "a-filo-en",
          subjectId: "subj-filo",
          name: "Ensaio",
          weight: 0.5,
          grade: 8,
        },
        {
          id: "a-filo-se",
          subjectId: "subj-filo",
          name: "Seminário",
          weight: 0.5,
        },
      ],
    },
  ];
  return raw.map((s) => SubjectSchema.parse(s));
}

function buildActivities(): Activity[] {
  const raw = [
    {
      id: "act-1",
      title: "Entregar Lista 4 de Cálculo",
      dueDate: "2026-06-30",
      contextId: "ctx-fac",
      subjectId: "subj-calc",
      kind: ActivityKind.ASSIGNMENT,
      status: ActivityStatus.OPEN,
      root: Root.CONTEXT,
    },
    {
      id: "act-2",
      title: "Estudar para P3 de Cálculo",
      dueDate: "2026-07-02",
      contextId: "ctx-fac",
      subjectId: "subj-calc",
      kind: ActivityKind.EXAM,
      status: ActivityStatus.OPEN,
      root: Root.CONTEXT,
      subtasks: [
        { id: "s1", text: "Refazer provas antigas", done: true },
        { id: "s2", text: "Lista de integrais", done: false },
      ],
    },
    {
      id: "act-3",
      title: "Ler cap. 3 — Kuhn",
      dueDate: "2026-06-29",
      contextId: "ctx-fac",
      subjectId: "subj-filo",
      kind: ActivityKind.READING,
      status: ActivityStatus.OPEN,
      root: Root.CONTEXT,
    },
    {
      id: "act-4",
      title: "Commitar projeto de Algoritmos",
      dueDate: "2026-07-05",
      contextId: "ctx-fac",
      subjectId: "subj-algo",
      kind: ActivityKind.TASK,
      status: ActivityStatus.OPEN,
      root: Root.CONTEXT,
    },
    {
      id: "act-5",
      title: "Renovar empréstimo da biblioteca",
      kind: ActivityKind.CAPTURE,
      status: ActivityStatus.OPEN,
      root: Root.INBOX,
    },
  ];
  return raw.map((a) => ActivitySchema.parse(a));
}

interface CadernoState {
  context: Context;
  subjects: Subject[];
  activities: Activity[];
}

let state: CadernoState | null = null;
function store(): CadernoState {
  if (!state) {
    state = reactive({
      context: buildContext(),
      subjects: buildSubjects(),
      activities: buildActivities(),
    });
  }
  return state;
}

export interface TodayClass {
  subject: Subject;
  stats: SubjectStats;
  block?: string;
  marked: AttendanceStatus | null;
}

export function useCaderno() {
  const s = store();
  const weekday = parse(TODAY).getDay();

  const stats = computed(() =>
    s.subjects.map((subj) => deriveStats(subj, s.context.attendanceFloor)),
  );

  const roll = computed<TodayClass[]>(() =>
    s.subjects
      .filter((subj) => subj.schedule?.weekdays?.includes(weekday))
      .map((subj) => {
        const st =
          stats.value.find((x) => x.subject.id === subj.id) ??
          deriveStats(subj, s.context.attendanceFloor);
        const b = subj.schedule?.blocks?.[0];
        return {
          subject: subj,
          stats: st,
          block: b ? `${b.start}–${b.end}` : undefined,
          marked:
            (subj.records ?? []).find((r) => r.day === TODAY)?.status ?? null,
        };
      }),
  );

  function mark(subjectId: string, status: AttendanceStatus) {
    const subj = s.subjects.find((x) => x.id === subjectId);
    if (!subj) return;
    subj.records ??= [];
    const existing = subj.records.find((r) => r.day === TODAY);
    if (existing) {
      existing.status = status;
    } else {
      subj.records.push(
        RecordSchema.parse({
          id: `r-${subjectId}-${TODAY}`,
          subjectId,
          day: TODAY,
          status,
        }),
      );
    }
  }

  const pendingActivities = computed(() =>
    sortByDue(s.activities.filter((a) => a.status === ActivityStatus.OPEN)),
  );

  return {
    context: computed(() => s.context),
    subjects: computed(() => s.subjects),
    stats,
    roll,
    mark,
    activities: computed(() => s.activities),
    pendingActivities,
  };
}
