import * as z from "zod";
import type { $ZodRegistry } from "zod/v4/core";
import { mappings } from "./mappings";

type RegistryMeta = {
  id?: string | undefined;
};

type Registry = $ZodRegistry<RegistryMeta>;

const register = (registry: Registry) => {
  for (const [schema, id] of mappings) {
    registry.add(schema, { id: id });
  }

  return registry;
};

export const getJsonSchema = () => {
  const registry = z.registry<RegistryMeta>();
  register(registry);
  return z.toJSONSchema(registry, {
    uri: (id) => `#/$defs/${id}`,
  });
};
