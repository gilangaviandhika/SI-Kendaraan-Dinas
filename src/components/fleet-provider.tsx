import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AppUser } from "@/lib/access";
import { clearLoginSession, restoreLoginSession, saveLoginSession } from "@/lib/login-session";
import { driverWilayah, type Driver, type Kendaraan, type Trip } from "@/lib/vehicle-data";
import { dbLoad, dbLogin, dbLogout, dbSync, type FleetChanges } from "@/lib/fleet-db.functions";
import { diffFleet, type FleetSnapshot } from "@/lib/fleet-sync";

export type MasterUser = AppUser;
const POLL_MS = 20000;

function useFleetState() {
  const [kend, setKend] = useState<Kendaraan[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [users, setUsers] = useState<MasterUser[]>([]);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const token = useRef<string | null>(null);
  const synced = useRef<FleetSnapshot | null>(null);
  const busy = useRef(false);

  const hydrate = useCallback((d: NonNullable<Awaited<ReturnType<typeof dbLoad>>>) => {
    synced.current = { kend: d.kend, drivers: d.drivers, areas: d.areas, users: d.users, trips: d.trips };
    setKend(d.kend); setDrivers(d.drivers); setAreas(d.areas); setUsers(d.users); setTrips(d.trips); setCurrentName(d.username);
  }, []);
  const reset = useCallback(() => {
    token.current = null; synced.current = null; setCurrentName(null);
    setKend([]); setDrivers([]); setAreas([]); setUsers([]); setTrips([]);
  }, []);

  useEffect(() => {
    const t = restoreLoginSession();
    if (!t) { setSessionReady(true); return; }
    token.current = t;
    dbLoad({ data: { token: t } })
      .then((d) => { if (d) hydrate(d); else { clearLoginSession(); reset(); } })
      .catch(() => setSyncError("Tidak dapat terhubung ke database."))
      .finally(() => setSessionReady(true));
  }, [hydrate, reset]);

  // Kirim perubahan lokal ke database (sedikit ditunda agar beberapa perubahan sekaligus terkirim).
  const state: FleetSnapshot = { kend, drivers, areas, users, trips };
  const stateRef = useRef(state); stateRef.current = state;
  useEffect(() => {
    if (!token.current || !synced.current || busy.current) return;
    const changes = diffFleet(synced.current, state);
    if (!changes) return;
    const timer = setTimeout(() => void push(changes), 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kend, drivers, areas, users, trips]);

  async function push(changes: FleetChanges) {
    if (!token.current || !synced.current) return;
    busy.current = true;
    const sent = stateRef.current;
    try {
      const res = await dbSync({ data: { token: token.current, changes } });
      const byId = new Map(res.trips.map((t) => [t.id, t]));
      const trips2 = sent.trips.map((t) => byId.get(t.id) ?? t);
      synced.current = { ...sent, trips: trips2 };
      setTrips((cur) => cur.map((t) => { const s = byId.get(t.id); const was = sent.trips.find((x) => x.id === t.id); return s && was === t ? s : t; }));
      setSyncError(null);
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : "Gagal menyimpan ke database.");
    } finally {
      busy.current = false;
      const again = synced.current && diffFleet(synced.current, stateRef.current);
      if (again && !syncErrorRef.current) setTimeout(() => void push(again), 400);
    }
  }
  const syncErrorRef = useRef(syncError); syncErrorRef.current = syncError;

  // Ambil data terbaru dari perangkat lain secara berkala bila tidak ada perubahan yang belum tersimpan.
  useEffect(() => {
    if (!currentName) return;
    const id = setInterval(() => {
      if (!token.current || busy.current || !synced.current || diffFleet(synced.current, stateRef.current)) return;
      dbLoad({ data: { token: token.current } }).then((d) => {
        if (!d) { clearLoginSession(); reset(); return; }
        if (!busy.current && synced.current && !diffFleet(synced.current, stateRef.current)) hydrate(d);
      }).catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [currentName, hydrate, reset]);

  const currentUser = users.find((u) => u.username === currentName) ?? null;
  /** true bila berhasil masuk; selain itu pesan kesalahan untuk ditampilkan di formulir. */
  const login = async (username: string, password: string): Promise<true | string> => {
    const { token: t, pesan } = await dbLogin({ data: { username, password } });
    if (!t) return pesan ?? "Username atau password salah.";
    const d = await dbLoad({ data: { token: t } });
    if (!d) return "Gagal memuat data, coba lagi.";
    token.current = t; saveLoginSession(t); hydrate(d); setSyncError(null);
    return true;
  };
  const logout = () => {
    const t = token.current;
    clearLoginSession(); reset();
    if (t) void dbLogout({ data: { token: t } }).catch(() => undefined);
  };
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
    setUsers(old => old.map(u => u.nama === original ? user : u));
    setKend(old => old.map(k => k.admin === original ? { ...k, admin: user.nama } : k));
  };
  return { kend, setKend, trips, setTrips, drivers, setDrivers, areas, setAreas, users, setUsers, upsertVehicle, editDriver, editArea, editUser, currentUser, sessionReady, login, logout, syncError };
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
