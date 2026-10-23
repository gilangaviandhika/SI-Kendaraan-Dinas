import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
export const Route = createFileRoute("/master/area-kerja")({
  head: () => ({ meta: [{ title: "Master Wilayah Kerja — UPT Bandung" }, { name: "description", content: "Daftar wilayah kerja kendaraan dinas UPT Bandung." }, { property: "og:title", content: "Master Wilayah Kerja — UPT Bandung" }, { property: "og:description", content: "Data wilayah kerja dan alokasi kendaraan UPT Bandung." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <MasterPage key="area-kerja" kind="area-kerja" />,
});