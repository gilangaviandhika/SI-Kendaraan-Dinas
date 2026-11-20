import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sessions = new Map<string, string>();
const accounts: Record<string, { password: string; role: "Admin" | "Security" }> = { security: { password: "security", role: "Security" }, admin: { password: "admin", role: "Admin" } };
vi.mock("@/lib/fleet-db.functions", () => ({
  dbLogin: async ({ data }: { data: { username: string; password: string } }) => {
    const a = accounts[data.username];
    if (!a || a.password !== data.password) return { token: null };
    const token = `tok-${data.username}-${sessions.size}`; sessions.set(token, data.username); return { token };
  },
  dbLoad: async ({ data }: { data: { token: string } }) => {
    const u = sessions.get(data.token); if (!u) return null;
    return { username: u, kend: [], drivers: [], areas: [], trips: [], users: Object.entries(accounts).map(([username, a]) => ({ nama: username, bidang: "", username, password: "", role: a.role, status: "Aktif" as const })) };
  },
  dbLogout: async ({ data }: { data: { token: string } }) => { sessions.delete(data.token); return { ok: true }; },
  dbSync: async () => ({ trips: [] }),
}));

import { FleetProvider, useFleet } from "@/components/fleet-provider";
import { clearLoginSession, restoreLoginSession, saveLoginSession } from "@/lib/login-session";

function SessionProbe() {
  const { currentUser, sessionReady, login, logout } = useFleet();
  return <><output>{sessionReady ? currentUser?.role ?? "keluar" : "memuat"}</output><button onClick={() => void login("security", "security")}>Masuk</button><button onClick={() => void login("security", "salah")}>Salah</button><button onClick={logout}>Keluar</button></>;
}

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); sessions.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("sesi masuk dari database", () => {
  it("memulihkan Security saat halaman dibuat ulang meskipun sessionStorage hilang", async () => {
    const view = render(<FleetProvider><SessionProbe /></FleetProvider>);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("keluar"));
    fireEvent.click(screen.getByText("Masuk"));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Security"));
    view.unmount();
    sessionStorage.clear();
    render(<FleetProvider><SessionProbe /></FleetProvider>);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Security"));
  });
  it("password salah tidak masuk", async () => {
    render(<FleetProvider><SessionProbe /></FleetProvider>);
    fireEvent.click(screen.getByText("Salah"));
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByRole("status")).toHaveTextContent("keluar");
  });
  it("memigrasikan sesi lama ke penyimpanan persisten", () => {
    sessionStorage.setItem("si-kendaraan-user", "tok");
    expect(restoreLoginSession()).toBe("tok");
    sessionStorage.clear();
    expect(restoreLoginSession()).toBe("tok");
  });
  it("Keluar menghapus sesi dan tidak masuk kembali setelah halaman dibuat ulang", async () => {
    const view = render(<FleetProvider><SessionProbe /></FleetProvider>);
    fireEvent.click(screen.getByText("Masuk"));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Security"));
    fireEvent.click(screen.getByText("Keluar"));
    expect(restoreLoginSession()).toBeNull();
    view.unmount();
    render(<FleetProvider><SessionProbe /></FleetProvider>);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("keluar"));
  });
  it("token lama yang tidak valid dihapus dan kembali ke login", async () => {
    saveLoginSession("admin");
    render(<FleetProvider><SessionProbe /></FleetProvider>);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("keluar"));
    expect(restoreLoginSession()).toBeNull();
  });
  it("penyimpanan diblokir tidak membuat proses login atau logout melempar error", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(restoreLoginSession()).toBeNull();
    expect(() => saveLoginSession("admin")).not.toThrow();
    expect(() => clearLoginSession()).not.toThrow();
  });
});
