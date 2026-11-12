import { describe, expect, it } from "vitest";
import { pickOdometer } from "@/lib/odometer-ocr";
describe("pickOdometer", () => {
  it("takes the longest digit run", () => expect(pickOdometer("12 045230 km 7")).toBe("45230"));
  it("handles thousand separators", () => expect(pickOdometer("45.230")).toBe("45230"));
  it("returns null without digits", () => expect(pickOdometer("abc")).toBeNull());
});
