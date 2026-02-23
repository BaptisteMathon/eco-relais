# Fonctionnalité Litiges (frontend)

**Ce document explique la fonctionnalité Litiges d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

Sur le frontend, la fonctionnalité de litiges est actuellement **réservée aux admins** : les admins peuvent **lister** tous les litiges et **résoudre** un litige en saisissant un texte de résolution. Le backend supporte aussi la **création** d'un litige (POST /api/disputes) par les clients ou les partenaires ; si le frontend ajoute une action "Créer un litige" (par exemple sur les détails de la mission), il appellerait cet endpoint. Ce document se concentre sur le flux existant de liste et résolution admin.

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/app/(admin)/admin/disputes/page.tsx` | Liste des litiges, boîte de dialogue de résolution, boîte de dialogue de détails |
| `frontend/lib/api/endpoints.ts` | adminApi.disputes, adminApi.resolveDispute |
| `frontend/lib/utils/format.ts` | formatDate |
| `frontend/lib/i18n` | useTranslation |
| `frontend/lib/types` | Type Dispute |

---

## 3. Explication fichier par fichier

### `frontend/app/(admin)/admin/disputes/page.tsx`

- **Ce qu'il fait :** Récupère tous les litiges, les affiche dans un tableau, et permet à l'admin d'ouvrir une boîte de dialogue de résolution ou une boîte de dialogue de détails.
- **Requête :** useQuery(['admin-disputes'], () => adminApi.disputes().then(r => r.data?.disputes ?? []). list = data ?? [].
- **État :** resolveId (quel litige résoudre), resolution (textarea), detailDispute (quel litige afficher en détails).
- **resolveMutation :** adminApi.resolveDispute(id, res). onSuccess : invalide ['admin-disputes'], efface resolveId et resolution, toast. onError : toast.
- **UI :** Tableau : mission_id, raison, badge de statut, created_at, actions (Voir détails, Résoudre). Boîte de dialogue de détails : affiche les champs du litige. Boîte de dialogue de résolution : textarea pour la résolution, soumission appelle resolveMutation. Le backend attend PATCH /admin/disputes/:id/resolve avec body { resolution }.

### `frontend/lib/api/endpoints.ts`

- **adminApi.disputes()** — GET /admin/disputes. Le backend retourne { success, disputes }.
- **adminApi.resolveDispute(disputeId, resolution)** — PATCH /admin/disputes/:id/resolve avec body { resolution }. Le backend retourne { success, dispute }.

---

## 4. Flux utilisateur

1. L'admin ouvre "Litiges" dans la barre latérale → /admin/disputes. La page charge GET /admin/disputes → tableau des litiges (mission_id, raison, statut, date).
2. L'admin clique sur "Voir" → la boîte de dialogue de détails s'ouvre avec les informations complètes du litige.
3. L'admin clique sur "Résoudre" → la boîte de dialogue de résolution s'ouvre ; l'admin tape la résolution et soumet → PATCH /admin/disputes/:id/resolve { resolution } → la liste se recharge, la boîte de dialogue se ferme, toast succès.

**Créer un litige (quand implémenté) :** Le client ou le partenaire appellerait POST /api/disputes avec { mission_id, reason } (par exemple depuis un bouton sur les détails de la mission). Le backend autorise le client/partenaire impliqués dans la mission.

---

## 5. Comment cela se connecte au backend

- **GET /api/admin/disputes** — adminApi.disputes(). Backend : admin uniquement ; DisputeModel.listAll(statut optionnel).
- **PATCH /api/admin/disputes/:id/resolve** — adminApi.resolveDispute(id, resolution). Backend : admin uniquement ; DisputeModel.resolveDispute(id, resolution, userId).
- **POST /api/disputes** — Pas encore utilisé depuis le frontend ; le backend supporte la création avec mission_id et reason pour client/partenaire.

---

## 6. Gestion de l'état

- **TanStack Query :** ['admin-disputes']. resolveMutation l'invalide après succès.
- **État local :** resolveId, resolution, detailDispute pour les boîtes de dialogue.
- **Zustand :** Non utilisé.

---

Documentation associée : [admin-dashboard-feature.md](admin-dashboard-feature.md). Backend : [disputes-feature.md](../../backend/docs/disputes-feature.md).
