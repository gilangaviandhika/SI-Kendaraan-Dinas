import { Link } from "@tanstack/react-router";
import { Clock, FileText } from "lucide-react";

export function ServiceNav({ active }: { active?: "overtime" | "sppd" }) {
  const item = "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors";
  return (
    <div className="mt-4 flex gap-1 border-t border-primary-foreground/20 pt-4 md:flex-col">
      <Link to="/e-overtime" className={`${item} ${active === "overtime" ? "bg-accent text-accent-foreground" : "hover:bg-primary-foreground/10"}`}><Clock size={16} />e-Overtime</Link>
      <Link to="/e-sppd" className={`${item} ${active === "sppd" ? "bg-accent text-accent-foreground" : "hover:bg-primary-foreground/10"}`}><FileText size={16} />e-SPPD</Link>
    </div>
  );
}