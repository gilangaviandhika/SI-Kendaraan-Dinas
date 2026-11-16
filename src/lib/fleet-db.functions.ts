import { createServerFn } from "@tanstack/react-start";
import type { AppUser } from "@/lib/access";
import type { Database } from "@/integrations/supabase/types";
type TripRow = Database["public"]["Tables"]["trips"]["Row"];
type UserRow = Database["public"]["Tables"]["app_users"]["Row"];
import type { Driver, Kendaraan, Trip } from "@/lib/vehicle-data";

const BUCKET = "trip-photos";
export type FleetChanges = {
  kend?: { upsert: Kendaraan[]; remove: string[] };
  drivers?: { upsert: Driver[]; remove: string[] };
  areas?: { upsert: string[]; remove: string[] };
  users?: { upsert: AppUser[]; remove: string[] };
  trips?: Trip[];
  order?: { kend?: string[]; drivers?: string[]; areas?: string[]; users?: string[] };
};
type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];
const admin = async (): Promise<Admin> => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
/** Menghapus properti undefined agar cocok dengan tipe Trip (exactOptionalPropertyTypes). */
const clean = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Trip;
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : "");

async function sessionUser(db: Admin, token: unknown) {
  if (typeof token !== "string" || token.length < 20) return null;
  const { data: s } = await db.from("app_sessions").select("username").eq("token", token).maybeSingle();
  if (!s) return null;
  const { data: u } = await db.from("app_users").select("*").eq("username", s.username).maybeSingle();
  return u;
}

async function signPhotos(db: Admin, trips: Trip[]) {
  const paths = [...new Set(trips.flatMap((t) => [t.fotoOdoOut, t.fotoOdoIn, ...t.fotoOut, ...(t.fotoIn ?? [])]).filter((p): p is string => !!p && !p.startsWith("data:") && !p.startsWith("http")))];
  const map = new Map<string, string>();
  for (let i = 0; i < paths.length; i += 100) {
    const { data } = await db.storage.from(BUCKET).createSignedUrls(paths.slice(i, i + 100), 60 * 60 * 24);
    data?.forEach((d) => { if (d.path && d.signedUrl) map.set(d.path, d.signedUrl); });
  }
  const s = (p?: string) => (p ? map.get(p) ?? p : p);
  return trips.map((t) => clean({ ...t, fotoOdoOut: s(t.fotoOdoOut), fotoOdoIn: s(t.fotoOdoIn), fotoOut: t.fotoOut.map((p) => s(p) ?? ""), fotoIn: t.fotoIn?.map((p) => s(p) ?? "") }));
}

/** Mengubah foto data-URL menjadi berkas di storage; URL bertanda tangan dikembalikan ke path aslinya. */
async function storePhoto(db: Admin, tripId: number, name: string, value?: string | null): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("data:")) {
    const m = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(value);
    if (!m?.[1] || !m[2]) return null;
    const mime = m[1];
    const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
    const path = `trips/${tripId}/${name}-${Date.now()}.${mime === "image/png" ? "png" : "jpg"}`;
    const { error } = await db.storage.from(BUCKET).upload(path, bytes, { contentType: mime, upsert: true });
    if (error) throw new Error("Upload foto gagal");
    return path;
  }
  const i = value.indexOf(`/${BUCKET}/`);
  if (value.startsWith("http") && i >= 0) return decodeURIComponent(value.slice(i + BUCKET.length + 2).split("?")[0] ?? "");
  return value.startsWith("http") ? null : value;
}

const rowToTrip = (r: Omit<TripRow, "updated_at"> & { updated_at?: string }): Trip => clean({
  id: Number(r.id), tipe: r.tipe === "tamu" ? "tamu" : "dinas", nopol: r.nopol, driver: r.driver, tujuan: r.tujuan, lokasi: r.lokasi ?? undefined,
  user: r.pengguna ?? undefined, bidang: r.bidang ?? undefined, satpamOut: r.satpam_out, outAt: Number(r.out_at), odoOut: Number(r.odo_out),
  fotoOdoOut: r.foto_odo_out ?? undefined, fotoOut: r.foto_out ?? [], satpamIn: r.satpam_in ?? undefined, inAt: r.in_at == null ? undefined : Number(r.in_at),
  odoIn: r.odo_in == null ? undefined : Number(r.odo_in), fotoOdoIn: r.foto_odo_in ?? undefined, fotoIn: r.foto_in ?? undefined, kondisi: r.kondisi ?? undefined,
});
const toAppUser = (u: UserRow, withPassword: boolean): AppUser => ({ nama: u.nama, bidang: u.bidang, username: u.username, password: withPassword ? u.password : "", role: u.role === "Admin" ? "Admin" : "Security" });

export const dbLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) => ({ username: str(d?.username, 100).trim().toLowerCase(), password: str(d?.password, 200) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: u } = await db.from("app_users").select("username,password").ilike("username", data.username.replace(/[%_\\]/g, "\\$&")).maybeSingle();
    if (!u || u.password !== data.password) return { token: null as string | null };
    const token = crypto.randomUUID() + crypto.randomUUID();
    await db.from("app_sessions").insert({ token, username: u.username });
    return { token };
  });

export const dbLogout = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: str(d?.token, 200) }))
  .handler(async ({ data }) => { const db = await admin(); await db.from("app_sessions").delete().eq("token", data.token); return { ok: true }; });

