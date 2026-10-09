import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SI Kendaraan Dinas — UPT Bandung" },
      { name: "description", content: "Kelola kendaraan dinas, peminjaman, servis, BBM, dan laporan UPT Bandung." },
      { property: "og:title", content: "SI Kendaraan Dinas — UPT Bandung" },
      { property: "og:description", content: "Kelola kendaraan dinas, peminjaman, servis, BBM, dan laporan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type Role = "Admin" | "Atasan" | "Pegawai";
const menus = ["Dashboard", "Kendaraan", "Peminjaman", "Servis & BBM", "Laporan"] as const;
type Menu = (typeof menus)[number];

const kendaraan = [
  { nopol: "D 1234 ABC", merk: "Toyota Innova", tahun: 2021, status: "Tersedia", pajak: "12 Mar 2027" },
  { nopol: "D 5678 XYZ", merk: "Mitsubishi Pajero", tahun: 2019, status: "Dipinjam", pajak: "02 Nov 2026" },
  { nopol: "D 9012 KLM", merk: "Honda Vario", tahun: 2022, status: "Servis", pajak: "20 Jan 2027" },
  { nopol: "D 3456 PQR", merk: "Toyota Avanza", tahun: 2020, status: "Tersedia", pajak: "15 Okt 2026" },
];
const pinjam0 = [
  { id: 1, nama: "Rina Suryani", nopol: "D 5678 XYZ", tujuan: "Rapat di Kantor Provinsi", tgl: "06 Okt 2026", status: "Disetujui" },
  { id: 2, nama: "Agus Pratama", nopol: "D 1234 ABC", tujuan: "Monitoring lapangan Lembang", tgl: "07 Okt 2026", status: "Menunggu" },
  { id: 3, nama: "Dewi Lestari", nopol: "D 3456 PQR", tujuan: "Antar dokumen ke Cimahi", tgl: "08 Okt 2026", status: "Menunggu" },
];
const servis = [
  { tgl: "28 Sep 2026", nopol: "D 9012 KLM", jenis: "Servis rutin + ganti oli", biaya: 450000 },
  { tgl: "25 Sep 2026", nopol: "D 1234 ABC", jenis: "BBM Pertamax 40 L", biaya: 520000 },
  { tgl: "20 Sep 2026", nopol: "D 5678 XYZ", jenis: "Ganti ban depan", biaya: 1800000 },
];
const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function Badge({ s }: { s: string }) {
  const c =
    s === "Tersedia" || s === "Disetujui" ? "bg-success/15 text-success"
    : s === "Ditolak" ? "bg-destructive/15 text-destructive"
    : "bg-warning/20 text-foreground";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c}`}>{s}</span>;
}
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border bg-card p-5 shadow-sm ${className}`}>{children}</div>
);

