"use client";
import { supabase } from "./supabase";

export async function getRole() {
  const { data } = await supabase.auth.getUser();
  return (data.user?.user_metadata as any)?.role ?? "mechanic";
}
export async function isManager() {
  return (await getRole()) === "manager";
}

