import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function isValidLogin(user: string, pass: string) {
  return user.trim() === "admin" && pass === "admin";
}

export function LoginGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  if (ok) return <>{children}</>;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (isValidLogin(user, pass)) setOk(true);
    else setErr("Username atau password salah");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">SI Kendaraan Dinas UPT Bandung</h1>
          <p className="text-sm text-muted-foreground">Monitoring Kendaraan Dinas</p>
        </div>
        <label className="block text-sm font-medium text-foreground">Username
          <input aria-label="Username" name="username" autoComplete="username" required value={user} onChange={e => { setUser(e.target.value); setErr(""); }} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-foreground">Password
          <input aria-label="Password" name="password" autoComplete="current-password" required type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(""); }} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
        </label>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full font-semibold">Masuk</Button>
      </form>
    </div>
  );
}
