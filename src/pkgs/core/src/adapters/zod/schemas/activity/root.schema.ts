import * as z from "zod";
import { Root } from "../../../../types/activity/root";

export const RootSchema = z.enum(Root);
