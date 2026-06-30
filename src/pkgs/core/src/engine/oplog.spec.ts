import { describe, expect, it } from "vitest";
import type { Id, Timestamp } from "../domain";
import { EntityName, OpKind } from "../domain";
import { appendOp, makeOp, opsForId } from "./oplog";

const id = "subj-1" as Id;
const timestamp = 1_700_000_000_000 as Timestamp;

describe("makeOp", () => {
  it("builds an oplog entry", () => {
    const op = makeOp(EntityName.SUBJECT, OpKind.PUT, id, timestamp);
    expect(op).toEqual({
      entity: EntityName.SUBJECT,
      op: OpKind.PUT,
      id,
      timestamp,
    });
  });
});

describe("appendOp", () => {
  it("appends without mutating the original log", () => {
    const log = [makeOp(EntityName.SUBJECT, OpKind.PUT, id, timestamp)];
    const next = appendOp(
      log,
      makeOp(EntityName.SUBJECT, OpKind.DELETE, id, timestamp),
    );
    expect(log).toHaveLength(1);
    expect(next).toHaveLength(2);
    expect(next[1]?.op).toBe(OpKind.DELETE);
  });
});

describe("opsForId", () => {
  it("filters entries by id", () => {
    const other = "subj-2" as Id;
    const log = [
      makeOp(EntityName.SUBJECT, OpKind.PUT, id, timestamp),
      makeOp(EntityName.SUBJECT, OpKind.PUT, other, timestamp),
    ];
    expect(opsForId(log, id)).toHaveLength(1);
  });
});
