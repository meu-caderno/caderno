import * as z from "zod";
import { Shift } from "../../../../types/subject/shift";

export const ShiftSchema = z.enum(Shift);
