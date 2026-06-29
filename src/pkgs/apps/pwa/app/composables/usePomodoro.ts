import type { Id, Preferences } from "@meu-caderno/core";

const PREF_ID = "default" as Id;
const CYCLES_PER_LONG = 4;

export type PomodoroPhase = "focus" | "break" | "long";

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  focus: "Foco",
  break: "Pausa",
  long: "Pausa longa",
};

export function usePomodoro() {
  const { config } = useCadernoService();

  const focusMin = useState<number>("caderno:pomo:focus", () => 25);
  const breakMin = useState<number>("caderno:pomo:break", () => 5);
  const longMin = useState<number>("caderno:pomo:long", () => 15);
  const hydrated = useState<boolean>("caderno:pomo:hydrated", () => false);

  const phase = useState<PomodoroPhase>("caderno:pomo:phase", () => "focus");
  const remaining = useState<number>("caderno:pomo:remaining", () => 25 * 60);
  const running = useState<boolean>("caderno:pomo:running", () => false);
  const completedFocus = useState<number>("caderno:pomo:done", () => 0);

  let handle: ReturnType<typeof setInterval> | null = null;

  function minutesFor(value: PomodoroPhase): number {
    if (value === "focus") return focusMin.value;
    if (value === "break") return breakMin.value;
    return longMin.value;
  }

  const phaseLabel = computed(() => PHASE_LABEL[phase.value]);
  const clock = computed(() => {
    const total = Math.max(0, remaining.value);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  });
  const ratio = computed(() => {
    const full = minutesFor(phase.value) * 60;
    return full === 0 ? 0 : 1 - remaining.value / full;
  });

  function stopTimer() {
    if (handle) clearInterval(handle);
    handle = null;
  }

  function setPhase(next: PomodoroPhase) {
    phase.value = next;
    remaining.value = minutesFor(next) * 60;
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
    handle = setInterval(tick, 1000);
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
    const prefs = await config.preferences.get(PREF_ID);
    if (prefs?.pomodoroFocus) focusMin.value = prefs.pomodoroFocus;
    if (prefs?.pomodoroBreak) breakMin.value = prefs.pomodoroBreak;
    if (prefs?.pomodoroLong) longMin.value = prefs.pomodoroLong;
    if (!running.value) remaining.value = minutesFor(phase.value) * 60;
    hydrated.value = true;
  }

  async function persist(patch: Partial<Preferences>) {
    const prefs = await config.preferences.get(PREF_ID);
    await config.preferences.put({ ...prefs, ...patch, id: PREF_ID });
  }

  async function setDurations(focus: number, brk: number, long: number) {
    focusMin.value = Math.max(1, focus);
    breakMin.value = Math.max(1, brk);
    longMin.value = Math.max(1, long);
    if (!running.value) remaining.value = minutesFor(phase.value) * 60;
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
    clock,
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
