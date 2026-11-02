import { describe, expect, it } from "vitest";
import { Workbook } from "exceljs";
import { createAdministrationReport, filterRequests, type RequestRow } from "@/lib/administration-export";

const row: RequestRow = { id: 1, nama: "Budi", user: "Andi", bidang: "Operasi", tanggal: "2026-11-02", akhir: "2026-11-04", mulai: "18:00", sampai: "20:00", tujuan: "Bandung", keperluan: "Inspeksi" };
describe("administrative reports", () => {
  it("includes both date boundaries and excludes dates outside the range", () => {
    const rows = [row, { ...row, id: 2, tanggal: "2026-11-03" }, { ...row, id: 3, tanggal: "2026-11-04" }, { ...row, id: 4, tanggal: "2026-11-01" }];
    expect(filterRequests(rows, "2026-11-02", "2026-11-03").map(r => r.id)).toEqual([1, 2]);
  });
  it("allows open date bounds and rejects reversed bounds", () => {
    expect(filterRequests([row], "", "")).toEqual([row]);
    expect(filterRequests([row], "2026-11-03", "")).toEqual([]);
    expect(filterRequests([row], "", "2026-11-01")).toEqual([]);
    expect(filterRequests([row], "2026-11-04", "2026-11-01")).toEqual([]);
  });
  for (const kind of ["overtime", "sppd"] as const) {
    it(`exports ${kind} identity and activity fields from filtered requests`, async () => {
      const blob = await createAdministrationReport(filterRequests([row, { ...row, id: 2, tanggal: "2026-12-01" }], "2026-11-01", "2026-11-30"), kind);
      const bytes = await new Promise<ArrayBuffer>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => { if (reader.result instanceof ArrayBuffer) resolve(reader.result); else reject(new Error("Missing bytes")); }; reader.onerror = reject; reader.readAsArrayBuffer(blob); });
      const workbook = new Workbook();
      await workbook.xlsx.load(bytes);
      const sheet = workbook.getWorksheet(kind === "overtime" ? "e-Overtime" : "e-SPPD");
      expect(sheet?.rowCount).toBe(2);
      expect(sheet?.getCell("B2").value).toBe("Andi");
      expect(sheet?.getCell("C2").value).toBe("Operasi");
      expect(sheet?.getCell("E2").value).toBe(kind === "overtime" ? "18:00" : "2026-11-04");
      expect(sheet?.getCell("F2").value).toBe(kind === "overtime" ? "20:00" : "Bandung");
      expect(sheet?.getCell("H2").value).toBe("Menunggu");
    });
  }
});