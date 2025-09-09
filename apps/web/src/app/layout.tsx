import "./globals.css";
import type { ReactNode } from "react";
import { SidebarNav } from "@/components/SidebarNav";

export const metadata = { title: "GarageFlow Aviation" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex bg-neutral-50 text-slate-900">
        <SidebarNav />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
