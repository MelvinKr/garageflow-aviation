import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.user_metadata as any)?.role ?? "user";
  if (!user || !["manager", "admin"].includes(role)) {
    return <p className="p-6 text-red-600">Accès réservé aux managers.</p>;
  }
  return <div style={{ padding: "2rem" }}>✅ /reports/ai-ask OK</div>;
}

