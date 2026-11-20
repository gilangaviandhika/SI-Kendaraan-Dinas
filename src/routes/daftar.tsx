import { createFileRoute, Navigate } from "@tanstack/react-router";

// Formulir pendaftaran ditampilkan oleh AuthGate saat belum masuk;
// bila sudah masuk, halaman ini mengembalikan pengguna ke Dashboard.
export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [
      { title: "Daftar Akun — GARDU BANDUNG" },
      { name: "description", content: "Pendaftaran akun baru GARDU BANDUNG; akun aktif setelah disetujui Admin." },
      { property: "og:title", content: "Daftar Akun — GARDU BANDUNG" },
      { property: "og:description", content: "Pendaftaran akun baru GARDU BANDUNG; akun aktif setelah disetujui Admin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <Navigate to="/" />,
});
