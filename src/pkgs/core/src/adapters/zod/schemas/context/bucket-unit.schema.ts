import * as z from "zod";
import { BucketUnit } from "../../../../types/context/bucket-unit";

export const BucketUnitSchema = z.enum(BucketUnit);
