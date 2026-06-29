import type { Id, Preferences } from "@meu-caderno/core";

const PREF_ID = "default" as Id;

export function useWelcomeBack() {
  const { config } = useCadernoService();
  const { hasConsent } = useConsent();
  const show = useState<boolean>("caderno:welcomeBack:show", () => false);
  const checked = useState<boolean>("caderno:welcomeBack:checked", () => false);

  async function check(today: string) {
    if (checked.value || !today || today === "1970-01-01") return;
    checked.value = true;
    const prefs = await config.preferences.get(PREF_ID);
    const lastSeen = prefs?.lastSeenDay;
    const patch: Partial<Preferences> = { lastSeenDay: today };
    await config.preferences.put({ ...prefs, ...patch, id: PREF_ID });
    if (hasConsent("welcomeBack") && lastSeen != null && lastSeen !== today) {
      show.value = true;
    }
  }

  function dismiss() {
    show.value = false;
  }

  return { show, check, dismiss };
}
