import { describe, expect, it } from "vitest";
import { isCheckoutValid, type CheckoutForm } from "@/lib/checkout";
import { kendaraan0 } from "@/lib/vehicle-data";

const form: CheckoutForm = { nopol: "B 2240 PYF", driver: "EGI RIFKI TRIADI", tujuan: "Bandung", user: "Budi", bidang: "Bidang Umum", satpam: "Satpam", odo: "100", foto: ["depan", "samping", "belakang"] };
describe("Identitas pengguna saat Check-Out", () => {
  it("requires User before checkout", () => {
    expect(isCheckoutValid(form, kendaraan0[0])).toBe(true);
    expect(isCheckoutValid({ ...form, user: "  " }, kendaraan0[0])).toBe(false);
  });
  it("requires Bidang before checkout", () => {
    expect(isCheckoutValid(form, kendaraan0[0])).toBe(true);
    expect(isCheckoutValid({ ...form, bidang: "  " }, kendaraan0[0])).toBe(false);
  });
});