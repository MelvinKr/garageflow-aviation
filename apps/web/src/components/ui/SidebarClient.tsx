"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

function normalizeRole(role?: string | null) {
  return (role ?? "viewer").toString().toLowerCase();
}
function isManager(role?: string | null) {
  const r = normalizeRole(role);
  return r === "manager" || r === "admin";
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded transition ${
        active ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
}

export default function SidebarClient({
  role,
  email,
}: {
  role: string;
  email?: string | null;
}) {
  const manager = isManager(role);

  return (
    <aside className="w-64 min-h-screen border-r bg-white flex flex-col">
      <div className="p-4 text-lg font-semibold">GarageFlow</div>

      <nav className="px-2 space-y-1">
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/parts">Pièces</NavLink>
        <NavLink href="/aircraft">Avions</NavLink>
        <NavLink href="/customers">Clients</NavLink>
        <NavLink href="/suppliers">Fournisseurs</NavLink>
        <NavLink href="/quotes">Devis</NavLink>
        <NavLink href="/workorders">Réparations</NavLink>
        <NavLink href="/purchase-orders">PO</NavLink>
        <NavLink href="/templates">Templates</NavLink>

        {manager && (
          <Fragment>
            <div className="pt-3 pb-1 px-3 text-xs uppercase text-gray-500">Rapports</div>
            <NavLink href="/reports">Rapports</NavLink>
            <NavLink href="/reports/ai">Rapport IA (LLM)</NavLink>
            <NavLink href="/reports/ai/ask">Ask IA (RAG)</NavLink>
            <NavLink href="/reports/ai/insights">Insights</NavLink>
          </Fragment>
        )}
      </nav>

      <div className="mt-auto px-3 py-3 text-xs text-gray-500 border-t">
        {email ? (
          <>Connecté : {email} — rôle <b>{normalizeRole(role)}</b></>
        ) : (
          "Non connecté"
        )}
      </div>
    </aside>
  );
}
