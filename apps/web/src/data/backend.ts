export type Backend = "MOCK" | "DB";

export function getBackend(): Backend {
  const v = (process.env.NEXT_PUBLIC_DATA_BACKEND ?? "MOCK").toUpperCase();
  return v === "DB" ? "DB" : "MOCK";
}

