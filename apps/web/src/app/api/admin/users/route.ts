import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const cookieStore = await cookies();
  const supaUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );
  const { data: { user } } = await supaUser.auth.getUser();
  const myRole = (user?.user_metadata as any)?.role ?? "user";
  if (myRole !== "admin") return { ok: false as const };
  return { ok: true as const };
}

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const users: any[] = [];
    const page = await admin.auth.admin.listUsers({ perPage: 100, page: 1 });
    users.push(...(page?.data?.users ?? []));

    const rows = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: (u.user_metadata as any)?.role ?? "user",
      created_at: (u as any).created_at,
      last_sign_in_at: (u as any).last_sign_in_at ?? null,
    }));
    return NextResponse.json({ users: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, role } = await req.json().catch(() => ({}));
    if (!userId || !["user", "manager", "admin"].includes(role)) {
      return NextResponse.json({ error: "payload invalide" }, { status: 400 });
    }
    const guard = await requireAdmin();
    if (!guard.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    } as any);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 });
  }
}

