"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded transition ${active ? "bg-gray-200 font-medium" : "hover:bg-gray-100"}`}
    >
      {children}
    </Link>
  );
}

export default function SidebarClient({ role, email }: { role: string; email?: string | null }) {
  const isManager = role === "manager" || role === "admin";

  return (
    <aside className="w-64 min-h-screen border-r bg-white">
      <div className="p-4 text-lg font-semibold">GarageFlow</div>

      <nav className="px-2 space-y-1">
        <NavLink href="/">🏠 Dashboard</NavLink>
        <NavLink href="/parts">🧩 Pièces</NavLink>
        <NavLink href="/aircraft">✈️ Avions</NavLink>
        <NavLink href="/customers">👤 Clients</NavLink>
        <NavLink href="/suppliers">🏭 Fournisseurs</NavLink>
        <NavLink href="/quotes">🧾 Devis</NavLink>
        <NavLink href="/workorders">🛠️ Réparations</NavLink>
        <NavLink href="/purchase-orders">📦 PO</NavLink>
        <NavLink href="/templates">📑 Templates</NavLink>

        {isManager && (
          <>
            <div className="pt-3 pb-1 px-3 text-xs uppercase text-gray-500">Rapports</div>
            <NavLink href="/reports">📈 Rapports</NavLink>
            <NavLink href="/reports/overview">🗂️ Overview</NavLink>
            <NavLink href="/reports/ai-llm">🤖 Rapport IA (LLM)</NavLink>
            <NavLink href="/reports/ai-ask">🔎 Ask IA (RAG)</NavLink>
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

