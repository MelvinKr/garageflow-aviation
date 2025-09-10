"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SUser = { id: string; email?: string | null };

function initialsOf(email?: string | null) {
  if (!email) return "U";
  const name = email.split("@")[0];
  const parts = name.replace(/[._-]+/g, " ").split(" ");
  const ini = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return (ini || name.slice(0, 1)).toUpperCase();
}

export default function UserNav() {
  const r = useRouter();
  const [user, setUser] = useState<SUser | null>(null);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>("mechanic");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
      setRole((data.user?.user_metadata as any)?.role || "mechanic");
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      setRole((session?.user?.user_metadata as any)?.role || "mechanic");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const initials = useMemo(() => initialsOf(user?.email), [user?.email]);

  if (!user) {
    return (
      <button
        className="text-sm underline"
        onClick={() => r.push("/auth?next=" + encodeURIComponent(location.pathname))}
        title="Se connecter"
      >
        Se connecter
      </button>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    r.push("/auth");
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
        onClick={() => setOpen((x) => !x)}
        title={user.email || "Utilisateur"}
      >
        <span className="h-7 w-7 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">
          {initials}
        </span>
        <span className="hidden sm:block text-sm max-w-[180px] truncate">{user.email}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" className="text-gray-500">
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-56 rounded border bg-white shadow z-50"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-3 py-2 border-b">
            <div className="text-xs text-gray-500">Connecté</div>
            <div className="text-sm truncate">{user.email}</div>
            <span className="mt-1 inline-block text-[11px] px-2 py-0.5 rounded-full border bg-gray-50">{role}</span>
          </div>
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => {
              navigator.clipboard.writeText(user.id).catch(() => {});
            }}
          >
            Copier mon userId
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
