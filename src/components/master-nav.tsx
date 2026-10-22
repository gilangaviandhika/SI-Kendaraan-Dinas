import { Link } from "@tanstack/react-router";
import { Car, Users, MapPin, UserRound } from "lucide-react";

export function MasterNav() {
  const cls = "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-primary-foreground/10";
  const activeProps = { className: "bg-accent text-accent-foreground" };
  return <nav aria-label="Data Master" className="mt-4 border-t border-primary-foreground/20 pt-4">
    <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest opacity-70">Data Master</p>
    <div className="grid grid-cols-2 gap-1 md:grid-cols-1">
      <Link to="/master/kendaraan" className={cls} activeProps={activeProps}><Car size={16} />Kendaraan</Link>
      <Link to="/master/driver" className={cls} activeProps={activeProps}><Users size={16} />Driver</Link>
      <Link to="/master/area-kerja" className={cls} activeProps={activeProps}><MapPin size={16} />Area Kerja</Link>
      <Link to="/master/user" className={cls} activeProps={activeProps}><UserRound size={16} />User</Link>
    </div>
  </nav>;
}