import type { Id } from "../primitives";
import type { BucketUnit } from "./bucket-unit";

export interface Bucket {
  id: Id;

  name: string;
  icon?: string;

  done: number;
  goal: number;

  unit?: BucketUnit | string;
}
