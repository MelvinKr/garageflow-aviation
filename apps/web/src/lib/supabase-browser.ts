"use client";
import { createBrowserClient } from "@supabase/ssr";

// Lightweight browser client factory for client components
export const sb = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

