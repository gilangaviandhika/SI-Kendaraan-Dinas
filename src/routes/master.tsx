import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MasterNav } from "@/components/master-nav";
import { ServiceNav } from "@/components/service-nav";

export const Route = createFileRoute("/master")({ component: MasterLayout });
function MasterLayout() {
  return <div className="min-h-screen font-sans md:flex"><aside className="bg-sidebar-bg p-5 text-primary-foreground md:min-h-screen md:w-64 md:shrink-0"><p className="text-xs uppercase tracking-widest text-accent">UPT Bandung</p><h1 className="text-xl font-extrabold">SI Kendaraan Dinas</h1><Link to="/" className="mt-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-primary-foreground/10"><ArrowLeft size={16} />Dashboard Kendaraan</Link><MasterNav /><ServiceNav /></aside><main className="min-w-0 flex-1 p-5 md:p-8"><Outlet /></main></div>;
}