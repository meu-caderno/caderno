import type { DayIso, Id, Timestamp } from "./values";

export interface Clock {
  now(): Promise<Timestamp>;
  today(zone?: string): Promise<DayIso>;
}

export interface IdGenerator {
  newId(): Promise<Id>;
}
