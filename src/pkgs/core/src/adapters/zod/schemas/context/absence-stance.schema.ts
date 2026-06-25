import * as z from "zod";
import { AbsenceStance } from "../../../../types/context/absence-stance";

export const AbsenceStanceSchema = z.enum(AbsenceStance);
