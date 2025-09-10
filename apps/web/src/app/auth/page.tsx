"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return alert(error.message);
    r.push("/");
  }

  async function signup() {
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) return alert(error.message);
    alert("Vérifie ton email pour confirmer.");
  }

  return (
    <section className="p-6 max-w-sm space-y-3">
      <h1 className="text-xl font-semibold">Connexion</h1>
      <input
        className="border rounded px-2 py-1 w-full"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1 w-full"
        type="password"
        placeholder="mot de passe"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      <div className="flex gap-2">
        <button className="px-3 py-1 border rounded" onClick={login}>
          Se connecter
        </button>
        <button className="px-3 py-1 border rounded" onClick={signup}>
          Créer un compte
        </button>
      </div>
    </section>
  );
}

