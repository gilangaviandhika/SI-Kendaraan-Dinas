import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
export const Route = createFileRoute("/master/driver")({
  head: () => ({ meta: [{ title: "Master Driver — UPT Bandung" }, { name: "description", content: "Daftar driver dan kesiapan penugasan UPT Bandung." }, { property: "og:title", content: "Master Driver — UPT Bandung" }, { property: "og:description", content: "Data driver kendaraan dinas UPT Bandung." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <MasterPage key="driver" kind="driver" />,
});