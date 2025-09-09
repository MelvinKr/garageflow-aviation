// Simple in-memory movement store for demo purposes (client-only usage)
export type Movement = {
  sku?: string;
  id?: string;
  delta: number;
  reason?: string;
  note?: string;
  attachmentUrl?: string;
  at: string; // ISO
};

const movements: Movement[] = [];

export function addMovement(m: Movement) {
  movements.push(m);
}

export function listMovementsFor(key?: string) {
  if (!key) return [] as Movement[];
  return movements
    .filter((m) => (m.sku || m.id) === key)
    .sort((a, b) => (a.at > b.at ? -1 : 1))
    .slice(0, 20);
}

export function clearFor(key?: string) {
  if (!key) return;
  for (let i = movements.length - 1; i >= 0; i--) {
    const k = movements[i].sku || movements[i].id;
    if (k === key) movements.splice(i, 1);
  }
}

export function clearAll() {
  movements.splice(0, movements.length);
}
