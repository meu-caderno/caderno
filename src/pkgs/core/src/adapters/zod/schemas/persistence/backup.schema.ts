import * as z from "zod";
import { ActivitySchema } from "../activity/activity.schema";
import { ContextSchem } from "../context/context.schema";
import { LibraryItemSchema } from "../library/library-item.schema";
import { EdgeSchema } from "../notebook/edge.schema";
import { NodeSchema } from "../notebook/node.schema";
import { InstantSchema } from "../primitives";
import { MoodSchema } from "../profiles/mood.schema";
import { ProfileSchema } from "../profiles/profile.schema";
import { RecordSchema } from "../subject/record.schema";
import { SubjectSchema } from "../subject/subject.schema";

export const BackupSchema = z.object({
  version: z.literal(2),
  exportedAt: InstantSchema,

  contexts: z.array(ContextSchem),
  subjects: z.array(SubjectSchema),
  records: z.array(RecordSchema),
  activities: z.array(ActivitySchema),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  library: z.array(LibraryItemSchema),

  profiles: z.array(ProfileSchema).optional(),
  moods: z.array(MoodSchema).optional(),
});
