"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  const r = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function login() {
    try {
      setErr(null);
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      // Fallback: set a lightweight cookie so middleware lets us through if using client-only auth
      if (typeof document !== "undefined") {
        const hasCookie = document.cookie.includes("sb-access-token=") || document.cookie.includes("sb:token=");
        if (!hasCookie) document.cookie = `sb-access-token=ok; path=/; SameSite=Lax`;
      }
      r.push(next);
    } catch (e: any) {
      console.error("Login error:", e);
      setErr(e?.message || String(e) || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function signup() {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      alert(
        data.user?.confirmed_at
          ? "Compte créé."
          : "Compte créé. Vérifie ton email pour confirmer."
      );
    } catch (e: any) {
      console.error("Signup error:", e);
      alert(e?.message || e || "Signup failed");
    }
  }

  return (
    <section className="p-6 max-w-sm space-y-3">
      <h1 className="text-xl font-semibold">Connexion</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) void login();
        }}
        className="space-y-3"
      >
        <input className="border rounded px-2 py-1 w-full" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" type="password" placeholder="mot de passe" value={pass} onChange={e=>setPass(e.target.value)} />
        <div className="flex gap-2">
          <button type="submit" className="px-3 py-1 border rounded" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
          <button type="button" className="px-3 py-1 border rounded" onClick={signup}>Créer un compte</button>
        </div>
        {err && <p className="text-xs text-red-600">{err}</p>}
      </form>
      <p className="text-xs text-gray-500">
        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MANQUANTE"} • KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "OK" : "MANQUANTE"}
      </p>
    </section>
  );
}
