import type {
  Activity,
  Assessment,
  AttendanceRecord,
  Backup,
  BackupV1,
  Color,
  Context,
  DayIso,
  Edge,
  Grade,
  Id,
  LibraryItem,
  MapItem,
  Modules,
  Mood,
  NotebookNode,
  OpLogEntry,
  Profile,
  Schedule,
  StudyMap,
  Subject,
  Term,
  Timestamp,
} from "@meu-caderno/core";
import {
  AbsenceStance,
  ActivityKind,
  ActivityStatus,
  Aspect,
  AttendanceStatus,
  Background,
  ContextMode,
  Density,
  EdgeKind,
  EntityName,
  Goal,
  Immersion,
  LibraryKind,
  LibraryState,
  Link,
  MapItemKind,
  Mastery,
  OpKind,
  OriginKind,
  Recurrence,
  Root,
  ScheduleKind,
  Shift,
} from "@meu-caderno/core";
import { z } from "zod";

export const IdSchema = z
  .string()
  .min(1)
  .transform((value) => value as Id);
export const DayIsoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((value) => value as DayIso);
export const TimestampSchema = z
  .number()
  .int()
  .transform((value) => value as Timestamp);
export const ColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .transform((value) => value as Color);
export const GradeSchema = z
  .number()
  .min(0)
  .max(10)
  .transform((value) => value as Grade);
export const ClockTimeSchema = z.string().regex(/^\d{2}:\d{2}$/);

export const GoalSchema = z.enum(Goal);
export const LinkSchema = z.enum(Link);
export const AbsenceStanceSchema = z.enum(AbsenceStance);
export const ScheduleKindSchema = z.enum(ScheduleKind);
export const ShiftSchema = z.enum(Shift);
export const AttendanceStatusSchema = z.enum(AttendanceStatus);
export const ActivityStatusSchema = z.enum(ActivityStatus);
export const ActivityKindSchema = z.enum(ActivityKind);
export const RootSchema = z.enum(Root);
export const RecurrenceSchema = z.enum(Recurrence);
export const AspectSchema = z.enum(Aspect);
export const MasterySchema = z.enum(Mastery);
export const LibraryStateSchema = z.enum(LibraryState);
export const LibraryKindSchema = z.enum(LibraryKind);
export const MapItemKindSchema = z.enum(MapItemKind);
export const EdgeKindSchema = z.enum(EdgeKind);
export const DensitySchema = z.enum(Density);
export const ImmersionSchema = z.enum(Immersion);
export const BackgroundSchema = z.enum(Background);
export const ContextModeSchema = z.enum(ContextMode);
export const OpKindSchema = z.enum(OpKind);
export const OriginKindSchema = z.enum(OriginKind);

export const OriginSchema = z.object({
  kind: OriginKindSchema,
  source: z.string().optional(),
});

export const ModulesSchema = z.object({
  attendance: z.boolean(),
  grades: z.boolean(),
  term: z.boolean(),
  streak: z.boolean(),
  hours: z.boolean(),
  syllabus: z.boolean(),
  certificate: z.boolean(),
});

export const VocabularySchema = z.object({
  subject: z.string(),
  activity: z.string(),
  attendance: z.string(),
  term: z.string(),
});

export const BackendRefSchema = z.object({
  backend: z.string().optional(),
  hostId: IdSchema.optional(),
});

export const TermSchema = z.object({
  id: IdSchema,
  label: z.string(),
  start: DayIsoSchema.optional(),
  end: DayIsoSchema.optional(),
});

export const BucketSchema = z.object({
  id: IdSchema,
  name: z.string(),
  icon: z.string().optional(),
  done: z.number().int(),
  goal: z.number().int(),
  unit: z.string().optional(),
});

