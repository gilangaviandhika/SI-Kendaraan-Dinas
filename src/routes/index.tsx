import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Trip } from "@/lib/vehicle-data";
import { useFleet } from "@/components/fleet-provider";
import { MasterNav } from "@/components/master-nav";
import { isCheckoutValid } from "@/lib/checkout";
import { ServiceNav } from "@/components/service-nav";
import { Button } from "@/components/ui/button";

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

const satpams = ["Pak Hendra (Satpam)", "Pak Iwan (Satpam)"] as const satisfies readonly string[];
const SATPAM0: string = satpams[0];
const fmtWaktu = (ms?: number) => (ms ? new Date(ms).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-");

const menus = ["Dashboard", "Check-Out", "Dalam Perjalanan", "Check-In", "Laporan"] as const;
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
  const { kend, setKend, trips, setTrips, drivers, users, areas } = useFleet();
  const [msg, setMsg] = useState("");

  const aktif = trips.filter((t) => !t.inAt);
  const selesai = trips.filter((t) => t.inAt);

  // Filter dashboard per area kerja
  const [areaFilter, setAreaFilter] = useState("Semua");
  const areaOf = (nopol: string) => kend.find((k) => k.nopol === nopol)?.area;
  const kendF = areaFilter === "Semua" ? kend : kend.filter((k) => k.area === areaFilter);
  const selesaiF = areaFilter === "Semua" ? selesai : selesai.filter((t) => areaOf(t.nopol) === areaFilter);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

  // Check-out form
  const [co, setCo] = useState({ nopol: "", driver: "", tujuan: "", user: "", bidang: "", satpam: SATPAM0, odo: "", foto: ["", "", ""] });
  const kSel = kend.find((k) => k.nopol === co.nopol);
  const coValid = isCheckoutValid(co, kSel);
  const submitOut = () => {
    if (!coValid) return;
    setTrips((t) => [{ id: Date.now(), nopol: co.nopol, driver: co.driver, tujuan: co.tujuan, user: co.user.trim(), bidang: co.bidang.trim(), satpamOut: co.satpam, outAt: Date.now(), odoOut: Number(co.odo), fotoOut: co.foto }, ...t]);
    setKend((ks) => ks.map((k) => (k.nopol === co.nopol ? { ...k, status: "Digunakan" } : k)));
    setCo({ nopol: "", driver: "", tujuan: "", user: "", bidang: "", satpam: SATPAM0, odo: "", foto: ["", "", ""] });
    flash("Check-out tercatat. Kendaraan kini berstatus Digunakan.");
    setMenu("Dalam Perjalanan");
  };

  // Check-in form
  const [ci, setCi] = useState({ id: 0, satpam: SATPAM0, odo: "", foto: ["", ""], kondisi: "Baik, tidak ada kerusakan", user: "", bidang: "" });
  const tSel = trips.find((t) => t.id === ci.id);
  const ciValid = tSel && Number(ci.odo) > tSel.odoOut && ci.foto.every(Boolean) && !!ci.user.trim() && !!ci.bidang.trim();
  const submitIn = () => {
    if (!ciValid || !tSel) return;
    setTrips((t) => t.map((x) => (x.id === ci.id ? { ...x, satpamIn: ci.satpam, inAt: Date.now(), odoIn: Number(ci.odo), fotoIn: ci.foto, kondisi: ci.kondisi, user: ci.user.trim(), bidang: ci.bidang.trim() } : x)));
    setKend((ks) => ks.map((k) => (k.nopol === tSel.nopol ? { ...k, status: "Tersedia", odo: Number(ci.odo) } : k)));
    setCi({ id: 0, satpam: SATPAM0, odo: "", foto: ["", ""], kondisi: "Baik, tidak ada kerusakan", user: "", bidang: "" });
    flash("Check-in tercatat. Jarak & BBM dihitung otomatis, kendaraan kembali Tersedia.");
    setMenu("Laporan");
  };

  const jarak = (t: Trip) => (t.odoIn ?? t.odoOut) - t.odoOut;
  const bbm = (t: Trip) => { const k = kend.find((x) => x.nopol === t.nopol); return k?.kml && k.kml > 0 ? jarak(t) / k.kml : null; };
  const durasi = (t: Trip) => (t.inAt ?? t.outAt) - t.outAt;
  const fmtDur = (ms: number) => { const h = Math.floor(ms / 3600000); const m = Math.round((ms % 3600000) / 60000); return h ? `${h} jam ${m} menit` : `${m} menit`; };
  const totalKm = selesaiF.reduce((a, t) => a + jarak(t), 0);
  const totalWaktu = selesaiF.reduce((a, t) => a + durasi(t), 0);
  const totalBbm = selesaiF.reduce((a, t) => a + (bbm(t) ?? 0), 0);
  const bbmLengkap = selesaiF.every((t) => bbm(t) !== null);

  // Data grafik per area kerja
  const grafikArea = areas.map((a) => {
    const kA = kend.filter((k) => k.area === a);
    const tA = selesai.filter((t) => areaOf(t.nopol) === a);
    return {
      area: a,
      total: kA.length,
      digunakan: kA.filter((k) => k.status === "Digunakan").length,
      tersedia: kA.filter((k) => k.status === "Tersedia").length,
      trip: tA.length,
      km: tA.reduce((s, t) => s + jarak(t), 0),
    };
  });
  const maxKend = Math.max(1, ...grafikArea.map((g) => g.total));
  const maxKm = Math.max(1, ...grafikArea.map((g) => g.km));

  return (
    <div className="min-h-screen font-sans md:flex">
      <aside className="bg-sidebar-bg text-primary-foreground md:min-h-screen md:w-64 md:shrink-0 p-5">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-accent">UPT Bandung</p>
          <h1 className="text-xl font-extrabold">SI Kendaraan Dinas</h1>
          <p className="mt-1 text-xs opacity-70">Monitoring keluar-masuk kendaraan</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {menus.map((m) => (
            <Button variant="ghost" key={m} onClick={() => setMenu(m)}
              className={`justify-start whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold ${menu === m ? "bg-accent text-accent-foreground" : "hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}>
              {m}{m === "Dalam Perjalanan" && aktif.length > 0 && <span className="ml-2 rounded-full bg-warning px-2 text-xs text-foreground">{aktif.length}</span>}
            </Button>
          ))}
        </nav>
        <MasterNav />
        <ServiceNav />
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <h2 className="mb-6 text-2xl font-extrabold text-foreground">{menu}</h2>
        {msg && <div className="mb-4 rounded-lg bg-success/15 px-4 py-3 text-sm font-semibold text-success">{msg}</div>}

        {menu === "Dashboard" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="filter-area">Filter Area Kerja:</label>
              <select id="filter-area" aria-label="Filter area kerja" className={`${inp} max-w-xs`} value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
                <option value="Semua">Semua Area Kerja</option>
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { l: "Total Kendaraan", v: kendF.length, c: "text-primary" },
                { l: "Sedang Digunakan", v: kendF.filter((k) => k.status === "Digunakan").length, c: "text-warning" },
                { l: "Tersedia", v: kendF.filter((k) => k.status === "Tersedia").length, c: "text-success" },
                { l: "Perjalanan Selesai", v: selesaiF.length, c: "text-foreground" },
              ].map((s) => (
                <Card key={s.l}><p className="text-sm text-muted-foreground">{s.l}</p><p className={`mt-1 text-3xl font-extrabold ${s.c}`}>{s.v}</p></Card>
              ))}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Rekap Perjalanan{areaFilter !== "Semua" && ` — ${areaFilter}`}</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { l: "Total Trip (KM)", v: totalKm.toLocaleString("id-ID"), c: "text-primary" },
                  { l: "Total Waktu Perjalanan", v: fmtDur(totalWaktu), c: "text-warning" },
                  { l: "Total Estimasi BBM (Ltr)", v: bbmLengkap ? `${totalBbm.toFixed(1)} Ltr` : "Belum tersedia", c: "text-success" },
                ].map((s) => (
                  <Card key={s.l}><p className="text-sm text-muted-foreground">{s.l}</p><p className={`mt-1 text-2xl font-extrabold ${s.c}`}>{s.v}</p></Card>
                ))}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <h3 className="mb-1 font-bold">Kendaraan per Area Kerja</h3>
                <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" /> Total</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-warning" /> Digunakan</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-success" /> Tersedia</span>
                </div>
                <div className="space-y-4">
                  {grafikArea.map((g) => (
                    <div key={g.area}>
                      <p className="mb-1 text-xs font-semibold">{g.area}</p>
                      {[
                        { v: g.total, c: "bg-primary" },
                        { v: g.digunakan, c: "bg-warning" },
                        { v: g.tersedia, c: "bg-success" },
                      ].map((b, i) => (
                        <div key={i} className="mb-1 flex items-center gap-2">
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full rounded-full ${b.c}`} style={{ width: `${(b.v / maxKend) * 100}%` }} />
                          </div>
                          <span className="w-6 text-right text-xs font-bold">{b.v}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="mb-1 font-bold">Perjalanan per Area Kerja</h3>
                <p className="mb-4 text-xs text-muted-foreground">Jumlah trip selesai dan total jarak tempuh (KM)</p>
                <div className="space-y-4">
                  {grafikArea.map((g) => (
                    <div key={g.area}>
                      <p className="mb-1 text-xs font-semibold">{g.area}</p>
                      <div className="mb-1 flex items-center gap-2">
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(g.trip / Math.max(1, ...grafikArea.map((x) => x.trip))) * 100}%` }} />
                        </div>
                        <span className="w-14 text-right text-xs font-bold">{g.trip} trip</span>
                      </div>
                      <div className="mb-1 flex items-center gap-2">
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${(g.km / maxKm) * 100}%` }} />
                        </div>
                        <span className="w-14 text-right text-xs font-bold">{g.km.toLocaleString("id-ID")} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {menu === "Check-Out" && (
          <Card className="max-w-3xl space-y-5">
            <Steps items={["Data perjalanan", "Odometer", "Foto kendaraan", "Kirim"]} active={!co.nopol || !co.driver ? 0 : !co.odo ? 1 : !co.foto.every(Boolean) ? 2 : 3} />
            <div className="grid gap-3 md:grid-cols-2">
              <select aria-label="Kendaraan tersedia" className={inp} value={co.nopol} onChange={(e) => setCo({ ...co, nopol: e.target.value, odo: String(kend.find((k) => k.nopol === e.target.value)?.odo ?? "") })}>
                <option value="">Pilih kendaraan tersedia…</option>
                {kend.filter((k) => k.status === "Tersedia").map((k) => <option key={k.nopol} value={k.nopol}>{k.nopol} — {k.merk}</option>)}
              </select>
              <select aria-label="Driver" className={inp} value={co.driver} onChange={(e) => setCo({ ...co, driver: e.target.value })}>
                <option value="">Pilih driver…</option>
                {drivers.filter((d) => !aktif.some((t) => t.driver === d)).map((d) => <option key={d}>{d}</option>)}
              </select>
              <label className="space-y-1 text-sm font-semibold"><span>User</span><input className={inp} list="checkout-users" placeholder="Nama pegawai" value={co.user} onChange={(e) => { const user = users.find(u => u.nama === e.target.value); setCo({ ...co, user: e.target.value, bidang: user?.bidang || co.bidang }); }} /></label>
              <datalist id="checkout-users">{users.map(u => <option key={u.nama} value={u.nama} />)}</datalist>
              <label className="space-y-1 text-sm font-semibold"><span>Bidang</span><input className={inp} placeholder="Bidang pegawai" value={co.bidang} onChange={e => setCo({ ...co, bidang: e.target.value })} /></label>
              <input className={inp} placeholder="Tujuan / keperluan" value={co.tujuan} onChange={(e) => setCo({ ...co, tujuan: e.target.value })} />
              <select className={inp} value={co.satpam} onChange={(e) => setCo({ ...co, satpam: e.target.value })}>{satpams.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div>
              <p className="mb-1 text-sm font-bold">🧭 Odometer saat berangkat (KM)</p>
              <input aria-label="Odometer saat berangkat (KM)" type="number" className={inp} value={co.odo} onChange={(e) => setCo({ ...co, odo: e.target.value })} />
              {kSel && <p className="mt-1 text-xs text-muted-foreground">Odometer terakhir tercatat: {kSel.odo === null ? "Belum tersedia" : `${kSel.odo.toLocaleString("id-ID")} KM`}</p>}
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Foto kendaraan</p>
              <div className="grid grid-cols-3 gap-3">
                {["Depan", "Samping", "Belakang"].map((l, i) => (
                  <Foto key={l} label={l} value={co.foto[i]} onChange={(u) => setCo({ ...co, foto: co.foto.map((f, j) => (j === i ? u : f)) })} />
                ))}
              </div>
            </div>
            <Button disabled={!coValid} onClick={submitOut}>Kirim Data Check-Out</Button>
          </Card>
        )}

        {menu === "Dalam Perjalanan" && (
          <div className="space-y-3">
            {aktif.length === 0 && <Card><p className="text-sm text-muted-foreground">Tidak ada kendaraan yang sedang dalam perjalanan.</p></Card>}
            {aktif.map((t) => (
              <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3 border-warning/50">
                <div>
                  <p className="font-bold">🚗 {t.nopol} · <span className="text-primary">{t.driver}</span></p>
                  <p className="text-sm">User: {t.user || "—"} · Bidang: {t.bidang || "—"}</p>
                  <p className="text-sm text-muted-foreground">{t.tujuan} — keluar {fmtWaktu(t.outAt)} · odometer {t.odoOut.toLocaleString("id-ID")} KM</p>
                </div>
                <button className={btn} onClick={() => { setCi({ ...ci, id: t.id, user: t.user ?? "", bidang: t.bidang ?? "" }); setMenu("Check-In"); }}>Check-In</button>
              </Card>
            ))}
          </div>
        )}

        {menu === "Check-In" && (
          <Card className="max-w-3xl space-y-5">
            <Steps items={["Pilih perjalanan", "Odometer akhir", "Foto kondisi", "Kirim"]} active={!ci.id ? 0 : !ci.odo ? 1 : !ci.foto.every(Boolean) ? 2 : 3} />
            <div className="grid gap-3 md:grid-cols-2">
              <select className={inp} value={ci.id} onChange={(e) => { const trip = aktif.find(t => t.id === Number(e.target.value)); setCi({ ...ci, id: Number(e.target.value), user: trip?.user ?? "", bidang: trip?.bidang ?? "" }); }}>
                <option value={0}>Pilih kendaraan yang kembali…</option>
                {aktif.map((t) => <option key={t.id} value={t.id}>{t.nopol} — {t.driver}</option>)}
              </select>
              <select className={inp} value={ci.satpam} onChange={(e) => setCi({ ...ci, satpam: e.target.value })}>{satpams.map((s) => <option key={s}>{s}</option>)}</select>
              <input className={inp} placeholder="User (nama pegawai yang membawa kendaraan)" value={ci.user} onChange={(e) => setCi({ ...ci, user: e.target.value })} />
              <input className={inp} placeholder="Bidang tujuan (contoh: Bidang Umum)" value={ci.bidang} onChange={(e) => setCi({ ...ci, bidang: e.target.value })} />
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
                <th className="py-2">Kendaraan</th><th>Driver</th><th>User</th><th>Bidang</th><th>Keluar</th><th>Kembali</th><th className="text-right">Jarak</th><th className="text-right">Est. BBM</th><th>Kondisi</th><th>Foto</th>
              </tr></thead>
              <tbody>{selesai.map((t) => (
                <tr key={t.id} className="border-t align-top">
                  <td className="py-3 font-semibold">{t.nopol}</td><td>{t.driver}</td>
                  <td>{t.user ?? <span className="text-muted-foreground">-</span>}</td>
                  <td>{t.bidang ?? <span className="text-muted-foreground">-</span>}</td>
                  <td>{fmtWaktu(t.outAt)}<br /><span className="text-xs text-muted-foreground">{t.satpamOut}</span></td>
                  <td>{fmtWaktu(t.inAt)}<br /><span className="text-xs text-muted-foreground">{t.satpamIn}</span></td>
                  <td className="text-right font-semibold">{jarak(t).toLocaleString("id-ID")} KM</td>
                   <td className="text-right">{bbm(t) === null ? "Belum tersedia" : `${bbm(t)?.toFixed(1)} L`}</td>
                  <td>{t.kondisi}</td>
                  <td><div className="flex gap-1">{[...t.fotoOut, ...(t.fotoIn ?? [])].map((f, i) => <img key={i} src={f} alt="" className="h-8 w-8 rounded object-cover" />)}
                    {t.fotoOut.length === 0 && <span className="text-xs text-muted-foreground">contoh</span>}</div></td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
        )}


      </main>
    </div>
  );
}
