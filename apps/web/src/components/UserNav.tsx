"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

type SUser = { id: string; email?: string | null };

function initialsOf(email?: string | null) {
  if (!email) return "U";
  const name = email.split("@")[0];
  const parts = name.replace(/[._-]+/g, " ").split(" ").filter(Boolean);
  const ini = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return (ini || name.slice(0, 1)).toUpperCase();
}
const normalizeRole = (r?: string | null) => (r ?? "viewer").toString().toLowerCase();

export default function UserNav() {
  const r = useRouter();
  const [user, setUser] = useState<SUser | null>(null);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>("viewer");
  const menuRef = useRef<HTMLDivElement>(null);

  // initial + live auth state
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const u = data.user;
      setUser(u ? { id: u.id, email: u.email } : null);
      setRole(normalizeRole((u?.user_metadata as any)?.role));
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u ? { id: u.id, email: u.email } : null);
      setRole(normalizeRole((u?.user_metadata as any)?.role));
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // close on click outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const initials = useMemo(() => initialsOf(user?.email), [user?.email]);

  if (!user) {
    return (
      <button
        className="text-sm underline"
        onClick={() => r.push(("/auth?next=" + encodeURIComponent(location.pathname)) as any)}
        title="Se connecter"
      >
        Se connecter
      </button>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    r.push("/auth" as any);
  }

  return (
    <div className="relative" ref={menuRef}>
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
        <div className="absolute right-0 mt-1 w-56 rounded border bg-white shadow z-50">
          <div className="px-3 py-2 border-b">
            <div className="text-xs text-gray-500">Connecté</div>
            <div className="text-sm truncate">{user.email}</div>
            <span className="mt-1 inline-block text-[11px] px-2 py-0.5 rounded-full border bg-gray-50">
              {role}
            </span>
          </div>
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => navigator.clipboard.writeText(user.id).catch(() => {})}
          >
            Copier mon userId
          </button>
          <a className="block px-3 py-2 text-sm hover:bg-gray-50" href="/whoami">
            Mon profil
          </a>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
