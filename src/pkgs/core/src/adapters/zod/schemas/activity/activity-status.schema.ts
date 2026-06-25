import * as z from "zod";
import { ActivityStatus } from "../../../../types/activity/activity-status";

export const ActivityStatusSchema = z.enum(ActivityStatus);
