import type {
  Activity,
  Record as AttendanceRecord,
  Context,
  DayIso,
  Id,
  Subject,
} from "@meu-caderno/core";
import {
  ActivityStatus,
  AttendanceRiskLevel,
  AttendanceStatus,
  type AttendanceSummary,
  attendanceRisk,
  computeAttendance,
  nextRecurrence,
  Root,
  recordsOf,
  sortByDue,
  weightedAverage,
} from "@meu-caderno/core";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDay(isoStr: string): string {
  return format(parseISO(isoStr), "EEE, d MMM", { locale: ptBR });
}
export function daysFromToday(isoStr: string, today: string): number {
  return differenceInCalendarDays(parseISO(isoStr), parseISO(today));
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

export interface TodayClass {
  subject: Subject;
  stats: SubjectStats;
  block?: string;
  marked: AttendanceStatus | null;
}

export function useCaderno() {
  const { service, store, clock, ids } = useCadernoService();
  const { activeId, hydrate, setActive } = useActiveContext();

  const today = useState<string>("caderno:today", () => "1970-01-01");
  const booting = useState<boolean>("caderno:booting", () => true);

  const allContexts = useLiveQuery(
    ["contexts"],
    () => store.contexts.list(),
    [] as Context[],
  );
  const contexts = computed(() =>
    [...allContexts.value]
      .filter((c) => !c.archived)
      .sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false)),
  );

  onMounted(async () => {
    today.value = await clock.today();
    allContexts.value = await store.contexts.list();
    await hydrate();
    booting.value = false;
  });
  const allSubjects = useLiveQuery(
    ["subjects"],
    () => store.subjects.list(),
    [] as Subject[],
  );
  const allRecords = useLiveQuery(
    ["records"],
    () => store.records.list(),
    [] as AttendanceRecord[],
  );
  const allActivities = useLiveQuery(
    ["activities"],
    () => store.activities.list(),
    [] as Activity[],
  );

  watchEffect(() => {
    const available = contexts.value;
    const active = available.find((c) => c.id === activeId.value);
    if (!active && available.length) {
      activeId.value = available[0]?.id ?? null;
    }
  });

  const context = computed(
    () => contexts.value.find((c) => c.id === activeId.value) ?? null,
  );

  const subjects = computed<Subject[]>(() =>
    allSubjects.value
      .filter((s) => s.contextId === activeId.value)
      .map((s) => ({ ...s, records: recordsOf(allRecords.value, s.id) })),
  );

  const activities = computed(() =>
    allActivities.value.filter(
      (a) => !a.contextId || a.contextId === activeId.value,
    ),
  );

  const stats = computed(() =>
    subjects.value.map((s) => deriveStats(s, context.value?.attendanceFloor)),
  );

  const roll = computed<TodayClass[]>(() => {
    const weekday = parseISO(today.value).getDay();
    return subjects.value
      .filter((s) => s.schedule?.weekdays?.includes(weekday))
      .map((s) => {
        const st =
          stats.value.find((x) => x.subject.id === s.id) ??
          deriveStats(s, context.value?.attendanceFloor);
        const block = s.schedule?.blocks?.[0];
        return {
          subject: s,
          stats: st,
          block: block ? `${block.start}–${block.end}` : undefined,
          marked:
            (s.records ?? []).find((r) => r.day === today.value)?.status ??
            null,
        };
      });
  });

  const pendingActivities = computed(() =>
    sortByDue(
      activities.value.filter(
        (a) => a.status === ActivityStatus.OPEN && a.root !== Root.INBOX,
      ),
    ),
  );
  const inboxItems = computed(() =>
    allActivities.value.filter(
      (a) => a.status === ActivityStatus.OPEN && a.root === Root.INBOX,
    ),
  );

  async function mark(subjectId: string, status: AttendanceStatus) {
    await service.markAttendance({
      subjectId: subjectId as Id,
      day: today.value as DayIso,
      status,
    });
  }

  const { toast } = useToast();
  async function completeActivity(act: Activity) {
    await service.upsertActivity({ ...act, status: ActivityStatus.DONE });
    const next = nextRecurrence(act, await ids.newId());
    if (next) await service.upsertActivity(next);
    toast({
      title: next ? "Concluída · próxima agendada" : "Atividade concluída",
      actionLabel: "desfazer",
      onAction: () => {
        void service.upsertActivity({ ...act, status: ActivityStatus.OPEN });
        if (next) void service.deleteActivity(next.id);
      },
    });
  }

  return {
    context,
    contexts,
    setActive,
    subjects,
    stats,
    roll,
    mark,
    completeActivity,
    activities,
    pendingActivities,
    inboxItems,
    today,
    todayLabel: computed(() => formatDay(today.value)),
    booting,
    ready: computed(() => context.value !== null),
  };
}
