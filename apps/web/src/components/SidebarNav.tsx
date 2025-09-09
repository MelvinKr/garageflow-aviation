"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links: Array<[href: string, label: string]> = [
  ["/", "Dashboard"],
  ["/parts", "Pièces"],
  ["/aircraft", "Avions"],
  ["/customers", "Clients"],
  ["/suppliers", "Fournisseurs"],
  ["/quotes", "Devis"],
  ["/workorders", "Réparations"],
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-slate-800 text-slate-200 min-h-screen">
      <div className="p-4 text-lg font-semibold tracking-tight">GarageFlow</div>
      <nav className="flex flex-col gap-1 p-2 text-sm">
        {links.map(([href, label]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-md transition-colors ${
                active
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

