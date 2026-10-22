import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
export const Route = createFileRoute("/master/kendaraan")({
  head: () => ({ meta: [{ title: "Master Kendaraan — UPT Bandung" }, { name: "description", content: "Daftar kendaraan dinas dan penugasan UPT Bandung." }, { property: "og:title", content: "Master Kendaraan — UPT Bandung" }, { property: "og:description", content: "Data kendaraan dinas dan penugasan UPT Bandung." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <MasterPage key="kendaraan" kind="kendaraan" />,
});