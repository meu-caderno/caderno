import * as z from "zod";
import { ContextMode } from "../../../../types/profiles/context-mode";

export const ContextModeSchema = z.enum(ContextMode);
