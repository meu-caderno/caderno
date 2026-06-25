import z from "zod";
import { Goal } from "../../../../types/context/goal";

export const GoalSchema = z.enum(Goal);
