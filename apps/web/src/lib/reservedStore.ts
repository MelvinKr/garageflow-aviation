// LocalStorage-backed reserved quantities per part key (sku or id)
const KEY = "gf_reserved";

type MapType = Record<string, number>;

function read(): MapType {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return typeof obj === "object" && obj ? obj : {};
  } catch {
    return {};
  }
}

function write(map: MapType) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {}
}

export function getReservedMap(): MapType {
  return read();
}

export function getReservedFor(key: string): number {
  const m = read();
  return Number(m[key] ?? 0);
}

export function setReservedFor(key: string, qty: number) {
  const m = read();
  m[key] = Math.max(0, Number(qty) || 0);
  write(m);
}

export function clearReserved() {
  try { localStorage.removeItem(KEY); } catch {}
}

