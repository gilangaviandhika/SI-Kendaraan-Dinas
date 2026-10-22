import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFleet } from "@/components/fleet-provider";

export type MasterKind = "kendaraan" | "driver" | "area-kerja" | "user";
const titles = { kendaraan: "Kendaraan", driver: "Driver", "area-kerja": "Area Kerja", user: "User" };
const empty = { nama: "", bidang: "", nopol: "", merk: "", driver: "", area: "", admin: "", odo: "", kml: "" };
const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm";
export function MasterPage({ kind }: { kind: MasterKind }) {
  const { kend, setKend, trips, drivers, setDrivers, areas, setAreas, users, setUsers } = useFleet();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const title = titles[kind];
  const field = (label: string, key: keyof typeof empty, required = true, type = "text") => <label className="space-y-1 text-sm font-semibold"><span>{label}</span><input className={inp} required={required} type={type} min={type === "number" ? (key === "kml" ? "0.01" : "0") : undefined} step={type === "number" ? "any" : undefined} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>;
  const select = (label: string, key: "driver" | "area" | "admin", values: string[]) => <label className="space-y-1 text-sm font-semibold"><span>{label}</span><select aria-label={label} className={inp} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}><option value="">—</option>{values.map(v => <option key={v}>{v}</option>)}</select></label>;
  const rows: string[][] = kind === "kendaraan" ? kend.map(k => [k.nopol, k.merk, k.driver || "—", k.area || "—", k.admin || "—", k.odo?.toLocaleString("id-ID") ?? "—", k.status]) : kind === "driver" ? drivers.map(d => [d, kend.filter(k => k.driver === d).map(k => k.nopol).join(" · ") || "—", trips.some(t => t.driver === d && !t.inAt) ? "Sedang bertugas" : "Siap"]) : kind === "area-kerja" ? areas.map(a => [a, [...new Set(kend.filter(k => k.area === a).map(k => k.admin).filter(Boolean))].join(", ") || "—", String(kend.filter(k => k.area === a).length)]) : users.map(u => [u.nama, u.bidang || "—", kend.some(k => k.admin === u.nama) ? "Admin kendaraan" : "User"]);
  const headers = kind === "kendaraan" ? ["No. Polisi", "Kendaraan", "Driver", "Area Kerja", "Admin", "Odometer (KM)", "Status"] : kind === "driver" ? ["Nama Driver", "Kendaraan", "Status"] : kind === "area-kerja" ? ["Area Kerja", "Admin", "Kendaraan"] : ["Nama User", "Bidang", "Penugasan"];
  return <>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-extrabold">Master {title}</h2><Button onClick={() => { setOpen(true); setError(""); }}><Plus size={16} />Tambah {title}</Button></div>
    {open && <section className="mb-6 max-w-3xl border-b pb-6"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Tambah {title}</h3><Button variant="ghost" size="icon" aria-label="Tutup formulir" onClick={() => setOpen(false)}><X /></Button></div>
      <form onSubmit={e => { e.preventDefault(); const name = form.nama.trim(); const plate = form.nopol.trim().toUpperCase(); const existing = kind === "kendaraan" ? kend.map(k => k.nopol) : kind === "driver" ? drivers : kind === "area-kerja" ? areas : users.map(u => u.nama); const value = kind === "kendaraan" ? plate : name; if (!value || existing.some(v => v.toUpperCase() === value.toUpperCase())) { setError("Data sudah ada atau nama belum diisi."); return; }
        if (kind === "kendaraan") setKend(old => [...old, { nopol: plate, merk: form.merk.trim(), driver: form.driver, area: form.area, admin: form.admin, odo: form.odo === "" ? null : Number(form.odo), kml: form.kml === "" ? null : Number(form.kml), status: "Tersedia" }]);
        else if (kind === "driver") setDrivers(old => [...old, name]);
        else if (kind === "area-kerja") setAreas(old => [...old, name]);
        else setUsers(old => [...old, { nama: name, bidang: form.bidang.trim() }]);
        setForm(empty); setOpen(false); setError("");
      }}><div className="grid gap-4 sm:grid-cols-2">{kind === "kendaraan" ? <>{field("No. Polisi", "nopol")}{field("Merk / tipe kendaraan", "merk")}{select("Driver", "driver", drivers)}{select("Area Kerja", "area", areas)}{select("Admin", "admin", users.map(u => u.nama))}{field("Odometer (KM)", "odo", false, "number")}{field("Efisiensi BBM (KM/L)", "kml", false, "number")}</> : <>{field(kind === "driver" ? "Nama Driver" : kind === "area-kerja" ? "Nama Area Kerja" : "Nama User", "nama")}{kind === "user" && field("Bidang", "bidang")}</>}</div>{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}<div className="mt-4 flex gap-2"><Button type="submit">Tambah</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button></div></form>
    </section>}
    <p className="mb-3 text-sm text-muted-foreground">{rows.length} {title.toLowerCase()}</p>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-muted-foreground"><tr>{headers.map(h => <th key={h} className="whitespace-nowrap py-3 pr-6">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={row[0] ?? i} className="border-t align-top">{row.map((cell, j) => <td key={j} className={`py-3 pr-6 ${j === 0 ? "font-semibold" : ""}`}>{cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <p className="border-y py-12 text-center text-sm text-muted-foreground">Belum ada data.</p>}</div>
  </>;
}