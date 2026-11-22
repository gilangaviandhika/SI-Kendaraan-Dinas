import { useEffect, useRef, useState } from "react";

/** In-page rear camera viewfinder so phones never leave the browser for the native camera app. */
export function LiveCamera({ onCapture, onClose, onUnavailable, stampName }: { stampName?: string;  onCapture: (dataUrl: string, file: File) => void; onClose: () => void; onUnavailable: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stopped = false;
    if (!navigator.mediaDevices?.getUserMedia) { onUnavailable(); return; }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then((s) => {
        if (stopped) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; void videoRef.current.play().catch(() => {}); }
      })
      .catch(() => setError("Kamera tidak dapat dibuka. Izinkan akses kamera di pengaturan browser lalu coba lagi."));
    return () => { stopped = true; streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
  }, [onUnavailable]);

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const scale = Math.min(1, 1024 / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * scale); c.height = Math.round(v.videoHeight * scale);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    drawStamp(ctx, c.width, c.height, stampName);
    const url = c.toDataURL("image/jpeg", 0.8);
    c.toBlob((b) => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onCapture(url, new File([b ?? new Blob()], "foto.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.8);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground/95" role="dialog" aria-label="Kamera">
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted autoPlay onLoadedData={() => setReady(true)} className="h-full w-full object-contain" />
        {error && <p className="absolute inset-x-4 top-1/3 rounded-lg bg-background p-4 text-center text-sm">{error}</p>}
      </div>
      <div className="flex items-center justify-between gap-3 bg-background p-4">
        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Batal</button>
        <button type="button" onClick={capture} disabled={!ready} aria-label="Ambil Foto" className="h-16 w-16 rounded-full border-4 border-primary bg-primary/20 disabled:opacity-40" />
        <span className="w-16" />
      </div>
    </div>
  );
}

/** Burns capture time (WIB) and the logged-in officer's name into the bottom-left corner. */
function drawStamp(ctx: CanvasRenderingContext2D, w: number, h: number, name?: string) {
  const time = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()) + " WIB";
  const lines = [time, `Petugas: ${name || "-"}`];
  const fs = Math.max(14, Math.round(w / 40)), pad = Math.round(fs / 2), lh = Math.round(fs * 1.3);
  ctx.font = `bold ${fs}px sans-serif`;
  const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const bh = lh * lines.length + pad * 2;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(pad, h - bh - pad, tw + pad * 2, bh);
  ctx.fillStyle = "#fff"; ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, pad * 2, h - bh - pad + pad + i * lh));
}
