import type { Id, Preferences } from "@meu-caderno/core";

const PREF_ID = "default" as Id;

export interface ConsentItem {
  key: string;
  label: string;
  blurb: string;
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
];

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
    return consents.value === null || consents.value.includes(key);
  }

  async function persist(patch: Partial<Preferences>) {
    const prefs = await config.preferences.get(PREF_ID);
    await config.preferences.put({ ...prefs, ...patch, id: PREF_ID });
  }

  async function toggleConsent(key: string) {
    const all = CONSENTS.map((item) => item.key);
    const current = consents.value ?? all;
    const next = current.includes(key)
      ? current.filter((entry) => entry !== key)
      : all.filter((entry) => current.includes(entry) || entry === key);
    consents.value = next;
    await persist({ consents: next });
  }

  return { consents, hydrate, hasConsent, toggleConsent };
}
