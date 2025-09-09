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
- Drawer de détail pièce avec formulaire "Mouvement stock" (±, motif, pièce jointe mock) et historique local.
- Quantité effective = quantité mock + mouvements locaux (persistés dans localStorage).
- Export CSV de la liste filtrée/triée.
- Totaux: nombre d’articles, quantité totale et valeur stock (CAD).

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

## 🛣️ Roadmap

- 🔗 Connexion à Supabase/Drizzle (DB cloud).
- 📶 Mode offline-first avec synchronisation automatique.
- 📑 Génération de fiches de révision automatiques.
- 🤖 Rapports financiers et prévisions avec IA.

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
