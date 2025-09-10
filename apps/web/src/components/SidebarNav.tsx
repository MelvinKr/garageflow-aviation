"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; icon: React.ReactNode };
const links: Item[] = [
  { href: "/", label: "Dashboard", icon: <HomeIcon /> },
  { href: "/parts", label: "Pièces", icon: <BagIcon /> },
  { href: "/aircraft", label: "Avions", icon: <PlaneIcon /> },
  { href: "/customers", label: "Clients", icon: <UsersIcon /> },
  { href: "/suppliers", label: "Fournisseurs", icon: <StoreIcon /> },
  { href: "/quotes", label: "Devis", icon: <QuoteIcon /> },
  { href: "/workorders", label: "Réparations", icon: <WrenchIcon /> },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <aside className="w-64 bg-[#1f2a37] text-slate-200 min-h-screen">
      <div className="p-5 text-lg font-semibold tracking-tight">GarageFlow</div>
      <nav className="flex flex-col gap-1 p-3 text-sm">
        {[
          ...links,
          { href: "/reports", label: "Rapports", icon: <ChartIcon /> },
          { href: "/reports/overview", label: "Rapports — Overview", icon: <ChartIcon /> },
          { href: "/reports/ai-llm", label: "Rapport IA (LLM)", icon: <ChartIcon /> },
          { href: "/reports/ai-ask", label: "Ask IA (RAG)", icon: <span>🔎</span> },
          { href: "/admin/roles", label: "Admin → Rôles", icon: <UsersIcon /> },
          { href: "/purchase-orders", label: "PO", icon: <StoreIcon /> },
          { href: "/templates", label: "Templates", icon: <WrenchIcon /> },
        ].map((item) => {
          const active = mounted && pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 h-6 w-1 rounded-r bg-white/70" />
              )}
              <span className="text-slate-300 group-hover:text-white">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 3 3 10h2v9h5v-6h4v6h5v-9h2l-9-7Z" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M8 7V6a4 4 0 1 1 8 0v1h2a1 1 0 0 1 1 1l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8a1 1 0 0 1 1-1h2Zm2 0h4V6a2 2 0 1 0-4 0v1Z" />
    </svg>
  );
}
function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 1 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" />
    </svg>
  );
}
function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M4 4h16l1 5H3l1-5Zm0 7h16v9H4v-9Zm4 2v5h2v-5H8Z" />
    </svg>
  );
}
function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M4 4h16v12H7l-3 4V4Zm4 4v2h8V8H8Zm0 4v2h5v-2H8Z" />
    </svg>
  );
}
function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M22 7.5a6.5 6.5 0 0 1-8.4 6.2l-6.2 6.2-2.1-2.1 6.2-6.2A6.5 6.5 0 1 1 22 7.5ZM15.5 5A2.5 2.5 0 1 0 18 7.5 2.5 2.5 0 0 0 15.5 5Z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M3 3h2v18H3V3Zm4 12h2v6H7v-6Zm4-8h2v14h-2V7Zm4 4h2v10h-2V11Zm4-6h2v16h-2V5Z" />
    </svg>
  );
}

