import { describe, expect, it } from "vitest";
import { kendaraan0, drivers0, areas0 } from "@/lib/vehicle-data";

describe("DATA_DRIVER_1 master import", () => {
  it("imports the 33 identified vehicles without duplicate plates", () => {
    expect(kendaraan0).toHaveLength(33);
    expect(new Set(kendaraan0.map((k) => k.nopol)).size).toBe(33);
    expect(kendaraan0[0]).toMatchObject({ nopol: "B 2240 PYF", driver: "EGI RIFKI TRIADI", area: "UPT BANDUNG", admin: "DIKI AHMAD SOLIHIN" });
    expect(kendaraan0[32]).toMatchObject({ nopol: "D 7482 AU", driver: "RYAN AJI KURNIA", area: "ULTG BANDUNG TIMUR", admin: "YADI KUSTIANA" });
  });
  it("keeps multi-vehicle driver assignments without duplicate driver options", () => {
    expect(drivers0).toHaveLength(31);
    expect(kendaraan0.filter((k) => k.driver === "DADAN WARDANI").map((k) => k.nopol)).toEqual(["D 7485 AU", "D 8239 GL"]);
    expect(kendaraan0.filter((k) => k.driver === "BUDI MAHMUDIN").map((k) => k.nopol)).toEqual(["D 8289 FV", "D 8288 FV"]);
  });
  it("preserves all four identified work areas and their vehicle totals", () => {
    expect(areas0.map((area) => [area, kendaraan0.filter((k) => k.area === area).length])).toEqual([
      ["UPT BANDUNG", 14], ["ULTG BANDUNG BARAT", 7], ["ULTG BANDUNG SELATAN", 6], ["ULTG BANDUNG TIMUR", 6],
    ]);
  });
  it("does not invent missing odometer or fuel-efficiency values", () => {
    expect(kendaraan0.every((k) => k.odo === null && k.kml === null)).toBe(true);
  });
});