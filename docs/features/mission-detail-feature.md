# Fonctionnalité Détails de mission (frontend)

**Ce document explique la fonctionnalité Détails de mission d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

La page de détails de mission montre à un **client** une mission unique : chronologie de statut (pending → accepted → collected → in_transit → delivered), une **carte** avec collecte et livraison (et emplacement partenaire optionnel), détails du colis (photo, taille, prix, créneau horaire, adresses), bloc **partenaire** avec lien de directions et espace réservé pour le chat, et affichage du **code QR** pour que le client puisse le montrer au partenaire lors de la collecte/livraison. La page se recharge toutes les 30 secondes pour des mises à jour de statut en temps réel.

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/app/(client)/client/missions/[id]/page.tsx` | Page de détails : requête mission, chronologie, carte, détails, partenaire, QR |
| `frontend/components/client/mission-map.tsx` | Carte avec collecte, livraison, marqueur partenaire optionnel |
| `frontend/lib/api/endpoints.ts` | missionsApi.get(id) |
| `frontend/lib/utils/format.ts` | formatDate, formatCurrency |
| `frontend/lib/i18n` | useTranslation, useMissionStatusLabels, usePackageSizeLabels |
| `qrcode.react` | QRCodeSVG pour QR non–data-URL |

---

## 3. Explication fichier par fichier

### `frontend/app/(client)/client/missions/[id]/page.tsx`

- **Ce qu'il fait :** Récupère une mission par id et affiche la chronologie, la carte, les détails, la carte partenaire et le QR.
- **Paramètres :** params est Promise<{ id: string }> ; React.use(params) pour lire l'id.
- **Requête :** useQuery({ queryKey: ['mission', id], queryFn: () => missionsApi.get(id).then(r => r.data), refetchInterval: 30_000 }). missionsApi.get retourne l'objet mission (normalisé depuis response.data.mission).
- **Chargement :** Squelette pendant le chargement ou pas de mission et pas d'erreur.
- **Erreur :** Si isError, affiche lien retour, carte avec message et "Réessayer" (refetch) / lien "Mes missions".
- **Chronologie :** STEPS = [pending, accepted, collected, in_transit, delivered]. currentStepIndex = STEPS.indexOf(mission.status). Affiche des cercles et des étiquettes pour chaque étape ; les étapes complétées montrent une coche, l'actuelle et les futures stylisées différemment. Masquée quand le statut est cancelled.
- **Carte :** MissionMap avec coordonnées de collecte, livraison et partnerLocation optionnel (actuellement dérivé de pickup + offset si partner_id présent ; l'emplacement réel du partenaire viendrait du backend si disponible).
- **Carte de détails :** package_photo_url (image), taille, prix, créneau horaire, adresses de collecte/livraison, created_at.
- **Carte partenaire :** Si mission.partner, affiche nom, "Directions" (lien Google Maps vers la livraison), "Chat" (espace réservé désactivé).
- **Carte QR :** Si mission.qr_code, affiche image (si data URL) ou QRCodeSVG(value=mission.qr_code).

### `frontend/components/client/mission-map.tsx`

- **Ce qu'il fait :** Affiche une carte (par exemple Google Maps ou similaire) avec des marqueurs pour la collecte, la livraison et optionnellement l'emplacement du partenaire. Utilisé pour que le client puisse voir l'itinéraire et la position du partenaire (si fourni).

### `frontend/lib/api/endpoints.ts`

- **missionsApi.get(id)** — GET /missions/:id. Retourne des données normalisées (objet mission). Le backend retourne la mission avec les objets partner et client pour la vue de détails.

---

## 4. Flux utilisateur

1. Le client clique sur "Voir" sur une mission (tableau de bord ou liste des missions) → navigue vers /client/missions/:id.
2. La page charge → useQuery récupère GET /api/missions/:id → le backend retourne la mission (avec partner/client si autorisé).
3. L'utilisateur voit le titre, le badge de statut, la chronologie (étapes jusqu'au statut actuel), la carte, les détails, le bloc partenaire (si assigné) et le code QR (si présent).
4. L'utilisateur peut ouvrir "Directions" vers la livraison dans Google Maps. Le QR est affiché pour que le partenaire le scanne lors de la collecte/livraison.
5. Toutes les 30s la page se recharge pour que les mises à jour de statut (par exemple collected, in_transit, delivered) apparaissent sans rafraîchissement.

---

## 5. Comment cela se connecte au backend

- **GET /api/missions/:id** — missionsApi.get(id). Backend : requireAuth, missionIdValidator, missionGetById. Retourne { success, mission } avec partner et client imbriqués pour la vue de détails. Accès : uniquement client, partenaire assigné ou admin.

---

## 6. Gestion de l'état

- **TanStack Query :** queryKey ['mission', id], refetchInterval 30_000. Mission unique mise en cache ; les pages de liste utilisent ['missions'] donc elles n'affichent pas automatiquement le statut mis à jour jusqu'à ce qu'elles soient rechargées ou invalidées.
- **État local :** Aucun au-delà du paramètre de route id.
- **Zustand :** Non utilisé ; authentification utilisée par la mise en page.

---

Documentation associée : [client-dashboard-feature.md](client-dashboard-feature.md), [mission-creation-feature.md](mission-creation-feature.md), [partner-mission-flow-feature.md](partner-mission-flow-feature.md). Backend : [missions-feature.md](../../backend/docs/missions-feature.md).
