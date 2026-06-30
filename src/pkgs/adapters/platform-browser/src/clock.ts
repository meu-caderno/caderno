import type { Clock, DayIso, Timestamp } from "@meu-caderno/core";

export function browserClock(): Clock {
  return {
    now: async () => Date.now() as Timestamp,
    today: async (zone) => {
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return fmt.format(new Date()) as DayIso;
    },
  };
}