function App() {
  const [menu, setMenu] = useState<Menu>("Dashboard");
  const [role, setRole] = useState<Role>("Admin");
  const [pinjam, setPinjam] = useState(pinjam0);
  const [form, setForm] = useState<null | { nama: string; nopol: string; tujuan: string; tgl: string }>(null);
  const submit = () => {
    if (!form || !form.nama || !form.tujuan || !form.tgl) return;
    setPinjam((p) => [{ id: Date.now(), ...form, status: "Menunggu" }, ...p]);
    setForm(null);
  };
  const setStatus = (id: number, status: string) => setPinjam((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));

  return (
    <div className="min-h-screen font-sans md:flex">
      <aside className="bg-sidebar-bg text-primary-foreground md:min-h-screen md:w-64 p-5">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-accent">UPT Bandung</p>
          <h1 className="text-xl font-extrabold">SI Kendaraan Dinas</h1>
        </div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {menus.map((m) => (
            <button key={m} onClick={() => setMenu(m)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold ${menu === m ? "bg-accent text-accent-foreground" : "hover:bg-primary-foreground/10"}`}>
              {m}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-5 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-foreground">{menu}</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Lihat sebagai:</span>
            {(["Admin", "Atasan", "Pegawai"] as Role[]).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`rounded-full border px-3 py-1 font-semibold ${role === r ? "bg-primary text-primary-foreground" : "bg-card"}`}>{r}</button>
            ))}
          </div>
        </div>

        {menu === "Dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { l: "Total Kendaraan Dinas", v: kendaraan.length, c: "text-primary" },
                { l: "Total Kendaraan Digunakan", v: kendaraan.filter((k) => k.status === "Dipinjam").length, c: "text-warning" },
                { l: "Total Kendaraan Tersedia", v: kendaraan.filter((k) => k.status === "Tersedia").length, c: "text-success" },
              ].map((s) => (
                <Card key={s.l}>
                  <p className="text-sm text-muted-foreground">{s.l}</p>
                  <p className={`mt-1 text-3xl font-extrabold ${s.c}`}>{s.v}</p>
                </Card>
              ))}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Pengajuan Peminjaman</h3>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { l: "Total Pengajuan", v: pinjam.length, c: "text-primary" },
                  { l: "Menunggu", v: pinjam.filter((p) => p.status === "Menunggu").length, c: "text-warning" },
                  { l: "Disetujui", v: pinjam.filter((p) => p.status === "Disetujui").length, c: "text-success" },
                  { l: "Ditolak", v: pinjam.filter((p) => p.status === "Ditolak").length, c: "text-destructive" },
                ].map((s) => (
                  <Card key={s.l}>
                    <p className="text-sm text-muted-foreground">{s.l}</p>
                    <p className={`mt-1 text-3xl font-extrabold ${s.c}`}>{s.v}</p>
                  </Card>
                ))}
              </div>
            </div>
            <Card>
              <h3 className="mb-3 font-bold">Pengingat pajak / STNK</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>D 3456 PQR — Toyota Avanza</span><span className="font-semibold text-destructive">15 Okt 2026</span></li>
                <li className="flex justify-between"><span>D 5678 XYZ — Mitsubishi Pajero</span><span className="font-semibold text-foreground">02 Nov 2026</span></li>
              </ul>
            </Card>
          </div>
        )}

        {menu === "Kendaraan" && (
          <Card className="overflow-x-auto">
            {role === "Admin" && <button className="mb-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">+ Tambah Kendaraan</button>}
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground"><tr><th className="py-2">No. Polisi</th><th>Merk</th><th>Tahun</th><th>Pajak</th><th>Status</th></tr></thead>
              <tbody>{kendaraan.map((k) => (
                <tr key={k.nopol} className="border-t"><td className="py-3 font-semibold">{k.nopol}</td><td>{k.merk}</td><td>{k.tahun}</td><td>{k.pajak}</td><td><Badge s={k.status} /></td></tr>
              ))}</tbody>
            </table>
          </Card>
        )}

        {menu === "Peminjaman" && (
          <div className="space-y-4">
            {role === "Pegawai" && !form && <button onClick={() => setForm({ nama: "", nopol: kendaraan[0]?.nopol ?? "", tujuan: "", tgl: "" })} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">+ Ajukan Peminjaman</button>}
            {role === "Pegawai" && form && (
              <Card className="space-y-3">
                <h3 className="font-bold">Form Pengajuan Peminjaman</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input placeholder="Nama pegawai" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm" />
                  <select value={form.nopol} onChange={(e) => setForm({ ...form, nopol: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm">
                    {kendaraan.filter((k) => k.status === "Tersedia").map((k) => <option key={k.nopol} value={k.nopol}>{k.nopol} — {k.merk}</option>)}
                  </select>
                  <input placeholder="Tujuan / keperluan" value={form.tujuan} onChange={(e) => setForm({ ...form, tujuan: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm" />
                  <input type="date" value={form.tgl} onChange={(e) => setForm({ ...form, tgl: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={submit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Kirim Pengajuan</button>
                  <button onClick={() => setForm(null)} className="rounded-lg border px-4 py-2 text-sm font-semibold">Batal</button>
                </div>
              </Card>
            )}
            {pinjam.map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{p.nama} · <span className="text-primary">{p.nopol}</span></p>
                  <p className="text-sm text-muted-foreground">{p.tujuan} — {p.tgl}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge s={p.status} />
                  {role === "Atasan" && p.status === "Menunggu" && (<>
                    <button onClick={() => setStatus(p.id, "Disetujui")} className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-primary-foreground">Setujui</button>
                    <button onClick={() => setStatus(p.id, "Ditolak")} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Tolak</button>
                  </>)}
                </div>
              </Card>
            ))}
          </div>
        )}

        {menu === "Servis & BBM" && (
          <Card className="overflow-x-auto">
            <button className="mb-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">+ Catat Servis / BBM</button>
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground"><tr><th className="py-2">Tanggal</th><th>No. Polisi</th><th>Keterangan</th><th className="text-right">Biaya</th></tr></thead>
              <tbody>{servis.map((s, i) => (
                <tr key={i} className="border-t"><td className="py-3">{s.tgl}</td><td className="font-semibold">{s.nopol}</td><td>{s.jenis}</td><td className="text-right">{rp(s.biaya)}</td></tr>
              ))}</tbody>
            </table>
          </Card>
        )}

        {menu === "Laporan" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="mb-4 font-bold">Biaya per kendaraan (Sep 2026)</h3>
              {[["D 5678 XYZ", 1800000], ["D 1234 ABC", 520000], ["D 9012 KLM", 450000]].map(([n, v]) => (
                <div key={n as string} className="mb-3">
                  <div className="flex justify-between text-sm"><span>{n}</span><span className="font-semibold">{rp(v as number)}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${((v as number) / 1800000) * 100}%` }} /></div>
                </div>
              ))}
            </Card>
            <Card>
              <h3 className="mb-4 font-bold">Rekap penggunaan</h3>
              <p className="text-sm text-muted-foreground">Total peminjaman bulan ini</p>
              <p className="text-3xl font-extrabold text-primary">18 kali</p>
              <button className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold">Unduh PDF</button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
