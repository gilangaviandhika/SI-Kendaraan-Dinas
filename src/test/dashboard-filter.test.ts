import { describe, expect, it } from "vitest";
import { inRange, rangeBounds } from "@/lib/dashboard-filter";

const DAY = 86_400_000;
// Senin, 2 November 2026, 15:30 waktu lokal.
const now = new Date(2026, 10, 2, 15, 30).getTime();
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe("Filter rentang waktu Dashboard", () => {
  it("Hari ini hanya memuat trip hari ini", () => {
    const b = rangeBounds("hari-ini", now);
    expect(inRange(at(2026, 11, 2), b)).toBe(true);
    expect(inRange(at(2026, 11, 1), b)).toBe(false);
  });
  it("Minggu ini dimulai hari Senin", () => {
    const b = rangeBounds("minggu-ini", now);
    expect(b.start).toBe(at(2026, 11, 2, 0));
    expect(inRange(at(2026, 11, 8), b)).toBe(true);
    expect(inRange(at(2026, 11, 1), b)).toBe(false);
  });
  it("Bulan ini mencakup seluruh bulan berjalan", () => {
    const b = rangeBounds("bulan-ini", now);
    expect(inRange(at(2026, 11, 1, 0), b)).toBe(true);
    expect(inRange(at(2026, 11, 30, 23), b)).toBe(true);
    expect(inRange(at(2026, 10, 31), b)).toBe(false);
  });
  it("Custom menyaring tanggal awal-akhir secara inklusif", () => {
    const b = rangeBounds("custom", now, "2026-10-20", "2026-11-01");
    expect(inRange(at(2026, 10, 20), b)).toBe(true);
    expect(inRange(at(2026, 11, 1), b)).toBe(true);
    expect(inRange(at(2026, 10, 19), b)).toBe(false);
    expect(inRange(at(2026, 11, 2), b)).toBe(false);
  });
  it("Custom tanpa tanggal tidak membatasi apa pun", () => {
    const b = rangeBounds("custom", now);
    expect(inRange(at(2020, 1, 1), b)).toBe(true);
  });
});
