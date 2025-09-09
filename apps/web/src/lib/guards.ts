export function ensureCanAcceptQuote(itemsLen: number) {
  if (itemsLen <= 0) throw new Error("Devis vide : ajoute au moins une ligne.");
}
export function ensureCanCloseWo(allTasksDone: boolean) {
  if (!allTasksDone) throw new Error("Impossible de clore : toutes les tâches ne sont pas terminées.");
}
export function ensureNonNegative(n: number, label = "valeur") {
  if (n < 0 || Number.isNaN(n)) throw new Error(`${label} invalide`);
}
export function ensureStockAvailable(available: number, needed: number) {
  if (needed > available) throw new Error(`Stock insuffisant: besoin ${needed}, dispo ${available}`);
}
