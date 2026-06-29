import { describe, expect, it } from "vitest";
import { browserClock } from "./clock";
import { uuidIdGenerator, uuidv7 } from "./id";

describe("browserClock", () => {
  it("returns a numeric instant and an ISO day", async () => {
    const clock = browserClock();
    expect(typeof (await clock.now())).toBe("number");
    expect(await clock.today("UTC")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("uuidv7", () => {
  it("produces a version-7 uuid", () => {
    const generatedUuid = uuidv7();
    expect(generatedUuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("generates distinct ids", async () => {
    const gen = uuidIdGenerator();
    expect(await gen.newId()).not.toBe(await gen.newId());
  });
});
