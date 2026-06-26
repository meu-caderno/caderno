import * as z from "zod";
import { ScheduleKind } from "../../../../types/subject/schedule-kind";

export const ScheduleKindSchema = z.enum(ScheduleKind);
