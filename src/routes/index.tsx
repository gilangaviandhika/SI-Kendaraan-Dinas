import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SI Kendaraan Dinas — UPT Bandung" },
      { name: "description", content: "Monitoring keluar-masuk kendaraan dinas UPT Bandung: check-out, check-in, odometer, foto, dan laporan." },
      { property: "og:title", content: "SI Kendaraan Dinas — UPT Bandung" },
      { property: "og:description", content: "Monitoring keluar-masuk kendaraan dinas: odometer, foto kondisi, laporan perjalanan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type Status = "Tersedia" | "Digunakan";
type Kendaraan = { nopol: string; merk: string; odo: number; kml: number; status: Status };
type Trip = {
  id: number; nopol: string; driver: string; tujuan: string; satpamOut: string;
  waktuOut: string; odoOut: number; fotoOut: string[];
  satpamIn?: string; waktuIn?: string; odoIn?: number; fotoIn?: string[]; kondisi?: string;
};

const drivers = ["Asep Sunandar", "Dedi Kurniawan", "Ujang Supriatna", "Rudi Hartono", "Yayan Ruhiyat"];
const satpams = ["Pak Hendra (Satpam)", "Pak Iwan (Satpam)"] as const satisfies readonly string[];
const SATPAM0: string = satpams[0];
const kendaraan0: Kendaraan[] = [
  { nopol: "D 1234 ABC", merk: "Toyota Innova", odo: 45210, kml: 10, status: "Tersedia" },
  { nopol: "D 5678 XYZ", merk: "Mitsubishi Pajero", odo: 78300, kml: 9, status: "Digunakan" },
  { nopol: "D 9012 KLM", merk: "Toyota Hilux", odo: 61020, kml: 11, status: "Tersedia" },
  { nopol: "D 3456 PQR", merk: "Toyota Avanza", odo: 32890, kml: 13, status: "Tersedia" },
  { nopol: "D 7788 RST", merk: "Daihatsu Gran Max", odo: 54400, kml: 12, status: "Tersedia" },
];
const trips0: Trip[] = [
  { id: 1, nopol: "D 5678 XYZ", driver: "Dedi Kurniawan", tujuan: "Rapat Kantor Provinsi", satpamOut: SATPAM0, waktuOut: "14 Okt 2026 08:10", odoOut: 78300, fotoOut: [] },
  { id: 2, nopol: "D 1234 ABC", driver: "Asep Sunandar", tujuan: "Monitoring Lembang", satpamOut: satpams[1] as string, waktuOut: "13 Okt 2026 07:45", odoOut: 45080, fotoOut: [],
    satpamIn: SATPAM0, waktuIn: "13 Okt 2026 15:20", odoIn: 45210, fotoIn: [], kondisi: "Baik, tidak ada kerusakan" },
];
const now = () => new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const menus = ["Dashboard", "Check-Out", "Dalam Perjalanan", "Check-In", "Laporan", "Data Master"] as const;
type Menu = (typeof menus)[number];

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border bg-card p-5 shadow-sm ${className}`}>{children}</div>
);
const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm";
const btn = "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40";

function Foto({ label, value, onChange }: { label: string; value?: string | undefined; onChange: (u: string) => void }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 p-2 text-xs text-muted-foreground h-28">
      {value ? <img src={value} alt={label} className="h-full w-full object-cover rounded-lg" /> : <><span className="text-2xl">📷</span>{label}</>}
      <input type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(URL.createObjectURL(f)); }} />
    </label>
  );
}
function Steps({ items, active }: { items: string[]; active: number }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2 text-xs font-semibold">
      {items.map((s, i) => (
        <span key={s} className={`rounded-full px-3 py-1 ${i <= active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}. {s}</span>
      ))}
    </div>
  );
}

