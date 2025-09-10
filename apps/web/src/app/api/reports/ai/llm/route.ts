import { NextResponse } from "next/server";
import { getLLM, getModel } from "@/lib/ai";
import { buildReportPrompt } from "@/lib/aiReport";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const months = Number(searchParams.get("months") ?? 12);
  const alpha = Number(searchParams.get("alpha") ?? 0.5);

  const base = process.env.NEXT_PUBLIC_BASE_URL || url.origin;
  const [stock, quotes, wo] = await Promise.all([
    fetch(`${base}/api/reports/stock?months=${months}&alpha=${alpha}`).then((r) => r.json()),
    fetch(`${base}/api/reports/quotes?months=${months}`).then((r) => r.json()),
    fetch(`${base}/api/reports/wo?months=${months}`).then((r) => r.json()),
  ]);

  const { system, user, json } = buildReportPrompt({
    org: "GarageFlow Aviation",
    months,
    alpha,
    stock,
    quotes,
    wo,
  } as any);

  const openai = getLLM();
  const model = getModel();

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `${user}\n\nJSON:\n${JSON.stringify(json)}` },
    ],
  });

  const markdown = completion.choices[0]?.message?.content ?? "Aucun contenu.";
  return NextResponse.json({ months, alpha, model, markdown });
}
