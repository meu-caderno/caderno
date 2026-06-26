import * as z from "zod";
import { AttendanceStatus } from "../../../../types/subject/attendance-status";

export const AttendanceStatusSchema = z.enum(AttendanceStatus);