export const dbLoad = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: str(d?.token, 200) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const me = await sessionUser(db, data.token);
    if (!me) return null;
    const [k, d, a, u, t] = await Promise.all([
      db.from("kendaraan").select("*").order("urutan"),
      db.from("driver").select("*").order("urutan"),
      db.from("wilayah_kerja").select("*").order("urutan"),
      db.from("app_users").select("*").order("urutan"),
      db.from("trips").select("*").order("out_at", { ascending: false }).limit(5000),
    ]);
    const isAdmin = me.role === "Admin";
    return {
      username: me.username as string,
      kend: (k.data ?? []).map((r): Kendaraan => ({ nopol: r.nopol, merk: r.merk, driver: r.driver, area: r.area, admin: r.admin, odo: r.odo == null ? null : Number(r.odo), kml: r.kml == null ? null : Number(r.kml), status: r.status === "Digunakan" ? "Digunakan" : "Tersedia" })),
      drivers: (d.data ?? []).map((r): Driver => ({ nama: r.nama, wilayah: r.wilayah })),
      areas: (a.data ?? []).map((r) => r.nama as string),
      users: (u.data ?? []).map((r) => toAppUser(r, isAdmin || r.username === me.username)),
      trips: await signPhotos(db, (t.data ?? []).map(rowToTrip)),
    };
  });

export const dbSync = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; changes: FleetChanges }) => d)
  .handler(async ({ data }) => {
    const db = await admin();
    const me = await sessionUser(db, data.token);
    if (!me) throw new Error("Sesi berakhir, silakan masuk lagi.");
    const c = data.changes ?? {};
    const isAdmin = me.role === "Admin";
    const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
    const ord = (list: string[] | undefined, key: string) => Math.max(0, list?.indexOf(key) ?? 0);
    if (c.kend) {
      if (c.kend.remove.length && isAdmin) fail((await db.from("kendaraan").delete().in("nopol", c.kend.remove)).error);
      if (c.kend.upsert.length) fail((await db.from("kendaraan").upsert(c.kend.upsert.map((k) => ({ nopol: str(k.nopol, 50), merk: str(k.merk), driver: str(k.driver), area: str(k.area), admin: str(k.admin), odo: k.odo, kml: k.kml, status: k.status, urutan: ord(c.order?.kend, k.nopol), updated_at: new Date().toISOString() })))).error);
    }
    if (isAdmin && c.drivers) {
      if (c.drivers.remove.length) fail((await db.from("driver").delete().in("nama", c.drivers.remove)).error);
      if (c.drivers.upsert.length) fail((await db.from("driver").upsert(c.drivers.upsert.map((x) => ({ nama: str(x.nama), wilayah: str(x.wilayah), urutan: ord(c.order?.drivers, x.nama) })))).error);
    }
    if (isAdmin && c.areas) {
      if (c.areas.remove.length) fail((await db.from("wilayah_kerja").delete().in("nama", c.areas.remove)).error);
      if (c.areas.upsert.length) fail((await db.from("wilayah_kerja").upsert(c.areas.upsert.map((x) => ({ nama: str(x), urutan: ord(c.order?.areas, x) })))).error);
    }
    if (isAdmin && c.users) {
      const remove = c.users.remove.filter((u) => u !== me.username);
      if (remove.length) { fail((await db.from("app_users").delete().in("username", remove)).error); await db.from("app_sessions").delete().in("username", remove); }
      for (const u of c.users.upsert) {
        const row: Record<string, unknown> = { username: str(u.username, 100), nama: str(u.nama), bidang: str(u.bidang), role: u.role === "Admin" ? "Admin" : "Security", urutan: ord(c.order?.users, u.username) };
        if (u.password) row.password = str(u.password, 200);
        const exists = (await db.from("app_users").select("username").eq("username", row.username as string).maybeSingle()).data;
        if (!exists && !row.password) continue;
        fail(exists ? (await db.from("app_users").update(row).eq("username", row.username as string)).error : (await db.from("app_users").insert(row as never)).error);
      }
    }
    const saved: Trip[] = [];
    for (const t of c.trips ?? []) {
      const id = Number(t.id);
      const row = {
        id, tipe: t.tipe === "tamu" ? "tamu" : "dinas", nopol: str(t.nopol, 50), driver: str(t.driver), tujuan: str(t.tujuan, 1000), lokasi: t.lokasi ?? null,
        pengguna: t.user ?? null, bidang: t.bidang ?? null, satpam_out: str(t.satpamOut), out_at: Number(t.outAt), odo_out: Number(t.odoOut) || 0,
        foto_odo_out: await storePhoto(db, id, "odo-out", t.fotoOdoOut),
        foto_out: (await Promise.all((t.fotoOut ?? []).map((f, i) => storePhoto(db, id, `out-${i}`, f)))).map((p) => p ?? ""),
        satpam_in: t.satpamIn ?? null, in_at: t.inAt ?? null, odo_in: t.odoIn ?? null,
        foto_odo_in: await storePhoto(db, id, "odo-in", t.fotoOdoIn),
        foto_in: t.fotoIn ? (await Promise.all(t.fotoIn.map((f, i) => storePhoto(db, id, `in-${i}`, f)))).map((p) => p ?? "") : null,
        kondisi: t.kondisi ?? null, updated_at: new Date().toISOString(),
      };
      fail((await db.from("trips").upsert(row)).error);
      saved.push(rowToTrip(row));
    }
    return { trips: await signPhotos(db, saved) };
  });
