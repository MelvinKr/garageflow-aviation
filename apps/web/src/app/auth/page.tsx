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

  async function login() {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      r.push(next);
    } catch (e: any) {
      console.error("Login error:", e);
      alert(e?.message || e || "Login failed");
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
      <input className="border rounded px-2 py-1 w-full" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border rounded px-2 py-1 w-full" type="password" placeholder="mot de passe" value={pass} onChange={e=>setPass(e.target.value)} />
      <div className="flex gap-2">
        <button className="px-3 py-1 border rounded" onClick={login}>Se connecter</button>
        <button className="px-3 py-1 border rounded" onClick={signup}>Créer un compte</button>
      </div>
      <p className="text-xs text-gray-500">
        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MANQUANTE"} • KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "OK" : "MANQUANTE"}
      </p>
    </section>
  );
}

