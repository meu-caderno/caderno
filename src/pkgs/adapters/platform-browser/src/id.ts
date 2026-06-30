import type { Id, IdGenerator } from "@meu-caderno/core";
import { v7 as uuidv7 } from "uuid";

export { uuidv7 };

export function uuidIdGenerator(): IdGenerator {
  return { newId: async () => uuidv7() as Id };
}
