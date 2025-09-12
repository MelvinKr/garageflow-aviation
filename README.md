---

````markdown
# ✈ GarageFlow Aviation

Application MRO (Maintenance, Repair & Overhaul) pour la gestion d’un hangar aéronautique.  
Objectif : digitaliser **inventaire → achats → devis → ordres de travail → traçabilité** avec **Supabase** comme backend (DB + Auth + Storage).

---

## 🚀 Fonctionnalités
- **Inventaire** : pièces, seuils min, mouvements (IN/OUT/ADJUST/RECEIVE), historique complet.
- **Achats (PO)** : création, suivi des statuts, réception partielle/complète.
- **Devis (Quotes)** : workflow DRAFT → SENT → APPROVED, génération automatique de Work Orders.
- **Ordres de travail (WO)** : tâches, réservations/consommations de pièces, QA, clôture.
- **Référentiels** : flotte (aircraft), clients, fournisseurs, compatibilité pièces↔avions.
- **Documents (Attachments)** : certificats, photos, rapports (PDF/JPG/PNG).
- **Dashboard** : KPIs stock, POs à recevoir, devis en attente, WOs par statut.
- **Rôles & Sécurité** : Tech / Manager / Admin via Supabase Auth + RLS.

---

## 🏗️ Stack
- **Frontend** : Next.js 15 (App Router), React Query, Tailwind.
- **Backend** : Route Handlers Next.js (Server Actions + API sécurisées).
- **Database** : PostgreSQL (Supabase) avec RLS activé.
- **Auth** : Supabase Auth (profiles.role).
- **Storage** : Supabase Storage (attachments privés via signed URLs).
- **Validation** : Zod.
- **Tests** : Playwright (E2E), Vitest (unit/integration).

---

## ⚙️ Installation

### Prérequis
- Node.js >= 20
- pnpm >= 9
- Compte Supabase avec DB provisionnée (schéma déjà créé et peuplé)

### Cloner & installer
```bash
git clone https://github.com/<user>/garageflow-aviation.git
cd garageflow-aviation
pnpm install
````

### Variables d’environnement

Créer `apps/web/.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Serveur uniquement
SUPABASE_SERVICE_ROLE=<service-role-key>
NEXTAUTH_SECRET=<long-random-secret>
```

### Lancer en dev

```bash
cd apps/web
pnpm dev
```

### Build & start

```bash
pnpm build
pnpm start
```

---

## 📂 Structure

```
apps/web/
 ├─ src/
 │   ├─ app/              # Pages Next.js
 │   ├─ lib/supabase/     # Clients Supabase (browser/server/types)
 │   ├─ repositories/     # Accès DB (parts, po, quotes, wo, etc.)
 │   ├─ lib/queries.ts    # Hooks React Query
 │   ├─ components/       # UI réutilisable
 │   └─ app/api/          # Routes API serveur (ops sensibles, uploads)
```

---

## 📋 Roadmap d’intégration (Supabase → App)

### Phase 0 — Pré-vol

* [ ] Supprimer tous les mocks (`mock/`, flags, fixtures).
* [ ] Vérifier `.env.local` (Supabase URL/keys).
* [ ] Installer dépendances (@supabase/supabase-js, react-query, zod).

### Phase 1 — Clients Supabase

* [ ] `lib/supabase/browser.ts`, `server.ts`, (optionnel) `admin.ts`.
* [ ] Générer types Supabase.

### Phase 2 — Repositories

* [ ] Créer `repositories/*.repo.ts` (parts, purchaseOrders, quotes, workOrders, aircraft, customers, suppliers, attachments).
* [ ] Ajouter validations Zod.

### Phase 3 — React Query

* [ ] Provider global `QueryClientProvider`.
* [ ] Hooks par ressource (useParts, useQuotes, useWorkOrders…).
* [ ] Gestion toasts succès/erreur.

### Phase 4 — Intégration Pages

* [ ] `/parts` (liste + mouvements).
* [ ] `/purchase-orders` (réception partielle/complète).
* [ ] `/quotes` (workflow, acceptation → WO).
* [ ] `/work-orders` (tasks, réservations, consommations, QA → close).
* [ ] `/aircraft`, `/customers`, `/suppliers` (CRUD simples).
* [ ] `/attachments` (uploads + liens signés).
* [ ] `Dashboard` (KPIs & exports).

### Phase 5 — API Routes sécurisées

* [ ] `/api/parts/[id]/movement`
* [ ] `/api/purchase-orders/[id]/receive`
* [ ] `/api/quotes/[id]/accept`
* [ ] `/api/workorders/[id]/consume`
* [ ] `/api/attachments` (uploads privés)

### Phase 6 — Auth & Rôles

* [ ] Middleware Next.js (protection routes).
* [ ] UI ACL (désactiver actions non autorisées).
* [ ] Vérifier RLS Supabase cohérente.

### Phase 7 — RPC Métier

* [ ] Brancher `quote_accept`, `po_receive`, `wo_consume`.

### Phase 8 — Tests

* [ ] Unitaires (Zod, calculs).
* [ ] Intégration (API routes).
* [ ] E2E Playwright (flux complet devis→WO→close).

### Phase 9 — Observabilité & Sécurité

* [ ] Logs structurés.
* [ ] Headers sécurité (CSP, HSTS).
* [ ] Rate-limiting sur POST sensibles.
* [ ] Pagination server-side + index DB.

### Phase 10 — Go-Live

* [ ] ENV prod configurés.
* [ ] RLS testée (roles Tech/Manager/Admin).
* [ ] Backups DB & Storage validés.
* [ ] Smoke test prod OK.
* [ ] Runbook rollback prêt.

---

## 🧪 Scénario E2E attendu

1. Créer un devis (DRAFT → SENT → APPROVED).
2. Vérifier création auto d’un WO avec réservations.
3. Consommer une pièce (OUT) → stock mis à jour.
4. Passer WO en QA → Close.
5. Générer rapport stock et export PDF.

---

## 🤝 Contribution

* Fork, branche `feature/...`, puis PR.
* Vérifier lint & tests :

  ```bash
  pnpm lint
  pnpm test
  pnpm e2e
  ```

---

## 📜 Licence

MIT – usage libre et adaptation.

```

---
