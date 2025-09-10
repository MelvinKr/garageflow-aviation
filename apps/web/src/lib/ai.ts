import OpenAI from "openai";

export function getLLM() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const baseURL = process.env.OPENAI_BASE_URL; // optional proxy
  return new OpenAI({ apiKey, baseURL } as any);
}

export function getModel() {
  return process.env.LLM_MODEL || "gpt-4o-mini";
}

