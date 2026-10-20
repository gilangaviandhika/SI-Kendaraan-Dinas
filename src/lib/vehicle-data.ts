export type Status = "Tersedia" | "Digunakan";
export type Kendaraan = { nopol: string; merk: string; odo: number; kml: number; status: Status };
export type Trip = {
  id: number; nopol: string; driver: string; tujuan: string; satpamOut: string;
  outAt: number; odoOut: number; fotoOut: string[];
  satpamIn?: string; inAt?: number; odoIn?: number; fotoIn?: string[]; kondisi?: string;
  user?: string; bidang?: string;
};

export const kendaraan0: Kendaraan[] = [
  { nopol: "D 1234 ABC", merk: "Toyota Innova", odo: 45210, kml: 10, status: "Tersedia" },
  { nopol: "D 5678 XYZ", merk: "Mitsubishi Pajero", odo: 78300, kml: 9, status: "Tersedia" },
  { nopol: "D 9012 KLM", merk: "Toyota Hilux", odo: 61020, kml: 11, status: "Tersedia" },
  { nopol: "D 3456 PQR", merk: "Toyota Avanza", odo: 32890, kml: 13, status: "Tersedia" },
  { nopol: "D 7788 RST", merk: "Daihatsu Gran Max", odo: 54400, kml: 12, status: "Tersedia" },
];
export const trips0: Trip[] = [];