# Fonctionnalité Création de mission (frontend)

**Ce document explique la fonctionnalité Création de mission d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

La création de mission permet à un **client** de soumettre une nouvelle mission de livraison : titre du colis, photo optionnelle, taille, adresses de collecte et de livraison (avec autocomplétion), créneau horaire, et voir le prix avant de soumettre. Lors de la soumission, le frontend crée la mission via l'API, puis demande une URL de paiement Stripe Checkout ; si une URL est retournée, l'utilisateur est redirigé vers Stripe pour payer, sinon il est redirigé vers la page de détails de la mission (par exemple lorsque les paiements ne sont pas configurés).

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/app/(client)/client/new-mission/page.tsx` | Formulaire, mutation de création, redirection de paiement |
| `frontend/lib/api/endpoints.ts` | missionsApi.create, missionsApi.createCheckout |
| `frontend/lib/validators/mission.ts` | missionFormSchema, MissionFormInput |
| `frontend/components/client/address-autocomplete.tsx` | Autocomplétion Google Places, définit lat/lng lors de la sélection du lieu |
| `frontend/lib/constants.ts` | PRICE_BY_SIZE, TIME_SLOTS |
| `frontend/lib/utils/format.ts` | formatCurrency |
| `frontend/lib/i18n` | useTranslation, usePackageSizeLabels |
| UI : Card, Form, Input, Select, Button (depuis components/ui) |

---

## 3. Explication fichier par fichier

### `frontend/app/(client)/client/new-mission/page.tsx`

- **Ce qu'il fait :** Affiche le formulaire de création de mission et gère la soumission → création → paiement ou redirection vers les détails.
- **Formulaire :** useForm avec missionFormSchema (Zod), defaultValues pour tous les champs. form.watch('package_size') détermine le prix depuis PRICE_BY_SIZE.
- **Photo :** État local photoFile, photoPreview. Glisser-déposer et input de fichier ; aperçu avec bouton de suppression. (Note : missionsApi.create actuel peut envoyer JSON ; le backend supporte multipart via uploadPackagePhoto—si le frontend envoie FormData avec fichier quand la photo est présente, le backend stockera package_photo_url.)
- **Adresses :** AddressAutocomplete pour la collecte et la livraison ; onPlaceSelect appelle form.setValue pour pickup_lat/lng et delivery_lat/lng.
- **createMutation :** mutationFn : missionsApi.create({ ...data, package_size, price }) (le backend calcule aussi le prix). onSuccess : obtenir l'id de la mission → missionsApi.createCheckout(id) ; si data.url alors window.location.href = data.url (Stripe) ; sinon toast et router.push(`/client/missions/${id}`). onError : toast avec message.
- **Soumission :** form.handleSubmit((d) => createMutation.mutate(d)).

### `frontend/lib/api/endpoints.ts`

- **missionsApi.create(body)** — POST /missions avec package_title, package_size, adresses de collecte/livraison et lat/lng, pickup_time_slot, prix optionnel. Retourne { success, mission }.
- **missionsApi.createCheckout(missionId)** — POST /payments/create-checkout avec { mission_id }. Retourne { success, url?, session_id? }.

### `frontend/lib/validators/mission.ts`

- **missionFormSchema** — package_title (min 1), package_size enum small|medium|large, pickup_address, pickup_lat/lng, delivery_address, delivery_lat/lng, pickup_time_slot (min 1).
- **MissionFormInput** — Type inféré depuis le schéma.

### `frontend/components/client/address-autocomplete.tsx`

- **Ce qu'il fait :** Utilise @react-google-maps/api (useLoadScript) avec la bibliothèque places. Attache Autocomplete à l'input ; sur place_changed obtient formatted_address et geometry (lat/lng), appelle onChange(value) et onPlaceSelect({ address, lat, lng }). Le formulaire parent définit l'adresse et lat/lng. Repli sur input simple si le script échoue.

### `frontend/lib/constants.ts`

- **PRICE_BY_SIZE** — par exemple { small: 3, medium: 5, large: 8 } (euros).
- **TIME_SLOTS** — Tableau de chaînes de créneaux horaires pour le select.

---

## 4. Flux utilisateur

1. Le client ouvre "Nouvelle mission" (par exemple depuis le tableau de bord ou la barre latérale) → /client/new-mission.
2. Remplit le titre du colis, ajoute optionnellement une photo (glisser ou fichier), sélectionne la taille (le prix se met à jour), choisit l'adresse de collecte via autocomplétion (lat/lng défini), adresse de livraison via autocomplétion, créneau horaire.
3. Clique sur "Créer et payer" → le formulaire valide (Zod) → createMutation s'exécute : POST /missions avec body → le backend crée la mission et la retourne.
4. Le frontend appelle POST /payments/create-checkout avec l'id de la mission. Si la réponse a une url → redirection vers Stripe (l'utilisateur y paie). Si pas d'url (paiements non configurés) → toast et redirection vers /client/missions/:id.
5. Après le paiement sur Stripe, l'utilisateur revient à success_url (par exemple /client/missions/:id?success=1) géré par les détails de la mission ou le tableau de bord.

---

## 5. Comment cela se connecte au backend

- **POST /api/missions** — missionsApi.create. Backend : requireAuth, requireRole('client'), uploadPackagePhoto, createMissionValidator, missionCreate. Crée la mission, génère le QR, upload S3 optionnel. Retourne 201 { mission }.
- **POST /api/payments/create-checkout** — missionsApi.createCheckout(missionId). Backend : requireAuth, createCheckoutValidator. Retourne { url, session_id } pour la redirection Stripe Checkout.

---

## 6. Gestion de l'état

- **TanStack Query :** useMutation pour create (pas de clé de cache ; onSuccess déclenche la redirection ou la deuxième requête createCheckout).
- **État local :** photoFile, photoPreview ; état du formulaire via react-hook-form.
- **Zustand :** Non utilisé pour cette fonctionnalité ; le store d'authentification utilisé par la mise en page.

---

Documentation associée : [auth-feature.md](auth-feature.md), [client-dashboard-feature.md](client-dashboard-feature.md), [mission-detail-feature.md](mission-detail-feature.md), [payments-feature.md](payments-feature.md). Backend : [missions-feature.md](../../backend/docs/missions-feature.md), [payments-feature.md](../../backend/docs/payments-feature.md).
