import { NextResponse } from "next/server";
import { Repos } from "@/data";

export async function POST(req: Request, { params }: { params: { id: string; itemId: string } }) {
  try {
    const { qty } = await req.json();
    await Repos.po.receiveItem(params.id, params.itemId, Number(qty));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 400 });
  }
}

