import { createFileRoute } from "@tanstack/react-router";
import { AdministrationPage } from "@/components/administration-page";

export const Route = createFileRoute("/e-sppd")({
  head: () => ({ meta: [
    { title: "e-SPPD — UPT Bandung" },
    { name: "description", content: "Pengajuan Surat Perintah Perjalanan Dinas UPT Bandung." },
    { property: "og:title", content: "e-SPPD — UPT Bandung" },
    { property: "og:description", content: "Daftar dan pengajuan perjalanan dinas pegawai UPT Bandung." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <AdministrationPage kind="sppd" />,
});