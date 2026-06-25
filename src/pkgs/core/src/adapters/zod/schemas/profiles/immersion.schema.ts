import * as z from "zod";
import { Immersion } from "../../../../types/profiles/immersion";

export const ImmersionSchema = z.enum(Immersion);
