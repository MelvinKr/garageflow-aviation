"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function ManagerOrAdminOnly({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const role = (data.user?.user_metadata as any)?.role ?? "user";
      setOk(role === "manager" || role === "admin");
    })();
  }, []);
  if (ok === null) return <div className="p-6 text-sm text-gray-500">Vérification des droits…</div>;
  if (!ok) return <div className="p-6 text-sm text-red-600">Accès réservé aux managers ou admins.</div>;
  return <>{children}</>;
}
