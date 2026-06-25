import * as z from "zod";
import { Recurrence } from "../../../../types/activity/recurrence";

export const RecurrenceSchema = z.enum(Recurrence);
