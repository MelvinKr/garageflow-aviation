import "./globals.css";
import type { ReactNode } from "react";
import SidebarServer from "@/components/SidebarServer";
import { ToastProvider } from "@/components/ui/useToast";
import ToastContainer from "@/components/ui/ToastContainer";
import OutboxMount from "@/components/OutboxMount";
import UserNav from "@/components/UserNav";

export const metadata = { title: "GarageFlow Aviation" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
      </head>
      <body className="min-h-screen flex bg-neutral-50 text-slate-900">
        <ToastProvider>
          <OutboxMount />
          <SidebarServer />
          <main className="flex-1 min-h-screen">
            <header className="h-12 border-b flex items-center justify-between px-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50">
              <div className="font-semibold">GarageFlow</div>
              <UserNav />
            </header>
            {children}
          </main>
          <ToastContainer />
        </ToastProvider>
        <script dangerouslySetInnerHTML={{__html: `
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(()=>{}));
}
`}} />
      </body>
    </html>
  );
}
