import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { findLogin, usernameFrom, type AppUser } from "@/lib/access";
import { kendaraan0, trips0, drivers0, areas0, driverWilayah, type Driver, type Kendaraan } from "@/lib/vehicle-data";

export type MasterUser = AppUser;
const SESSION_KEY = "si-kendaraan-user";
function useFleetState() {
  const [kend, setKend] = useState(kendaraan0);
  const [trips, setTrips] = useState(trips0);
  const [drivers, setDrivers] = useState<Driver[]>(drivers0);
  const [areas, setAreas] = useState(areas0);
  const [users, setUsers] = useState<MasterUser[]>(() => [
    { nama: "Administrator", bidang: "", username: "admin", password: "admin", role: "Admin" },
    { nama: "Petugas Security", bidang: "", username: "security", password: "security", role: "Security" },
    ...[...new Set(kendaraan0.map(k => k.admin))].filter(Boolean).map(nama => ({ nama, bidang: "", username: usernameFrom(nama), password: "123456", role: "Admin" as const })),
  ]);
  const [currentName, setCurrentName] = useState<string | null>(null);
  useEffect(() => { const saved = window.sessionStorage.getItem(SESSION_KEY); if (saved) setCurrentName(saved); }, []);
  const currentUser = users.find(u => u.username === currentName) ?? null;
  const login = (username: string, password: string) => { const u = findLogin(users, username, password); if (!u) return false; setCurrentName(u.username); window.sessionStorage.setItem(SESSION_KEY, u.username); return true; };
  const logout = () => { setCurrentName(null); window.sessionStorage.removeItem(SESSION_KEY); };
  // original === null menambah kendaraan; selain itu mengedit baris bernopol `original`.
  // Wilayah kerja driver selalu disinkronkan dari kendaraan yang ditugaskan kepadanya
  // agar master driver, check-out, dan check-in tetap terhubung.
  const upsertVehicle = (original: string | null, vehicle: Kendaraan) => {
    const next = original !== null && kend.some((k) => k.nopol === original) ? kend.map((k) => (k.nopol === original ? vehicle : k)) : [...kend, vehicle];
    setKend(next);
    if (original !== null) setTrips((old) => old.map((t) => (t.nopol === original ? { ...t, nopol: vehicle.nopol } : t)));
    setDrivers((ds) => ds.map((d) => ({ ...d, wilayah: driverWilayah(d.nama, next) ?? d.wilayah })));
  };
  const editDriver = (original: string, driver: Driver) => {
    setDrivers((old) => old.map((d) => (d.nama === original ? driver : d)));
    setKend((old) => old.map((k) => (k.driver === original ? { ...k, driver: driver.nama } : k)));
  };
  const editArea = (original: string, name: string) => {
    setAreas(old => old.map(a => a === original ? name : a));
    setKend(old => old.map(k => k.area === original ? { ...k, area: name } : k));
  };
  const editUser = (original: string, user: MasterUser) => {
    const prev = users.find(u => u.nama === original);
    setUsers(old => old.map(u => u.nama === original ? user : u));
    if (prev && prev.username === currentName) { setCurrentName(user.username); window.sessionStorage.setItem(SESSION_KEY, user.username); }
    setKend(old => old.map(k => k.admin === original ? { ...k, admin: user.nama } : k));
  };
  return { kend, setKend, trips, setTrips, drivers, setDrivers, areas, setAreas, users, setUsers, upsertVehicle, editDriver, editArea, editUser, currentUser, login, logout };
}
const FleetContext = createContext<ReturnType<typeof useFleetState> | null>(null);
export function FleetProvider({ children }: { children: ReactNode }) {
  const value = useFleetState();
  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}
export function useFleet() {
  const value = useContext(FleetContext);
  if (!value) throw new Error("FleetProvider is required");
  return value;
}