# 📦 Système de Gestion de Stock en Temps Réel // INFODIX

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Demo-Live_Preview-emerald?style=for-the-badge&logo=googlechrome&logoColor=black)](https://anass-elkh.github.io/stock-management-infodix/)

Application web complète de gestion d'inventaire et de suivi des flux logistiques en temps réel, développée dans le cadre de mon stage chez **INFODIX SARL**.

---

## 📌 Présentation & Enjeux

Dans un environnement de distribution de matériel informatique et réseaux, la traçabilité des mouvements d'entrée/sortie et l'automatisation des alertes de rupture sont critiques pour la performance opérationnelle.

La solution conçue pour **INFODIX SARL** permet :
- La centralisation du catalogue produits et des numéros de série (SKUs).
- L'enregistrement instantané des entrées, sorties et transferts d'entrepôt.
- Le suivi des fournisseurs partenaires et des ordres de réapprovisionnement.
- La réduction des erreurs de saisie manuelle grâce à une interface ergonomique et réactive.
- La génération d'indicateurs de valorisation de stock et d'alertes seuils critiques en temps réel.

---

## ⚙️ Fonctionnalités Clés

1. **📊 Tableau de Bord Décisionnel & KPIs**
   - Calcul dynamique de la valeur totale du stock en magasin.
   - Compteur en direct des références actives et des seuils d'alerte critique.
   - Répartition par familles technologiques (Infrastructure, Réseau, Sécurité, Stockage, Énergie).

2. **📦 Gestion Centralisée du Catalogue Produits**
   - Fiches articles détaillées : SKU unique, emplacement physique en rayon/baie, prix unitaire, stock minimum.
   - Ajustements rapides de stock en un clic (+1 Entrée / -1 Sortie).
   - Filtrage multi-critères et recherche instantanée sans rechargement de page.

3. **🔄 Journal d'Audit & Traçabilité des Mouvements**
   - Historisation complète et immuable de chaque flux : type (Entrée, Sortie, Transfert), quantité, date/heure, opérateur et numéro de bon de livraison / ordre de travail.

4. **🤝 Gestion des Fournisseurs**
   - Répertoire des distributeurs officiels avec notation de fiabilité, coordonnées et suivi des commandes en cours.

---

## 🏗️ Architecture Technique

```
┌───────────────────────────────────────────────┐
│              Frontend SPA (React)             │
│        Tailwind CSS + Lucide Icons + Vite     │
└───────────────────────┬───────────────────────┘
                        │ API REST (JSON)
┌───────────────────────▼───────────────────────┐
│           Backend API (Node.js/Express)       │
│           Middleware Auth + Validation        │
└───────────────┬───────────────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
┌───────────────┐ ┌───────────────┐
│  Redis Cache  │ │  PostgreSQL   │
│  (Sessions &  │ │  (Inventaire, │
│  Quotas Fast) │ │  Audit Logs)  │
└───────────────┘ └───────────────┘
```

- **Frontend** : Single Page Application (SPA) réactive bâtie avec **React 18** et **TypeScript**.
- **Backend** : API REST structurée en **Node.js** avec **Express**.
- **Mise en cache** : **Redis** pour l'accélération des requêtes d'inventaire récurrentes.
- **Persistance des données** : **PostgreSQL** avec contraintes d'intégrité référentielle et déclencheurs (`Triggers`) d'audit.
- **Déploiement conteneurisé** : Environnement complet reproductible via **Docker Compose**.

---

## 🚀 Installation & Démarrage Rapide

### Option A : Déploiement Conteneurisé avec Docker
```bash
git clone https://github.com/Anass-elkh/stock-management-infodix.git
cd stock-management-infodix
docker-compose up --build
```
- L'application web sera disponible sur `http://localhost:3000`.
- L'API REST sera accessible sur `http://localhost:5000`.

### Option B : Démarrage Local (Mode Développement)
```bash
# 1. Cloner le projet
git clone https://github.com/Anass-elkh/stock-management-infodix.git
cd stock-management-infodix

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

---

## 👨‍💻 Auteur

**EL Kharbaoui Anass**  
*Ingénieur d'État en Génie Informatique — ENSA Fès*  
Stage Développeur Full Stack — INFODIX SARL (Juillet 2025 – Septembre 2025)
