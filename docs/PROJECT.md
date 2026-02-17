## Eco-Relais Dashboard (Frontend) — Documentation du projet

Ce dépôt contient l’**application web dashboard Eco-Relais** (Next.js App Router). C’est l’interface pour tous les rôles : **client**, **partner** et **admin**.

### Vue d’ensemble

Les utilisateurs se connectent puis sont redirigés vers un dashboard selon leur rôle :

- **client** : créer des missions, payer, suivre la livraison
- **partner** : accepter les missions à proximité, collecter/livrer, gains
- **admin** : stats, utilisateurs, missions, litiges, paramètres

### Stack technique

- Next.js 16 (App Router), React 19, TypeScript
- shadcn/ui + Tailwind CSS
- TanStack Query (appels API et cache)
- Zustand (état d’authentification)
- Google Maps (autocomplétion d’adresse + vues carte)
- QR : affichage et scan pour la validation enlèvement/livraison

### Installation en local

1. Installer les dépendances :

```bash
npm install
```

2. Créer le fichier d’environnement :

```bash
cp .env.example .env.local
```

Variables importantes :

- `NEXT_PUBLIC_API_URL` — URL de base du backend (ex. `http://localhost:3000/api`)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — requise pour l’autocomplétion d’adresse et les cartes

3. Démarrer le serveur de dev :

```bash
npm run dev
```

### Intégration backend

Tous les appels API passent par :

- `lib/api/client.ts` — instance Axios, injection du JWT depuis localStorage, gestion des 401 (redirection)
- `lib/api/endpoints.ts` — wrappers typés des endpoints (auth, missions, partner, admin, profile)

L’URL de base par défaut est :

- `NEXT_PUBLIC_API_URL` ou repli `http://localhost:3000/api`

### Flux d’authentification (côté client)

- La connexion appelle `authApi.login()` et stocke l’utilisateur et le token dans Zustand (`lib/stores/auth-store.ts`).
- Les écrans protégés utilisent `components/layout/protected-layout.tsx` :
  - Redirection vers `/login` si pas d’auth
  - Contrôle d’accès par rôle (client/partner/admin)
- Le token étant stocké dans **localStorage**, le middleware Next.js ne peut pas valider l’auth côté serveur.

### Routes

- Auth : `/login`, `/register`
- Client : `/client/dashboard`, `/client/new-mission`, `/client/missions`, `/client/missions/[id]`, `/client/payments`, `/client/profile`
- Partenaire : `/partner/dashboard`, `/partner/available`, `/partner/missions`, `/partner/earnings`, `/partner/profile`
- Admin : `/admin/dashboard`, `/admin/users`, `/admin/missions`, `/admin/disputes`, `/admin/settings`

La navigation est définie dans `components/layout/dashboard-sidebar.tsx`.

### Internationalisation (FR/EN) — français par défaut

L’interface est disponible en **français (par défaut)** et en **anglais** :

- Messages :
  - `messages/fr.json`
  - `messages/en.json`
- Provider :
  - `lib/i18n/context.tsx` (`I18nProvider`)
  - Stocke la locale dans `localStorage` sous la clé `eco_relais_locale` (défaut `fr`)
- Hook :
  - `useTranslation()` retourne `{ locale, setLocale, t }`
- Helpers :
  - `useMissionStatusLabels()` et `usePackageSizeLabels()` dans `lib/i18n/index.ts`
- Sélecteur de langue :
  - `components/layout/language-switcher.tsx`
  - Monté dans :
    - `components/layout/header.tsx` (dashboard)
    - `app/(auth)/layout.tsx` (login/register)

Pour ajouter des chaînes :

1. Ajouter la clé dans `fr.json` et `en.json`
2. Utiliser `t("section.key")` dans le composant

### Tests

```bash
npm run test
```

Utilise Vitest + React Testing Library (jsdom).

### Dépendances backend connues

Certains écrans s’appuient sur des routes backend qui peuvent être en stub ou non implémentées selon l’état du dépôt API :

- `/api/admin/disputes` existe (renvoie actuellement `[]` dans le dépôt API)
- L’endpoint d’onboarding Stripe partenaire peut nécessiter une implémentation backend (`/partner/stripe/onboarding-link`)
