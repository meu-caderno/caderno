import type { Id } from "@meu-caderno/core";
import { Background, Density } from "@meu-caderno/core";

const PREF_ID = "default" as Id;
const DEFAULT_MOOD = "calmo";

export interface MoodPreset {
  key: string;
  emoji: string;
  label: string;
  blurb: string;
  background: Background;
  accent: string;
  density: Density;
}

export const MOODS: MoodPreset[] = [
  {
    key: "survival",
    emoji: "🌱",
    label: "Survival",
    blurb: "Só o essencial pra não afundar.",
    background: Background.LINEN,
    accent: "#2f7d4f",
    density: Density.MINIMAL,
  },
  {
    key: "calmo",
    emoji: "🌿",
    label: "Calmo",
    blurb: "Tela enxuta, sem distração.",
    background: Background.PAPER,
    accent: "#3f6fb0",
    density: Density.NORMAL,
  },
  {
    key: "foco",
    emoji: "🎯",
    label: "Foco",
    blurb: "O essencial do dia em destaque.",
    background: Background.PAPER,
    accent: "#b8862b",
    density: Density.NORMAL,
  },
  {
    key: "dopamina",
    emoji: "🎉",
    label: "Dopamina",
    blurb: "Cores e conquistas à mostra.",
    background: Background.CREAM,
    accent: "#7d5ba6",
    density: Density.DENSE,
  },
  {
    key: "meujeito",
    emoji: "🎨",
    label: "Meu jeito",
    blurb: "Tudo à mostra, do seu jeito.",
    background: Background.PAPER,
    accent: "#2c8c8c",
    density: Density.DENSE,
  },
];

const MOOD_ALIASES: Record<string, string> = { tudo: "meujeito" };

const DENSITY_ATTR: Record<Density, string> = {
  [Density.MINIMAL]: "minimal",
  [Density.NORMAL]: "normal",
  [Density.DENSE]: "dense",
};

const BACKGROUND_TOKENS: Record<
  Background,
  { paper: string; paper2: string; card: string; linen: string }
> = {
  [Background.PAPER]: {
    paper: "#f4f1ea",
    paper2: "#f1ece1",
    card: "#fcfcfa",
    linen: "#efe9dc",
  },
  [Background.CREAM]: {
    paper: "#f7f1e2",
    paper2: "#f3ecd9",
    card: "#fffdf5",
    linen: "#f1e7d2",
  },
  [Background.LINEN]: {
    paper: "#eef0eb",
    paper2: "#e9ece4",
    card: "#fbfcf9",
    linen: "#e5e9df",
  },
};

export function resolveMood(key?: string): MoodPreset {
  const resolved = key ? (MOOD_ALIASES[key] ?? key) : DEFAULT_MOOD;
  return (
    MOODS.find((mood) => mood.key === resolved) ??
    (MOODS.find((mood) => mood.key === DEFAULT_MOOD) as MoodPreset)
  );
}

function applyTheme(mood: MoodPreset) {
  if (!import.meta.client) return;
  const tokens = BACKGROUND_TOKENS[mood.background];
  const root = document.documentElement;
  root.style.setProperty("--pt-paper", tokens.paper);
  root.style.setProperty("--pt-paper-2", tokens.paper2);
  root.style.setProperty("--pt-card", tokens.card);
  root.style.setProperty("--pt-linen", tokens.linen);
  root.style.setProperty("--pt-accent", mood.accent);
  root.dataset.density = DENSITY_ATTR[mood.density];
}

export function useTheme() {
  const { config } = useCadernoService();
  const moodKey = useState<string>("caderno:theme:mood", () => DEFAULT_MOOD);
  const hydrated = useState<boolean>("caderno:theme:hydrated", () => false);

  const activeMood = computed(() => resolveMood(moodKey.value));

  watchEffect(() => applyTheme(activeMood.value));

  async function hydrate() {
    if (hydrated.value) return;
    const prefs = await config.preferences.get(PREF_ID);
    if (prefs?.homeProfile) moodKey.value = prefs.homeProfile;
    hydrated.value = true;
  }

  async function setMood(key: string) {
    moodKey.value = key;
    const prefs = await config.preferences.get(PREF_ID);
    await config.preferences.put({ ...prefs, id: PREF_ID, homeProfile: key });
  }

  async function restoreDefaults() {
    await setMood(DEFAULT_MOOD);
  }

  return { moodKey, activeMood, hydrate, setMood, restoreDefaults };
}
