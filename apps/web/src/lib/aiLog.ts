// Placeholder for AI logging (to be implemented)
export type AiLogEntry = {
  id?: string;
  at?: string;
  kind: "insights" | "llm" | "ask";
  promptHash?: string;
  responseHash?: string;
};

export async function logAi(_entry: AiLogEntry) {
  // no-op placeholder
  return;
}

