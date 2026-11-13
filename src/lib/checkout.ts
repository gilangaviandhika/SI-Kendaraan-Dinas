import type { Kendaraan } from "@/lib/vehicle-data";

import type { Trip } from "@/lib/vehicle-data";

export type CheckoutForm = { nopol: string; driver: string; tujuan: string; satpam: string; odo: string; foto: string[]; fotoOdo: string; user: string; bidang: string };
export function isCheckoutValid(form: CheckoutForm, vehicle?: Kendaraan) {
  return Boolean(vehicle?.status === "Tersedia" && form.driver.trim() && form.tujuan.trim() && form.user.trim() && form.bidang.trim() && form.odo.trim() && Number.isFinite(Number(form.odo)) && Number(form.odo) >= (vehicle.odo ?? 0) && form.fotoOdo && form.foto.length === 2 && form.foto.every(Boolean));
}

export type CheckinForm = { odo: string; fotoOdo: string; foto: string[]; user: string; bidang: string };
export function isCheckinValid(form: CheckinForm, trip?: Trip) {
  return Boolean(trip && Number.isFinite(Number(form.odo)) && Number(form.odo) > trip.odoOut && form.fotoOdo && form.foto.length === 2 && form.foto.every(Boolean) && form.user.trim() && form.bidang.trim());
}
// Kendaraan tamu: tanpa odometer; "user" = nama tamu, "bidang" = instansi.
export type TipeKendaraan = "dinas" | "tamu";
export type GuestCheckoutForm = { nopol: string; tujuan: string; user: string; bidang: string; lokasi: string; foto: string[] };
export function isGuestCheckoutValid(form: GuestCheckoutForm) {
  return Boolean(form.nopol.trim() && form.tujuan.trim() && form.user.trim() && form.bidang.trim() && form.lokasi.trim() && form.foto.length === 2 && form.foto.every(Boolean));
}
export function isGuestCheckinValid(form: { foto: string[]; user: string; bidang: string }, trip?: Trip) {
  return Boolean(trip?.tipe === "tamu" && form.foto.length === 2 && form.foto.every(Boolean) && form.user.trim() && form.bidang.trim());
}
