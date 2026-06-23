export enum ScheduleKind {
  WEEKLY = "WEEKLY",
  AB_WEEKS = "AB_WEEKS", // alternating A/B weeks
  ROTATING_CYCLE = "ROTATING_CYCLE", // anchored to a date
  BLOCK_INTENSIVE = "BLOCK_INTENSIVE", // many classes in one session
  AD_HOC = "AD_HOC"
}
