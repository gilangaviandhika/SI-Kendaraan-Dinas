import { describe, expect, it } from "vitest";
import { canAccessPath, findLogin, validateRegistration, type AppUser } from "@/lib/access";
const users: AppUser[] = [{ nama: "A", bidang: "", username: "admin", password: "admin", role: "Admin", status: "Aktif" }, { nama: "S", bidang: "", username: "security", password: "security", role: "Security", status: "Aktif" }];
describe("akses role", () => {
  it("admin boleh membuka data master dan e-SPPD", () => { expect(canAccessPath("Admin", "/master/user")).toBe(true); expect(canAccessPath("Admin", "/e-sppd")).toBe(true); });
  it("security hanya dashboard", () => { expect(canAccessPath("Security", "/")).toBe(true); expect(canAccessPath("Security", "/master/kendaraan")).toBe(false); expect(canAccessPath("Security", "/e-overtime")).toBe(false); });
  it("login mencocokkan username dan password", () => { expect(findLogin(users, "Admin", "admin")?.role).toBe("Admin"); expect(findLogin(users, "security", "salah")).toBeUndefined(); });
});
describe("validasi pendaftaran akun", () => {
  const taken = ["admin", "security"];
  it("data lengkap dan username baru lolos", () => { expect(validateRegistration({ nama: "Budi", username: "budi.s", password: "rahasia1" }, taken)).toBeNull(); });
  it("nama kosong ditolak", () => { expect(validateRegistration({ nama: " ", username: "budi", password: "rahasia1" }, taken)).toMatch(/Nama/); });
  it("username tidak valid ditolak", () => { expect(validateRegistration({ nama: "Budi", username: "Budi Besar!", password: "rahasia1" }, taken)).toMatch(/Username/); expect(validateRegistration({ nama: "Budi", username: "ab", password: "rahasia1" }, taken)).toMatch(/Username/); });
  it("password kurang dari 6 karakter ditolak", () => { expect(validateRegistration({ nama: "Budi", username: "budi", password: "12345" }, taken)).toMatch(/Password/); });
  it("username yang sudah dipakai ditolak walau beda huruf besar", () => { expect(validateRegistration({ nama: "Budi", username: "ADMIN", password: "rahasia1" }, taken)).toMatch(/sudah dipakai/); });
});
