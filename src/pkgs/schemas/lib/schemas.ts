import * as z from "zod";


export const AbsencePolicySchema = z.enum([
    "ATTENDANCE_FOCUSED",
    "NONE",
    "PLAN",
]);
export type AbsencePolicy = z.infer<typeof AbsencePolicySchema>;


export const GoalSchema = z.enum([
    "CIVIL_SERVICE_EXAM",
    "COLLEGE",
    "COLLEGE_EXAM",
    "FREE",
    "FREE_COURSE",
    "NA",
]);
export type Goal = z.infer<typeof GoalSchema>;


export const MembershipTypeSchema = z.enum([
    "CLASS",
    "GROUP",
    "PERSONAL",
]);
export type MembershipType = z.infer<typeof MembershipTypeSchema>;

export const ModulesSchema = z.object({
    "absences": z.boolean(),
    "certificate": z.boolean(),
    "examNotice": z.boolean(),
    "grades": z.boolean(),
    "hours": z.boolean(),
    "streak": z.boolean(),
    "term": z.boolean(),
});
export type Modules = z.infer<typeof ModulesSchema>;

export const VocabularySchema = z.object({
    "activity": z.string(),
    "attendance": z.string(),
    "subject": z.string(),
    "term": z.string(),
});
export type Vocabulary = z.infer<typeof VocabularySchema>;

export const BackendRefSchema = z.object({
    "backend": z.string().optional(),
    "hostId": z.string().optional(),
});
export type BackendRef = z.infer<typeof BackendRefSchema>;

export const AcademicTermSchema = z.object({
    "end": z.string().optional(),
    "id": z.string(),
    "label": z.string(),
    "start": z.string().optional(),
});
export type AcademicTerm = z.infer<typeof AcademicTermSchema>;

export const BucketSchema = z.object({
    "completed": z.number(),
    "icon": z.string().optional(),
    "id": z.string(),
    "name": z.string(),
    "target": z.number(),
    "unit": z.string().optional(),
});
export type Bucket = z.infer<typeof BucketSchema>;

export const BucketElementSchema = z.object({
    "completed": z.number(),
    "icon": z.string().optional(),
    "id": z.string(),
    "name": z.string(),
    "target": z.number(),
    "unit": z.string().optional(),
});
export type BucketElement = z.infer<typeof BucketElementSchema>;

export const ModulesClassSchema = z.object({
    "absences": z.boolean(),
    "certificate": z.boolean(),
    "examNotice": z.boolean(),
    "grades": z.boolean(),
    "hours": z.boolean(),
    "streak": z.boolean(),
    "term": z.boolean(),
});
export type ModulesClass = z.infer<typeof ModulesClassSchema>;

export const SocialSchema = z.object({
    "backend": z.string().optional(),
    "hostId": z.string().optional(),
});
export type Social = z.infer<typeof SocialSchema>;

export const TermElementSchema = z.object({
    "end": z.string().optional(),
    "id": z.string(),
    "label": z.string(),
    "start": z.string().optional(),
});
export type TermElement = z.infer<typeof TermElementSchema>;

export const VocabularyClassSchema = z.object({
    "activity": z.string(),
    "attendance": z.string(),
    "subject": z.string(),
    "term": z.string(),
});
export type VocabularyClass = z.infer<typeof VocabularyClassSchema>;

export const ContextSchema = z.object({
    "absencePolicy": AbsencePolicySchema,
    "buckets": z.array(BucketElementSchema).optional(),
    "goal": GoalSchema,
    "id": z.string(),
    "membership": MembershipTypeSchema,
    "minimumAttendance": z.number().optional(),
    "minimumGrade": z.number().optional(),
    "modules": ModulesClassSchema,
    "name": z.string(),
    "social": SocialSchema.optional(),
    "terms": z.array(TermElementSchema).optional(),
    "vocabulary": VocabularyClassSchema.optional(),
});
export type Context = z.infer<typeof ContextSchema>;
