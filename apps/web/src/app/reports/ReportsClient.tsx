"use client";
import { useRouter, useSearchParams } from "next/navigation";

const PERIODS = [3, 6, 12];

export default function ReportsClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const months = Number(sp.get("months") ?? 12);
  const alpha = Number(sp.get("alpha") ?? 0.5);

  function setParam(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    p.set(key, val);
    router.replace(`/reports?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 mb-4">
      <label className="text-sm">Période</label>
      <select
        value={months}
        onChange={(e) => setParam("months", e.target.value)}
        className="border rounded px-2 py-1"
      >
        {PERIODS.map((m) => (
          <option key={m} value={m}>
            {m} mois
          </option>
        ))}
      </select>

      <label className="text-sm ml-4">EMA α</label>
      <input
        type="range"
        min={0.1}
        max={0.9}
        step={0.05}
        value={alpha}
        onChange={(e) => setParam("alpha", e.target.value)}
      />
      <span className="text-sm w-10 text-center">{alpha}</span>
    </div>
  );
}