export const ContextSchema = z.object({
  id: IdSchema,
  name: z.string(),
  goal: GoalSchema,
  modules: ModulesSchema,
  link: LinkSchema,
  social: BackendRefSchema.optional(),
  absenceStance: AbsenceStanceSchema,
  attendanceFloor: z.number().min(0).max(1).optional(),
  minAverage: GradeSchema.optional(),
  vocabulary: VocabularySchema.optional(),
  terms: z.array(TermSchema).optional(),
  buckets: z.array(BucketSchema).optional(),
  nature: z.string().optional(),
  vision: z.string().optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const TimeBlockSchema = z.object({
  start: ClockTimeSchema,
  end: ClockTimeSchema,
  shift: ShiftSchema.optional(),
});

export const ScheduleSchema = z.object({
  kind: ScheduleKindSchema,
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
  blocks: z.array(TimeBlockSchema).optional(),
  anchor: DayIsoSchema.optional(),
  adHocDates: z.array(DayIsoSchema).optional(),
});

export const RecordSchema = z.object({
  id: IdSchema,
  subjectId: IdSchema,
  day: DayIsoSchema,
  status: AttendanceStatusSchema,
  block: z.number().int().optional(),
});

export const AssessmentSchema = z.object({
  id: IdSchema,
  subjectId: IdSchema,
  name: z.string(),
  weight: z.number(),
  grade: GradeSchema.optional(),
});

export const SubjectSchema = z.object({
  id: IdSchema,
  contextId: IdSchema,
  name: z.string(),
  color: ColorSchema,
  hoursPerClass: z.number(),
  classesPerSession: z.number().int(),
  totalClassHours: z.number().optional(),
  credits: z.number().int().optional(),
  floor: z.number().min(0).max(1).optional(),
  lateIsHalf: z.boolean().optional(),
  medicalExcuses: z.boolean().optional(),
  schedule: ScheduleSchema.optional(),
  assessments: z.array(AssessmentSchema).optional(),
  records: z.array(RecordSchema).optional(),
});

export const SubtaskSchema = z.object({
  id: IdSchema,
  text: z.string(),
  done: z.boolean(),
});

export const ActivitySchema = z.object({
  id: IdSchema,
  title: z.string(),
  dueDate: DayIsoSchema.optional(),
  contextId: IdSchema.optional(),
  subjectId: IdSchema.optional(),
  kind: ActivityKindSchema,
  status: ActivityStatusSchema,
  root: RootSchema,
  subtasks: z.array(SubtaskSchema).optional(),
  preparesId: IdSchema.optional(),
  gapDays: z.number().int().optional(),
  seriesId: IdSchema.optional(),
  recurrence: RecurrenceSchema.optional(),
  origin: OriginSchema.optional(),
});

export const NodeSchema = z.object({
  id: IdSchema,
  aspects: z.array(AspectSchema),
  title: z.string(),
  body: z.string().optional(),
  parentId: IdSchema.optional(),
  root: RootSchema.optional(),
  day: DayIsoSchema.optional(),
  status: ActivityStatusSchema.optional(),
  mastery: MasterySchema.optional(),
  subjectId: IdSchema.optional(),
  contextId: IdSchema.optional(),
  origin: OriginSchema.optional(),
});

export const EdgeSchema = z.object({
  id: IdSchema,
  from: IdSchema,
  to: IdSchema,
  kind: EdgeKindSchema,
});

export const LibraryReviewSchema = z.object({
  contextId: IdSchema,
  text: z.string(),
});

export const LibraryItemSchema = z.object({
  id: IdSchema,
  title: z.string(),
  cover: z.string().optional(),
  synopsis: z.string().optional(),
  progress: z.number().min(0).max(1).optional(),
  stars: z.number().int().min(1).max(5).optional(),
  state: LibraryStateSchema.optional(),
  kind: LibraryKindSchema.optional(),
  personalNote: z.string().optional(),
  contextIds: z.array(IdSchema).optional(),
  reviews: z.array(LibraryReviewSchema).optional(),
});

export const MapItemSchema = z.object({
  kind: MapItemKindSchema,
  label: z.string().optional(),
  nodeId: IdSchema.optional(),
});

export const StudyMapSchema = z.object({
  id: IdSchema,
  name: z.string(),
  items: z.array(MapItemSchema),
  contextId: IdSchema.optional(),
});

export const WidgetPrefSchema = z.object({
  widget: z.string(),
  visible: z.boolean(),
});

export const MoodSchema = z.object({
  id: IdSchema,
  name: z.string(),
  density: DensitySchema,
  dopamine: z.boolean(),
  immersion: ImmersionSchema,
  accent: ColorSchema.optional(),
  background: BackgroundSchema.optional(),
  widgets: z.array(WidgetPrefSchema).optional(),
  scope: z.array(IdSchema).optional(),
});

export const ProfileSchema = z.object({
  id: IdSchema,
  name: z.string(),
  contextMode: ContextModeSchema,
  contexts: z.array(IdSchema).optional(),
  accent: ColorSchema.optional(),
  density: DensitySchema.optional(),
  background: BackgroundSchema.optional(),
  immersion: ImmersionSchema.optional(),
  widgets: z.array(WidgetPrefSchema).optional(),
  headingFont: z.string().optional(),
});

export const OpLogEntrySchema = z.object({
  timestamp: TimestampSchema,
  entity: z.nativeEnum(EntityName),
  op: OpKindSchema,
  id: IdSchema,
});

const CollectionsShape = {
  contexts: z.array(ContextSchema),
  subjects: z.array(SubjectSchema),
  records: z.array(RecordSchema),
  activities: z.array(ActivitySchema),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  library: z.array(LibraryItemSchema),
};

export const BackupV1Schema = z.object({
  version: z.literal(1),
  exportedAt: TimestampSchema,
  ...CollectionsShape,
});

export const BackupSchema = z.object({
  version: z.literal(2),
  exportedAt: TimestampSchema,
  ...CollectionsShape,
  profiles: z.array(ProfileSchema).optional(),
  moods: z.array(MoodSchema).optional(),
});

type Fn<A> = <T>() => T extends A ? 1 : 2;
type Equal<A, B> =
  Fn<A> extends Fn<B> ? (Fn<B> extends Fn<A> ? true : false) : false;
type Expect<T extends true> = T;

export type _Context = Expect<Equal<z.infer<typeof ContextSchema>, Context>>;
export type _Modules = Expect<Equal<z.infer<typeof ModulesSchema>, Modules>>;
export type _Term = Expect<Equal<z.infer<typeof TermSchema>, Term>>;
export type _Subject = Expect<Equal<z.infer<typeof SubjectSchema>, Subject>>;
export type _Record = Expect<
  Equal<z.infer<typeof RecordSchema>, AttendanceRecord>
>;
export type _Assessment = Expect<
  Equal<z.infer<typeof AssessmentSchema>, Assessment>
>;
export type _Schedule = Expect<Equal<z.infer<typeof ScheduleSchema>, Schedule>>;
export type _Activity = Expect<Equal<z.infer<typeof ActivitySchema>, Activity>>;
export type _Node = Expect<Equal<z.infer<typeof NodeSchema>, NotebookNode>>;
export type _Edge = Expect<Equal<z.infer<typeof EdgeSchema>, Edge>>;
export type _LibraryItem = Expect<
  Equal<z.infer<typeof LibraryItemSchema>, LibraryItem>
>;
export type _MapItem = Expect<Equal<z.infer<typeof MapItemSchema>, MapItem>>;
export type _StudyMap = Expect<Equal<z.infer<typeof StudyMapSchema>, StudyMap>>;
export type _Mood = Expect<Equal<z.infer<typeof MoodSchema>, Mood>>;
export type _Profile = Expect<Equal<z.infer<typeof ProfileSchema>, Profile>>;
export type _OpLogEntry = Expect<
  Equal<z.infer<typeof OpLogEntrySchema>, OpLogEntry>
>;
export type _Backup = Expect<Equal<z.infer<typeof BackupSchema>, Backup>>;
export type _BackupV1 = Expect<Equal<z.infer<typeof BackupV1Schema>, BackupV1>>;
