import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Pencil, Route as RouteIcon } from "lucide-react";
import { createGuestReportBlob, createReportBlob, deliverReport } from "@/lib/report-export";
import { type Trip } from "@/lib/vehicle-data";
import { useFleet } from "@/components/fleet-provider";
import { UserBadge } from "@/components/auth-gate";
import { MasterNav } from "@/components/master-nav";
import { isCheckoutValid, isCheckinValid, isGuestCheckoutValid, isGuestCheckinValid, type TipeKendaraan } from "@/lib/checkout";
import { dashboardTripRows, inRange, rangeBounds, timeRangePresets, type TimeRangePreset } from "@/lib/dashboard-filter";
import { ServiceNav } from "@/components/service-nav";
import { Button } from "@/components/ui/button";
import { scanOdometer } from "@/lib/odometer-ocr";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SI Kendaraan Dinas — UPT Bandung" },
      { name: "description", content: "Monitoring Kendaraan Dinas UPT Bandung: check-out, check-in, odometer, foto, dan laporan." },
      { property: "og:title", content: "SI Kendaraan Dinas — UPT Bandung" },
      { property: "og:description", content: "Monitoring Kendaraan Dinas: odometer, foto kondisi, laporan perjalanan." },
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

function Foto({ label, value, onChange, onFile }: { label: string; value?: string | undefined; onChange: (u: string) => void; onFile?: (f: File) => void }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 p-2 text-xs text-muted-foreground h-28">
      {value ? <img src={value} alt={label} className="h-full w-full object-cover rounded-lg" /> : <><span className="text-2xl">📷</span>{label}</>}
      <input type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { onChange(URL.createObjectURL(f)); onFile?.(f); } }} />
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
  const { kend, setKend, trips, setTrips, drivers, users, areas, currentUser } = useFleet();
  const [msg, setMsg] = useState("");
  const [scan, setScan] = useState<{ which: "out" | "in"; state: "busy" | "ok" | "fail" } | null>(null);
  const [editOdoIn, setEditOdoIn] = useState(false);
  const runScan = async (which: "out" | "in", f: File) => {
    setScan({ which, state: "busy" });
    try {
      const n = await scanOdometer(f);
      if (!n) return setScan({ which, state: "fail" });
      if (which === "out") setCo((c) => ({ ...c, odo: n })); else { setCi((c) => ({ ...c, odo: n })); setEditOdoIn(false); }
      setScan({ which, state: "ok" });
    } catch { setScan({ which, state: "fail" }); }
  };
  const scanNote = (which: "out" | "in") => scan?.which === which && <p className="mt-1 text-xs text-muted-foreground" role="status">{scan.state === "busy" ? "Membaca angka dari foto odometer…" : scan.state === "ok" ? "Angka terbaca otomatis dari foto. Tekan Edit bila tidak sesuai." : "Angka tidak terbaca dari foto, silakan isi manual."}</p>;
  const [reportBlob, setReportBlob] = useState<Blob | null>(null);
  const [reportError, setReportError] = useState("");
  const [reportTab, setReportTab] = useState<TipeKendaraan>("dinas");
  useEffect(() => {
    if (menu !== "Laporan") return;
    let cancelled = false;
    setReportBlob(null);
    setReportError("");
    (reportTab === "tamu" ? createGuestReportBlob(trips) : createReportBlob(trips, kend)).then(blob => { if (!cancelled) setReportBlob(blob); }).catch(() => { if (!cancelled) setReportError("Laporan belum dapat disiapkan. Buka kembali menu Laporan untuk mencoba lagi."); });
    return () => { cancelled = true; };
  }, [menu, trips, kend, reportTab]);

  const aktif = trips.filter((t) => !t.inAt);
  const selesai = trips.filter((t) => t.inAt);
  const selesaiDinas = selesai.filter((t) => t.tipe !== "tamu");

  // Filter dashboard per wilayah kerja & rentang waktu
  const [areaFilter, setAreaFilter] = useState("Semua");
  const [waktuPreset, setWaktuPreset] = useState<TimeRangePreset>("hari-ini");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const waktuBounds = rangeBounds(waktuPreset, Date.now(), customStart, customEnd);
  const areaOf = (nopol: string) => kend.find((k) => k.nopol === nopol)?.area;
  const kendF = areaFilter === "Semua" ? kend : kend.filter((k) => k.area === areaFilter);
  const dalamRentang = (t: Trip) => inRange(t.outAt, waktuBounds);
  const selesaiF = (areaFilter === "Semua" ? selesaiDinas : selesaiDinas.filter((t) => areaOf(t.nopol) === areaFilter)).filter(dalamRentang);
  const tripTerbaru = dashboardTripRows(trips.filter((trip) => trip.tipe !== "tamu"), areaOf, areaFilter, waktuBounds);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

  // Check-out form
  const [tipe, setTipe] = useState<TipeKendaraan>("dinas");
  const tamu = tipe === "tamu";
  const [co, setCo] = useState({ nopol: "", driver: "", tujuan: "", user: "", bidang: "", lokasi: "", satpam: SATPAM0, odo: "", fotoOdo: "", foto: ["", ""] });
  const kSel = kend.find((k) => k.nopol === co.nopol);
  const coValid = tamu ? isGuestCheckoutValid(co) : isCheckoutValid(co, kSel);
  const submitOut = () => {
    if (!coValid) return;
    if (tamu) {
      setTrips((t) => [{ id: Date.now(), tipe: "tamu", nopol: co.nopol.trim(), driver: co.user.trim(), tujuan: co.tujuan, user: co.user.trim(), bidang: co.bidang.trim(), lokasi: co.lokasi, satpamOut: co.satpam, outAt: Date.now(), odoOut: 0, fotoOut: co.foto }, ...t]);
      setCo({ nopol: "", driver: "", tujuan: "", user: "", bidang: "", lokasi: "", satpam: SATPAM0, odo: "", fotoOdo: "", foto: ["", ""] });
      flash("Kedatangan tamu tercatat (Check-In). Proses Check-Out saat tamu keluar.");
      setMenu("Dalam Perjalanan");
      return;
    }
    setTrips((t) => [{ id: Date.now(), tipe: "dinas", nopol: co.nopol, driver: co.driver, tujuan: co.tujuan, user: co.user.trim(), bidang: co.bidang.trim(), satpamOut: co.satpam, outAt: Date.now(), odoOut: Number(co.odo), fotoOdoOut: co.fotoOdo, fotoOut: co.foto }, ...t]);
    setKend((ks) => ks.map((k) => (k.nopol === co.nopol ? { ...k, status: "Digunakan" } : k)));
    setCo({ nopol: "", driver: "", tujuan: "", user: "", bidang: "", lokasi: "", satpam: SATPAM0, odo: "", fotoOdo: "", foto: ["", ""] });
    flash("Check-out tercatat. Kendaraan kini berstatus Digunakan.");
    setMenu("Dalam Perjalanan");
  };

  // Check-in form
  const [ci, setCi] = useState({ id: 0, satpam: SATPAM0, odo: "", fotoOdo: "", foto: ["", ""], kondisi: "Baik, tidak ada kerusakan", user: "", bidang: "" });
  const tSel = trips.find((t) => t.id === ci.id);
  const [editOdo, setEditOdo] = useState<string | null>(null);
  const ciValid = tSel?.tipe === "tamu" ? isGuestCheckinValid(ci, tSel) : isCheckinValid(ci, tSel);
  const submitIn = () => {
    if (!ciValid || !tSel) return;
    if (tSel.tipe === "tamu") {
      setTrips((t) => t.map((x) => (x.id === ci.id ? { ...x, satpamIn: ci.satpam, inAt: Date.now(), odoIn: 0, fotoIn: ci.foto, kondisi: ci.kondisi, user: ci.user.trim(), bidang: ci.bidang.trim() } : x)));
      setCi({ id: 0, satpam: SATPAM0, odo: "", fotoOdo: "", foto: ["", ""], kondisi: "Baik, tidak ada kerusakan", user: "", bidang: "" });
      flash("Tamu sudah keluar (Check-Out) dan tercatat di laporan.");
      setReportTab("tamu");
      setMenu("Laporan");
      return;
    }
    setTrips((t) => t.map((x) => (x.id === ci.id ? { ...x, satpamIn: ci.satpam, inAt: Date.now(), odoIn: Number(ci.odo), fotoOdoIn: ci.fotoOdo, fotoIn: ci.foto, kondisi: ci.kondisi, user: ci.user.trim(), bidang: ci.bidang.trim() } : x)));
    setKend((ks) => ks.map((k) => (k.nopol === tSel.nopol ? { ...k, status: "Tersedia", odo: Number(ci.odo) } : k)));
    setCi({ id: 0, satpam: SATPAM0, odo: "", fotoOdo: "", foto: ["", ""], kondisi: "Baik, tidak ada kerusakan", user: "", bidang: "" });
    flash("Check-in tercatat. Jarak & BBM dihitung otomatis, kendaraan kembali Tersedia.");
    setReportTab("dinas");
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

  // Data grafik per wilayah kerja
  const grafikArea = areas.map((a) => {
    const kA = kend.filter((k) => k.area === a);
    const tA = selesaiDinas.filter((t) => areaOf(t.nopol) === a && dalamRentang(t));
    return {
      area: a,
      total: kA.length,
      digunakan: kA.filter((k) => k.status === "Digunakan").length,
      tersedia: kA.filter((k) => k.status === "Tersedia").length,
      trip: tA.length,
      km: tA.reduce((s, t) => s + jarak(t), 0),
      waktu: tA.reduce((s, t) => s + durasi(t), 0),
      bbm: tA.reduce((s, t) => s + (bbm(t) ?? 0), 0),
      bbmSiap: tA.length > 0 && tA.every((t) => bbm(t) !== null),
    };
  });
  const maxKend = Math.max(1, ...grafikArea.map((g) => g.total));
  const maxKm = Math.max(1, ...grafikArea.map((g) => g.km));
  const maxWaktu = Math.max(1, ...grafikArea.map((g) => g.waktu));
  const maxBbm = Math.max(1, ...grafikArea.map((g) => g.bbm));

  return (
    <div className="min-h-screen font-sans md:flex">
      <aside className="bg-sidebar-bg text-primary-foreground md:min-h-screen md:w-64 md:shrink-0 p-5">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-accent">UPT Bandung</p>
          <h1 className="text-xl font-extrabold">SI Kendaraan Dinas</h1>
          <p className="mt-1 text-xs opacity-70">Monitoring Kendaraan Dinas</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {menus.map((m) => (
            <Button variant="ghost" key={m} onClick={() => setMenu(m)}
              className={`justify-start whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold ${menu === m ? "bg-accent text-accent-foreground" : "hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}>
              {m}{m === "Dalam Perjalanan" && aktif.length > 0 && <span className="ml-2 rounded-full bg-warning px-2 text-xs text-foreground">{aktif.length}</span>}
            </Button>
          ))}
        </nav>
        {currentUser?.role === "Admin" && <><MasterNav /><ServiceNav /></>}
        <UserBadge />
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <h2 className="mb-6 text-2xl font-extrabold text-foreground">{menu}</h2>
        {msg && <div className="mb-4 rounded-lg bg-success/15 px-4 py-3 text-sm font-semibold text-success">{msg}</div>}

        {menu === "Dashboard" && (
          <div className="space-y-6">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,20rem)_minmax(0,12rem)]">
              <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="filter-area">Wilayah Kerja</label>
              <select id="filter-area" aria-label="Wilayah Kerja" className={inp} value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
                <option value="Semua">Semua Wilayah Kerja</option>
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              </div>
              <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="filter-waktu">Rentang Waktu</label>
              <select id="filter-waktu" aria-label="Rentang Waktu" className={inp} value={waktuPreset} onChange={(e) => setWaktuPreset(e.target.value as TimeRangePreset)}>
                {timeRangePresets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              </div>
              {waktuPreset === "custom" && (
                <div className="grid gap-3 sm:grid-cols-2 xl:col-span-2">
                  <label className="min-w-0 space-y-2 text-sm font-semibold text-muted-foreground">Tanggal awal
                    <input aria-label="Tanggal awal" type="date" className={`${inp} min-w-0`} value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                  </label>
                  <label className="min-w-0 space-y-2 text-sm font-semibold text-muted-foreground">Tanggal akhir
                    <input aria-label="Tanggal akhir" type="date" className={`${inp} min-w-0`} value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                  </label>
                </div>
              )}
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
            <Card className="overflow-x-auto">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-bold"><RouteIcon size={18} className="text-primary" />Trip Terbaru</h3>
                <span className="text-xs text-muted-foreground">{tripTerbaru.length} perjalanan</span>
              </div>
              <table aria-label="Trip terbaru" className="w-full min-w-[52rem] text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Kode Trip</th>
                    <th className="py-2 pr-4">Tujuan</th>
                    <th className="py-2 pr-4">Kendaraan</th>
                    <th className="py-2 pr-4">Driver</th>
                    <th className="py-2 pr-4">Waktu Berangkat</th>
                    <th className="py-2 pr-4">Waktu Check-In</th>
                    <th className="py-2 pr-4">Durasi</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tripTerbaru.map((trip) => (
                    <tr key={trip.id} className="border-t align-top">
                      <td className="py-3 pr-4 font-mono text-xs">{String(trip.id)}</td>
                      <td className="py-3 pr-4 font-medium">{trip.tujuan || "—"}</td>
                      <td className="py-3 pr-4 font-semibold">{kend.find((vehicle) => vehicle.nopol === trip.nopol)?.merk ?? trip.nopol} ({trip.nopol})</td>
                      <td className="py-3 pr-4">{trip.driver}</td>
                      <td className="py-3 pr-4">{fmtWaktu(trip.outAt)}</td>
                      <td className="py-3 pr-4">{fmtWaktu(trip.inAt)}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{fmtDur((trip.inAt ?? Date.now()) - trip.outAt)}{trip.inAt === undefined && " (berjalan)"}</td>
                      <td className="py-3">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${trip.inAt === undefined ? "bg-warning/20 text-foreground" : "bg-success/15 text-success"}`}>
                          {trip.inAt === undefined ? "Sedang Berjalan" : "Selesai"}
                        </span>
                      </td>
                      <td className="py-3">
                        {trip.inAt === undefined
                          ? <Button size="sm" onClick={() => { setTipe("dinas"); setCi({ ...ci, id: trip.id, user: trip.user ?? "", bidang: trip.bidang ?? "" }); setMenu("Check-In"); }}>Check-In</Button>
                          : <Button size="sm" variant="outline" onClick={() => { setReportTab("dinas"); setMenu("Laporan"); }}>Lihat Laporan</Button>}
                      </td>
                    </tr>
                  ))}
                  {tripTerbaru.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        Belum ada perjalanan pada rentang waktu ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
            {(() => {
              const tamuAll = trips.filter((t) => t.tipe === "tamu" && (areaFilter === "Semua" || t.lokasi === areaFilter));
              const tamuAktif = tamuAll.filter((t) => !t.inAt).sort((a, b) => a.outAt - b.outAt);
              const tamuRentang = tamuAll.filter(dalamRentang);
              const tamuSelesai = tamuRentang.filter((t) => t.inAt);
              const rata = tamuSelesai.length ? tamuSelesai.reduce((s, t) => s + durasi(t), 0) / tamuSelesai.length : 0;
              return (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Ringkasan Kendaraan Tamu{areaFilter !== "Semua" && ` — ${areaFilter}`}</h3>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                      { l: "Tamu Sedang Berkunjung", v: String(tamuAktif.length), c: "text-warning" },
                      { l: "Total Tamu Masuk", v: String(tamuRentang.length), c: "text-primary" },
                      { l: "Kunjungan Selesai", v: String(tamuSelesai.length), c: "text-success" },
                      { l: "Rata-rata Waktu Kunjungan", v: tamuSelesai.length ? fmtDur(rata) : "-", c: "text-foreground" },
                    ].map((s) => (
                      <Card key={s.l}><p className="text-sm text-muted-foreground">{s.l}</p><p className={`mt-1 text-2xl font-extrabold ${s.c}`}>{s.v}</p></Card>
                    ))}
                  </div>
                  <Card className="overflow-x-auto">
                    <h3 className="mb-3 font-bold">Tamu Sedang Berkunjung</h3>
                    <table aria-label="Tamu sedang berkunjung" className="w-full min-w-[48rem] text-sm">
                      <thead className="text-left text-muted-foreground">
                        <tr><th className="py-2 pr-4">Nomor Polisi</th><th className="py-2 pr-4">Nama Tamu / Instansi</th><th className="py-2 pr-4">Keperluan</th><th className="py-2 pr-4">Lokasi Kunjungan</th><th className="py-2 pr-4">Jam Masuk</th><th className="py-2 pr-4">Lama Berkunjung</th><th className="py-2">Aksi</th></tr>
                      </thead>
                      <tbody>
                        {tamuAktif.map((t) => (
                          <tr key={t.id} className="border-t align-top">
                            <td className="py-3 pr-4 font-semibold">{t.nopol}</td>
                            <td className="py-3 pr-4">{t.user || "—"}<span className="block text-xs text-muted-foreground">{t.bidang || "—"}</span></td>
                            <td className="py-3 pr-4">{t.tujuan || "—"}</td>
                            <td className="py-3 pr-4">{fmtWaktu(t.outAt)}</td>
                            <td className="py-3 pr-4">{fmtDur(Date.now() - t.outAt)}</td>
                            <td className="py-3"><Button size="sm" variant="outline" onClick={() => { setTipe("tamu"); setCi({ ...ci, id: t.id, user: t.user ?? "", bidang: t.bidang ?? "" }); setMenu("Check-Out"); }}>Check-Out</Button></td>
                          </tr>
                        ))}
                        {tamuAktif.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Saat ini tidak ada tamu yang sedang berkunjung.</td></tr>}
                      </tbody>
                    </table>
                  </Card>
                </div>
              );
            })()}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <h3 className="mb-1 font-bold">Kendaraan per Wilayah Kerja</h3>
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
                <h3 className="mb-1 font-bold">Perjalanan per Wilayah Kerja</h3>
                <p className="mb-4 text-xs text-muted-foreground">Jumlah trip selesai, total jarak tempuh (KM), total waktu perjalanan, dan estimasi BBM (Ltr)</p>
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
                      <div className="mb-1 flex items-center gap-2">
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-warning" style={{ width: `${(g.waktu / maxWaktu) * 100}%` }} />
                        </div>
                        <span className="w-24 text-right text-xs font-bold">{g.waktu > 0 ? fmtDur(g.waktu) : "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-success" style={{ width: `${(g.bbm / maxBbm) * 100}%` }} />
                        </div>
                        <span className="w-14 text-right text-xs font-bold">{g.bbmSiap ? `${g.bbm.toFixed(1)} L` : "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {((menu === "Check-Out" && !tamu) || (menu === "Check-In" && tamu)) && (
          <Card className="max-w-3xl space-y-5">
            <div role="group" aria-label="Tipe kendaraan" className="flex gap-2">{(["dinas", "tamu"] as const).map((v) => <Button key={v} type="button" variant={tipe === v ? "default" : "outline"} onClick={() => { setTipe(v); setCo({ ...co, nopol: "", driver: "", odo: "" }); setCi({ ...ci, id: 0 }); }}>{v === "dinas" ? "Kendaraan Dinas" : "Kendaraan Tamu"}</Button>)}</div>
            {tamu ? <Steps items={["Data tamu masuk", "Foto kendaraan", "Kirim"]} active={!co.nopol || !co.user || !co.bidang ? 0 : !co.foto.every(Boolean) ? 1 : 2} /> : <Steps items={["Data perjalanan", "Odometer", "Foto odometer", "Foto kendaraan", "Kirim"]} active={!co.nopol || !co.driver ? 0 : !co.odo ? 1 : !co.fotoOdo ? 2 : !co.foto.every(Boolean) ? 3 : 4} />}
            <div className="grid gap-3 md:grid-cols-2">
              {tamu ? <>
              <label className="space-y-1 text-sm font-semibold"><span>Nomor Polisi</span><input aria-label="Nomor polisi kendaraan tamu" className={inp} placeholder="Contoh: D 1234 AB" value={co.nopol} onChange={(e) => setCo({ ...co, nopol: e.target.value })} /></label>
              <label className="space-y-1 text-sm font-semibold"><span>Nama Tamu</span><input className={inp} placeholder="Nama tamu" value={co.user} onChange={(e) => setCo({ ...co, user: e.target.value })} /></label>
              <label className="space-y-1 text-sm font-semibold"><span>Instansi</span><input className={inp} placeholder="Asal instansi" value={co.bidang} onChange={(e) => setCo({ ...co, bidang: e.target.value })} /></label>
              <label className="space-y-1 text-sm font-semibold"><span>Lokasi Kunjungan</span><select aria-label="Lokasi kunjungan tamu" className={inp} value={co.lokasi} onChange={(e) => setCo({ ...co, lokasi: e.target.value })}>
                <option value="">Pilih lokasi kunjungan…</option>
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select></label>
              </> : <>
              <label className="space-y-1 text-sm font-semibold"><span>Kendaraan</span><select aria-label="Kendaraan tersedia" className={inp} value={co.nopol} onChange={(e) => setCo({ ...co, nopol: e.target.value, odo: String(kend.find((k) => k.nopol === e.target.value)?.odo ?? "") })}>
                <option value="">Pilih kendaraan tersedia…</option>
                {kend.filter((k) => k.status === "Tersedia").map((k) => <option key={k.nopol} value={k.nopol}>{k.nopol} — {k.merk}</option>)}
              </select></label>
              <label className="space-y-1 text-sm font-semibold"><span>Driver</span><select aria-label="Driver" className={inp} value={co.driver} onChange={(e) => setCo({ ...co, driver: e.target.value })}>
                <option value="">Pilih driver…</option>
                {drivers.filter((d) => !aktif.some((t) => t.driver === d.nama) && (!kSel || !d.wilayah || d.wilayah === kSel.area)).map((d) => <option key={d.nama} value={d.nama}>{d.nama}{d.wilayah ? ` — ${d.wilayah}` : ""}</option>)}
              </select></label>
              <label className="space-y-1 text-sm font-semibold"><span>User</span><input className={inp} list="checkout-users" placeholder="Nama pegawai" value={co.user} onChange={(e) => { const user = users.find(u => u.nama === e.target.value); setCo({ ...co, user: e.target.value, bidang: user?.bidang || co.bidang }); }} /></label>
              <datalist id="checkout-users">{users.map(u => <option key={u.nama} value={u.nama} />)}</datalist>
              <label className="space-y-1 text-sm font-semibold"><span>Bidang</span><input className={inp} placeholder="Bidang pegawai" value={co.bidang} onChange={e => setCo({ ...co, bidang: e.target.value })} /></label>
              </>}
              <label className="space-y-1 text-sm font-semibold"><span>{tamu ? "Keperluan" : "Tujuan"}</span><input className={inp} placeholder={tamu ? "Keperluan bertamu" : "Tujuan / keperluan"} value={co.tujuan} onChange={(e) => setCo({ ...co, tujuan: e.target.value })} /></label>
              <label className="space-y-1 text-sm font-semibold"><span>Petugas Satpam</span><select className={inp} value={co.satpam} onChange={(e) => setCo({ ...co, satpam: e.target.value })}>{satpams.map((s) => <option key={s}>{s}</option>)}</select></label>
            </div>
            {!tamu && <>
            <div>
              <p className="mb-1 text-sm font-bold">🧭 Odometer saat berangkat (KM)</p>
              <div className="flex items-center gap-2"><input aria-label="Odometer saat berangkat (KM)" type="number" readOnly={!!kSel && kSel.odo !== null && editOdo === null} className={inp + " max-w-[200px] read-only:bg-muted"} value={co.odo} onChange={(e) => setCo({ ...co, odo: e.target.value })} />{kSel && kSel.odo !== null && (editOdo === null ? <Button type="button" size="sm" variant="outline" onClick={() => setEditOdo(co.odo)}><Pencil size={14} />Edit</Button> : <><Button type="button" size="sm" onClick={() => setEditOdo(null)}>Simpan</Button><Button type="button" size="sm" variant="outline" onClick={() => { setCo({ ...co, odo: editOdo }); setEditOdo(null); }}>Batal</Button></>)}</div>
              {scanNote("out")}{kSel && <p className="mt-1 text-xs text-muted-foreground">Odometer terakhir tercatat: {kSel.odo === null ? "Belum tersedia" : `${kSel.odo.toLocaleString("id-ID")} KM`}</p>}
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Foto odometer saat berangkat</p>
              <div className="max-w-md"><Foto label="Foto odometer" value={co.fotoOdo} onChange={(u) => setCo({ ...co, fotoOdo: u })} onFile={(f) => void runScan("out", f)} /></div>
            </div>
            </>}
            <div>
              <p className="mb-2 text-sm font-bold">Foto kendaraan</p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {["Depan", "Belakang"].map((l, i) => (
                  <Foto key={l} label={l} value={co.foto[i]} onChange={(u) => setCo({ ...co, foto: co.foto.map((f, j) => (j === i ? u : f)) })} />
                ))}
              </div>
            </div>
            <Button disabled={!coValid} onClick={submitOut}>{tamu ? "Kirim Data Check-In Tamu" : "Kirim Data Check-Out"}</Button>
          </Card>
        )}

        {menu === "Dalam Perjalanan" && (
          <div className="space-y-3">
            {aktif.length === 0 && <Card><p className="text-sm text-muted-foreground">Tidak ada kendaraan yang sedang dalam perjalanan.</p></Card>}
            {aktif.map((t) => (
              <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3 border-warning/50">
                <div>
                  <p className="font-bold">🚗 {t.nopol} · <span className="text-primary">{t.driver}</span></p>
                  <p className="text-sm">{t.tipe === "tamu" ? <>Kendaraan Tamu · Nama Tamu: {t.user || "—"} · Instansi: {t.bidang || "—"}</> : <>User: {t.user || "—"} · Bidang: {t.bidang || "—"}</>}</p>
                  <p className="text-sm text-muted-foreground">{t.tujuan} — keluar {fmtWaktu(t.outAt)}{t.tipe !== "tamu" && <> · odometer {t.odoOut.toLocaleString("id-ID")} KM</>}</p>
                </div>
                <button className={btn} onClick={() => { setTipe(t.tipe === "tamu" ? "tamu" : "dinas"); setCi({ ...ci, id: t.id, user: t.user ?? "", bidang: t.bidang ?? "" }); setMenu(t.tipe === "tamu" ? "Check-Out" : "Check-In"); }}>{t.tipe === "tamu" ? "Check-Out" : "Check-In"}</button>
              </Card>
            ))}
          </div>
        )}

        {((menu === "Check-In" && !tamu) || (menu === "Check-Out" && tamu)) && (
          <Card className="max-w-3xl space-y-5">
            <div role="group" aria-label="Tipe kendaraan" className="flex gap-2">{(["dinas", "tamu"] as const).map((v) => <Button key={v} type="button" variant={tipe === v ? "default" : "outline"} onClick={() => { setTipe(v); setCo({ ...co, nopol: "", driver: "", odo: "" }); setCi({ ...ci, id: 0 }); }}>{v === "dinas" ? "Kendaraan Dinas" : "Kendaraan Tamu"}</Button>)}</div>
            {tamu ? <Steps items={["Pilih kendaraan tamu", "Foto kondisi", "Kirim"]} active={!ci.id ? 0 : !ci.foto.every(Boolean) ? 1 : 2} /> : <Steps items={["Pilih perjalanan", "Odometer akhir", "Foto odometer", "Foto kondisi", "Kirim"]} active={!ci.id ? 0 : !ci.odo ? 1 : !ci.fotoOdo ? 2 : !ci.foto.every(Boolean) ? 3 : 4} />}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold"><span>{tamu ? "Kendaraan Tamu" : "Kendaraan"}</span><select className={inp} value={ci.id} onChange={(e) => { const trip = aktif.find(t => t.id === Number(e.target.value)); setCi({ ...ci, id: Number(e.target.value), user: trip?.user ?? "", bidang: trip?.bidang ?? "" }); }}>
                <option value={0}>{tamu ? "Pilih kendaraan tamu yang keluar…" : "Pilih kendaraan yang kembali…"}</option>
                {aktif.filter((t) => (t.tipe === "tamu") === tamu).map((t) => <option key={t.id} value={t.id}>{t.nopol} — {t.tipe === "tamu" ? `${t.user} (${t.bidang})` : t.driver}</option>)}
              </select></label>
              <label className="space-y-1 text-sm font-semibold"><span>Petugas Satpam</span><select className={inp} value={ci.satpam} onChange={(e) => setCi({ ...ci, satpam: e.target.value })}>{satpams.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label className="space-y-1 text-sm font-semibold"><span>{tamu ? "Nama Tamu" : "User"}</span><input className={inp} aria-label={tamu ? "Nama Tamu" : "User"} placeholder={tamu ? "Nama tamu" : "Nama pegawai yang membawa kendaraan"} value={ci.user} onChange={(e) => setCi({ ...ci, user: e.target.value })} /></label>
              <label className="space-y-1 text-sm font-semibold"><span>{tamu ? "Instansi" : "Bidang"}</span><input className={inp} aria-label={tamu ? "Instansi" : "Bidang"} placeholder={tamu ? "Instansi" : "Contoh: Bidang Umum"} value={ci.bidang} onChange={(e) => setCi({ ...ci, bidang: e.target.value })} /></label>
            </div>
            {!tamu && <>
            <div>
              <p className="mb-1 text-sm font-bold">🧭 Odometer akhir (KM)</p>
              <div className="flex items-center gap-2"><input aria-label="Odometer akhir (KM)" type="number" readOnly={scan?.which === "in" && scan.state === "ok" && !!ci.odo && !editOdoIn} className={inp + " max-w-[200px] read-only:bg-muted"} value={ci.odo} onChange={(e) => setCi({ ...ci, odo: e.target.value })} />{scan?.which === "in" && scan.state === "ok" && !!ci.odo && (editOdoIn ? <Button type="button" size="sm" onClick={() => setEditOdoIn(false)}>Simpan</Button> : <Button type="button" size="sm" variant="outline" onClick={() => setEditOdoIn(true)}><Pencil size={14} />Edit</Button>)}</div>{scanNote("in")}
              {tSel && <p className="mt-2 text-xs text-muted-foreground">Odometer saat berangkat: {tSel.odoOut.toLocaleString("id-ID")} KM</p>}
              {tSel && <p className="mt-1 text-xs text-muted-foreground">
                {Number(ci.odo) > tSel.odoOut && <>Jarak tempuh <b>{(Number(ci.odo) - tSel.odoOut).toLocaleString("id-ID")} KM</b></>}</p>}
            </div>
            <div>
              <p className="mb-2 text-sm font-bold">Foto odometer saat kembali</p>
              <div className="max-w-md"><Foto label="Foto odometer" value={ci.fotoOdo} onChange={(u) => setCi({ ...ci, fotoOdo: u })} onFile={(f) => void runScan("in", f)} /></div>
            </div>
            </>}
            <div>
              <p className="mb-2 text-sm font-bold">Foto kondisi kendaraan</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {["Kondisi 1", "Kondisi 2"].map((l, i) => (
                  <Foto key={l} label={l} value={ci.foto[i]} onChange={(u) => setCi({ ...ci, foto: ci.foto.map((f, j) => (j === i ? u : f)) })} />
                ))}
              </div>
            </div>
            <input className={inp} placeholder="Catatan kondisi" value={ci.kondisi} onChange={(e) => setCi({ ...ci, kondisi: e.target.value })} />
            <button className={btn} disabled={!ciValid} onClick={submitIn}>{tamu ? "Kirim Data Check-Out Tamu" : "Kirim Data Check-In"}</button>
          </Card>
        )}

        {menu === "Laporan" && (
          <Card className="overflow-x-auto">
            <div role="tablist" aria-label="Jenis laporan" className="mb-4 flex gap-2">{(["dinas", "tamu"] as const).map((v) => <Button key={v} role="tab" aria-selected={reportTab === v} variant={reportTab === v ? "default" : "outline"} onClick={() => setReportTab(v)}>{v === "dinas" ? "Kendaraan Dinas" : "Kendaraan Tamu"}</Button>)}</div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold">{reportTab === "tamu" ? "Log kunjungan kendaraan tamu" : "Log perjalanan kendaraan dinas (dihitung otomatis)"}</h3>
              <Button disabled={!reportBlob} onClick={() => { if (reportBlob) void deliverReport(reportBlob, `Laporan-Kendaraan-${reportTab === "tamu" ? "Tamu" : "Dinas"}-${new Date().toISOString().slice(0, 10)}.xlsx`).catch(() => flash("Unduhan gagal. Silakan coba lagi.")); }}><Download size={16} />{reportBlob ? "Download Laporan" : "Menyiapkan Excel…"}</Button>
            </div>
            {reportError && <p role="alert" className="mb-3 text-sm text-destructive">{reportError}</p>}
            {reportTab === "tamu" ? (
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground"><tr>
                <th className="py-2">Nomor Polisi</th><th>Nama Tamu</th><th>Instansi</th><th>Keperluan</th><th>Masuk</th><th>Keluar</th><th>Kondisi</th><th>Foto</th>
              </tr></thead>
              <tbody>{selesai.filter((t) => t.tipe === "tamu").map((t) => (
                <tr key={t.id} className="border-t align-top">
                  <td className="py-3 font-semibold">{t.nopol}</td><td>{t.user || "-"}</td><td>{t.bidang || "-"}</td><td>{t.tujuan}</td>
                  <td>{fmtWaktu(t.outAt)}<br /><span className="text-xs text-muted-foreground">{t.satpamOut}</span></td>
                  <td>{fmtWaktu(t.inAt)}<br /><span className="text-xs text-muted-foreground">{t.satpamIn}</span></td>
                  <td>{t.kondisi}</td>
                  <td><div className="flex gap-1">{[...t.fotoOut, ...(t.fotoIn ?? [])].filter(Boolean).map((f, i) => <img key={i} src={f} alt="Foto kendaraan tamu" className="h-8 w-8 rounded object-cover" />)}</div></td>
                </tr>
              ))}</tbody>
            </table>
            ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground"><tr>
                <th className="py-2">Kendaraan</th><th>Driver</th><th>User</th><th>Bidang</th><th>Keluar</th><th>Kembali</th><th className="text-right">Jarak</th><th className="text-right">Est. BBM</th><th>Kondisi</th><th>Foto</th>
              </tr></thead>
              <tbody>{selesai.filter((t) => t.tipe !== "tamu").map((t) => (
                <tr key={t.id} className="border-t align-top">
                  <td className="py-3 font-semibold">{t.nopol}</td><td>{t.driver}</td>
                  <td>{t.user ?? <span className="text-muted-foreground">-</span>}</td>
                  <td>{t.bidang ?? <span className="text-muted-foreground">-</span>}</td>
                  <td>{fmtWaktu(t.outAt)}<br /><span className="text-xs text-muted-foreground">{t.satpamOut}</span></td>
                  <td>{fmtWaktu(t.inAt)}<br /><span className="text-xs text-muted-foreground">{t.satpamIn}</span></td>
                  <td className="text-right font-semibold">{jarak(t).toLocaleString("id-ID")} KM</td>
                   <td className="text-right">{bbm(t) === null ? "Belum tersedia" : `${bbm(t)?.toFixed(1)} L`}</td>
                  <td>{t.kondisi}</td>
                  <td><div className="flex gap-1">{[...(t.fotoOdoOut ? [t.fotoOdoOut] : []), ...t.fotoOut, ...(t.fotoOdoIn ? [t.fotoOdoIn] : []), ...(t.fotoIn ?? [])].map((f, i) => <img key={i} src={f} alt="Foto odometer atau kendaraan" className="h-8 w-8 rounded object-cover" />)}
                    {t.fotoOut.length === 0 && <span className="text-xs text-muted-foreground">contoh</span>}</div></td>
                </tr>
              ))}</tbody>
            </table>
            )}
          </Card>
        )}


      </main>
    </div>
  );
}
