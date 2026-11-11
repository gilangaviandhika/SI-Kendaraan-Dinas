export type Role = "Admin" | "Security";
export type AppUser = { nama: string; bidang: string; username: string; password: string; role: Role };

/** Security hanya boleh membuka Dashboard (beserta Check-Out, Dalam Perjalanan, Check-In, Laporan). */
export function canAccessPath(role: Role, path: string): boolean {
  if (role === "Admin") return true;
  return path === "/" || path === "";
}
export function findLogin(users: AppUser[], username: string, password: string): AppUser | undefined {
  const u = username.trim().toLowerCase();
  return users.find((x) => x.username.toLowerCase() === u && x.password === password);
}
export const usernameFrom = (nama: string) => nama.trim().toLowerCase().split(/\s+/)[0] ?? "";
