export type Role = "Admin" | "Security";
export type UserStatus = "Aktif" | "Menunggu";
export type AppUser = { nama: string; bidang: string; username: string; password: string; role: Role; status: UserStatus; wilayah?: string };

/** Wilayah yang boleh dilihat akun; null = semua wilayah (Superadmin). Satpam UPT Bandung juga menjaga ULTG Bandung Barat (satu gerbang), datanya tetap terpisah per wilayah. */
export function allowedAreas(user: Pick<AppUser, "wilayah"> | null | undefined): string[] | null {
  const w = user?.wilayah?.trim();
  if (!w) return null;
  if (w.toUpperCase() === "UPT BANDUNG") return ["UPT BANDUNG", "ULTG BANDUNG BARAT"];
  return [w.toUpperCase()];
}

/** Security hanya boleh membuka Dashboard (beserta Check-Out, Dalam Perjalanan, Check-In, Laporan). */
export function canAccessPath(role: Role, path: string): boolean {
  if (role === "Admin") return true;
  return path === "/" || path === "" || path.startsWith("/foto/");
}
export function findLogin(users: AppUser[], username: string, password: string): AppUser | undefined {
  const u = username.trim().toLowerCase();
  return users.find((x) => x.username.toLowerCase() === u && x.password === password);
}
export const usernameFrom = (nama: string) => nama.trim().toLowerCase().split(/\s+/)[0] ?? "";

/** Validasi pendaftaran akun mandiri; mengembalikan pesan kesalahan atau null bila lolos. */
export function validateRegistration(input: { nama: string; username: string; password: string }, existingUsernames: string[]): string | null {
  const nama = input.nama.trim();
  const username = input.username.trim().toLowerCase();
  if (!nama) return "Nama lengkap belum diisi.";
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) return "Username 3–30 karakter: huruf kecil, angka, titik, strip, atau garis bawah.";
  if (input.password.length < 6) return "Password minimal 6 karakter.";
  if (existingUsernames.some((u) => u.toLowerCase() === username)) return "Username sudah dipakai, pilih yang lain.";
  return null;
}
