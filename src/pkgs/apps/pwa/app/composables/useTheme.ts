import type { Color, Id, Profile } from "@meu-caderno/core";
import { Background, ContextMode, Density } from "@meu-caderno/core";

const DEFAULT_MOOD = "calmo";
const DEFAULT_TEXT_SCALE = 1;
const DEFAULT_HEADING = "hand";
const DEFAULT_SCREEN = "equilibrio";

export interface ScreenDensityOption {
  value: string;
  label: string;
  blurb: string;
}

export const SCREEN_DENSITIES: ScreenDensityOption[] = [
  { value: "essencial", label: "Essencial", blurb: "Só o que importa agora." },
  { value: "equilibrio", label: "Equilíbrio", blurb: "O padrão, sem excesso." },
  { value: "tudo", label: "Tudo à mostra", blurb: "Todos os detalhes." },
];

export interface TextSizeOption {
  value: number;
  label: string;
}

export const TEXT_SIZES: TextSizeOption[] = [
  { value: 0.92, label: "Pequeno" },
  { value: 1, label: "Normal" },
  { value: 1.1, label: "Grande" },
];

export interface HeadingFontOption {
  key: string;
  label: string;
  family: string;
}

export const HEADING_FONTS: HeadingFontOption[] = [
  { key: "hand", label: "Manuscrita", family: "var(--pt-font-hand)" },
  { key: "serif", label: "Serifada", family: "var(--pt-font-read)" },
  { key: "grotesk", label: "Grotesca", family: "var(--pt-font-ui)" },
];

function resolveHeadingFamily(key?: string): string {
  return (
    HEADING_FONTS.find((font) => font.key === key)?.family ??
    "var(--pt-font-hand)"
  );
}

export interface MoodPreset {
  key: string;
  emoji: string;
  label: string;
  blurb: string;
  background: Background;
  accent: string;
  density: Density;
  custom?: boolean;
}

