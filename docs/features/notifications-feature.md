# Fonctionnalité Notifications (frontend)

**Ce document explique la fonctionnalité Notifications d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

Le backend supporte la **liste** des notifications de l'utilisateur actuel (GET /notifications), **marquer une comme lue** (PUT /notifications/:id/read), et **envoyer** des notifications (POST /notifications/send, admin uniquement). Sur le frontend, il n'y a pas encore de page dédiée "Notifications" : la page **paramètres admin** a une carte **Notifications** qui est un espace réservé pour une configuration future (préférences email et in-app). Pour supporter pleinement les notifications sur le frontend, vous ajouteriez : une page ou un menu déroulant qui appelle GET /notifications et affiche la liste, et des actions pour marquer comme lu ; et une UI admin pour envoyer des notifications (user_id/user_ids, type, message) appelant POST /notifications/send.

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/app/(admin)/admin/settings/page.tsx` | Contient une carte "Notifications" (texte d'espace réservé) |
| `frontend/lib/api/endpoints.ts` | Aucun endpoint de notifications exporté encore ; le backend a GET /notifications, PUT /notifications/:id/read, POST /notifications/send |

---

## 3. Explication fichier par fichier

### `frontend/app/(admin)/admin/settings/page.tsx`

- **Ce qu'il fait :** Paramètres admin : bascules pour Stripe et Google Maps (localStorage), et une carte "Notifications" avec description et espace réservé. Il n'appelle **pas** l'API de notifications. Le titre et la description de la carte utilisent t('settings.notifications') et t('settings.notificationsDescription') ; le contenu est un espace réservé pour "préférences et modèles de notifications".

### API Backend (pour quand le frontend l'implémente)

- **GET /api/notifications** — Retourne { success, notifications } pour l'utilisateur authentifié. Le frontend utiliserait cela pour une liste de notifications ou un menu déroulant de cloche.
- **PUT /api/notifications/:id/read** — Marquer une notification comme lue. Body non requis ; retourne { success, notification }.
- **POST /api/notifications/send** — Admin uniquement. Body : user_id (unique) ou user_ids (tableau), type, message. Retourne { success, notifications }.

---

## 4. Flux utilisateur (actuel et possible)

**Actuel :** L'admin ouvre Paramètres → voit la carte Notifications avec espace réservé. Aucun appel API pour les notifications.

**Possible :**  
- **Utilisateur :** Icône de notifications dans l'en-tête → menu déroulant ou page avec useQuery(['notifications'], () => api.get('/notifications')) → liste d'éléments ; cliquer pour marquer comme lu (PUT /notifications/:id/read).  
- **Admin :** Formulaire "Envoyer une notification" (user_id ou user_ids, type, message) → POST /notifications/send.

---

## 5. Comment cela se connecterait au backend

- **GET /api/notifications** — Liste des notifications de l'utilisateur actuel. Backend : NotificationModel.listByUserId(req.user.userId).
- **PUT /api/notifications/:id/read** — Marquer comme lu. Backend : vérifier la propriété, NotificationModel.markAsRead(id, userId).
- **POST /api/notifications/send** — Envoi admin. Backend : NotificationModel.create par utilisateur, Firebase optionnel.

---

## 6. Gestion de l'état (quand implémenté)

- **TanStack Query :** par exemple ['notifications'] pour la liste ; mutation pour marquer comme lu et pour envoyer (invalider la liste après envoi).
- **État local :** Notification sélectionnée, état du formulaire pour l'envoi.
- **Zustand :** Non requis pour les notifications.

---

Documentation associée : [admin-dashboard-feature.md](admin-dashboard-feature.md). Backend : [notifications-feature.md](../../backend/docs/notifications-feature.md).
