import { createFileRoute } from "@tanstack/react-router";
import { AdministrationPage } from "@/components/administration-page";

export const Route = createFileRoute("/e-overtime")({
  head: () => ({ meta: [
    { title: "e-Overtime — UPT Bandung" },
    { name: "description", content: "Pengajuan lembur pegawai UPT Bandung." },
    { property: "og:title", content: "e-Overtime — UPT Bandung" },
    { property: "og:description", content: "Daftar dan pengajuan lembur pegawai UPT Bandung." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <AdministrationPage kind="overtime" />,
});