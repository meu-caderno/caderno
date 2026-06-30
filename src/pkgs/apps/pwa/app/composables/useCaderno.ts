import type {
  Activity,
  Record as AttendanceRecord,
  Context,
  Subject,
} from "@meu-caderno/core";
import { ActivityStatus, Root, recordsOf, sortByDue } from "@meu-caderno/core";
import { deriveStats, formatDay, UNSET_DAY } from "~/utils/caderno-stats";

export function useCaderno() {
  const { store, clock } = useCadernoService();
  const { activeId, focusIds, hydrate, setActive } = useActiveContext();

  const today = useState<string>("caderno:today", () => UNSET_DAY);
  const booting = useState<boolean>("caderno:booting", () => true);

  const allContexts = useLiveQuery(
    ["contexts"],
    () => store.contexts.list(),
    [] as Context[],
  );
  const contexts = computed(() => {
    const focus = focusIds.value;
    return [...allContexts.value]
      .filter((context) => !context.archived)
      .filter(
        (context) =>
          focus.length === 0 ||
          focus.includes(context.id) ||
          context.id === activeId.value,
      )
      .sort(
        (left, right) =>
          Number(right.pinned ?? false) - Number(left.pinned ?? false),
      );
  });

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
    const active = available.find((context) => context.id === activeId.value);
    if (!active && available.length) {
      activeId.value = available[0]?.id ?? null;
    }
  });

  const context = computed(
    () =>
      contexts.value.find((context) => context.id === activeId.value) ?? null,
  );

  const subjects = computed<Subject[]>(() =>
    allSubjects.value
      .filter((subject) => subject.contextId === activeId.value)
      .map((subject) => ({
        ...subject,
        records: recordsOf(allRecords.value, subject.id),
      })),
  );

  const activities = computed(() =>
    allActivities.value.filter(
      (activity) =>
        !activity.contextId || activity.contextId === activeId.value,
    ),
  );

  const stats = computed(() =>
    subjects.value.map((subject) =>
      deriveStats(subject, context.value?.attendanceFloor),
    ),
  );

  const roll = useDailyRoll({ subjects, stats, context, today });

  const pendingActivities = computed(() =>
    sortByDue(
      activities.value.filter(
        (activity) =>
          activity.status === ActivityStatus.OPEN &&
          activity.root !== Root.INBOX,
      ),
    ),
  );
  const inboxItems = computed(() =>
    allActivities.value.filter(
      (activity) =>
        activity.status === ActivityStatus.OPEN && activity.root === Root.INBOX,
    ),
  );

  const gamification = useGamification({
    stats,
    activities,
    records: allRecords,
    today,
  });

  const { mark, completeActivity } = useAttendanceActions({ today });

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
    gamification,
    today,
    todayLabel: computed(() => formatDay(today.value)),
    booting,
    ready: computed(() => context.value !== null),
  };
}
