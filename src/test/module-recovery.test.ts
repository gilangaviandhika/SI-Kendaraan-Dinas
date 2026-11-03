import { describe, expect, it, vi } from "vitest";
import { moduleRecoveryScript } from "@/lib/module-recovery";

describe("Stale entry module recovery", () => {
  it("reloads failed entry imports once without looping or reacting to unrelated errors", () => {
    const listeners = new Map<string, (event: { message: string }) => void>();
    const reload = vi.fn();
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
    new Function("window", "document", "sessionStorage", "location", moduleRecoveryScript)(
      { addEventListener: (name: string, listener: (event: { message: string }) => void) => listeners.set(name, listener) },
      { addEventListener: vi.fn() }, storage, { reload },
    );
    listeners.get("error")?.({ message: "Unrelated error" });
    expect(reload).not.toHaveBeenCalled();
    listeners.get("error")?.({ message: "Failed to fetch dynamically imported module: client.tsx" });
    expect(reload).toHaveBeenCalledTimes(1);
    listeners.get("error")?.({ message: "Failed to fetch dynamically imported module: client.tsx" });
    expect(reload).toHaveBeenCalledTimes(1);
  });
});