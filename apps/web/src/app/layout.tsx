import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = { title: "GarageFlow Aviation" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex bg-neutral-50">
        <aside className="w-60 border-r bg-white">
          <div className="p-4 font-semibold">GarageFlow</div>
          <nav className="flex flex-col gap-1 p-2">
            {([
              ["/", "Dashboard"],
              ["/parts", "Pièces"],
              ["/aircraft", "Avions"],
              ["/customers", "Clients"],
              ["/suppliers", "Fournisseurs"],
              ["/quotes", "Devis"],
              ["/workorders", "Réparations"],
            ] as const).map(([href, label]) => (
              <Link key={href} href={href} className="px-3 py-2 rounded hover:bg-neutral-100">
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
