import type {
  Activity,
  Record as AttendanceRecord,
  Subject,
} from "@meu-caderno/core";
import { ActivityStatus, Root, recordsOf, sortByDue } from "@meu-caderno/core";
import { deriveStats, formatDay, UNSET_DAY } from "~/utils/caderno-stats";

export function useCaderno() {
  const { store, clock } = useCadernoService();
  const { effectiveId, contexts, context, hydrate, setActive } =
    useActiveContext();

  const today = useState<string>("caderno:today", () => UNSET_DAY);
  const booting = useState<boolean>("caderno:booting", () => true);

  onMounted(async () => {
    today.value = await clock.today();
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

  const subjects = computed<Subject[]>(() =>
    allSubjects.value
      .filter((subject) => subject.contextId === effectiveId.value)
      .map((subject) => ({
        ...subject,
        records: recordsOf(allRecords.value, subject.id),
      })),
  );

  const activities = computed(() =>
    allActivities.value.filter(
      (activity) =>
        !activity.contextId || activity.contextId === effectiveId.value,
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
