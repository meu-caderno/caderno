import type { Clock, DayIso, Id, IdGenerator, Timestamp } from "../domain";

export function fixedClock(now: Timestamp, today: DayIso): Clock {
  return { now: async () => now, today: async () => today };
}

export function counterIds(prefix = "id"): IdGenerator {
  let counter = 0;
  return {
    newId: async () => {
      const id = `${prefix}-${counter}` as Id;
      counter += 1;
      return id;
    },
  };
}
