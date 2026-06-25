import * as z from "zod";
import { ActivityKind } from "../../../../types/activity/activity-kind";

export const ActivityKindSchema = z.enum(ActivityKind);
