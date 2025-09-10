"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarClient from "./SidebarClient";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link href={href} className={`block px-3 py-2 rounded text-sm ${active ? "bg-gray-200 font-medium" : "hover:bg-gray-100"}`}>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string>("user");

  useEffect(() => {
    fetch("/api/debug/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setEmail(j.email ?? null);
        setRole(j.role ?? "user");
      })
      .catch(() => {});
  }, []);

  const isManager = role === "manager" || role === "admin";

  return (
    <aside className="w-64 min-h-screen border-r bg-white">
      <div className="p-4 text-lg font-semibold">GarageFlow</div>
      <nav className="px-2 space-y-1">
        <NavLink href="/" label="Dashboard" />
        <NavLink href="/parts" label="Pièces" />
        <NavLink href="/aircraft" label="Avions" />
        <NavLink href="/customers" label="Clients" />
        <NavLink href="/suppliers" label="Fournisseurs" />
        <NavLink href="/quotes" label="Devis" />
        <NavLink href="/workorders" label="Réparations" />
        <NavLink href="/purchase-orders" label="PO" />
        <NavLink href="/templates" label="Templates" />

        {isManager && (
          <>
            <div className="pt-3 pb-1 px-3 text-xs uppercase text-gray-500">Rapports</div>
            <NavLink href="/reports" label="Rapports" />
            <NavLink href="/reports/overview" label="Overview" />
            <NavLink href="/reports/ai-llm" label="Rapport IA (LLM)" />
            <NavLink href="/reports/ai-ask" label="Ask IA (RAG)" />
          </>
        )}
      </nav>

      <div className="mt-6 px-3 text-xs text-gray-500">
        {email ? (
          <>
            Connecté : {email} • rôle <b>{role}</b>
          </>
        ) : (
          "Non connecté"
        )}
      </div>
    </aside>
  );
}
