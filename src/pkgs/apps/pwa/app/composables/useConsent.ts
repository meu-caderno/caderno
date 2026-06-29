import type { Id, Preferences } from "@meu-caderno/core";

const PREF_ID = "default" as Id;

export interface ConsentItem {
  key: string;
  label: string;
  blurb: string;
  optIn?: boolean;
}

export const CONSENTS: ConsentItem[] = [
  {
    key: "welcomeBack",
    label: "Boas-vindas de volta",
    blurb: "Um resumo curto quando você retorna ao app.",
  },
  {
    key: "tips",
    label: "Dicas e confirmações",
    blurb: "Avisos com desfazer ao concluir atividades.",
  },
  {
    key: "gamification",
    label: "Ofensiva & XP",
    blurb: "Streak, níveis e conquistas. Desligado por padrão.",
    optIn: true,
  },
];

const DEFAULT_ON = CONSENTS.filter((item) => !item.optIn).map(
  (item) => item.key,
);

export function useConsent() {
  const { config } = useCadernoService();
  const consents = useState<string[] | null>(
    "caderno:consent:list",
    () => null,
  );
  const hydrated = useState<boolean>("caderno:consent:hydrated", () => false);

  async function hydrate() {
    if (hydrated.value) return;
    const prefs = await config.preferences.get(PREF_ID);
    consents.value = prefs?.consents ?? null;
    hydrated.value = true;
  }

  function hasConsent(key: string): boolean {
    if (consents.value === null) return DEFAULT_ON.includes(key);
    return consents.value.includes(key);
  }

  async function persist(patch: Partial<Preferences>) {
    const prefs = await config.preferences.get(PREF_ID);
    await config.preferences.put({ ...prefs, ...patch, id: PREF_ID });
  }

  async function toggleConsent(key: string) {
    const all = CONSENTS.map((item) => item.key);
    const current = consents.value ?? DEFAULT_ON;
    const next = current.includes(key)
      ? current.filter((entry) => entry !== key)
      : all.filter((entry) => current.includes(entry) || entry === key);
    consents.value = next;
    await persist({ consents: next });
  }

  return { consents, hydrate, hasConsent, toggleConsent };
}
