import { createContext, useContext, useState, type ReactNode } from "react";
import { kendaraan0, trips0, drivers0, areas0, type Kendaraan } from "@/lib/vehicle-data";

export type MasterUser = { nama: string; bidang: string };
function useFleetState() {
  const [kend, setKend] = useState(kendaraan0);
  const [trips, setTrips] = useState(trips0);
  const [drivers, setDrivers] = useState(drivers0);
  const [areas, setAreas] = useState(areas0);
  const [users, setUsers] = useState<MasterUser[]>(() => [...new Set(kendaraan0.map(k => k.admin))].map(nama => ({ nama, bidang: "" })));
  const editVehicle = (original: string, vehicle: Kendaraan) => {
    setKend(old => old.map(k => k.nopol === original ? vehicle : k));
    setTrips(old => old.map(t => t.nopol === original ? { ...t, nopol: vehicle.nopol } : t));
  };
  const editDriver = (original: string, name: string) => {
    setDrivers(old => old.map(d => d === original ? name : d));
    setKend(old => old.map(k => k.driver === original ? { ...k, driver: name } : k));
  };
  const editArea = (original: string, name: string) => {
    setAreas(old => old.map(a => a === original ? name : a));
    setKend(old => old.map(k => k.area === original ? { ...k, area: name } : k));
  };
  const editUser = (original: string, user: MasterUser) => {
    setUsers(old => old.map(u => u.nama === original ? user : u));
    setKend(old => old.map(k => k.admin === original ? { ...k, admin: user.nama } : k));
  };
  return { kend, setKend, trips, setTrips, drivers, setDrivers, areas, setAreas, users, setUsers, editVehicle, editDriver, editArea, editUser };
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