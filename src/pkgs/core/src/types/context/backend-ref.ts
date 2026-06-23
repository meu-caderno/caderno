import type { Id } from "../primitives";

/**
 * e.g. "local", "official-cloud", "self-host"
 * @todo
 */
export interface BackendRef {
  backend?: string;
  hostId?: Id;
}
