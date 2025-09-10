// apps/web/src/components/ui/Sidebar.tsx
import SidebarClient from "@/components/ui/SidebarClient"; // import ABSOLU
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Sidebar() {
  const user = await getCurrentUser();
  const role = (user?.role ?? "viewer").toLowerCase();
  const email = user?.email ?? null;

  return <SidebarClient role={role} email={email} />;
}
