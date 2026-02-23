# Fonctionnalité Tableau de bord admin (frontend)

**Ce document explique la fonctionnalité Tableau de bord admin d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

Le tableau de bord admin donne aux **utilisateurs admin** un aperçu (cartes de statistiques et graphique de croissance), **gestion des utilisateurs** (liste paginée avec filtre de rôle, actions suspendre/supprimer optionnelles, feuille de détails utilisateur), **gestion des missions** (liste de toutes les missions avec filtre de statut optionnel), et **résolution de litiges** (liste des litiges, résoudre avec texte de résolution). Les routes admin sont enveloppées dans la mise en page protégée admin (rôle admin). La page Paramètres inclut des bascules et un espace réservé pour les notifications.

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/app/(admin)/admin/dashboard/page.tsx` | Cartes de statistiques, graphique de croissance (revenus/utilisateurs) |
| `frontend/app/(admin)/admin/users/page.tsx` | Liste d'utilisateurs, filtre de rôle, pagination, suspendre/supprimer, feuille de détails utilisateur |
| `frontend/app/(admin)/admin/missions/page.tsx` | Liste de missions, filtre de statut |
| `frontend/app/(admin)/admin/disputes/page.tsx` | Liste de litiges, boîte de dialogue de résolution, boîte de dialogue de détails |
| `frontend/app/(admin)/admin/settings/page.tsx` | Bascules Stripe/Google Maps, espace réservé notifications |
| `frontend/app/(admin)/layout.tsx` | ProtectedLayout(role="admin") |
| `frontend/lib/api/endpoints.ts` | adminApi.stats, users, missions, disputes, resolveDispute, userAction |
| `frontend/lib/utils/format.ts` | formatCurrency, formatDate |
| `frontend/lib/i18n` | useTranslation |
| UI : Card, Table, Chart (recharts), Dialog, Sheet, Select, etc. |

---

## 3. Explication fichier par fichier

### `frontend/app/(admin)/admin/dashboard/page.tsx`

- **Ce qu'il fait :** Récupère les statistiques admin et affiche 4 cartes et un graphique en barres pour la croissance.
- **Requête :** useQuery(['admin-stats'], () => adminApi.stats().then(r => r.data)). total_users, active_missions, revenue depuis stats ; growth = stats?.growth ?? [] (tableau de { month, users, revenue }).
- **Graphique :** chartData = growth mappé avec formatMonthLabel(month, locale). growthPercent = (last - secondLast) / secondLast pour revenue. BarChart avec month, users, revenue (ou similaire). Cartes : total utilisateurs, missions actives, revenus, % de croissance.
- **Backend :** GET /admin/stats retourne { total_users, active_missions, revenue, growth }.

### `frontend/app/(admin)/admin/users/page.tsx`

- **Ce qu'il fait :** Liste d'utilisateurs paginée avec filtre de rôle, voir détails (feuille), et actions suspendre/supprimer.
- **Requête :** useQuery(['admin-users', roleFilter, page, limit], () => adminApi.users({ role, page, limit }).then(r => r.data). data a data (utilisateurs), total, page, limit.
- **Mutations :** suspendMutation(userId) → adminApi.userAction(userId, 'suspend'). deleteMutation(userId) → adminApi.userAction(userId, 'delete'). Les deux invalident ['admin-users'].
- **UI :** Sélection de rôle (all, client, partner, admin). Tableau : email, rôle, nom, created_at, actions (Voir, Suspendre, Supprimer). Feuille pour les détails utilisateur. Pagination (page, limit) avec prev/next.
- **Backend :** GET /admin/users?role=&page=&limit retourne { data, total, page, limit }. PATCH /admin/users/:id/suspend et .../delete peuvent exister ou être ébauchés.

### `frontend/app/(admin)/admin/missions/page.tsx`

- **Ce qu'il fait :** Liste de toutes les missions avec filtre de statut optionnel.
- **Requête :** useQuery(['admin-missions', statusFilter], () => adminApi.missions({ status }).then(r => r.data)). Tableau des missions (id, client, statut, dates, etc.).
- **Backend :** GET /admin/missions?status= retourne { data, total, page, limit }.

### `frontend/app/(admin)/admin/disputes/page.tsx`

- **Ce qu'il fait :** Liste des litiges, boîte de dialogue de résolution, boîte de dialogue de détails (voir disputes-feature.md).
- **Backend :** GET /admin/disputes, PATCH /admin/disputes/:id/resolve.

### `frontend/app/(admin)/admin/settings/page.tsx`

- **Ce qu'il fait :** Affiche les clés Stripe et Google Maps (masquées), bascules pour activer/désactiver (stockées dans localStorage). Carte Notifications avec espace réservé. Pas d'API directe pour les paramètres ; les bascules affectent uniquement le comportement côté client.

### `frontend/app/(admin)/layout.tsx`

- **Ce qu'il fait :** Enveloppe les routes admin avec ProtectedLayout(role="admin").

### `frontend/lib/api/endpoints.ts` (admin)

- **adminApi.stats()** — GET /admin/stats.
- **adminApi.users(params)** — GET /admin/users avec role, page, limit.
- **adminApi.userAction(userId, action)** — PATCH /admin/users/:userId/:action (par exemple suspend, delete).
- **adminApi.missions(params)** — GET /admin/missions.
- **adminApi.disputes()** — GET /admin/disputes.
- **adminApi.resolveDispute(disputeId, resolution)** — PATCH /admin/disputes/:id/resolve.

---

## 4. Flux utilisateur

1. L'admin se connecte → redirection vers /admin/dashboard. Le tableau de bord charge GET /admin/stats → cartes et graphique de croissance.
2. L'admin ouvre "Utilisateurs" → liste avec filtre de rôle et pagination ; peut voir les détails utilisateur (feuille), suspendre ou supprimer (si le backend le supporte).
3. L'admin ouvre "Missions" → liste avec filtre de statut optionnel.
4. L'admin ouvre "Litiges" → liste ; peut résoudre avec texte de résolution (voir disputes-feature).
5. L'admin ouvre "Paramètres" → bascules et espace réservé notifications.

---

## 5. Comment cela se connecte au backend

- **GET /api/admin/stats** — adminApi.stats(). Backend : requêtes pool pour comptes, revenus, croissance sur 6 mois.
- **GET /api/admin/users** — adminApi.users(). Backend : listUsers avec role, page, limit.
- **PATCH /api/admin/users/:id/suspend|delete** — adminApi.userAction(). Le backend peut ou non implémenter ceux-ci ; le frontend les appelle.
- **GET /api/admin/missions** — adminApi.missions(). Backend : listMissions avec statut optionnel.
- **GET /api/admin/disputes** — adminApi.disputes(). Backend : listDisputes.
- **PATCH /api/admin/disputes/:id/resolve** — adminApi.resolveDispute(). Backend : resolveDispute.

---

## 6. Gestion de l'état

- **TanStack Query :** ['admin-stats'], ['admin-users', role, page, limit], ['admin-missions', status], ['admin-disputes']. Les mutations invalident les clés pertinentes.
- **État local :** Filtres (role, status), page, limit, utilisateur de détails, boîtes de dialogue résolution/détails (litiges), bascules de paramètres (localStorage).
- **Zustand :** Store d'authentification pour la mise en page uniquement.

---

Documentation associée : [auth-feature.md](auth-feature.md), [disputes-feature.md](disputes-feature.md), [notifications-feature.md](notifications-feature.md). Backend : [admin-feature.md](../../backend/docs/admin-feature.md).
