import { NextResponse } from "next/server";
import { getLLM, getModel } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const url = new URL(req.url);
    const { searchParams } = url;
    const months = Number(searchParams.get("months") ?? 12);
    const alpha = Number(searchParams.get("alpha") ?? 0.5);

    // Compose lightweight context from existing aggregations
    const base = process.env.NEXT_PUBLIC_BASE_URL || url.origin;
    const [stock, quotes, wo] = await Promise.all([
      fetch(`${base}/api/reports/stock?months=${months}&alpha=${alpha}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${base}/api/reports/quotes?months=${months}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${base}/api/reports/wo?months=${months}`, { cache: "no-store" }).then((r) => r.json()),
    ]);

    let context: any = {
      months,
      alpha,
      stock: stock.parts ?? stock.rows ?? stock,
      quotes: quotes.items ?? quotes,
      wo: wo.items ?? wo,
    };

    // Fallback: if no stock returned by aggregation endpoint, try a direct parts read
    if (Array.isArray(context.stock) && context.stock.length === 0) {
      try {
        const direct = await fetch(`${base}/api/reports/stock?months=1&alpha=0.5`, { cache: "no-store" }).then(r=>r.json());
        const rows = direct.rows ?? direct.parts ?? [];
        if (Array.isArray(rows) && rows.length > 0) {
          context.stock = rows;
        }
      } catch {}
    }

    const system =
      "Tu es un assistant pour un atelier MRO. Réponds brièvement et précisément en t'appuyant sur le JSON de contexte. Donne des chiffres quand c'est pertinent.";

    // Guard: API key present
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquant côté serveur. Ajoutez-le dans .env (racine) et redémarrez." },
        { status: 400 }
      );
    }
    const openai = getLLM();
    const model = getModel();
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `CONTEXTE JSON:\n${JSON.stringify(context).slice(0, 15000)}` },
        ...((messages as any[]) ?? []).map((m) => ({ role: m.role, content: String(m.content ?? "") })),
      ],
    });

    const answer = completion.choices?.[0]?.message?.content ?? "(pas de réponse)";
    return NextResponse.json({ answer });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 });
  }
}