function App() {
  const [menu, setMenu] = useState<Menu>("Dashboard");
  const [kend, setKend] = useState(kendaraan0);
  const [trips, setTrips] = useState(trips0);
  const [msg, setMsg] = useState("");

  const aktif = trips.filter((t) => !t.waktuIn);
  const selesai = trips.filter((t) => t.waktuIn);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

  // Check-out form
  const [co, setCo] = useState({ nopol: "", driver: "", tujuan: "", satpam: SATPAM0, odo: "", foto: ["", "", ""] });
  const kSel = kend.find((k) => k.nopol === co.nopol);
  const coValid = co.nopol && co.driver && co.tujuan && Number(co.odo) >= (kSel?.odo ?? 0) && co.foto.every(Boolean);
  const submitOut = () => {
    if (!coValid) return;
    setTrips((t) => [{ id: Date.now(), nopol: co.nopol, driver: co.driver, tujuan: co.tujuan, satpamOut: co.satpam, waktuOut: now(), odoOut: Number(co.odo), fotoOut: co.foto }, ...t]);
    setKend((ks) => ks.map((k) => (k.nopol === co.nopol ? { ...k, status: "Digunakan" } : k)));
    setCo({ nopol: "", driver: "", tujuan: "", satpam: SATPAM0, odo: "", foto: ["", "", ""] });
    flash("Check-out tercatat. Kendaraan kini berstatus Digunakan.");
    setMenu("Dalam Perjalanan");
  };

  // Check-in form
  const [ci, setCi] = useState({ id: 0, satpam: SATPAM0, odo: "", foto: ["", ""], kondisi: "Baik, tidak ada kerusakan" });
  const tSel = trips.find((t) => t.id === ci.id);
  const ciValid = tSel && Number(ci.odo) > tSel.odoOut && ci.foto.every(Boolean);
  const submitIn = () => {
    if (!ciValid || !tSel) return;
    setTrips((t) => t.map((x) => (x.id === ci.id ? { ...x, satpamIn: ci.satpam, waktuIn: now(), odoIn: Number(ci.odo), fotoIn: ci.foto, kondisi: ci.kondisi } : x)));
    setKend((ks) => ks.map((k) => (k.nopol === tSel.nopol ? { ...k, status: "Tersedia", odo: Number(ci.odo) } : k)));
    setCi({ id: 0, satpam: SATPAM0, odo: "", foto: ["", ""], kondisi: "Baik, tidak ada kerusakan" });
    flash("Check-in tercatat. Jarak & BBM dihitung otomatis, kendaraan kembali Tersedia.");
    setMenu("Laporan");
  };

  const jarak = (t: Trip) => (t.odoIn ?? t.odoOut) - t.odoOut;
  const bbm = (t: Trip) => { const k = kend.find((x) => x.nopol === t.nopol); return k ? (jarak(t) / k.kml).toFixed(1) : "-"; };

  return (
    <div className="min-h-screen font-sans md:flex">
      <aside className="bg-sidebar-bg text-primary-foreground md:min-h-screen md:w-64 p-5">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-accent">UPT Bandung</p>
          <h1 className="text-xl font-extrabold">SI Kendaraan Dinas</h1>
          <p className="mt-1 text-xs opacity-70">Monitoring keluar-masuk kendaraan</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {menus.map((m) => (
            <button key={m} onClick={() => setMenu(m)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold ${menu === m ? "bg-accent text-accent-foreground" : "hover:bg-primary-foreground/10"}`}>
              {m}{m === "Dalam Perjalanan" && aktif.length > 0 && <span className="ml-2 rounded-full bg-warning px-2 text-xs text-foreground">{aktif.length}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-5 md:p-8">
        <h2 className="mb-6 text-2xl font-extrabold text-foreground">{menu}</h2>
        {msg && <div className="mb-4 rounded-lg bg-success/15 px-4 py-3 text-sm font-semibold text-success">{msg}</div>}

        {menu === "Dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { l: "Total Kendaraan", v: kend.length, c: "text-primary" },
                { l: "Sedang Digunakan", v: kend.filter((k) => k.status === "Digunakan").length, c: "text-warning" },
                { l: "Tersedia", v: kend.filter((k) => k.status === "Tersedia").length, c: "text-success" },
                { l: "Perjalanan Selesai", v: selesai.length, c: "text-foreground" },
              ].map((s) => (
                <Card key={s.l}><p className="text-sm text-muted-foreground">{s.l}</p><p className={`mt-1 text-3xl font-extrabold ${s.c}`}>{s.v}</p></Card>
              ))}
            </div>
          </div>
        )}

        {menu === "Check-Out" && (
          <Card className="max-w-3xl space-y-5">
            <Steps items={["Data perjalanan", "Odometer", "Foto kendaraan", "Kirim"]} active={!co.nopol || !co.driver ? 0 : !co.odo ? 1 : !co.foto.every(Boolean) ? 2 : 3} />
            <div className="grid gap-3 md:grid-cols-2">
              <select className={inp} value={co.nopol} onChange={(e) => setCo({ ...co, nopol: e.target.value, odo: String(kend.find((k) => k.nopol === e.target.value)?.odo ?? "") })}>
                <option value="">Pilih kendaraan tersedia…</option>
                {kend.filter((k) => k.status === "Tersedia").map((k) => <option key={k.nopol} value={k.nopol}>{k.nopol} — {k.merk}</option>)}
              </select>
              <select className={inp} value={co.driver} onChange={(e) => setCo({ ...co, driver: e.target.value })}>
                <option value="">Pilih driver…</option>
                {drivers.filter((d) => !aktif.some((t) => t.driver === d)).map((d) => <option key={d}>{d}</option>)}
              </select>
              <input className={inp} placeholder="Tujuan / keperluan" value={co.tujuan} onChange={(e) => setCo({ ...co, tujuan: e.target.value })} />
              <select className={inp} value={co.satpam} onChange={(e) => setCo({ ...co, satpam: e.target.value })}>{satpams.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div>
              <p className="mb-1 text-sm font-bold">🧭 Odometer saat berangkat (KM)</p>
              <input type="number" className={inp} value={co.odo} onChange={(e) => setCo({ ...co, odo: e.target.value })} />
              {kSel && <p className="mt-1 text-xs text-muted-foreground">Odometer terakhir tercatat: {kSel.odo.toLocaleString("id-ID")} KM</p>}
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Foto kendaraan</p>
              <div className="grid grid-cols-3 gap-3">
                {["Depan", "Samping", "Belakang"].map((l, i) => (
                  <Foto key={l} label={l} value={co.foto[i]} onChange={(u) => setCo({ ...co, foto: co.foto.map((f, j) => (j === i ? u : f)) })} />
                ))}
              </div>
            </div>
            <button className={btn} disabled={!coValid} onClick={submitOut}>Kirim Data Check-Out</button>
          </Card>
        )}

        {menu === "Dalam Perjalanan" && (
          <div className="space-y-3">
            {aktif.length === 0 && <Card><p className="text-sm text-muted-foreground">Tidak ada kendaraan yang sedang dalam perjalanan.</p></Card>}
            {aktif.map((t) => (
              <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3 border-warning/50">
                <div>
                  <p className="font-bold">🚗 {t.nopol} · <span className="text-primary">{t.driver}</span></p>
                  <p className="text-sm text-muted-foreground">{t.tujuan} — keluar {t.waktuOut} · odometer {t.odoOut.toLocaleString("id-ID")} KM</p>
                </div>
                <button className={btn} onClick={() => { setCi({ ...ci, id: t.id }); setMenu("Check-In"); }}>Check-In</button>
              </Card>
            ))}
          </div>
        )}

        {menu === "Check-In" && (
          <Card className="max-w-3xl space-y-5">
            <Steps items={["Pilih perjalanan", "Odometer akhir", "Foto kondisi", "Kirim"]} active={!ci.id ? 0 : !ci.odo ? 1 : !ci.foto.every(Boolean) ? 2 : 3} />
            <div className="grid gap-3 md:grid-cols-2">
              <select className={inp} value={ci.id} onChange={(e) => setCi({ ...ci, id: Number(e.target.value) })}>
                <option value={0}>Pilih kendaraan yang kembali…</option>
                {aktif.map((t) => <option key={t.id} value={t.id}>{t.nopol} — {t.driver}</option>)}
              </select>
              <select className={inp} value={ci.satpam} onChange={(e) => setCi({ ...ci, satpam: e.target.value })}>{satpams.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div>
              <p className="mb-1 text-sm font-bold">🧭 Odometer akhir (KM)</p>
              <input type="number" className={inp} value={ci.odo} onChange={(e) => setCi({ ...ci, odo: e.target.value })} />
              {tSel && <p className="mt-1 text-xs text-muted-foreground">Odometer saat berangkat: {tSel.odoOut.toLocaleString("id-ID")} KM
                {Number(ci.odo) > tSel.odoOut && <> · jarak tempuh <b>{(Number(ci.odo) - tSel.odoOut).toLocaleString("id-ID")} KM</b></>}</p>}
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Foto kondisi kendaraan</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {["Kondisi 1", "Kondisi 2"].map((l, i) => (
                  <Foto key={l} label={l} value={ci.foto[i]} onChange={(u) => setCi({ ...ci, foto: ci.foto.map((f, j) => (j === i ? u : f)) })} />
                ))}
              </div>
            </div>
            <input className={inp} placeholder="Catatan kondisi" value={ci.kondisi} onChange={(e) => setCi({ ...ci, kondisi: e.target.value })} />
            <button className={btn} disabled={!ciValid} onClick={submitIn}>Kirim Data Check-In</button>
          </Card>
        )}

        {menu === "Laporan" && (
          <Card className="overflow-x-auto">
            <h3 className="mb-3 font-bold">Log perjalanan (dihitung otomatis)</h3>
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground"><tr>
                <th className="py-2">Kendaraan</th><th>Driver</th><th>Keluar</th><th>Kembali</th><th className="text-right">Jarak</th><th className="text-right">Est. BBM</th><th>Kondisi</th><th>Foto</th>
              </tr></thead>
              <tbody>{selesai.map((t) => (
                <tr key={t.id} className="border-t align-top">
                  <td className="py-3 font-semibold">{t.nopol}</td><td>{t.driver}</td>
                  <td>{t.waktuOut}<br /><span className="text-xs text-muted-foreground">{t.satpamOut}</span></td>
                  <td>{t.waktuIn}<br /><span className="text-xs text-muted-foreground">{t.satpamIn}</span></td>
                  <td className="text-right font-semibold">{jarak(t).toLocaleString("id-ID")} KM</td>
                  <td className="text-right">{bbm(t)} L</td>
                  <td>{t.kondisi}</td>
                  <td><div className="flex gap-1">{[...t.fotoOut, ...(t.fotoIn ?? [])].map((f, i) => <img key={i} src={f} alt="" className="h-8 w-8 rounded object-cover" />)}
                    {t.fotoOut.length === 0 && <span className="text-xs text-muted-foreground">contoh</span>}</div></td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
        )}

        {menu === "Data Master" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="overflow-x-auto">
              <h3 className="mb-3 font-bold">Kendaraan</h3>
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground"><tr><th className="py-2">No. Polisi</th><th>Merk</th><th className="text-right">Odometer</th><th>Status</th></tr></thead>
                <tbody>{kend.map((k) => (
                  <tr key={k.nopol} className="border-t"><td className="py-3 font-semibold">{k.nopol}</td><td>{k.merk}</td><td className="text-right">{k.odo.toLocaleString("id-ID")}</td>
                    <td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${k.status === "Tersedia" ? "bg-success/15 text-success" : "bg-warning/20 text-foreground"}`}>{k.status}</span></td></tr>
                ))}</tbody>
              </table>
            </Card>
            <Card>
              <h3 className="mb-3 font-bold">Driver</h3>
              <ul className="space-y-2 text-sm">{drivers.map((d) => (
                <li key={d} className="flex justify-between border-t pt-2"><span>{d}</span>
                  <span className="text-muted-foreground">{aktif.some((t) => t.driver === d) ? "Sedang bertugas" : "Siap"}</span></li>
              ))}</ul>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
