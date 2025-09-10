import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function SidebarServer() {
  const me = await getCurrentUser();
  const role = me?.role ?? "user";
  const email = me?.email ?? null;
  const isManager = role === "manager" || role === "admin";

  return (
    <aside className="w-64 min-h-screen border-r bg-white">
      <div className="p-4 text-lg font-semibold">GarageFlow</div>
      <nav className="px-2 space-y-1 text-sm">
        <Link href="/" className="block px-3 py-2 rounded hover:bg-gray-100">Dashboard</Link>
        <Link href="/parts" className="block px-3 py-2 rounded hover:bg-gray-100">Pièces</Link>
        <Link href="/aircraft" className="block px-3 py-2 rounded hover:bg-gray-100">Avions</Link>
        <Link href="/customers" className="block px-3 py-2 rounded hover:bg-gray-100">Clients</Link>
        <Link href="/suppliers" className="block px-3 py-2 rounded hover:bg-gray-100">Fournisseurs</Link>
        <Link href="/quotes" className="block px-3 py-2 rounded hover:bg-gray-100">Devis</Link>
        <Link href="/workorders" className="block px-3 py-2 rounded hover:bg-gray-100">Réparations</Link>
        <Link href="/purchase-orders" className="block px-3 py-2 rounded hover:bg-gray-100">PO</Link>
        <Link href="/templates" className="block px-3 py-2 rounded hover:bg-gray-100">Templates</Link>
        {/* Ask IA accessible à tous */}
        <Link href="/reports/ai-ask" className="block px-3 py-2 rounded hover:bg-gray-100">Ask IA (RAG)</Link>
        {isManager && (
          <div className="mt-3">
            <div className="px-3 py-1 text-xs uppercase text-gray-500">Rapports</div>
            <Link href="/reports" className="block px-3 py-2 rounded hover:bg-gray-100">Rapports</Link>
            <Link href="/reports/overview" className="block px-3 py-2 rounded hover:bg-gray-100">Overview</Link>
            <Link href="/reports/ai-llm" className="block px-3 py-2 rounded hover:bg-gray-100">Rapport IA (LLM)</Link>
          </div>
        )}
        {email ? (
          <div className="mt-4 px-3 text-xs text-gray-500">Connecté : {email} — rôle <b>{role}</b></div>
        ) : (
          <div className="mt-4 px-3 text-xs text-gray-500">Non connecté</div>
        )}
      </nav>
    </aside>
  );
}

