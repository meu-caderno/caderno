import * as z from "zod";

export const OpKindSchema = z.enum(["put", "delete"]);
