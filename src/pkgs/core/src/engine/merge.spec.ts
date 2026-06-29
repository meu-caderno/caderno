import { describe, expect, it } from "vitest";
import type { Color, Id, Subject, Timestamp } from "../domain";
import { EntityName } from "../domain";
import { MergeStrategy, mergeCollection } from "./merge";

const id = (value: string) => value as Id;
const timestamp = 1 as Timestamp;
const subject = (identifier: string, name: string): Subject => ({
  id: id(identifier),
  contextId: id("ctx"),
  name,
  color: "#c0392b" as Color,
  hoursPerClass: 1,
  classesPerSession: 1,
});

describe("mergeCollection", () => {
  it("upserts new and changed items, emitting one op each", () => {
    const current = [subject("a", "A")];
    const incoming = [subject("a", "A2"), subject("b", "B")];
    const { merged, ops } = mergeCollection(
      EntityName.SUBJECT,
      current,
      incoming,
      timestamp,
    );
    expect(merged).toHaveLength(2);
    expect(ops).toHaveLength(2);
  });

  it("is idempotent for identical items", () => {
    const current = [subject("a", "A")];
    const { ops } = mergeCollection(
      EntityName.SUBJECT,
      current,
      [subject("a", "A")],
      timestamp,
    );
    expect(ops).toHaveLength(0);
  });

  it("REPLACE deletes items missing from the import", () => {
    const current = [subject("a", "A"), subject("b", "B")];
    const incoming = [subject("a", "A")];
    const { merged, ops } = mergeCollection(
      EntityName.SUBJECT,
      current,
      incoming,
      timestamp,
      MergeStrategy.REPLACE,
    );
    expect(merged).toHaveLength(1);
    expect(ops.some((operation) => operation.op === "DELETE")).toBe(true);
  });
});
