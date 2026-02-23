# Fonctionnalité Flux de mission partenaire (frontend)

**Ce document explique la fonctionnalité Flux de mission partenaire (accepter, collecter, livrer avec QR) d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

Après qu'un partenaire **accepte** une mission (sur la page disponible), il la gère depuis **Mes missions** : marquer **collectée** (avec scan QR optionnel à la collecte), définir **en transit**, puis marquer **livrée** (avec scan QR optionnel à la livraison). La page affiche des onglets actifs et terminés, la progression des étapes par mission, et une boîte de dialogue **scanner QR** pour collecter/livrer. Le lien Directions ouvre Google Maps vers l'adresse de livraison.

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/app/(partner)/partner/missions/page.tsx` | Liste mes missions, boutons collecter / en_transit / livrer, boîte de dialogue QR |
| `frontend/components/partner/qr-scanner.tsx` | UI caméra/scan, onScan(payload), onClose |
| `frontend/lib/api/endpoints.ts` | partnerApi.myMissions, markCollected, markInTransit, markDelivered |
| `frontend/lib/utils/format.ts` | formatDate, formatCurrency |
| `frontend/lib/i18n` | useTranslation, useMissionStatusLabels |

---

## 3. Explication fichier par fichier

### `frontend/app/(partner)/partner/missions/page.tsx`

- **Ce qu'il fait :** Récupère les missions du partenaire, sépare actives vs terminées, et pour chaque mission active affiche des boutons d'action (Marquer collectée avec QR, Démarrer la livraison, Marquer livrée avec QR, Directions). Ouvre une boîte de dialogue avec QRScanner quand collecter ou livrer est choisi.
- **Requête :** useQuery(['partner-missions'], partnerApi.myMissions, refetchInterval: 30_000). missions = data?.missions ?? []. activeMissions = non livrées/annulées ; completedMissions = livrées.
- **État :** qrOpen = { missionId, action: 'collected' | 'delivered' } | null. Quand l'utilisateur clique sur "Marquer collectée" ou "Marquer livrée", setQrOpen({ missionId, action }). La boîte de dialogue affiche QRScanner ; onScan(payload) appelle la mutation correspondante avec missionId et qrPayload.
- **Mutations :** collectedMutation : partnerApi.markCollected(missionId, qrPayload). onSuccess invalide partner-missions, setQrOpen(null), toast. inTransitMutation : partnerApi.markInTransit(missionId). deliveredMutation : partnerApi.markDelivered(missionId, qrPayload). handleScan(payload) : si qrOpen.action === 'collected' alors collectedMutation.mutate({ missionId, qrPayload: payload }) ; sinon deliveredMutation.mutate({ missionId, qrPayload: payload }).
- **MissionCard :** Pour chaque mission, affiche photo, titre, taille, prix, étiquettes d'étapes (pending → … → delivered). Si actif : accepted → bouton "Marquer collectée" (ouvre boîte de dialogue QR) ; collected → "Démarrer la livraison" (markInTransit) et "Marquer livrée" (ouvre boîte de dialogue QR) ; in_transit → "Marquer livrée" (ouvre boîte de dialogue QR). Lien "Directions" vers Google Maps (lat/lng de livraison).
- **Onglets :** Actif / Terminé ; chaque onglet affiche la liste des MissionCards.

### `frontend/components/partner/qr-scanner.tsx`

- **Ce qu'il fait :** Utilise le navigateur ou une bibliothèque (par exemple API caméra ou bibliothèque QR) pour scanner un code QR. Quand un code est décodé, appelle onScan(payload string). onClose ferme le scanner. Rendu dans la boîte de dialogue sur la page missions.

### `frontend/lib/api/endpoints.ts`

- **partnerApi.myMissions()** — GET /missions (missions assignées au partenaire).
- **partnerApi.markCollected(missionId, qrPayload?)** — PUT /missions/:id/collect avec body { qr_payload }.
- **partnerApi.markInTransit(missionId)** — PUT /missions/:id/status avec body { status: 'in_transit' }.
- **partnerApi.markDelivered(missionId, qrPayload?)** — PUT /missions/:id/deliver avec body { qr_payload }.

---

## 4. Flux utilisateur

1. Le partenaire a accepté une mission (depuis la page disponible). Va vers "Mes missions".
2. Voit les missions actives. Pour le statut "accepted" : clique sur "Marquer collectée" → boîte de dialogue QR s'ouvre → le partenaire scanne le QR du client à la collecte → onScan(payload) → PUT collect avec qr_payload → le statut de la mission devient "collected" ; la boîte de dialogue se ferme.
3. Pour le statut "collected" : clique sur "Démarrer la livraison" → PUT status in_transit → statut de la mission "in_transit". Clique sur "Marquer livrée" → boîte de dialogue QR → scan à la livraison → PUT deliver avec qr_payload → mission "delivered" ; le backend peut créer une transaction et transférer au partenaire.
4. "Directions" ouvre Google Maps vers les coordonnées de livraison. L'onglet Terminé affiche les missions livrées.

---

## 5. Comment cela se connecte au backend

- **GET /api/missions** — partnerApi.myMissions(). Backend : listByPartnerId (sans lat/lng).
- **PUT /api/missions/:id/collect** — Body qr_payload optionnel. Backend : partenaire uniquement ; la mission doit être accepted et assignée au partenaire ; updateMissionStatus(id, 'collected').
- **PUT /api/missions/:id/status** — Body { status: 'in_transit' }. Backend : partenaire uniquement ; statuts autorisés collected | in_transit.
- **PUT /api/missions/:id/deliver** — Body qr_payload optionnel. Backend : partenaire uniquement ; le statut doit être in_transit ; crée une transaction, peut créer createTransferToPartner ; updateMissionStatus(id, 'delivered').

---

## 6. Gestion de l'état

- **TanStack Query :** ['partner-missions'] avec refetchInterval 30s. Les mutations collect, inTransit, deliver invalident ['partner-missions'] pour que la liste se mette à jour.
- **État local :** qrOpen (quelle mission et action) pour la boîte de dialogue QR.
- **Zustand :** Non utilisé pour cette fonctionnalité.

---

Documentation associée : [partner-dashboard-feature.md](partner-dashboard-feature.md), [mission-detail-feature.md](mission-detail-feature.md), [payments-feature.md](payments-feature.md). Backend : [missions-feature.md](../../backend/docs/missions-feature.md), [payments-feature.md](../../backend/docs/payments-feature.md).
