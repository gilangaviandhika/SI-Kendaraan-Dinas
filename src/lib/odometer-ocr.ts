import { readOdometerAI } from "@/lib/odometer-ai.functions";

/** Pick the most likely odometer reading (longest digit run, 3–7 digits) from text. */
export function pickOdometer(text: string): string | null {
  const runs = (text.replace(/(\d)[.,](?=\d)/g, "$1").match(/\d{3,7}/g) ?? []);
  if (!runs.length) return null;
  return runs.reduce((a, b) => (b.length > a.length ? b : a)).replace(/^0+(?=\d)/, "");
}

async function shrink(file: File, max = 1280): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, no) => {
      const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url;
    });
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85);
  } finally { URL.revokeObjectURL(url); }
}

/** Read odometer digits from a photo using AI Vision. */
export async function scanOdometer(file: File): Promise<string | null> {
  try {
    const image = await shrink(file);
    const { odo } = await readOdometerAI({ data: { image } });
    return odo;
  } catch { return null; }
}
