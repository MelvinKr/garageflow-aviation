"use client";
import { useMemo, useState } from "react";

export type Col<T> = { key: keyof T; label: string; render?: (row: T) => React.ReactNode };

export function DataTable<T extends { [k: string]: any }>({
  rows,
  cols,
  onRowClick,
  sortable = true,
}: {
  rows: T[];
  cols: Col<T>[];
  onRowClick?: (row: T) => void;
  sortable?: boolean;
}) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = a[sortKey as string];
      const vb = b[sortKey as string];
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const sa = String(va ?? "").toLowerCase();
      const sb = String(vb ?? "").toLowerCase();
      return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function clickHeader(key: keyof T) {
    if (!sortable) return;
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return key;
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {cols.map((c) => (
              <th
                key={String(c.key)}
                className={`px-3 py-2 text-left font-medium ${sortable ? "cursor-pointer select-none" : ""}`}
                onClick={() => clickHeader(c.key)}
                title={sortable ? "Trier" : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {c.label}
                  {sortKey === c.key && (
                    <span className="text-gray-400">{sortDir === "asc" ? "▲" : "▼"}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr
              key={i}
              className={`border-t ${onRowClick ? "hover:bg-gray-50 cursor-pointer" : ""}`}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
            >
              {cols.map((c) => (
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
