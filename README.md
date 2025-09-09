# ✈️ GarageFlow Aviation

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=nextdotjs)](https://nextjs.org/) 
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue?style=flat&logo=tailwindcss)](https://tailwindcss.com/) 
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/) 
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-lightgrey?style=flat&logo=vercel)](https://turbo.build/)

> **GarageFlow Aviation** est un projet SaaS / PWA conçu pour digitaliser la gestion d’un hangar MRO (Maintenance, Repair & Overhaul) aviation.  
> L’objectif est un outil **offline-first**, simple, robuste, avec une **vision temps réel** des stocks, devis, clients et réparations.

---

## 🚀 Fonctionnalités

- 📦 **Inventaire intelligent** (pièces avec certificats, fournisseurs, seuils mini, coûts).
- 🛩️ **Gestion flotte** (heures, cycles, maintenances prévues).
- 👥 **Clients & fournisseurs** (contacts, termes de paiement, historique).
- 🧾 **Devis** (pièces + main d’œuvre, totaux calculés automatiquement).
- 🛠️ **Work Orders (réparations)** avec tâches et suivi des pièces consommées.
- 📊 **Dashboard** avec KPIs (valeur du stock, WO en cours, devis envoyés, etc.).

### Inventaire (Phase 1)
- Filtres: recherche (nom/SKU), catégorie, certificat, et filtre rapide "Bas stock".
- Tri multi-colonnes (Shift-clic) avec indicateurs de priorité.
- Drawer de détail pièce: certificat, traçabilité (batch/série/péremption), compat, fournisseur (lookup), réservé éditable, disponible calculé.
- Mouvement stock: formulaire (±, motif, note, attachement mock), règle anti-négatif, historique local (localStorage + mémoire).
- Quantité effective = quantité mock + mouvements locaux (persistés dans localStorage).
- Export CSV de la liste filtrée/triée.
- Totaux: nombre d’articles, quantité totale et valeur stock (CAD).
- Dashboard: widget "À commander" (top 5 sous seuil) avec lien vers /parts?low=1.

### UI
- Sidebar sombre avec icônes et état actif.
- Cartes KPI avec icônes (Dashboard) et formatage fr-CA.
- Tables polies: header sticky, séparation douce, cartes arrondies.

---

## 📂 Structure du projet

```
apps/web/
src/
app/ # Pages Next.js (App Router)
components/ # Composants UI (tables, stat cards…)
lib/ # mock.ts (helpers)
mock/ # Jeux de données factices (JSON)
```

---

## 📦 Jeux de données inclus

- **parts.json** → inventaire détaillé (15 pièces, certificats, traçabilité, fournisseurs).
- **aircraft.json** → flotte de 6 avions avec heures, cycles et maintenances prévues.
- **customers.json** → 5 clients (clubs, privés, charters).
- **suppliers.json** → 7 fournisseurs aéronautiques.
- **quotes.json** → devis détaillés (pièces + MO, statuts).
- **workorders.json** → réparations en cours (WO actifs).

---

## ▶️ Installation & Lancement

```bash
# depuis la racine du repo
cd apps/web
npm install
npm run dev
```

L’application sera dispo sur 👉 http://localhost:3000

---

## 🛣️ Avancement Roadmap (Septembre 2025 – Mise à jour)

### ✅ Phase 0 – Socle & DX (terminée)
- Monorepo Turborepo + workspaces OK
- Next.js 15 + Tailwind configurés
- Composants communs (`DataTable`, `StatCard`)
- Jeux de données mock enrichis
- Dashboard avec KPIs basiques

### 🔶 Phase 1 – Inventaire (en cours, ~70%)
- [x] Liste pièces + filtres, badges low-stock
- [x] Widget Dashboard “À commander”
- [x] Drawer détail pièce (édition inline, certificat, photo, commande fournisseur)
- [ ] Historique des mouvements stock (entrées/sorties mockées)
- [ ] Réservation liée aux devis/WO (sera finalisée en phase 3)

### ⏳ Phase 2 – Avions & Clients/Fournisseurs (à démarrer)
- [ ] Liste avions (immat, type, heures, maintenances dues)
- [ ] Drawer avion (timeline interventions + devis/WO liés)
- [ ] Liste clients (coordonnées, appareils liés)
- [ ] Liste fournisseurs (coordonnées, pièces associées)

### ⏳ Phase 3 – Devis & Work Orders (non implémenté)
- [ ] Création devis (pièces + MO + remise + taxes)
- [ ] Calculs auto des totaux
- [ ] Acceptation → génération WO lié
- [ ] Réservation auto de pièces à l’acceptation
- [ ] Consommation de pièces à la complétion d’une tâche
- [ ] Export PDF de devis et WO

### ⏳ Phase 4 – DB Cloud (Supabase/Drizzle)
- [ ] Schéma Drizzle + migrations
- [ ] Seed initial depuis les mocks
- [ ] Auth Supabase (email/password)
- [ ] API sécurisées `/api/parts`, `/api/quotes`, `/api/workorders`
- [ ] Repository toggle (mock | db)

### ⏳ Phase 5 – Offline-first
- [ ] PWA manifest + service worker
- [ ] IndexedDB local (parts, quotes, workorders)
- [ ] Queue d’actions offline (create/update)
- [ ] Synchronisation automatique au retour réseau
- [ ] UI status (Offline, Syncing, Conflit)

### ⏳ Phase 6 – Fiches de révision automatiques
- [ ] Templates par type d’avion (50h/100h/annuelle)
- [ ] Génération WO prérempli depuis template
- [ ] Réservation pièces auto
- [ ] Export PDF révision + signatures

### ⏳ Phase 7 – Rapports & Prévisions (IA lite)
- [ ] Rapports stock (valeur, ruptures, rotation)
- [ ] Rapports devis (conversion, délais)
- [ ] Rapports WO (temps moyen, top pièces)
- [ ] Prévisions (EMA → seuils dynamiques, cashflow)
- [ ] Dashboard graphique interactif
- [ ] Export XLSX/PDF

### ⏳ Phase 8 – Polish UX/Perf/Sécu
- [ ] Empty states, skeletons, toasts, raccourcis clavier
- [ ] Accessibilité (contrast, roles ARIA, navigation clavier)
- [ ] Performance (pagination, virtualisation tables)
- [ ] Sécurité (RLS Supabase, audit logs mouvements)
- [ ] Observabilité (logs, Sentry, métriques)

---

**Décision GO/NOGO (Septembre 2025) :**
- 🟢 **GO interne** → base stable, inventaire fonctionnel en démo.  
- 🔴 **NOGO client** → bloquant tant que les phases 2 & 3 ne sont pas implémentées.

---

## 👨‍💻 Tech Stack

- Next.js 15 (App Router)
- TailwindCSS pour le style
- TypeScript pour la sécurité de code
- Turborepo pour le monorepo
- JSON mocks pour les jeux de données

---

## 📸 Aperçu

(screenshots ou GIFs à ajouter ici quand l’UI sera prête)

---

## 📄 Licence

Projet interne démo
### Data backend
L’app supporte deux backends :

- `NEXT_PUBLIC_DATA_BACKEND=MOCK` (par défaut) : tout en mémoire via Zustand + JSON.
- `NEXT_PUBLIC_DATA_BACKEND=DB` : persistance Postgres (Drizzle).

Pour activer la DB :
1. Renseigner `DATABASE_URL` (Supabase ou Postgres).
2. Lancer les migrations (à créer ensuite) et le script de seed :
   ```bash
   pnpm ts-node apps/web/scripts/seed.ts
   ```
