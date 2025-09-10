// apps/web/src/components/ui/Sidebar.tsx
import { getCurrentUser } from "@/lib/auth";
import SidebarClient from "@/components/ui/SidebarClient";

export const dynamic = "force-dynamic";

export default async function Sidebar() {
  const user = await getCurrentUser();
  const role = (user?.role ?? "viewer").toLowerCase();
  const email = user?.email ?? null;

  if (typeof (SidebarClient as any) !== "function") {
    console.error("SidebarClient import is not a function:", SidebarClient);
    throw new Error("SidebarClient import failed (undefined). Check export/import.");
  }

  return <SidebarClient role={role} email={email} />;
}
