import './globals.css';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Garageflow Aviation',
  description: 'PWA MRO aviation — offline-first',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#111827" />
      </head>
      <body className="min-h-dvh bg-gray-50 text-gray-900 antialiased">
        <header className="bg-white border-b">
          <nav className="mx-auto max-w-5xl flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
            <Link className="font-semibold" href="/">Dashboard</Link>
            <Link href="/parts">Pièces</Link>
            <Link href="/aircraft">Avions</Link>
            <Link href="/customers">Clients</Link>
            <Link href="/suppliers">Fournisseurs</Link>
            <Link href="/quotes">Devis</Link>
            <Link href="/workorders">Réparations</Link>
            <a className="ml-auto text-gray-500 hover:text-gray-700" href="/manifest.json" target="_blank">PWA</a>
          </nav>
        </header>
        <div className="mx-auto max-w-5xl p-6">{children}</div>
      </body>
    </html>
  );
}
