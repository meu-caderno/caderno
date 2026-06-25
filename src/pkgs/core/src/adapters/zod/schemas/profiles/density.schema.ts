import * as z from "zod";
import { Density } from "../../../../types/profiles/density";

export const DensitySchema = z.enum(Density);
