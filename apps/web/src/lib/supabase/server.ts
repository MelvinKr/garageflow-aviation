// apps/web/src/lib/supabase/server.ts
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
          // Next.js 15 restricts cookie mutation to Server Actions/Route Handlers.
          // Swallow in RSC to avoid runtime error; Supabase will still function for reads.
          try {
            // @ts-ignore - Next may expose different cookie types per context
            cookieStore.set({ name, value, ...options });
          } catch (_e) {
            // no-op in RSC; allowed in Actions/Route Handlers
          }
        },
        remove(name: string, options: any) {
          try {
            // @ts-ignore - Next may expose different cookie types per context
            cookieStore.delete({ name, ...options });
          } catch (_e) {
            // no-op in RSC
          }
        },
      },
    }
  );
}

// Server-only admin client (service role).
// Use ONLY in server actions/route handlers or trusted server code.
export const sbAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );
