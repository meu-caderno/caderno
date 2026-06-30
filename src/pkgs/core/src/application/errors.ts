import type { EntityName } from "../domain";

export enum DomainErrorCode {
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  INVARIANT_WEIGHTS_SUM = "INVARIANT_WEIGHTS_SUM",
  INVARIANT_CYCLE = "INVARIANT_CYCLE",
  INVARIANT_FK_MISSING = "INVARIANT_FK_MISSING",
  INVARIANT_RANGE = "INVARIANT_RANGE",
}

export interface DomainError {
  code: DomainErrorCode;
  params?: Record<string, unknown>;
  entity?: EntityName;
}

export function domainError(
  code: DomainErrorCode,
  params?: Record<string, unknown>,
  entity?: EntityName,
): DomainError {
  return { code, params, entity };
}
