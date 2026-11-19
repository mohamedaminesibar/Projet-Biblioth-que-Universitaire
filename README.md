# BiblioEST — Médiathèque Universitaire Intelligente

Application de consultation, de réservation avec file d'attente FIFO et de supervision des emprunts pour les étudiants et responsables de l'**École Supérieure de Technologie (EST)** — Université Sidi Mohamed Ben Abdellah.

---

## 1. Stack Technique Full-Stack

* **Backend :** Node.js 22 LTS + Express 4 + TypeScript 5.7
* **Frontend :** React 19 + TypeScript + Vite 8
* **Styling & Design System :** Tailwind CSS v4 + Tokens personnalisés (Turquoise, Ivoire, Corail)
* **Intégration LLM :** `@google/genai` (Gemini 3.8 Flash) pour les conseils d'études et la rédaction graduée des rappels
* **Validation & Sécurité :** Zod schemas, RBAC étanche, Verrouillage transactionnel anti-double allocation
* **Tests & Qualité :** Vitest (15 tests unitaires et d'intégration validés) + `tsc --noEmit`

---

## 2. Documentation des Endpoints REST (`/api/*`)

| Méthode | Endpoint | Rôle Requis | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | Public | Vérification de l'état du serveur Express |
| `GET` | `/api/books` | Authentifié | Recherche, filtre par discipline et tri du catalogue (lecture seule) |
| `GET` | `/api/books/:id` | Authentifié | Fiche détaillée d'un ouvrage |
| `GET` | `/api/books/:id/copies` | Authentifié | Liste des exemplaires physiques et statuts en rayon |
| `GET` | `/api/books/:id/similar` | Authentifié | Recommandations d'ouvrages similaires |
| `GET` | `/api/loans` | Authentifié | Liste des emprunts (filtré par étudiant ou tous pour le responsable) |
| `POST` | `/api/loans/borrow` | `student` | Emprunt physique avec verrou de concurrence et contrôle des quotas |
| `POST` | `/api/loans/:id/return` | `librarian` | Clôture de l'emprunt et attribution automatique à la file FIFO |
| `GET` | `/api/reservations` | Authentifié | Consultation des réservations actives (filtré par étudiant ou livre) |
| `POST` | `/api/reservations` | `student` | Inscription en file d'attente FIFO pour un ouvrage épuisé |
| `DELETE`| `/api/reservations/:id` | `student` / `lib` | Annulation d'une réservation avec ré-indexation des rangs |
| `GET` | `/api/dashboard/stats` | `librarian` | Métriques opérationnelles (Total, À l'heure, Jaune, Orange, Rouge) |
| `GET` | `/api/notifications` | Authentifié | Consultation du registre des notifications |
| `POST` | `/api/notifications/send`| `librarian` | Émission d'une relance graduée vers un étudiant |
| `POST` | `/api/notifications/read-all`| Authentifié | Marquer les alertes comme lues |
| `GET` | `/api/history` | Authentifié | Consultation des dernières recherches personnelles |
| `POST` | `/api/history` | Authentifié | Enregistrement d'une requête de recherche |
| `DELETE`| `/api/history` | Authentifié | Purge de l'historique personnel |
| `POST` | `/api/ai/study-path` | Authentifié | Conseils méthodologiques et concepts clés générés par Gemini |
| `POST` | `/api/ai/draft-notification`| Authentifié | Génération automatique du texte selon la sévérité du retard |

---

## 3. Commandes du Projet

```bash
# Lancement de l'application en développement (Express API + Vite middleware)
npm run dev

# Exécution des 15 tests automatisés (Règles métier, FIFO, RBAC, Transactions)
npm test

# Contrôle strict des types TypeScript
npm run lint

# Build de production
npm run build

# Lancement en production
npm start
```
