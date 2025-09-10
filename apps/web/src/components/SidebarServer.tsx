import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import SidebarClient from "./SidebarClient";

export default async function SidebarServer() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.user_metadata as any)?.role ?? "user";
  return <SidebarClient role={role} email={user?.email ?? null} />;
}

