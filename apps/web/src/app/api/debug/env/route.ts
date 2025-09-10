import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENAI_API_KEY || "";
  const masked = key ? `${key.slice(0, 6)}…${key.slice(-4)}` : null;
  return NextResponse.json({
    hasOPENAI_API_KEY: !!key,
    OPENAI_API_KEY_masked: masked,
    LLM_MODEL: process.env.LLM_MODEL || null,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || null,
    NODE_ENV: process.env.NODE_ENV || null,
  });
}

