// Server auth helper
import { createSupabaseServerClient } from "./supabase-server";

export type CurrentUser = { email: string | null; role: string | null } | null;

export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  const role = (data.user.user_metadata as any)?.role ?? "viewer";
  return { email: data.user.email ?? null, role };
}
