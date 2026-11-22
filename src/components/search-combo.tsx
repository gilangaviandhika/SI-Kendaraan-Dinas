import { useState } from "react";

export type ComboOption = { value: string; label: string };

export function SearchCombo({ ariaLabel, placeholder, value, options, onChange, className }: { ariaLabel: string; placeholder: string; value: string; options: ComboOption[]; onChange: (v: string) => void; className: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const sel = options.find((o) => o.value === value);
  const term = q.trim().toLowerCase();
  const list = options.filter((o) => !term || o.label.toLowerCase().includes(term));
  const pick = (v: string) => { onChange(v); setQ(""); setOpen(false); };
  return (
    <div className="relative">
      <input role="combobox" aria-expanded={open} aria-label={ariaLabel} className={className + (sel && !open ? " pr-8" : "")} placeholder={sel ? sel.label : placeholder}
        value={open ? q : sel?.label ?? q}
        onFocus={() => { setOpen(true); setHi(0); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, list.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); const o = list[hi]; if (o) pick(o.value); }
          else if (e.key === "Escape") setOpen(false);
        }} />
      {sel && !open && <button type="button" aria-label="Hapus pilihan" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => onChange("")}>✕</button>}
      {open && (
        <ul role="listbox" className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {list.length === 0 ? <li className="px-3 py-2 text-sm text-muted-foreground">Tidak ditemukan</li> : list.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value} className={"cursor-pointer px-3 py-2 text-sm font-normal " + (i === hi ? "bg-accent text-accent-foreground" : "")}
              onMouseDown={(e) => { e.preventDefault(); pick(o.value); }} onMouseEnter={() => setHi(i)}>{o.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
