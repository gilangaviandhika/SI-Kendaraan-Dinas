import { Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { ServiceNav } from "@/components/service-nav";

export function AdministrationPage({ kind }: { kind: "overtime" | "sppd" }) {
  const isOvertime = kind === "overtime";
  const title = isOvertime ? "e-Overtime" : "e-SPPD";
  return (
    <div className="min-h-screen font-sans md:flex">
      <aside className="bg-sidebar-bg p-5 text-primary-foreground md:min-h-screen md:w-64 md:shrink-0">
        <p className="text-xs uppercase tracking-widest text-accent">UPT Bandung</p>
        <h1 className="text-xl font-extrabold">GARDU BANDUNG</h1>
        <Link to="/" className="mt-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-primary-foreground/10"><ArrowLeft size={16} />Dashboard Kendaraan</Link>
        <ServiceNav active={kind} />
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8">
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{isOvertime ? "Pengajuan lembur pegawai" : "Surat Perintah Perjalanan Dinas"}</p>
        <div className="mt-8 flex flex-col items-center border-y py-16 text-muted-foreground">
          <ClipboardList className="mb-3 h-9 w-9" />
          <p className="text-sm">Halaman ini sedang dipersiapkan.</p>
        </div>
      </main>
    </div>
  );
}
