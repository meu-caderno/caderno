import { describe, expect, it } from "vitest";
import type { Id, Timestamp } from "../domain";
import { OpKind } from "../domain";
import { appendOp, makeOp, opsForId } from "./oplog";

const id = "subj-1" as Id;
const ts = 1_700_000_000_000 as Timestamp;

describe("makeOp", () => {
  it("builds an oplog entry", () => {
    const op = makeOp("subject", OpKind.PUT, id, ts);
    expect(op).toEqual({ entity: "subject", op: OpKind.PUT, id, ts });
  });
});

describe("appendOp", () => {
  it("appends without mutating the original log", () => {
    const log = [makeOp("subject", OpKind.PUT, id, ts)];
    const next = appendOp(log, makeOp("subject", OpKind.DELETE, id, ts));
    expect(log).toHaveLength(1);
    expect(next).toHaveLength(2);
    expect(next[1]?.op).toBe(OpKind.DELETE);
  });
});

describe("opsForId", () => {
  it("filters entries by id", () => {
    const other = "subj-2" as Id;
    const log = [
      makeOp("subject", OpKind.PUT, id, ts),
      makeOp("subject", OpKind.PUT, other, ts),
    ];
    expect(opsForId(log, id)).toHaveLength(1);
  });
});
