import type { AppUser } from "@/lib/access";
import type { FleetChanges } from "@/lib/fleet-db.functions";
import type { Driver, Kendaraan, Trip } from "@/lib/vehicle-data";

export type FleetSnapshot = { kend: Kendaraan[]; drivers: Driver[]; areas: string[]; users: AppUser[]; trips: Trip[] };

function diffBy<T>(prev: T[], next: T[], key: (x: T) => string) {
  const before = new Map(prev.map((x) => [key(x), JSON.stringify(x)]));
  const keys = new Set(next.map(key));
  const upsert = next.filter((x) => before.get(key(x)) !== JSON.stringify(x));
  const remove = [...before.keys()].filter((k) => !keys.has(k));
  const reordered = prev.length === next.length && prev.some((x, i) => key(x) !== key(next[i]));
  return upsert.length || remove.length || reordered ? { upsert, remove } : null;
}

/** Perubahan antara data terakhir tersimpan dan data di layar; null bila sudah sama. Trip tidak pernah dihapus. */
export function diffFleet(prev: FleetSnapshot, next: FleetSnapshot): FleetChanges | null {
  const c: FleetChanges = {};
  const kend = diffBy(prev.kend, next.kend, (k) => k.nopol);
  const drivers = diffBy(prev.drivers, next.drivers, (d) => d.nama);
  const areas = diffBy(prev.areas, next.areas, (a) => a);
  const users = diffBy(prev.users, next.users, (u) => u.username);
  const before = new Map(prev.trips.map((t) => [t.id, JSON.stringify(t)]));
  const trips = next.trips.filter((t) => before.get(t.id) !== JSON.stringify(t));
  if (kend) c.kend = { upsert: kend.remove.length ? next.kend : kend.upsert, remove: kend.remove };
  if (drivers) c.drivers = { upsert: drivers.remove.length ? next.drivers : drivers.upsert, remove: drivers.remove };
  if (areas) c.areas = { upsert: next.areas, remove: areas.remove };
  if (users) c.users = { upsert: users.upsert, remove: users.remove };
  if (trips.length) c.trips = trips;
  if (!kend && !drivers && !areas && !users && !trips.length) return null;
  c.order = { kend: next.kend.map((k) => k.nopol), drivers: next.drivers.map((d) => d.nama), areas: next.areas, users: next.users.map((u) => u.username) };
  return c;
}
