// Dashboard time-range filter. Bounds are epoch ms, half-open [start, end)
// so any trip whose check-out (outAt) falls inside the window is included.
export type TimeRangePreset = "hari-ini" | "minggu-ini" | "bulan-ini" | "custom";

const DAY = 86_400_000;

export const timeRangePresets: { value: TimeRangePreset; label: string }[] = [
  { value: "hari-ini", label: "Hari ini" },
  { value: "minggu-ini", label: "Minggu ini" },
  { value: "bulan-ini", label: "Bulan ini" },
  { value: "custom", label: "Custom" },
];

// "YYYY-MM-DD" input value -> local midnight of that day (NaN when empty/invalid).
export function dayStart(value: string): number {
  if (!value) return NaN;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  return new Date(y, m - 1, d).getTime();
}

export function rangeBounds(
  preset: TimeRangePreset,
  now: number,
  customStart = "",
  customEnd = "",
): { start: number; end: number } {
  if (preset === "custom") {
    const s = dayStart(customStart);
    const e = dayStart(customEnd);
    return {
      start: Number.isNaN(s) ? -Infinity : s,
      end: Number.isNaN(e) ? Infinity : e + DAY,
    };
  }
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);
  const startOfDay = base.getTime();
  if (preset === "hari-ini") return { start: startOfDay, end: startOfDay + DAY };
  if (preset === "minggu-ini") {
    // Week starts Monday (Indonesian convention).
    const dow = (base.getDay() + 6) % 7;
    const monday = startOfDay - dow * DAY;
    return { start: monday, end: monday + 7 * DAY };
  }
  // bulan-ini: first of this month through the first of the next.
  const start = new Date(base.getFullYear(), base.getMonth(), 1).getTime();
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 1).getTime();
  return { start, end };
}

export function inRange(ms: number | undefined, bounds: { start: number; end: number }): boolean {
  return ms !== undefined && ms >= bounds.start && ms < bounds.end;
}

export function dashboardTripRows<T extends { nopol: string; outAt: number; inAt?: number }>(
  trips: readonly T[],
  areaOf: (nopol: string) => string | undefined,
  selectedArea: string,
  bounds: { start: number; end: number },
  limit = 6,
): T[] {
  return trips
    .filter((trip) =>
      (selectedArea === "Semua" || areaOf(trip.nopol) === selectedArea) &&
      inRange(trip.outAt, bounds),
    )
    .sort((a, b) => b.outAt - a.outAt)
    .slice(0, limit);
}
