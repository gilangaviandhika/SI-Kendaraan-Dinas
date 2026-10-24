import { describe, expect, it } from "vitest";
import { Workbook } from "exceljs";
import { createReportBlob } from "@/lib/report-export";
import { kendaraan0, type Trip } from "@/lib/vehicle-data";

describe("Excel report", () => {
  it("exports completed-trip user and department with editable distance and fuel calculations", async () => {
    const trip: Trip = { id: 1, nopol: "B 2240 PYF", driver: "Driver", user: "Budi", bidang: "Operasi", tujuan: "Inspeksi", satpamOut: "Satpam", outAt: 1_790_000_000_000, inAt: 1_790_003_600_000, odoOut: 100, odoIn: 150, fotoOut: [] };
    const { inAt: _inAt, ...activeTrip } = trip;
    const blob = await createReportBlob([trip, { ...activeTrip, id: 2 }], kendaraan0.map(v => ({ ...v, kml: 10 })));
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => { if (reader.result instanceof ArrayBuffer) resolve(reader.result); else reject(new Error("Missing bytes")); }; reader.onerror = reject; reader.readAsArrayBuffer(blob); });
    const wb = new Workbook();
    await wb.xlsx.load(bytes);
    const sheet = wb.getWorksheet("Laporan Perjalanan");
    expect(sheet?.rowCount).toBe(2);
    expect(sheet?.getCell("D2").value).toBe("Budi");
    expect(sheet?.getCell("E2").value).toBe("Operasi");
    expect(sheet?.getCell("M2").value).toEqual({ formula: "L2-K2", result: 50 });
    expect(sheet?.getCell("O2").value).toEqual({ formula: "M2/N2", result: 5 });
  });
});