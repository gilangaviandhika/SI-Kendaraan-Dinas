import { describe, expect, it } from "vitest";
import { kendaraan0, trips0 } from "@/lib/vehicle-data";

describe("Kondisi awal kendaraan", () => {
  it("tidak berisi perjalanan aktif atau selesai", () => {
    expect(trips0).toEqual([]);
  });
  it("semua kendaraan siap digunakan", () => {
    expect(kendaraan0.length).toBeGreaterThan(0);
    expect(kendaraan0.filter((k) => k.status !== "Tersedia")).toEqual([]);
  });
});