export interface ProfileDraft {
  name: string;
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

export const BACKGROUND_OPTIONS = [
  { value: Background.PAPER, label: "Papel" },
  { value: Background.CREAM, label: "Creme" },
  { value: Background.LINEN, label: "Linho" },
];

export const DENSITY_OPTIONS = [
  { value: Density.MINIMAL, label: "Espaçoso" },
  { value: Density.NORMAL, label: "Normal" },
  { value: Density.DENSE, label: "Compacto" },
];

export const ACCENT_OPTIONS = [
  "#3f6fb0",
  "#2f7d4f",
  "#b8862b",
  "#c0392b",
  "#7d5ba6",
  "#2c8c8c",
  "#2c2a27",
];

export function resolveMood(key: string, customs: MoodPreset[]): MoodPreset {
  const resolved = MOOD_ALIASES[key] ?? key;
  return (
    customs.find((mood) => mood.key === resolved) ??
    MOODS.find((mood) => mood.key === resolved) ??
    (MOODS.find((mood) => mood.key === DEFAULT_MOOD) as MoodPreset)
  );
}

function profileToMood(profile: Profile): MoodPreset {
  return {
    key: profile.id,
    emoji: "🎨",
    label: profile.name,
    blurb: "Perfil personalizado",
    background: profile.background ?? Background.PAPER,
    accent: profile.accent ?? "#2c2a27",
    density: profile.density ?? Density.NORMAL,
    custom: true,
  };
}

function applyTheme(
  mood: MoodPreset,
  textScale: number,
  headingKey: string,
  screen: string,
) {
  if (!import.meta.client) return;
  const tokens = BACKGROUND_TOKENS[mood.background];
  const root = document.documentElement;
  root.style.setProperty("--pt-paper", tokens.paper);
  root.style.setProperty("--pt-paper-2", tokens.paper2);
  root.style.setProperty("--pt-card", tokens.card);
  root.style.setProperty("--pt-linen", tokens.linen);
  root.style.setProperty("--pt-accent", mood.accent);
  root.style.setProperty("--pt-text-scale", String(textScale));
  root.style.setProperty("--pt-heading-font", resolveHeadingFamily(headingKey));
  root.dataset.density = DENSITY_ATTR[mood.density];
  root.dataset.screen = screen;
}

export function useTheme() {
  const { config, ids } = useCadernoService();
  const { read, patch: persist } = usePreferences();
  const moodKey = useState<string>("caderno:theme:mood", () => DEFAULT_MOOD);
  const customProfiles = useState<Profile[]>("caderno:theme:customs", () => []);
  const textScale = useState<number>(
    "caderno:theme:text",
    () => DEFAULT_TEXT_SCALE,
  );
  const headingFont = useState<string>(
    "caderno:theme:heading",
    () => DEFAULT_HEADING,
  );
  const screenDensity = useState<string>(
    "caderno:theme:screen",
    () => DEFAULT_SCREEN,
  );
  const zen = useState<boolean>("caderno:theme:zen", () => false);
  const activityView = useState<string>(
    "caderno:theme:activityView",
    () => "list",
  );
  const hydrated = useState<boolean>("caderno:theme:hydrated", () => false);

  const customMoods = computed(() => customProfiles.value.map(profileToMood));
  const allMoods = computed(() => [...MOODS, ...customMoods.value]);
  const activeMood = computed(() =>
    resolveMood(moodKey.value, customMoods.value),
  );

  async function reloadProfiles() {
    customProfiles.value = await config.profiles.list();
  }

  watchEffect(() =>
    applyTheme(
      activeMood.value,
      textScale.value,
      headingFont.value,
      screenDensity.value,
    ),
  );

  async function hydrate() {
    if (hydrated.value) return;
    await reloadProfiles();
    const prefs = await read();
    if (prefs?.homeProfile) moodKey.value = prefs.homeProfile;
    if (prefs?.textScale) textScale.value = prefs.textScale;
    if (prefs?.headingFont) headingFont.value = prefs.headingFont;
    if (prefs?.screenDensity) screenDensity.value = prefs.screenDensity;
    if (prefs?.zen != null) zen.value = prefs.zen;
    if (prefs?.activityView) activityView.value = prefs.activityView;
    hydrated.value = true;
  }

  async function setMood(key: string) {
    moodKey.value = key;
    await persist({ homeProfile: key });
  }

  async function setTextScale(value: number) {
    textScale.value = value;
    await persist({ textScale: value });
  }

  async function setHeadingFont(key: string) {
    headingFont.value = key;
    await persist({ headingFont: key });
  }

  async function setScreenDensity(value: string) {
    screenDensity.value = value;
    await persist({ screenDensity: value });
  }

  async function setZen(value: boolean) {
    zen.value = value;
    await persist({ zen: value });
  }

  async function setActivityView(value: string) {
    activityView.value = value;
    await persist({ activityView: value });
  }

  async function saveProfile(draft: ProfileDraft) {
    const profile: Profile = {
      id: await ids.newId(),
      name: draft.name.trim() || "Meu perfil",
      contextMode: ContextMode.FREE,
      background: draft.background,
      accent: draft.accent as Color,
      density: draft.density,
    };
    await config.profiles.put(profile);
    await reloadProfiles();
    await setMood(profile.id);
    return profile;
  }

  async function deleteProfile(id: string) {
    await config.profiles.delete(id as Id);
    await reloadProfiles();
    if (moodKey.value === id) await setMood(DEFAULT_MOOD);
  }

  async function restoreDefaults() {
    moodKey.value = DEFAULT_MOOD;
    textScale.value = DEFAULT_TEXT_SCALE;
    headingFont.value = DEFAULT_HEADING;
    screenDensity.value = DEFAULT_SCREEN;
    zen.value = false;
    activityView.value = "list";
    await persist({
      homeProfile: DEFAULT_MOOD,
      textScale: DEFAULT_TEXT_SCALE,
      headingFont: DEFAULT_HEADING,
      screenDensity: DEFAULT_SCREEN,
      zen: false,
      activityView: "list",
    });
  }

  return {
    moodKey,
    activeMood,
    allMoods,
    textScale,
    headingFont,
    screenDensity,
    zen,
    activityView,
    hydrate,
    setMood,
    setTextScale,
    setHeadingFont,
    setScreenDensity,
    setZen,
    setActivityView,
    saveProfile,
    deleteProfile,
    restoreDefaults,
  };
}
