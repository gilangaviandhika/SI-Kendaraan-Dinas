import { describe, expect, it } from "vitest";
import { isCheckoutValid, isCheckinValid, isGuestCheckoutValid, isGuestCheckinValid, type CheckoutForm } from "@/lib/checkout";
import { kendaraan0, type Trip } from "@/lib/vehicle-data";

const form: CheckoutForm = { nopol: "B 2240 PYF", driver: "EGI RIFKI TRIADI", tujuan: "Bandung", user: "Budi", bidang: "Bidang Umum", satpam: "Satpam", odo: "100", fotoOdo: "odometer", foto: ["depan", "belakang"] };
describe("Identitas pengguna saat Check-Out", () => {
  it("requires User before checkout", () => {
    expect(isCheckoutValid(form, kendaraan0[0])).toBe(true);
    expect(isCheckoutValid({ ...form, user: "  " }, kendaraan0[0])).toBe(false);
  });
  it("requires Bidang before checkout", () => {
    expect(isCheckoutValid(form, kendaraan0[0])).toBe(true);
    expect(isCheckoutValid({ ...form, bidang: "  " }, kendaraan0[0])).toBe(false);
  });
  it("requires exactly 2 photos, not 1 or 3", () => {
    expect(isCheckoutValid({ ...form, foto: ["depan", "belakang"] }, kendaraan0[0])).toBe(true);
    expect(isCheckoutValid({ ...form, foto: ["depan"] }, kendaraan0[0])).toBe(false);
    expect(isCheckoutValid({ ...form, foto: ["depan", "samping", "belakang"] }, kendaraan0[0])).toBe(false);
    expect(isCheckoutValid({ ...form, foto: ["depan", ""] }, kendaraan0[0])).toBe(false);
  });
  it("requires a separate odometer photo", () => {
    expect(isCheckoutValid(form, kendaraan0[0])).toBe(true);
    expect(isCheckoutValid({ ...form, fotoOdo: "" }, kendaraan0[0])).toBe(false);
  });
});

const trip: Trip = { id: 1, nopol: "B 2240 PYF", driver: "EGI RIFKI TRIADI", tujuan: "Bandung", satpamOut: "Satpam", outAt: 1, odoOut: 100, fotoOdoOut: "odometer-out", fotoOut: ["depan", "belakang"] };
const checkinForm = { odo: "150", fotoOdo: "odometer-in", foto: ["depan", "belakang"], user: "Budi", bidang: "Bidang Umum" };
describe("Foto odometer saat Check-In", () => {
  it("requires a separate odometer photo before check-in", () => {
    expect(isCheckinValid(checkinForm, trip)).toBe(true);
    expect(isCheckinValid({ ...checkinForm, fotoOdo: "" }, trip)).toBe(false);
  });
});
describe("Kendaraan tamu", () => {
  const g = { nopol: "D 1 X", tujuan: "Rapat", user: "Tamu A", bidang: "PLN UID", lokasi: "UPT BANDUNG", foto: ["d", "b"] };
  it("check-out tamu tidak memerlukan odometer, tetapi wajib nama tamu dan instansi", () => {
    expect(isGuestCheckoutValid(g)).toBe(true);
    expect(isGuestCheckoutValid({ ...g, user: " " })).toBe(false);
    expect(isGuestCheckoutValid({ ...g, bidang: "" })).toBe(false);
  });
  it("check-out tamu wajib memilih lokasi kunjungan", () => {
    expect(isGuestCheckoutValid({ ...g, lokasi: "" })).toBe(false);
    expect(isGuestCheckoutValid({ ...g, lokasi: " " })).toBe(false);
  });
  it("check-in tamu tanpa odometer", () => {
    const t: Trip = { ...trip, tipe: "tamu" };
    expect(isGuestCheckinValid({ foto: ["a", "b"], user: "Tamu A", bidang: "PLN" }, t)).toBe(true);
    expect(isGuestCheckinValid({ foto: ["a", "b"], user: "Tamu A", bidang: "PLN" }, trip)).toBe(false);
  });
});
