import type { Id, Profile } from "@meu-caderno/core";
import { Background, ContextMode } from "@meu-caderno/core";

const HOME_PROFILE_ID = "home" as Id;
const PREF_ID = "default" as Id;

interface ThemeTokens {
  paper: string;
  paper2: string;
  card: string;
  linen: string;
}

const THEMES: Record<Background, ThemeTokens> = {
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

function applyBackground(background: Background) {
  if (!import.meta.client) return;
  const theme = THEMES[background];
  const root = document.documentElement.style;
  root.setProperty("--pt-paper", theme.paper);
  root.setProperty("--pt-paper-2", theme.paper2);
  root.setProperty("--pt-card", theme.card);
  root.setProperty("--pt-linen", theme.linen);
}

export function useAppearance() {
  const { config } = useCadernoService();
  const background = useState<Background>(
    "caderno:appearance:bg",
    () => Background.PAPER,
  );
  const hydrated = useState<boolean>(
    "caderno:appearance:hydrated",
    () => false,
  );

  watchEffect(() => applyBackground(background.value));

  async function hydrate() {
    if (hydrated.value) return;
    const profile = await config.profiles.get(HOME_PROFILE_ID);
    if (profile?.background) background.value = profile.background;
    hydrated.value = true;
  }

  async function setBackground(value: Background) {
    background.value = value;
    const previous = await config.profiles.get(HOME_PROFILE_ID);
    const profile: Profile = previous
      ? { ...previous, background: value }
      : {
          id: HOME_PROFILE_ID,
          name: "Casa",
          contextMode: ContextMode.FREE,
          background: value,
        };
    await config.profiles.put(profile);
    const prefs = await config.preferences.get(PREF_ID);
    await config.preferences.put({
      ...prefs,
      id: PREF_ID,
      homeProfile: HOME_PROFILE_ID,
    });
  }

  return { background, hydrate, setBackground };
}
