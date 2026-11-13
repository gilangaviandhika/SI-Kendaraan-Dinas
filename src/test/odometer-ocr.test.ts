import { afterEach, describe, expect, it, vi } from "vitest";
import { pickOdometer, prepareOdometerImage, scanOdometer } from "@/lib/odometer-ocr";
vi.mock("@/lib/odometer-ai.functions", () => ({ readOdometerAI: vi.fn() }));
import { readOdometerAI } from "@/lib/odometer-ai.functions";
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe("pickOdometer", () => {
  it("takes the longest digit run", () => expect(pickOdometer("12 045230 km 7")).toBe("45230"));
  it("handles thousand separators", () => expect(pickOdometer("45.230")).toBe("45230"));
  it("returns null without digits", () => expect(pickOdometer("abc")).toBeNull());
});
describe("foto odometer ramah HP", () => {
  it("membatasi foto portrait menjadi 768 × 1024 dan membebaskan bitmap", async () => {
    const close = vi.fn();
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 1024, height: 1365, close }));
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,foto");
    expect(await prepareOdometerImage(new File(["foto"], "kamera.jpg"))).toBe("data:image/jpeg;base64,foto");
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 768, 1024);
    expect(close).toHaveBeenCalledOnce();
  });
  it("kegagalan AI mengembalikan null agar angka tetap dapat diisi manual", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 1024, height: 768, close: vi.fn() }));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,foto");
    vi.mocked(readOdometerAI).mockRejectedValueOnce(new Error("Jaringan terputus"));
    expect(await scanOdometer(new File(["foto"], "kamera.jpg"))).toBeNull();
  });
});
