import { describe, expect, it } from "vitest";
import { canAccessPath, findLogin, type AppUser } from "@/lib/access";
const users: AppUser[] = [{ nama: "A", bidang: "", username: "admin", password: "admin", role: "Admin" }, { nama: "S", bidang: "", username: "security", password: "security", role: "Security" }];
describe("akses role", () => {
  it("admin boleh membuka data master dan e-SPPD", () => { expect(canAccessPath("Admin", "/master/user")).toBe(true); expect(canAccessPath("Admin", "/e-sppd")).toBe(true); });
  it("security hanya dashboard", () => { expect(canAccessPath("Security", "/")).toBe(true); expect(canAccessPath("Security", "/master/kendaraan")).toBe(false); expect(canAccessPath("Security", "/e-overtime")).toBe(false); });
  it("login mencocokkan username dan password", () => { expect(findLogin(users, "Admin", "admin")?.role).toBe("Admin"); expect(findLogin(users, "security", "salah")).toBeUndefined(); });
});
