import { NextResponse } from "next/server";
import { Repos } from "@/data/server";

export async function POST(_req: Request, { params }: { params: { id: string; taskId: string } }) {
  try {
    await Repos.workorders.toggleTask(params.id, params.taskId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 400 });
  }
}
