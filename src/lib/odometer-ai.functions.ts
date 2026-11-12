import { createServerFn } from "@tanstack/react-start";

export const readOdometerAI = createServerFn({ method: "POST" })
  .inputValidator((input: { image: string }) => {
    if (typeof input?.image !== "string" || !input.image.startsWith("data:image/") || input.image.length > 4_000_000)
      throw new Error("Foto tidak valid");
    return input;
  })
  .handler(async ({ data }) => {
    const { generateResponse } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6.1-terra",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Foto ini adalah panel/odometer kendaraan. Baca angka ODOMETER total (jarak tempuh KM), bukan speedometer, RPM, trip meter, jam, atau suhu. Abaikan digit desimal/persepuluhan (mis. 20875.0 -> 20875). Jawab HANYA angka bulat tanpa titik/koma. Jika tidak terbaca jawab NONE.",
              },
              { type: "input_image", image_url: data.image, detail: "high" },
            ],
          },
        ],
      });
      const text = String((res as { output_text?: string }).output_text ?? "");
      const m = text.replace(/[.,](?=\d{3}\b)/g, "").match(/\d{1,7}/);
      return { odo: m ? m[0].replace(/^0+(?=\d)/, "") : null };
    } catch (e) {
      console.error("readOdometerAI", e);
      return { odo: null };
    }
  });
