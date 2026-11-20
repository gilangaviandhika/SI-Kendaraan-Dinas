import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFleet } from "@/components/fleet-provider";
import { canAccessPath } from "@/lib/access";
import { dbRegister } from "@/lib/fleet-db.functions";
import logo from "@/assets/gardu-bandung-logo.jpg.asset.json";

const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm";

function LoginForm() {
  const { login } = useFleet();
  const [busy, setBusy] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  return (
    <form className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm" onSubmit={(e) => { e.preventDefault(); setBusy(true); setErr(""); login(u, p).then((r) => { if (r !== true) setErr(r); }).catch(() => setErr("Tidak dapat terhubung ke database. Coba lagi.")).finally(() => setBusy(false)); }}>
      <div className="text-center"><img src={logo.url} alt="Logo GARDU BANDUNG" width={160} height={160} className="mx-auto h-40 w-40 rounded-3xl shadow-md" /><h1 className="sr-only">GARDU BANDUNG</h1><p className="mt-3 text-sm text-muted-foreground">Masuk untuk melanjutkan</p></div>
      <label className="block space-y-1 text-sm font-semibold"><span>Username</span><input aria-label="Username" className={inp} required value={u} onChange={(e) => setU(e.target.value)} /></label>
      <label className="block space-y-1 text-sm font-semibold"><span>Password</span><input aria-label="Password" type="password" className={inp} required value={p} onChange={(e) => setP(e.target.value)} /></label>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Memeriksa…" : "Masuk"}</Button>
      <p className="text-center text-sm text-muted-foreground">Belum punya akun? <Link to="/daftar" className="font-semibold text-primary underline">Daftar di sini</Link></p>
      <p className="text-xs text-muted-foreground">Akun contoh: admin / admin (Admin) · security / security (Security)</p>
    </form>
  );
}

function RegisterForm() {
  const [busy, setBusy] = useState(false);
  const [nama, setNama] = useState("");
  const [bidang, setBidang] = useState("");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  if (done) return (
    <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 text-center shadow-sm">
      <img src={logo.url} alt="Logo GARDU BANDUNG" width={120} height={120} className="mx-auto h-28 w-28 rounded-3xl shadow-md" />
      <h1 className="text-lg font-bold">Pendaftaran terkirim</h1>
      <p className="text-sm text-muted-foreground">Akun Anda menunggu persetujuan Admin. Setelah disetujui, Anda bisa masuk dengan username dan password yang didaftarkan.</p>
      <Link to="/" className="inline-block font-semibold text-primary underline">Kembali ke halaman masuk</Link>
    </div>
  );
  return (
    <form className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm" onSubmit={(e) => {
      e.preventDefault(); setErr("");
      if (p !== p2) { setErr("Konfirmasi password tidak sama."); return; }
      setBusy(true);
      dbRegister({ data: { nama, bidang, username: u, password: p } })
        .then((r) => { if (r.ok) setDone(true); else setErr(r.pesan ?? "Pendaftaran gagal, coba lagi."); })
        .catch(() => setErr("Tidak dapat terhubung ke database. Coba lagi."))
        .finally(() => setBusy(false));
    }}>
      <div className="text-center"><img src={logo.url} alt="Logo GARDU BANDUNG" width={120} height={120} className="mx-auto h-28 w-28 rounded-3xl shadow-md" /><h1 className="mt-3 text-lg font-bold">Daftar Akun Baru</h1><p className="mt-1 text-sm text-muted-foreground">Akun aktif setelah disetujui Admin</p></div>
      <label className="block space-y-1 text-sm font-semibold"><span>Nama Lengkap</span><input aria-label="Nama Lengkap" className={inp} required value={nama} onChange={(e) => setNama(e.target.value)} /></label>
      <label className="block space-y-1 text-sm font-semibold"><span>Bidang (opsional)</span><input aria-label="Bidang" className={inp} value={bidang} onChange={(e) => setBidang(e.target.value)} /></label>
      <label className="block space-y-1 text-sm font-semibold"><span>Username</span><input aria-label="Username" className={inp} required value={u} onChange={(e) => setU(e.target.value)} /></label>
      <label className="block space-y-1 text-sm font-semibold"><span>Password</span><input aria-label="Password" type="password" className={inp} required minLength={6} value={p} onChange={(e) => setP(e.target.value)} /></label>
      <label className="block space-y-1 text-sm font-semibold"><span>Konfirmasi Password</span><input aria-label="Konfirmasi Password" type="password" className={inp} required minLength={6} value={p2} onChange={(e) => setP2(e.target.value)} /></label>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Mengirim…" : "Daftar"}</Button>
      <p className="text-center text-sm text-muted-foreground">Sudah punya akun? <Link to="/" className="font-semibold text-primary underline">Masuk</Link></p>
    </form>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { currentUser, sessionReady, syncError } = useFleet();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (!sessionReady) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground" role="status">Memulihkan sesi masuk…</div>;
  if (!currentUser) return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
      {path === "/daftar" ? <RegisterForm /> : <LoginForm />}
    </div>
  );
  if (!canAccessPath(currentUser.role, path)) return (
    <div className="flex min-h-screen items-center justify-center px-4 font-sans"><div className="text-center"><h1 className="text-xl font-bold">Akses ditolak</h1><p className="mt-2 text-sm text-muted-foreground">Role Security tidak dapat membuka halaman ini.</p><Link to="/" className="mt-4 inline-block font-semibold text-primary underline">Kembali ke Dashboard</Link></div></div>
  );
  return <>{syncError && <p role="alert" className="fixed inset-x-0 top-0 z-50 bg-destructive px-4 py-2 text-center text-sm text-destructive-foreground">{syncError} Perubahan terakhir belum tersimpan.</p>}{children}</>;
}
export function UserBadge() {
  const { currentUser, logout } = useFleet();
  if (!currentUser) return null;
  return <div className="mt-4 border-t border-primary-foreground/20 pt-4 text-sm"><p className="font-semibold">{currentUser.nama}</p><p className="text-xs opacity-70">Role: {currentUser.role}</p><Button variant="ghost" size="sm" className="mt-2 px-3 hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={logout}><LogOut size={16} />Keluar</Button></div>;
}
