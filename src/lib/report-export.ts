import type { Kendaraan, Trip } from "@/lib/vehicle-data";

export async function createReportBlob(trips: Trip[], vehicles: Kendaraan[]) {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  workbook.creator = "SI Kendaraan Dinas UPT Bandung";
  const sheet = workbook.addWorksheet("Laporan Perjalanan");
  sheet.columns = [
    { header: "Kendaraan", key: "nopol", width: 18 },
    { header: "Wilayah Kerja", key: "area", width: 28 },
    { header: "Driver", key: "driver", width: 30 },
    { header: "User", key: "user", width: 28 },
    { header: "Bidang", key: "bidang", width: 24 },
    { header: "Tujuan / Keperluan", key: "tujuan", width: 32 },
    { header: "Keluar", key: "keluar", width: 22 },
    { header: "Kembali", key: "kembali", width: 22 },
    { header: "Satpam Keluar", key: "satpamOut", width: 24 },
    { header: "Satpam Kembali", key: "satpamIn", width: 24 },
    { header: "Odometer Keluar (KM)", key: "odoOut", width: 24 },
    { header: "Odometer Kembali (KM)", key: "odoIn", width: 24 },
    { header: "Jarak (KM)", key: "jarak", width: 18 },
    { header: "Efisiensi BBM (KM/L)", key: "kml", width: 24 },
    { header: "Estimasi BBM (Ltr)", key: "bbm", width: 22 },
    { header: "Waktu Perjalanan (jam)", key: "durasi", width: 26 },
    { header: "Kondisi", key: "kondisi", width: 36 },
  ];
  for (const trip of trips) {
    if (trip.inAt === undefined || trip.odoIn === undefined) continue;
    const vehicle = vehicles.find(v => v.nopol === trip.nopol);
    const distance = trip.odoIn - trip.odoOut;
    const efficiency = vehicle?.kml && vehicle.kml > 0 ? vehicle.kml : null;
    // Export local wall-clock values so Excel agrees with the displayed dates.
    const excelDate = (ms: number) => new Date(ms - new Date(ms).getTimezoneOffset() * 60_000);
    const row = sheet.addRow({
      nopol: trip.nopol, area: vehicle?.area ?? "", driver: trip.driver,
      user: trip.user ?? "", bidang: trip.bidang ?? "", tujuan: trip.tujuan,
      keluar: excelDate(trip.outAt), kembali: excelDate(trip.inAt),
      satpamOut: trip.satpamOut, satpamIn: trip.satpamIn ?? "",
      odoOut: trip.odoOut, odoIn: trip.odoIn, kml: efficiency,
      kondisi: trip.kondisi ?? "",
    });
    const n = row.number;
    row.getCell("jarak").value = { formula: `L${n}-K${n}`, result: distance };
    row.getCell("bbm").value = efficiency === null ? null : { formula: `M${n}/N${n}`, result: distance / efficiency };
    row.getCell("durasi").value = { formula: `(H${n}-G${n})*24`, result: (trip.inAt - trip.outAt) / 3_600_000 };
  }
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: `Q${Math.max(1, sheet.rowCount)}` };
  sheet.eachRow(row => {
    row.font = { name: "Arial", size: 11 };
    row.alignment = { vertical: "top", wrapText: true };
  });
  const header = sheet.getRow(1);
  header.font = { name: "Arial", size: 11, bold: true };
  header.height = 32;
  ["keluar", "kembali"].forEach(key => { sheet.getColumn(key).numFmt = "dd/mm/yyyy hh:mm"; });
  ["odoOut", "odoIn", "jarak", "kml", "bbm", "durasi"].forEach(key => { sheet.getColumn(key).numFmt = "#,##0.00"; });
  const bytes = await workbook.xlsx.writeBuffer();
  return new Blob([new Uint8Array(bytes)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export async function deliverReport(blob: Blob) {
  const filename = `Laporan-Kendaraan-Dinas-${new Date().toISOString().slice(0, 10)}.xlsx`;
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (error) { if ((error as DOMException).name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}