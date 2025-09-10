import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import RoleRow from "./role-row";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.user_metadata as any)?.role ?? "user";
  if (role !== "admin") return <p className="p-6 text-red-600">Accès admin requis.</p>;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/users`, { cache: "no-store" });
  const { users } = await res.json();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Gestion des rôles</h1>
      <div className="rounded border divide-y bg-white">
        <div className="grid grid-cols-4 gap-2 p-3 text-sm font-medium">
          <div>Email</div><div>Rôle</div><div>Dernière connexion</div><div>Action</div>
        </div>
        {users.map((u: any) => <RoleRow key={u.id} u={u} />)}
      </div>
    </div>
  );
}

