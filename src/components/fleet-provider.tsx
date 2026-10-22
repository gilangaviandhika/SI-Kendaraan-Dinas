import { createContext, useContext, useState, type ReactNode } from "react";
import { kendaraan0, trips0, drivers0, areas0 } from "@/lib/vehicle-data";

export type MasterUser = { nama: string; bidang: string };
function useFleetState() {
  const [kend, setKend] = useState(kendaraan0);
  const [trips, setTrips] = useState(trips0);
  const [drivers, setDrivers] = useState(drivers0);
  const [areas, setAreas] = useState(areas0);
  const [users, setUsers] = useState<MasterUser[]>(() => [...new Set(kendaraan0.map(k => k.admin))].map(nama => ({ nama, bidang: "" })));
  return { kend, setKend, trips, setTrips, drivers, setDrivers, areas, setAreas, users, setUsers };
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