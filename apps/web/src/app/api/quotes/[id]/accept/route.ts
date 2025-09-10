import { NextResponse } from "next/server";
import { Repos } from "@/data/server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { woId } = await Repos.quotes.accept(params.id);
    return NextResponse.json({ ok: true, woId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 400 });
  }
}
