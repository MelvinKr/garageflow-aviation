"use client";
import { useMemo, useState } from "react";

export type Col<T> = { key: keyof T; label: string; render?: (row: T) => React.ReactNode };

export type Sorter<T> = { key: keyof T; dir: "asc" | "desc" };

export function DataTable<T extends { [k: string]: any }>({
  rows,
  cols,
  onRowClick,
  sortable = true,
  multiSort = false,
  sorters,
  onSortChange,
}: {
  rows: T[];
  cols: Col<T>[];
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  multiSort?: boolean;
  sorters?: Sorter<T>[];
  onSortChange?: (s: Sorter<T>[]) => void;
}) {
  const [internalSorters, setInternalSorters] = useState<Sorter<T>[]>([]);
  const activeSorters = sorters ?? internalSorters;

  const sorted = useMemo(() => {
    if (!sortable || activeSorters.length === 0) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      for (const s of activeSorters) {
        const va = a[s.key as string];
        const vb = b[s.key as string];
        let cmp = 0;
        if (typeof va === "number" && typeof vb === "number") {
          cmp = va - vb;
        } else {
          const sa = String(va ?? "").toLowerCase();
          const sb = String(vb ?? "").toLowerCase();
          cmp = sa.localeCompare(sb);
        }
        if (cmp !== 0) return s.dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
    return copy;
  }, [rows, activeSorters, sortable]);

  function setSortersNext(next: Sorter<T>[]) {
    if (onSortChange) onSortChange(next);
    else setInternalSorters(next);
  }

  function clickHeader(key: keyof T, e: React.MouseEvent<HTMLTableHeaderCellElement>) {
    if (!sortable) return;
    const idx = activeSorters.findIndex((s) => s.key === key);
    const isShift = multiSort && e.shiftKey;
    let next = [...activeSorters];

    if (isShift) {
      if (idx === -1) {
        next.push({ key, dir: "asc" });
      } else if (next[idx].dir === "asc") {
        next[idx] = { key, dir: "desc" };
      } else {
        next.splice(idx, 1); // remove if desc -> none
      }
    } else {
      if (idx === -1) {
        next = [{ key, dir: "asc" }];
      } else if (next[idx].dir === "asc") {
        next = [{ key, dir: "desc" }];
      } else {
        next = [];
      }
    }
    setSortersNext(next);
  }

  function headerIndicator(key: keyof T) {
    const idx = activeSorters.findIndex((s) => s.key === key);
    if (idx === -1) return null;
    const arrow = activeSorters[idx].dir === "asc" ? "▲" : "▼";
    return (
      <span className="inline-flex items-center gap-1 text-gray-400">
        {arrow}
        {multiSort && activeSorters.length > 1 ? <sup>{idx + 1}</sup> : null}
      </span>
    );
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
                onClick={(e) => clickHeader(c.key, e)}
                title={sortable ? (multiSort ? "Trier (Shift = tri multiple)" : "Trier") : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {c.label}
                  {headerIndicator(c.key)}
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
