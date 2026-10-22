import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
export const Route = createFileRoute("/master/area-kerja")({
  head: () => ({ meta: [{ title: "Master Area Kerja — UPT Bandung" }, { name: "description", content: "Daftar area kerja kendaraan dinas UPT Bandung." }, { property: "og:title", content: "Master Area Kerja — UPT Bandung" }, { property: "og:description", content: "Data area kerja dan alokasi kendaraan UPT Bandung." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <MasterPage key="area-kerja" kind="area-kerja" />,
});