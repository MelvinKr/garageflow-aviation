import * as React from "react";

export function KpiCard({
  icon,
  label,
  value,
  accent = "orange",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: "orange" | "slate" | "emerald";
}) {
  const bg = accent === "orange" ? "bg-orange-50" : accent === "emerald" ? "bg-emerald-50" : "bg-slate-100";
  const fg = accent === "orange" ? "text-orange-600" : accent === "emerald" ? "text-emerald-600" : "text-slate-500";
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${bg}`}>
          <span className={`text-2xl ${fg}`}>{icon}</span>
        </div>
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}

