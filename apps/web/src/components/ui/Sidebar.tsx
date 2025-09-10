// apps/web/src/components/ui/Sidebar.tsx
import SidebarClient from "@/components/ui/SidebarClient"; // import ABSOLU
import { getCurrentUser } from "@/lib/auth";
import NextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

export default async function Sidebar() {
  const user = await getCurrentUser();
  const role = (user?.role ?? "viewer").toLowerCase();
  const email = user?.email ?? null;

  // Fallback: if bundler returns an invalid import during dev, force dynamic client import
  const Imported: any = SidebarClient as any;
  if (typeof Imported !== "function") {
    const Dyn = NextDynamic(() => import("@/components/ui/SidebarClient"), { ssr: false });
    return <Dyn role={role} email={email} />;
  }

  return <Imported role={role} email={email} />;
}
