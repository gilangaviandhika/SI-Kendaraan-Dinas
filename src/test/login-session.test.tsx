import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FleetProvider, useFleet } from "@/components/fleet-provider";
import { clearLoginSession, restoreLoginSession, saveLoginSession } from "@/lib/login-session";

function SessionProbe() {
  const { currentUser, sessionReady, login, logout } = useFleet();
  return <><output>{sessionReady ? currentUser?.role ?? "keluar" : "memuat"}</output><button onClick={() => login("security", "security")}>Masuk</button><button onClick={logout}>Keluar</button></>;
}

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("pemulihan sesi setelah kamera", () => {
  it("memulihkan Security saat halaman dibuat ulang meskipun sessionStorage hilang", async () => {
    const view = render(<FleetProvider><SessionProbe /></FleetProvider>);
    fireEvent.click(screen.getByText("Masuk"));
    expect(screen.getByRole("status")).toHaveTextContent("Security");
    view.unmount();
    sessionStorage.clear();
    render(<FleetProvider><SessionProbe /></FleetProvider>);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Security"));
  });
  it("memigrasikan sesi lama Admin ke penyimpanan persisten", () => {
    sessionStorage.setItem("si-kendaraan-user", "admin");
    expect(restoreLoginSession()).toBe("admin");
    sessionStorage.clear();
    expect(restoreLoginSession()).toBe("admin");
  });
  it("Keluar menghapus sesi dan tidak masuk kembali setelah halaman dibuat ulang", () => {
    const view = render(<FleetProvider><SessionProbe /></FleetProvider>);
    fireEvent.click(screen.getByText("Masuk"));
    fireEvent.click(screen.getByText("Keluar"));
    expect(restoreLoginSession()).toBeNull();
    view.unmount();
    render(<FleetProvider><SessionProbe /></FleetProvider>);
    expect(screen.getByRole("status")).toHaveTextContent("keluar");
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