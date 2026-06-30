import type { Id, Preferences } from "@meu-caderno/core";

const PREFERENCES_ID = "default" as Id;

export function usePreferences() {
  const { config } = useCadernoService();

  function read(): Promise<Preferences | undefined> {
    return config.preferences.get(PREFERENCES_ID);
  }

  async function patch(changes: Partial<Preferences>): Promise<void> {
    const current = await config.preferences.get(PREFERENCES_ID);
    await config.preferences.put({
      ...current,
      ...changes,
      id: PREFERENCES_ID,
    });
  }

  return { read, patch };
}
