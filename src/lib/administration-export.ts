export type AdministrationKind = "overtime" | "sppd";
export type RequestRow = { id: number; nama: string; user: string; bidang: string; tanggal: string; akhir: string; mulai: string; sampai: string; tujuan: string; keperluan: string };

// Both bounds include the request's activity date (departure date for SPPD).
export function filterRequests(rows: RequestRow[], start: string, end: string) {
  if (start && end && start > end) return [];
  return rows.filter(row => (!start || row.tanggal >= start) && (!end || row.tanggal <= end));
}

export async function createAdministrationReport(rows: RequestRow[], kind: AdministrationKind) {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  workbook.creator = "SI Kendaraan Dinas UPT Bandung";
  const overtime = kind === "overtime";
  const sheet = workbook.addWorksheet(overtime ? "e-Overtime" : "e-SPPD");
  sheet.columns = [
    { header: "Nama Pegawai", key: "nama", width: 28 },
    { header: "User", key: "user", width: 28 },
    { header: "Bidang", key: "bidang", width: 24 },
    { header: overtime ? "Tanggal Lembur" : "Tanggal Berangkat", key: "tanggal", width: 22 },
    ...(overtime ? [
      { header: "Jam Mulai", key: "mulai", width: 16 },
      { header: "Jam Selesai", key: "sampai", width: 16 },
    ] : [
      { header: "Tanggal Kembali", key: "akhir", width: 22 },
      { header: "Tujuan Perjalanan", key: "tujuan", width: 32 },
    ]),
    { header: overtime ? "Uraian Pekerjaan" : "Keperluan Dinas", key: "keperluan", width: 44 },
    { header: "Status", key: "status", width: 18 },
  ];
  rows.forEach(row => sheet.addRow({ ...row, status: "Menunggu" }));
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: `H${Math.max(1, sheet.rowCount)}` };
  sheet.eachRow(row => {
    row.font = { name: "Arial", size: 11 };
    row.alignment = { vertical: "top", wrapText: true };
  });
  sheet.getRow(1).font = { name: "Arial", size: 11, bold: true };
  sheet.getRow(1).height = 32;
  const bytes = await workbook.xlsx.writeBuffer();
  return new Blob([new Uint8Array(bytes)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}