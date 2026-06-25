import * as z from "zod";
import { EdgeKind } from "../../../../types/notebook/edge-kind";

export const EdgeKindSchema = z.enum(EdgeKind);
