/** Pick the most likely odometer reading (longest digit run, 3–7 digits) from OCR text. */
export function pickOdometer(text: string): string | null {
  const runs = (text.replace(/[\s.,]/g, (c) => (c === "\n" ? " " : "")).match(/\d{3,7}/g) ?? []);
  if (!runs.length) return null;
  return runs.reduce((a, b) => (b.length > a.length ? b : a)).replace(/^0+(?=\d)/, "");
}

/** Read odometer digits from a photo in the browser (no data leaves the device except the OCR engine download). */
export async function scanOdometer(file: File): Promise<string | null> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    await worker.setParameters({ tessedit_char_whitelist: "0123456789" });
    const { data } = await worker.recognize(file);
    return pickOdometer(data.text);
  } finally {
    await worker.terminate();
  }
}
