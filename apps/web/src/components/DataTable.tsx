"use client";
import { useMemo } from "react";

type Col<T> = { key: keyof T; label: string; render?: (row: T) => React.ReactNode };

export function DataTable<T extends { [k: string]: any }>({ rows, cols }: { rows: T[]; cols: Col<T>[] }) {
  const head = useMemo(() => cols.map(c => c.label), [cols]);
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {head.map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {cols.map(c => (
                <td key={String(c.key)} className="px-3 py-2">
                  {c.render ? c.render(r) : String(r[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

