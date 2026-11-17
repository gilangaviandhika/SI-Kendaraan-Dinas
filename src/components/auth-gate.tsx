import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFleet } from "@/components/fleet-provider";
import { canAccessPath } from "@/lib/access";
import logo from "@/assets/gardu-bandung-logo.jpg.asset.json";

const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm";
export function AuthGate({ children }: { children: ReactNode }) {
  const { currentUser, sessionReady, login, syncError } = useFleet();
  const [busy, setBusy] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  if (!sessionReady) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground" role="status">Memulihkan sesi masuk…</div>;
  if (!currentUser) return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
      <form className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm" onSubmit={(e) => { e.preventDefault(); setBusy(true); setErr(""); login(u, p).then((ok) => { if (!ok) setErr("Username atau password salah."); }).catch(() => setErr("Tidak dapat terhubung ke database. Coba lagi.")).finally(() => setBusy(false)); }}>
        <div className="text-center"><img src={logo.url} alt="Logo GARDU BANDUNG" width={160} height={160} className="mx-auto h-40 w-40 rounded-3xl shadow-md" /><h1 className="sr-only">GARDU BANDUNG</h1><p className="mt-3 text-sm text-muted-foreground">Masuk untuk melanjutkan</p></div>
        <label className="block space-y-1 text-sm font-semibold"><span>Username</span><input aria-label="Username" className={inp} required value={u} onChange={(e) => setU(e.target.value)} /></label>
        <label className="block space-y-1 text-sm font-semibold"><span>Password</span><input aria-label="Password" type="password" className={inp} required value={p} onChange={(e) => setP(e.target.value)} /></label>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Memeriksa…" : "Masuk"}</Button>
        <p className="text-xs text-muted-foreground">Akun contoh: admin / admin (Admin) · security / security (Security)</p>
      </form>
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
