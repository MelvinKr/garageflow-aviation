import { NextResponse } from "next/server";
import { Repos } from "@/data/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const move = await Repos.parts.movement({ partId: params.id, ...body });
    return NextResponse.json({ ok: true, move });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 400 });
  }
}
