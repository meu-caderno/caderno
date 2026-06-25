import * as z from "zod";
import { Aspect } from "../../../../types/notebook/aspect";

export const AspectSchema = z.enum(Aspect);
