# Fonctionnalité Tableau de bord client (frontend)

**Ce document explique la fonctionnalité Tableau de bord client d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

Le tableau de bord client donne au **client** un aperçu après la connexion : des cartes récapitulatives (nombre de missions actives, nombre de missions terminées, total dépensé) et un tableau des **missions récentes** avec des liens vers les détails de la mission. Une page séparée de **liste des missions** affiche toutes les missions avec un filtre de statut, une action d'annulation optionnelle et des liens vers les détails. Les deux utilisent la même API de missions et sont enveloppés dans la mise en page protégée client (rôle client).

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/app/(client)/client/dashboard/page.tsx` | Tableau de bord : cartes de statistiques, tableau des missions récentes, lien vers nouvelle mission |
| `frontend/app/(client)/client/missions/page.tsx` | Liste complète des missions, filtre de statut, annulation, lien de visualisation |
| `frontend/app/(client)/layout.tsx` | Enveloppe les routes client avec ProtectedLayout(role="client") |
| `frontend/lib/api/endpoints.ts` | missionsApi.list, missionsApi.cancel |
| `frontend/components/layout/protected-layout.tsx` | Vérification d'authentification + rôle, barre latérale, en-tête |
| `frontend/components/layout/dashboard-sidebar.tsx` | Liens de navigation (tableau de bord, missions, nouvelle mission, etc.) |
| `frontend/lib/utils/format.ts` | formatDate, formatCurrency |
| `frontend/lib/i18n` | useTranslation, useMissionStatusLabels |

---

## 3. Explication fichier par fichier

### `frontend/app/(client)/client/dashboard/page.tsx`

- **Ce qu'il fait :** Récupère les missions du client et affiche un aperçu + liste récente.
- **Logique clé :** useQuery({ queryKey: ['missions'], queryFn: () => missionsApi.list().then(r => r.data) }). Dérive missions, nombre actif (non livré/annulé), nombre terminé (livré), totalSpent (somme du prix pour les livrées), recent = missions.slice(0, 5). Affiche 3 cartes (actif, terminé, total dépensé), puis un tableau avec package_title, badge de statut, created_at, et lien "Voir" vers /client/missions/:id. Le bouton "Nouvelle mission" lie vers /client/new-mission. État de chargement : squelettes.

### `frontend/app/(client)/client/missions/page.tsx`

- **Ce qu'il fait :** Liste complète des missions client avec filtre et annulation.
- **Logique clé :** État statusFilter (all | pending | …). useQuery({ queryKey: ['missions', statusFilter], queryFn: () => missionsApi.list({ status }).then(r => r.data) }). cancelMutation : missionsApi.cancel(id), onSuccess invalidateQueries(['missions']), toast. Tableau : photo, titre, statut, partenaire (si présent), created_at, menu déroulant avec Voir (lien vers détails) et Annuler (seulement pour pending/accepted). Annuler appelle cancelMutation.mutate(m.id).

### `frontend/app/(client)/layout.tsx`

- **Ce qu'il fait :** Affiche ProtectedLayout avec role="client" pour que seuls les clients authentifiés voient les routes enfants ; les autres sont redirigés.

### `frontend/lib/api/endpoints.ts` (partie missions)

- **missionsApi.list(params?)** — GET /missions (le client obtient ses propres missions). Paramètres optionnels : status, page, limit.
- **missionsApi.cancel(id)** — PUT /missions/:id/cancel.

---

## 4. Flux utilisateur

1. Le client se connecte → redirigé vers /client/dashboard.
2. Le tableau de bord charge : GET /api/missions (sans paramètres) → liste des missions → calcule actif, terminé, totalSpent → affiche 3 cartes et tableau des 5 dernières missions avec liens "Voir".
3. L'utilisateur clique sur "Nouvelle mission" → va vers /client/new-mission.
4. L'utilisateur clique sur "Missions" dans la barre latérale → /client/missions → même GET /missions, optionnel ?status= → tableau avec menu déroulant de filtre. L'utilisateur peut changer le filtre, cliquer sur Voir (→ détails de la mission) ou Annuler (PUT cancel, puis la liste se recharge).
5. L'utilisateur clique sur "Voir" sur une mission → /client/missions/:id (page de détails de la mission).

---

## 5. Comment cela se connecte au backend

- **GET /api/missions** — Appelé par missionsApi.list() (et list({ status }) quand le filtre est défini). Le backend retourne { success, missions } pour le client authentifié. Utilisé par le tableau de bord et la liste des missions.
- **PUT /api/missions/:id/cancel** — Appelé par missionsApi.cancel(id). Le backend nécessite une authentification ; seul le client, le partenaire assigné ou l'admin peut annuler ; la mission ne doit pas être livrée/annulée.

---

## 6. Gestion de l'état

- **TanStack Query :** queryKey ['missions'] (et ['missions', statusFilter] sur la liste des missions). Liste mise en cache ; la mutation d'annulation invalide ['missions'] pour que le tableau de bord et la liste se rechargent.
- **État local :** statusFilter sur la page de liste des missions (all, pending, etc.).
- **Zustand :** Non utilisé pour les données de mission ; le store d'authentification est utilisé par ProtectedLayout pour le contrôle d'accès.

---

Documentation associée : [auth-feature.md](auth-feature.md), [mission-creation-feature.md](mission-creation-feature.md), [mission-detail-feature.md](mission-detail-feature.md). Backend : [missions-feature.md](../../backend/docs/missions-feature.md).
