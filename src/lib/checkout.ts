import type { Kendaraan } from "@/lib/vehicle-data";

export type CheckoutForm = { nopol: string; driver: string; tujuan: string; satpam: string; odo: string; foto: string[]; user: string; bidang: string };
export function isCheckoutValid(form: CheckoutForm, vehicle?: Kendaraan) {
  return Boolean(vehicle?.status === "Tersedia" && form.driver.trim() && form.tujuan.trim() && form.user.trim() && form.bidang.trim() && form.odo.trim() && Number.isFinite(Number(form.odo)) && Number(form.odo) >= (vehicle.odo ?? 0) && form.foto.length === 2 && form.foto.every(Boolean));
}