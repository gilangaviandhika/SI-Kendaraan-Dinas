import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/master-page";
export const Route = createFileRoute("/master/user")({
  head: () => ({ meta: [{ title: "Master User — UPT Bandung" }, { name: "description", content: "Daftar user dan bidang pengguna kendaraan dinas UPT Bandung." }, { property: "og:title", content: "Master User — UPT Bandung" }, { property: "og:description", content: "Data user dan bidang pengguna kendaraan UPT Bandung." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <MasterPage key="user" kind="user" />,
});