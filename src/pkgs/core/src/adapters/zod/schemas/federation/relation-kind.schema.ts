import * as z from "zod";
import { RelationKind } from "../../../../types/federation/relation-kind";

export const RelationKindSchema = z.enum(RelationKind);
