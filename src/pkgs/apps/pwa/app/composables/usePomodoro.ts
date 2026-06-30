const CYCLES_PER_LONG = 4;
const SECONDS_PER_MINUTE = 60;
const TICK_INTERVAL_MS = 1000;
const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const DEFAULT_LONG_MINUTES = 15;

export type PomodoroPhase = "focus" | "break" | "long";

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  focus: "Foco",
  break: "Pausa",
  long: "Pausa longa",
};

export function usePomodoro() {
  const { read, patch: persist } = usePreferences();

  const focusMin = useState<number>(
    "caderno:pomo:focus",
    () => DEFAULT_FOCUS_MINUTES,
  );
  const breakMin = useState<number>(
    "caderno:pomo:break",
    () => DEFAULT_BREAK_MINUTES,
  );
  const longMin = useState<number>(
    "caderno:pomo:long",
    () => DEFAULT_LONG_MINUTES,
  );
  const hydrated = useState<boolean>("caderno:pomo:hydrated", () => false);

  const phase = useState<PomodoroPhase>("caderno:pomo:phase", () => "focus");
  const remaining = useState<number>(
    "caderno:pomo:remaining",
    () => DEFAULT_FOCUS_MINUTES * SECONDS_PER_MINUTE,
  );
  const running = useState<boolean>("caderno:pomo:running", () => false);
  const completedFocus = useState<number>("caderno:pomo:done", () => 0);

  let handle: ReturnType<typeof setInterval> | null = null;

  function minutesFor(value: PomodoroPhase): number {
    if (value === "focus") return focusMin.value;
    if (value === "break") return breakMin.value;
    return longMin.value;
  }

  const phaseLabel = computed(() => PHASE_LABEL[phase.value]);
  const timeLabel = computed(() => {
    const total = Math.max(0, remaining.value);
    const minutes = Math.floor(total / SECONDS_PER_MINUTE);
    const seconds = total % SECONDS_PER_MINUTE;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  });
  const ratio = computed(() => {
    const full = minutesFor(phase.value) * SECONDS_PER_MINUTE;
    return full === 0 ? 0 : 1 - remaining.value / full;
  });

  function stopTimer() {
    if (handle) clearInterval(handle);
    handle = null;
  }

  function setPhase(next: PomodoroPhase) {
    phase.value = next;
    remaining.value = minutesFor(next) * SECONDS_PER_MINUTE;
  }

  function advance() {
    stopTimer();
    running.value = false;
    if (phase.value === "focus") {
      completedFocus.value += 1;
      setPhase(completedFocus.value % CYCLES_PER_LONG === 0 ? "long" : "break");
    } else {
      setPhase("focus");
    }
  }

  function tick() {
    if (remaining.value <= 1) {
      advance();
      return;
    }
    remaining.value -= 1;
  }

  function start() {
    if (running.value) return;
    running.value = true;
    handle = setInterval(tick, TICK_INTERVAL_MS);
  }
  function pause() {
    running.value = false;
    stopTimer();
  }
  function reset() {
    pause();
    setPhase(phase.value);
  }
  function skip() {
    advance();
  }

  async function hydrate() {
    if (hydrated.value) return;
    const prefs = await read();
    if (prefs?.pomodoroFocus) focusMin.value = prefs.pomodoroFocus;
    if (prefs?.pomodoroBreak) breakMin.value = prefs.pomodoroBreak;
    if (prefs?.pomodoroLong) longMin.value = prefs.pomodoroLong;
    if (!running.value)
      remaining.value = minutesFor(phase.value) * SECONDS_PER_MINUTE;
    hydrated.value = true;
  }

  async function setDurations(focus: number, brk: number, long: number) {
    focusMin.value = Math.max(1, focus);
    breakMin.value = Math.max(1, brk);
    longMin.value = Math.max(1, long);
    if (!running.value)
      remaining.value = minutesFor(phase.value) * SECONDS_PER_MINUTE;
    await persist({
      pomodoroFocus: focusMin.value,
      pomodoroBreak: breakMin.value,
      pomodoroLong: longMin.value,
    });
  }

  return {
    phase,
    phaseLabel,
    remaining,
    running,
    completedFocus,
    timeLabel,
    ratio,
    focusMin,
    breakMin,
    longMin,
    start,
    pause,
    reset,
    skip,
    hydrate,
    setDurations,
  };
}
