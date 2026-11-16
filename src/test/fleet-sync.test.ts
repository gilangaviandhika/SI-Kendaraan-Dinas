import { describe, expect, it } from "vitest";
import { diffFleet, type FleetSnapshot } from "@/lib/fleet-sync";
import { kendaraan0, type Trip } from "@/lib/vehicle-data";

const base: FleetSnapshot = { kend: kendaraan0.slice(0, 2), drivers: [], areas: ["UPT BANDUNG"], users: [], trips: [] };
const trip: Trip = { id: 1, nopol: "B 2240 PYF", driver: "A", tujuan: "X", satpamOut: "S", outAt: 1, odoOut: 100, fotoOut: ["a", "b"] };

describe("sinkronisasi database", () => {
  it("tidak mengirim apa pun bila data sama", () => expect(diffFleet(base, base)).toBeNull());
  it("trip baru dan kendaraan yang berubah status dikirim", () => {
    const c = diffFleet(base, { ...base, trips: [trip], kend: base.kend.map((k, i) => (i === 0 ? { ...k, status: "Digunakan" } : k)) });
    expect(c?.trips).toEqual([trip]);
    expect(c?.kend?.upsert.map((k) => k.nopol)).toEqual(["B 2240 PYF"]);
  });
  it("ganti nopol menghapus nopol lama", () => {
    const c = diffFleet(base, { ...base, kend: base.kend.map((k, i) => (i === 0 ? { ...k, nopol: "B 1 X" } : k)) });
    expect(c?.kend?.remove).toEqual(["B 2240 PYF"]);
  });
  it("trip yang hilang dari layar tidak dihapus dari database", () => {
    expect(diffFleet({ ...base, trips: [trip] }, base)).toBeNull();
  });
});
