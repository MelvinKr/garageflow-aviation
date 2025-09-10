"use client";
import { useState, useTransition } from "react";

const ROLES = ["user", "manager", "admin"] as const;

export default function RoleRow({ u }: { u: any }) {
  const [r, setR] = useState<string>(u.role ?? "user");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string>("");

  const save = () => start(async () => {
    setMsg("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id, role: r }),
    });
    if (!res.ok) setMsg((await res.json()).error ?? "Erreur");
    else setMsg("✅");
  });

  return (
    <div className="grid grid-cols-4 gap-2 p-3 items-center text-sm">
      <div className="truncate">{u.email}</div>
      <div>
        <select className="border rounded px-2 py-1" value={r} onChange={(e) => setR(e.target.value)}>
          {ROLES.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>
      <div>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}</div>
      <div className="flex items-center gap-2">
        <button onClick={save} disabled={pending} className="px-3 py-1 rounded border">
          {pending ? "…" : "Enregistrer"}
        </button>
        {msg && <span>{msg}</span>}
      </div>
    </div>
  );
}

