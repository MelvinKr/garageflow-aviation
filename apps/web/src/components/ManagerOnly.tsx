"use client";
import { useEffect, useState } from "react";
import { isManager } from "@/lib/role";

export default function ManagerOnly({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    isManager().then(setOk);
  }, []);
  if (ok === null) return <div className="p-6 text-sm text-gray-500">Vérification des droits…</div>;
  if (!ok) return <div className="p-6 text-sm text-red-600">Accès réservé aux managers.</div>;
  return <>{children}</>;
}

