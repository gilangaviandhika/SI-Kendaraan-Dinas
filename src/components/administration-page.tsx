import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, ClipboardList, X, Download, LoaderCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceNav } from "@/components/service-nav";
import { useFleet } from "@/components/fleet-provider";
import { createAdministrationReport, filterRequests, type RequestRow } from "@/lib/administration-export";
import { deliverReport } from "@/lib/report-export";

const emptyForm = { nama: "", user: "", bidang: "", tanggal: "", akhir: "", mulai: "", sampai: "", tujuan: "", keperluan: "" };
const inputClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm";

export function AdministrationPage({ kind }: { kind: "overtime" | "sppd" }) {
  const isOvertime = kind === "overtime";
  const title = isOvertime ? "e-Overtime" : "e-SPPD";
  const { users } = useFleet();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [report, setReport] = useState<{ blob: Blob; rows: RequestRow[] } | null>(null);
  const [exportError, setExportError] = useState("");
  const invalidRange = Boolean(start && end && start > end);
  const filteredRows = useMemo(() => filterRequests(rows, start, end), [rows, start, end]);
  useEffect(() => {
    let active = true;
    setReport(null);
    setExportError("");
    if (filteredRows.length) {
      createAdministrationReport(filteredRows, kind).then(blob => {
        if (active) setReport({ blob, rows: filteredRows });
      }).catch(() => { if (active) setExportError("Laporan gagal disiapkan. Coba ubah tanggal atau reset filter."); });
    }
    return () => { active = false; };
  }, [filteredRows, kind]);
  const reportReady = report?.rows === filteredRows;
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
                <label className="space-y-1 text-sm font-semibold"><span>User</span><input required className={inputClass} list="administration-users" value={form.user} onChange={e => { const user = users.find(u => u.nama === e.target.value); setForm({ ...form, user: e.target.value, bidang: user?.bidang || form.bidang }); }} /></label>
                <datalist id="administration-users">{users.map(u => <option key={u.nama} value={u.nama} />)}</datalist>
                {field("Bidang", "bidang")}
                {field(isOvertime ? "Tanggal lembur" : "Tanggal berangkat", "tanggal", "date")}
                {isOvertime ? <>{field("Jam mulai", "mulai", "time")}{field("Jam selesai", "sampai", "time")}</> : <>{field("Tanggal kembali", "akhir", "date", form.tanggal)}{field("Tujuan perjalanan", "tujuan")}</>}
                <label className="space-y-1 text-sm font-semibold sm:col-span-2"><span>{isOvertime ? "Uraian pekerjaan" : "Keperluan dinas"}</span><textarea required className={inputClass} rows={3} value={form.keperluan} onChange={(e) => setForm({ ...form, keperluan: e.target.value })} /></label>
              </div>
              <div className="mt-4 flex gap-2"><Button type="submit">Kirim Pengajuan</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button></div>
            </form>
          </section>
        )}
        <h3 className="mb-3 font-bold">Daftar Pengajuan</h3>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="space-y-1 text-sm font-semibold"><span className="block">{isOvertime ? "Tanggal lembur — dari" : "Tanggal berangkat — dari"}</span><input aria-label="Tanggal awal laporan" type="date" className={inputClass} value={start} onChange={e => setStart(e.target.value)} /></label>
          <label className="space-y-1 text-sm font-semibold"><span className="block">Sampai tanggal</span><input aria-label="Tanggal akhir laporan" type="date" min={start || undefined} className={inputClass} value={end} onChange={e => setEnd(e.target.value)} /></label>
          <Button variant="outline" size="icon" aria-label="Reset filter tanggal" title="Reset filter tanggal" disabled={!start && !end} onClick={() => { setStart(""); setEnd(""); }}><RotateCcw /></Button>
          <Button disabled={!reportReady || invalidRange || !filteredRows.length} onClick={() => {
            if (!report || !reportReady) return;
            const range = start || end ? `${start || "awal"}_sampai_${end || "akhir"}` : "Semua-Tanggal";
            void deliverReport(report.blob, `Laporan-${title}-${range}.xlsx`).catch(() => setExportError("Unduhan gagal. Silakan coba lagi."));
          }}>{filteredRows.length > 0 && !reportReady && !exportError ? <LoaderCircle className="animate-spin" /> : <Download />}Download Laporan</Button>
          <span className="pb-2 text-sm text-muted-foreground">{filteredRows.length} pengajuan</span>
        </div>
        {invalidRange && <p role="alert" className="mb-3 text-sm text-destructive">Tanggal akhir tidak boleh sebelum tanggal awal.</p>}
        {exportError && <p role="alert" className="mb-3 text-sm text-destructive">{exportError}</p>}
        {filteredRows.length === 0 ? <div className="flex flex-col items-center border-y py-16 text-muted-foreground"><ClipboardList className="mb-3 h-9 w-9" /><p className="text-sm">{rows.length ? "Tidak ada pengajuan pada rentang tanggal ini." : isOvertime ? "Belum ada pengajuan lembur." : "Belum ada pengajuan SPPD."}</p></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="text-muted-foreground"><tr><th className="py-3">Pegawai</th><th>User</th><th>Bidang</th><th>Tanggal</th><th>{isOvertime ? "Waktu" : "Tujuan"}</th><th>Keperluan</th><th>Status</th></tr></thead><tbody>{filteredRows.map((row) => <tr key={row.id} className="border-t align-top"><td className="py-4 font-semibold">{row.nama}</td><td className="max-w-48 break-words py-4">{row.user}</td><td className="max-w-48 break-words py-4">{row.bidang}</td><td className="py-4">{row.tanggal}{!isOvertime && <> — {row.akhir}</>}</td><td className="py-4">{isOvertime ? `${row.mulai}–${row.sampai}` : row.tujuan}</td><td className="max-w-64 break-words py-4">{row.keperluan}</td><td className="py-4"><span className="rounded-md bg-warning/20 px-2 py-1 text-xs font-semibold">Menunggu</span></td></tr>)}</tbody></table></div>
        )}
      </main>
    </div>
  );
}