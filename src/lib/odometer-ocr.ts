import { readOdometerAI } from "@/lib/odometer-ai.functions";

/** Pick the most likely odometer reading (longest digit run, 3–7 digits) from text. */
export function pickOdometer(text: string): string | null {
  const runs = (text.replace(/(\d)[.,](?=\d)/g, "$1").match(/\d{3,7}/g) ?? []);
  if (!runs.length) return null;
  return runs.reduce((a, b) => (b.length > a.length ? b : a)).replace(/^0+(?=\d)/, "");
}

export async function prepareOdometerImage(file: File, max = 1024): Promise<string> {
  // Resize during decoding when supported, rather than keeping a full camera
  // image plus a second full-size canvas in memory on mobile devices.
  if (typeof createImageBitmap === "function") {
    let bitmap: ImageBitmap | undefined;
    try {
      bitmap = await createImageBitmap(file, { resizeWidth: max, resizeQuality: "high" });
      const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Foto belum dapat diproses.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch { /* Older phones may not support bitmap decoding; use Image. */ }
    finally { bitmap?.close(); }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, no) => {
      const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url;
    });
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    const context = c.getContext("2d");
    if (!context) throw new Error("Foto belum dapat diproses.");
    context.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  } finally { URL.revokeObjectURL(url); }
}

/** Read odometer digits from a photo using AI Vision. */
export async function scanOdometer(file: File): Promise<string | null> {
  try {
    const image = await prepareOdometerImage(file);
    const { odo } = await readOdometerAI({ data: { image } });
    return odo;
  } catch { return null; }
}
