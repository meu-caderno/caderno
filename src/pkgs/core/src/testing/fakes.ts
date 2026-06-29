import type { Clock, DayIso, Id, IdGenerator, Timestamp } from "../domain";

export function fixedClock(now: Timestamp, today: DayIso): Clock {
  return { now: async () => now, today: async () => today };
}

export function counterIds(prefix = "id"): IdGenerator {
  let n = 0;
  return {
    newId: async () => {
      const id = `${prefix}-${n}` as Id;
      n += 1;
      return id;
    },
  };
}
