// Server-side Supabase client factory for RSC/route handlers
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Next.js 15: only allowed in Server Actions / Route Handlers
          try {
            // @ts-ignore
            cookieStore.set({ name, value, ...options });
          } catch (_e) {
            // no-op in RSC
          }
        },
        remove(name: string, options: any) {
          try {
            // @ts-ignore
            cookieStore.delete({ name, ...options });
          } catch (_e) {
            // no-op in RSC
          }
        },
      },
    }
  );
}

// Server-only admin client (service role key)
// Use ONLY in server actions, route handlers, or backend code.
export const sbAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );
