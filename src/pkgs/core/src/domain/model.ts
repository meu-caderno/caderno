import type { Color, DayIso, Grade, Id, Timestamp } from "./values";

export enum Goal {
  UNIVERSITY = "UNIVERSITY",
  PUBLIC_EXAM = "PUBLIC_EXAM",
  OPEN_COURSE = "OPEN_COURSE",
  FREE_STUDY = "FREE_STUDY",
  NONE = "NONE",
}

export enum Link {
  PERSONAL = "PERSONAL",
  CLASS = "CLASS",
  GROUP = "GROUP",
}

export enum AbsenceStance {
  PLAN_ABSENCES = "PLAN_ABSENCES",
  FOCUS_ON_NOT_MISSING = "FOCUS_ON_NOT_MISSING",
}

export interface Modules {
  attendance: boolean;
  grades: boolean;
  term: boolean;
  streak: boolean;
  hours: boolean;
  syllabus: boolean;
  certificate: boolean;
}

export interface Vocabulary {
  subject: string;
  activity: string;
  attendance: string;
  term: string;
}

export interface BackendRef {
  backend?: string;
  hostId?: Id;
}

export interface Term {
  id: Id;
  label: string;
  start?: DayIso;
  end?: DayIso;
}

export interface Bucket {
  id: Id;
  name: string;
  icon?: string;
  done: number;
  goal: number;
  unit?: string;
}

export interface Context {
  id: Id;
  name: string;
  goal: Goal;
  modules: Modules;
  link: Link;
  social?: BackendRef;
  absenceStance: AbsenceStance;
  attendanceFloor?: number;
  minAverage?: Grade;
  vocabulary?: Vocabulary;
  terms?: Term[];
  buckets?: Bucket[];
  nature?: string;
  vision?: string;
  pinned?: boolean;
  archived?: boolean;
}

export enum ScheduleKind {
  WEEKLY = "WEEKLY",
  AB_WEEKS = "AB_WEEKS",
  ROTATING_CYCLE = "ROTATING_CYCLE",
  BLOCK_INTENSIVE = "BLOCK_INTENSIVE",
  AD_HOC = "AD_HOC",
}

export enum Shift {
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON",
  EVENING = "EVENING",
}

export interface TimeBlock {
  start: string;
  end: string;
  shift?: Shift;
}

export interface Schedule {
  kind: ScheduleKind;
  weekdays?: number[];
  blocks?: TimeBlock[];
  anchor?: DayIso;
  adHocDates?: DayIso[];
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  MEDICAL = "MEDICAL",
  WAIVED = "WAIVED",
  HOLIDAY = "HOLIDAY",
  CANCELED = "CANCELED",
}

export interface Record {
  id: Id;
  subjectId: Id;
  day: DayIso;
  status: AttendanceStatus;
  block?: number;
}

export interface Assessment {
  id: Id;
  subjectId: Id;
  name: string;
  weight: number;
  grade?: Grade;
}

export interface Subject {
  id: Id;
  contextId: Id;
  name: string;
  color: Color;
  hoursPerClass: number;
  classesPerSession: number;
  totalClassHours?: number;
  credits?: number;
  floor?: number;
  lateIsHalf?: boolean;
  medicalExcuses?: boolean;
  schedule?: Schedule;
  assessments?: Assessment[];
  records?: Record[];
}

export enum ActivityStatus {
  OPEN = "OPEN",
  DONE = "DONE",
  ARCHIVED = "ARCHIVED",
}

export enum ActivityKind {
  TASK = "TASK",
  EXAM = "EXAM",
  ASSIGNMENT = "ASSIGNMENT",
  READING = "READING",
  CAPTURE = "CAPTURE",
}

export enum Root {
  CONTEXT = "CONTEXT",
  INBOX = "INBOX",
  LOOSE = "LOOSE",
}

export enum Recurrence {
  NONE = "NONE",
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
}

export interface Subtask {
  id: Id;
  text: string;
  done: boolean;
}

export interface Activity {
  id: Id;
  title: string;
  dueDate?: DayIso;
  contextId?: Id;
  subjectId?: Id;
  kind: ActivityKind;
  status: ActivityStatus;
  root: Root;
  subtasks?: Subtask[];
  preparesId?: Id;
  gapDays?: number;
  seriesId?: Id;
  recurrence?: Recurrence;
  origin?: Origin;
}

export enum Aspect {
  TASK = "TASK",
  CONCEPT = "CONCEPT",
  NOTE = "NOTE",
  WORK = "WORK",
}

export interface Node {
  id: Id;
  aspects: Aspect[];
  title: string;
  body?: string;
  parentId?: Id;
  root?: Root;
  day?: DayIso;
  status?: ActivityStatus;
  origin?: Origin;
}

export enum EdgeKind {
  PART_OF = "PART_OF",
  PREPARES = "PREPARES",
  ASSESSES = "ASSESSES",
  SOURCE_OF = "SOURCE_OF",
}

export interface Edge {
  id: Id;
  from: Id;
  to: Id;
  kind: EdgeKind;
}

export interface LibraryItem {
  id: Id;
  title: string;
  cover?: string;
  synopsis?: string;
  progress?: number;
  stars?: number;
}

export enum Density {
  MINIMAL = "MINIMAL",
  NORMAL = "NORMAL",
  DENSE = "DENSE",
}

export enum Immersion {
  FULL = "FULL",
  FOCUS = "FOCUS",
}

export enum Background {
  PAPER = "PAPER",
  CREAM = "CREAM",
  LINEN = "LINEN",
}

export interface WidgetPref {
  widget: string;
  visible: boolean;
}

export interface Mood {
  id: Id;
  name: string;
  density: Density;
  dopamine: boolean;
  immersion: Immersion;
  accent?: Color;
  background?: Background;
  widgets?: WidgetPref[];
  scope?: Id[];
}

export enum ContextMode {
  FREE = "FREE",
  RESTRICTED = "RESTRICTED",
  PINNED = "PINNED",
}

export interface Profile {
  id: Id;
  name: string;
  contextMode: ContextMode;
  contexts?: Id[];
  accent?: Color;
  density?: Density;
  background?: Background;
  immersion?: Immersion;
  widgets?: WidgetPref[];
  headingFont?: string;
}

export interface Preferences {
  id: Id;
  activeContextId?: Id;
  homeProfile?: string;
}

export enum OpKind {
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface OpLogEntry {
  ts: Timestamp;
  entity: string;
  op: OpKind;
  id: Id;
}

export interface Backup {
  version: 2;
  exportedAt: Timestamp;
  contexts: Context[];
  subjects: Subject[];
  records: Record[];
  activities: Activity[];
  nodes: Node[];
  edges: Edge[];
  library: LibraryItem[];
  profiles?: Profile[];
  moods?: Mood[];
}

export interface BackupV1 {
  version: 1;
  exportedAt: Timestamp;
  contexts: Context[];
  subjects: Subject[];
  records: Record[];
  activities: Activity[];
  nodes: Node[];
  edges: Edge[];
  library: LibraryItem[];
}

export enum OriginKind {
  NATIVE = "NATIVE",
  MEMBER = "MEMBER",
  IMPORT = "IMPORT",
  PLUGIN = "PLUGIN",
}

export interface Origin {
  kind: OriginKind;
  source?: string;
}
