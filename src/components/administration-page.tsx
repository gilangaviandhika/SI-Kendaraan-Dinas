import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, ClipboardList, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceNav } from "@/components/service-nav";

type RequestRow = { id: number; nama: string; tanggal: string; akhir: string; mulai: string; sampai: string; tujuan: string; keperluan: string };
const emptyForm = { nama: "", tanggal: "", akhir: "", mulai: "", sampai: "", tujuan: "", keperluan: "" };
const inputClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm";

export function AdministrationPage({ kind }: { kind: "overtime" | "sppd" }) {
  const isOvertime = kind === "overtime";
  const title = isOvertime ? "e-Overtime" : "e-SPPD";
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const field = (label: string, key: keyof typeof emptyForm, type = "text", min?: string) => (
    <label className="space-y-1 text-sm font-semibold"><span>{label}</span><input required type={type} min={min} className={inputClass} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>
  );
  return (
    <div className="min-h-screen font-sans md:flex">
      <aside className="bg-sidebar-bg p-5 text-primary-foreground md:min-h-screen md:w-64 md:shrink-0">
        <p className="text-xs uppercase tracking-widest text-accent">UPT Bandung</p>
        <h1 className="text-xl font-extrabold">SI Kendaraan Dinas</h1>
        <Link to="/" className="mt-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-primary-foreground/10"><ArrowLeft size={16} />Dashboard Kendaraan</Link>
        <ServiceNav active={kind} />
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-2xl font-extrabold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{isOvertime ? "Pengajuan lembur pegawai" : "Surat Perintah Perjalanan Dinas"}</p></div>
          <Button onClick={() => { setOpen(true); setMessage(""); }}><Plus />{isOvertime ? "Ajukan Lembur" : "Ajukan SPPD"}</Button>
        </div>
        {message && <p role="status" className="mb-4 rounded-lg bg-success/15 p-3 text-sm text-success">{message}</p>}
        {open && (
          <section className="mb-8 max-w-3xl border-b pb-6">
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">{isOvertime ? "Pengajuan Lembur Baru" : "Pengajuan SPPD Baru"}</h3><Button variant="ghost" size="icon" aria-label="Tutup formulir" onClick={() => setOpen(false)}><X /></Button></div>
            <form onSubmit={(e) => { e.preventDefault(); setRows((old) => [{ ...form, id: Date.now() }, ...old]); setForm(emptyForm); setOpen(false); setMessage("Pengajuan tercatat dalam mockup ini."); }}>
              <div className="grid gap-4 sm:grid-cols-2">
                {field("Nama pegawai", "nama")}
                {field(isOvertime ? "Tanggal lembur" : "Tanggal berangkat", "tanggal", "date")}
                {isOvertime ? <>{field("Jam mulai", "mulai", "time")}{field("Jam selesai", "sampai", "time")}</> : <>{field("Tanggal kembali", "akhir", "date", form.tanggal)}{field("Tujuan perjalanan", "tujuan")}</>}
                <label className="space-y-1 text-sm font-semibold sm:col-span-2"><span>{isOvertime ? "Uraian pekerjaan" : "Keperluan dinas"}</span><textarea required className={inputClass} rows={3} value={form.keperluan} onChange={(e) => setForm({ ...form, keperluan: e.target.value })} /></label>
              </div>
              <div className="mt-4 flex gap-2"><Button type="submit">Kirim Pengajuan</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button></div>
            </form>
          </section>
        )}
        <h3 className="mb-3 font-bold">Daftar Pengajuan</h3>
        {rows.length === 0 ? <div className="flex flex-col items-center border-y py-16 text-muted-foreground"><ClipboardList className="mb-3 h-9 w-9" /><p className="text-sm">{isOvertime ? "Belum ada pengajuan lembur." : "Belum ada pengajuan SPPD."}</p></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-muted-foreground"><tr><th className="py-3">Pegawai</th><th>Tanggal</th><th>{isOvertime ? "Waktu" : "Tujuan"}</th><th>Keperluan</th><th>Status</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t align-top"><td className="py-4 font-semibold">{row.nama}</td><td className="py-4">{row.tanggal}{!isOvertime && <> — {row.akhir}</>}</td><td className="py-4">{isOvertime ? `${row.mulai}–${row.sampai}` : row.tujuan}</td><td className="max-w-64 break-words py-4">{row.keperluan}</td><td className="py-4"><span className="rounded-md bg-warning/20 px-2 py-1 text-xs font-semibold">Menunggu</span></td></tr>)}</tbody></table></div>
        )}
      </main>
    </div>
  );
}