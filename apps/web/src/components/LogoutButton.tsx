"use client";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }}
      className="px-3 py-2 rounded border"
    >
      Logout
    </button>
  );
}

