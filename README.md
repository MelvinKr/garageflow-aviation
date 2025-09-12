READ.ME
---

````markdown
# GarageFlow Aviation

Application MRO (Maintenance, Repair & Overhaul) pour la gestion d’un hangar aéronautique.  
Objectif : digitaliser **inventaire → achats → devis → ordres de travail → traçabilité** avec **Supabase** (DB + Auth + Storage).

---

## 🚀 Fonctionnalités

- **Inventaire** : pièces, seuils min, mouvements (IN / OUT / ADJUST / RECEIVE), historique complet.  
- **Achats (PO)** : création, suivi des statuts, réception partielle ou complète.  
- **Devis (Quotes)** : workflow DRAFT → SENT → APPROVED, génération automatique de Work Orders.  
- **Ordres de travail (WO)** : tâches, réservations et consommations de pièces, QA, clôture.  
- **Référentiels** : flotte (aircraft), clients, fournisseurs, compatibilité pièces↔avions.  
- **Documents (Attachments)** : certificats, photos, rapports (PDF, JPG, PNG).  
- **Dashboard** : KPIs stock, POs à recevoir, devis en attente, WOs par statut.  
- **Rôles & Sécurité** : Tech / Manager / Admin via Supabase Auth + RLS.

---

## 🏗️ Stack

- **Frontend** : Next.js 15 (App Router), React Query, Tailwind CSS  
- **Backend** : Route Handlers Next.js (API sécurisées)  
- **Base de données** : PostgreSQL (Supabase) avec RLS  
- **Auth** : Supabase Auth (profiles.role)  
- **Storage** : Supabase Storage (fichiers privés avec URLs signées)  
- **Validation** : Zod  
- **Tests** : Playwright (E2E), Vitest (unit/integration)

---

## ⚙️ Installation

### Prérequis
- Node.js ≥ 20  
- pnpm ≥ 9  
- Compte Supabase avec DB provisionnée

### Étapes
```bash
git clone https://github.com/<user>/garageflow-aviation.git
cd garageflow-aviation
pnpm install
````

Créer `apps/web/.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

SUPABASE_SERVICE_ROLE=<service-role-key>   # uniquement côté serveur
NEXTAUTH_SECRET=<random-long-secret>
```

Lancer en développement :

```bash
pnpm --filter web dev
```

Build & run :

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
 │   ├─ lib/supabase/     # Clients Supabase (browser / server / types)
 │   ├─ repositories/     # Accès DB (parts, po, quotes, wo, etc.)
 │   ├─ lib/queries.ts    # Hooks React Query
 │   ├─ components/       # UI réutilisable
 │   └─ app/api/          # Routes API (ops sensibles, uploads)
```

---

## 📋 Roadmap

### Phase 0 — Pré-vol

* [ ] Supprimer tous les mocks et flags
* [ ] Vérifier `.env.local`
* [ ] Installer dépendances (@supabase/supabase-js, react-query, zod)

### Phase 1 — Clients Supabase

* [ ] Créer `lib/supabase/browser.ts` et `server.ts`
* [ ] Générer les types Supabase

### Phase 2 — Repositories

* [ ] Implémenter `repositories/*.repo.ts`
* [ ] Ajouter validations Zod

### Phase 3 — React Query

* [ ] Provider global QueryClient
* [ ] Hooks par ressource (useParts, useQuotes, etc.)
* [ ] Toasts succès/erreur

### Phase 4 — Pages

* [ ] `/parts` (liste + mouvements)
* [ ] `/purchase-orders` (réception)
* [ ] `/quotes` (workflow + acceptation → WO)
* [ ] `/work-orders` (tasks, réservations, QA → close)
* [ ] `/aircraft`, `/customers`, `/suppliers`
* [ ] `/attachments` (upload + signed URLs)
* [ ] Dashboard (KPIs + exports)

### Phase 5 — API Routes

* [ ] `/api/parts/[id]/movement`
* [ ] `/api/purchase-orders/[id]/receive`
* [ ] `/api/quotes/[id]/accept`
* [ ] `/api/workorders/[id]/consume`
* [ ] `/api/attachments`

### Phase 6 — Auth & Rôles

* [ ] Middleware Next.js (protection routes)
* [ ] ACL UI (désactiver actions non autorisées)
* [ ] Vérification RLS Supabase

### Phase 7 — RPC

* [ ] Brancher `quote_accept`, `po_receive`, `wo_consume`

### Phase 8 — Tests

* [ ] Unitaires (Zod, calculs)
* [ ] Intégration (API routes)
* [ ] E2E Playwright (flux complet devis → WO → close)

### Phase 9 — Observabilité & Sécurité

* [ ] Logs structurés
* [ ] Headers sécurité (CSP, HSTS)
* [ ] Rate-limit POST sensibles
* [ ] Pagination server-side + index DB

### Phase 10 — Go-Live

* [ ] ENV prod configurés
* [ ] RLS testée (roles Tech/Manager/Admin)
* [ ] Backups DB & Storage validés
* [ ] Smoke test prod OK
* [ ] Runbook rollback prêt

---

## 🧪 Scénario E2E attendu

1. Créer un devis (DRAFT → SENT → APPROVED)
2. Génération auto d’un Work Order avec réservations
3. Consommation d’une pièce (OUT) → décrémente stock
4. Passage en QA → Close
5. Génération rapport stock et export PDF

---

## 🤝 Contribution

* Forker le repo, créer une branche `feature/...`, ouvrir une PR
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
