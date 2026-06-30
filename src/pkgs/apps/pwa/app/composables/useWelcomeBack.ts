export function useWelcomeBack() {
  const { read, patch } = usePreferences();
  const { hasConsent } = useConsent();
  const show = useState<boolean>("caderno:welcomeBack:show", () => false);
  const checked = useState<boolean>("caderno:welcomeBack:checked", () => false);

  async function check(today: string) {
    if (checked.value || !today || today === "1970-01-01") return;
    checked.value = true;
    const prefs = await read();
    const lastSeen = prefs?.lastSeenDay;
    await patch({ lastSeenDay: today });
    if (hasConsent("welcomeBack") && lastSeen != null && lastSeen !== today) {
      show.value = true;
    }
  }

  function dismiss() {
    show.value = false;
  }

  return { show, check, dismiss };
}
