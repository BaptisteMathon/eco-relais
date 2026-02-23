# Fonctionnalité Tableau de bord partenaire (frontend)

**Ce document explique la fonctionnalité Tableau de bord partenaire d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

Le tableau de bord partenaire donne au **partenaire** un aperçu après la connexion : des cartes récapitulatives (missions terminées, nombre actif, total gagné) et un graphique de **vue d'ensemble des gains** (données hebdomadaires d'exemple). Une page séparée de **missions disponibles** utilise l'emplacement du partenaire pour récupérer les missions en attente à proximité, les affiche sur une **carte** et dans une liste, et permet au partenaire d'**accepter** une mission (avec une fenêtre d'annulation de 30 secondes). Toutes les routes partenaire sont enveloppées dans la mise en page protégée partenaire (rôle partenaire).

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/app/(partner)/partner/dashboard/page.tsx` | Tableau de bord : cartes, graphique des gains |
| `frontend/app/(partner)/partner/available/page.tsx` | Emplacement, carte, liste disponible, accepter + fenêtre d'annulation |
| `frontend/app/(partner)/partner/missions/page.tsx` | Mes missions (actives/terminées), collecter, in_transit, livrer, scanner QR |
| `frontend/app/(partner)/layout.tsx` | ProtectedLayout(role="partner") |
| `frontend/components/partner/available-missions-map.tsx` | Carte avec marqueurs pour les missions disponibles |
| `frontend/lib/api/endpoints.ts` | partnerApi.myMissions, partnerApi.available, partnerApi.accept, missionsApi.cancel |
| `frontend/lib/utils/format.ts` | formatCurrency, formatDistance |
| `frontend/lib/i18n` | useTranslation |

---

## 3. Explication fichier par fichier

### `frontend/app/(partner)/partner/dashboard/page.tsx`

- **Ce qu'il fait :** Récupère les missions et les gains du partenaire, puis affiche 3 cartes et un graphique.
- **Requêtes :** useQuery(['partner-missions'], partnerApi.myMissions) ; useQuery(['partner-earnings'], partnerApi.earnings). missions = missionsData?.missions ?? [] ; earnings = earnings?.total_earnings ?? 0. actif = missions non livrées/annulées ; terminé = livrées.
- **UI :** Cartes : nombre terminé, nombre actif, total gagné (formatCurrency). Graphique : AreaChart avec chartData d'exemple (W1–W4, gains) ; ChartContainer avec recharts.

### `frontend/app/(partner)/partner/available/page.tsx`

- **Ce qu'il fait :** Demande la géolocalisation, récupère les missions à proximité, affiche la carte et la liste ; le partenaire peut ouvrir une boîte de dialogue de détails, confirmer l'acceptation ou annuler l'acceptation dans les 30s.
- **Emplacement :** État location (lat/lng), locationStatus (idle|loading|granted|denied|unavailable). requestLocation() utilise navigator.geolocation.getCurrentPosition ; sur refus/indisponible utilise FALLBACK_LOCATION (Paris) et toast.
- **Requête :** useQuery(['partner-available', location?.lat, location?.lng], () => partnerApi.available(location.lat, location.lng), { enabled: Boolean(location) }). Retourne une liste de missions (données normalisées en tableau).
- **Accepter :** acceptMutation(missionId) → partnerApi.accept(missionId). onSuccess : invalide partner-available et partner-missions, toast, setJustAcceptedId, setCancelCountdown(30). cancelAcceptMutation(missionId) → missionsApi.cancel(missionId) ; onSuccess invalide et efface justAcceptedId.
- **Compte à rebours :** useEffect : quand justAcceptedId et cancelCountdown > 0, setInterval décrémente cancelCountdown toutes les 1s jusqu'à 0 ; puis efface justAcceptedId.
- **UI :** Si pas d'emplacement et pas de chargement : carte avec bouton "Autoriser l'emplacement". Si chargement : "Obtention de l'emplacement". Si emplacement : AvailableMap(center=location, missions), puis liste de cartes de mission (titre, taille, créneau horaire, adresses, distance, prix, Accepter). Boîte de dialogue de détails (cliquer sur titre) et boîte de dialogue de confirmation (Accepter → "Confirmer la collecte ?"). Bannière quand vient d'accepter : "Annuler dans les 30s" et bouton pour annuler l'acceptation.

### `frontend/components/partner/available-missions-map.tsx`

- **Ce qu'il fait :** Affiche une carte (par exemple Google Maps) centrée sur l'emplacement du partenaire avec des marqueurs pour chaque mission disponible (collecte/livraison ou liste de points).

### `frontend/app/(partner)/layout.tsx`

- **Ce qu'il fait :** Enveloppe les routes partenaire avec ProtectedLayout(role="partner").

### `frontend/lib/api/endpoints.ts` (partenaire)

- **partnerApi.myMissions()** — GET /missions sans lat/lng (le backend retourne listByPartnerId).
- **partnerApi.available(lat, lng, radiusKm)** — GET /missions?lat=&lng=&radius= (mètres). Le backend retourne listNearbyAvailable.
- **partnerApi.accept(missionId)** — PUT /missions/:id/accept.
- **missionsApi.cancel(id)** — PUT /missions/:id/cancel (utilisé pour "annuler l'acceptation" dans les 30s).

---

## 4. Flux utilisateur

1. Le partenaire se connecte → redirection vers /partner/dashboard. Le tableau de bord charge myMissions et earnings → affiche les cartes et le graphique.
2. Le partenaire va vers "Missions disponibles" → la page demande l'emplacement (ou utilise le repli) → une fois l'emplacement défini, GET /missions?lat=&lng=&radius= → carte et liste des missions en attente à proximité.
3. Le partenaire clique sur un titre de mission → boîte de dialogue de détails. Clique sur "Accepter" → boîte de dialogue de confirmation → "Oui, je vais collecter" → acceptMutation → mission acceptée ; bannière "Annuler dans les 30s" avec bouton pour annuler l'acceptation (appelle l'endpoint cancel).
4. Le partenaire va vers "Mes missions" pour collecter/livrer (voir partner-mission-flow-feature.md).

---

## 5. Comment cela se connecte au backend

- **GET /api/missions** (sans lat/lng) — partnerApi.myMissions(). Le backend retourne les missions où partner_id = utilisateur actuel (listByPartnerId).
- **GET /api/missions?lat=&lng=&radius=** — partnerApi.available(lat, lng). Le backend retourne listNearbyAvailable (en attente dans le rayon).
- **PUT /api/missions/:id/accept** — partnerApi.accept(missionId). Backend : partenaire uniquement ; la mission doit être en attente ; setPartner.
- **PUT /api/missions/:id/cancel** — missionsApi.cancel(id). Utilisé pour annuler juste après l'acceptation (le partenaire est autorisé à annuler sa mission acceptée).

---

## 6. Gestion de l'état

- **TanStack Query :** ['partner-missions'], ['partner-earnings'], ['partner-available', lat, lng]. Les mutations d'acceptation et d'annulation invalident partner-available et partner-missions.
- **État local :** location, locationStatus, detailMission, confirmMission, justAcceptedId, cancelCountdown (page disponible).
- **Zustand :** Store d'authentification pour la mise en page uniquement.

---

Documentation associée : [auth-feature.md](auth-feature.md), [partner-mission-flow-feature.md](partner-mission-flow-feature.md), [payments-feature.md](payments-feature.md). Backend : [missions-feature.md](../../backend/docs/missions-feature.md).
