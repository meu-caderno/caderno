import * as z from "zod";
import { Background } from "../../../../types/profiles/background";

export const BackgroundSchema = z.enum(Background);
