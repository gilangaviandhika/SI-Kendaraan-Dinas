import { createFileRoute, Link } from "@tanstack/react-router";
import { useFleet } from "@/components/fleet-provider";

export const Route = createFileRoute("/foto/$id")({
  head: () => ({ meta: [
    { title: "Foto Perjalanan — GARDU BANDUNG" },
    { name: "description", content: "Dokumentasi foto odometer dan kondisi kendaraan per perjalanan." },
    { property: "og:title", content: "Foto Perjalanan — GARDU BANDUNG" },
    { property: "og:description", content: "Lihat dan unduh foto perjalanan kendaraan UPT Bandung." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: FotoPage,
});

function FotoPage() {
  const { id } = Route.useParams();
  const { trips } = useFleet();
  const t = trips.find((x) => String(x.id) === id);
  const tamu = t?.tipe === "tamu";
  const list: [string, string | undefined][] = t ? [
    ...(tamu ? [] : [["Odometer Berangkat", t.fotoOdoOut] as [string, string | undefined]]),
    ...t.fotoOut.map((f, i) => [`${tamu ? "Kondisi Masuk" : "Kondisi Berangkat"} ${i + 1}`, f] as [string, string]),
    ...(tamu ? [] : [["Odometer Kembali", t.fotoOdoIn] as [string, string | undefined]]),
    ...(t.fotoIn ?? []).map((f, i) => [`${tamu ? "Kondisi Keluar" : "Kondisi Kembali"} ${i + 1}`, f] as [string, string]),
  ].filter((x) => !!x[1]) : [];
  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <Link to="/" className="text-sm font-semibold text-primary">← Kembali ke GARDU BANDUNG</Link>
      {!t ? <p>Data perjalanan tidak ditemukan atau masih dimuat…</p> : <>
        <h1 className="text-xl font-bold">Foto {tamu ? "Kunjungan Tamu" : "Perjalanan"} {t.nopol}</h1>
        <p className="text-sm text-muted-foreground">{t.tujuan} · {new Date(t.outAt).toLocaleString("id-ID")}</p>
        {list.length === 0 && <p>Tidak ada foto untuk perjalanan ini.</p>}
        <div className="grid gap-4 md:grid-cols-2">{list.map(([l, f]) => (
          <figure key={l} className="space-y-2 rounded border p-2">
            <a href={f} target="_blank" rel="noreferrer"><img src={f} alt={l} className="w-full rounded" /></a>
            <figcaption className="flex items-center justify-between text-sm font-semibold">{l}<a href={f} download target="_blank" rel="noreferrer" className="text-primary">Unduh</a></figcaption>
          </figure>))}</div>
      </>}
    </main>
  );
}
