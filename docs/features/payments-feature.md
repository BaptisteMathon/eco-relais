# Fonctionnalité Paiements (frontend)

**Ce document explique la fonctionnalité Paiements d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

La fonctionnalité de paiements sur le frontend couvre **l'historique des paiements client** (liste des transactions pour les missions qu'ils ont créées, total dépensé) et **les gains partenaire** (total gagné, tableau de l'historique des gains, et bouton **demander un paiement** qui peut rediriger vers Stripe ou afficher un succès). Le paiement lui-même est déclenché depuis le flux de **création de mission** : après avoir créé une mission, le frontend appelle create-checkout et redirige l'utilisateur vers Stripe quand une URL est retournée.

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/app/(client)/client/payments/page.tsx` | Client : historique des paiements, total dépensé |
| `frontend/app/(partner)/partner/earnings/page.tsx` | Partenaire : total gagné, demander un paiement, tableau des gains |
| `frontend/app/(client)/client/new-mission/page.tsx` | Appelle createCheckout après create ; redirection vers Stripe (voir mission-creation-feature) |
| `frontend/lib/api/endpoints.ts` | paymentsApi.history, partnerApi.earnings, partnerApi.requestPayout, missionsApi.createCheckout |
| `frontend/lib/utils/format.ts` | formatCurrency, formatDate |
| `frontend/lib/i18n` | useTranslation |

---

## 3. Explication fichier par fichier

### `frontend/app/(client)/client/payments/page.tsx`

- **Ce qu'il fait :** Récupère l'historique des paiements client et affiche le total dépensé et un tableau.
- **Requête :** useQuery(['payments'], () => paymentsApi.history().then(r => r.data). payments = data?.data ?? [] (le backend retourne { success, data: transactions[] }). totalSpent = somme des montants pour les transactions avec statut 'completed'.
- **UI :** Carte avec total dépensé ; tableau avec date, mission_id (tronqué), montant, badge de statut.

### `frontend/app/(partner)/partner/earnings/page.tsx`

- **Ce qu'il fait :** Récupère les gains partenaire et permet au partenaire de demander un paiement.
- **Requête :** useQuery(['partner-earnings'], () => partnerApi.earnings().then(r => r.data). totalEarned = data?.total_earnings ?? 0 ; transactions = data?.transactions ?? [].
- **requestPayoutMutation :** partnerApi.requestPayout(). onSuccess : si res?.url alors window.location.href = res.url (par exemple Stripe Connect) ; sinon toast success. onError : toast error.
- **UI :** Cartes pour total gagné et solde disponible (availableBalance est 0 si le backend ne l'expose pas). Bouton "Demander un paiement" (désactivé quand balance <= 0 ou en attente). Tableau : date, montant, mission_id.

### `frontend/lib/api/endpoints.ts`

- **paymentsApi.history(params?)** — GET /payments. Le backend retourne { success, data: [{ id, mission_id, amount, status, created_at }, ...] }. Client uniquement.
- **partnerApi.earnings()** — GET /payments/earnings. Le backend retourne { success, total_earnings, transactions }. Partenaire uniquement.
- **partnerApi.requestPayout()** — POST /payments/payout. Le backend peut retourner { success, payout_id, amount } ou URL de redirection. Partenaire uniquement.
- **missionsApi.createCheckout(missionId)** — POST /payments/create-checkout avec { mission_id }. Utilisé dans la page new-mission après create.

---

## 4. Flux utilisateur

**Client**

1. Le client va vers "Paiements" (barre latérale) → /client/payments. La page charge GET /payments → affiche le total dépensé et le tableau des transactions (mission, montant, statut, date).
2. Le client paie pour une mission depuis "Nouvelle mission" : après avoir créé la mission, le frontend appelle createCheckout → si URL retournée, redirection vers Stripe ; après le paiement, l'utilisateur revient à l'URL de succès (voir mission-creation-feature).

**Partenaire**

1. Le partenaire va vers "Gains" → /partner/earnings. La page charge GET /payments/earnings → affiche le total gagné et le tableau des transactions.
2. Le partenaire clique sur "Demander un paiement" → POST /payments/payout. Si le backend retourne une URL (par exemple onboarding Stripe Connect), le frontend redirige ; sinon toast "Paiement demandé".

---

## 5. Comment cela se connecte au backend

- **GET /api/payments** — paymentsApi.history(). Backend : client uniquement ; TransactionModel.listByClientId.
- **GET /api/payments/earnings** — partnerApi.earnings(). Backend : partenaire uniquement ; sumPartnerEarnings, listByPartnerId.
- **POST /api/payments/payout** — partnerApi.requestPayout(). Backend : partenaire uniquement ; createTransferToPartner (ou similaire).
- **POST /api/payments/create-checkout** — missionsApi.createCheckout(missionId). Backend : client uniquement ; createCheckoutSession, retourne url.

---

## 6. Gestion de l'état

- **TanStack Query :** ['payments'] (client), ['partner-earnings'] (partenaire). Pas d'invalidation depuis d'autres fonctionnalités sauf rechargement ; deliver sur le backend crée une transaction donc le prochain chargement affiche une nouvelle ligne.
- **État local :** Aucun au-delà du chargement/affichage.
- **Zustand :** Non utilisé pour les paiements.

---

Documentation associée : [mission-creation-feature.md](mission-creation-feature.md), [partner-mission-flow-feature.md](partner-mission-flow-feature.md), [client-dashboard-feature.md](client-dashboard-feature.md). Backend : [payments-feature.md](../../backend/docs/payments-feature.md).
