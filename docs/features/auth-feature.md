# Fonctionnalité d'authentification (frontend)

**Ce document explique la fonctionnalité d'authentification d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

La fonctionnalité d'authentification frontend gère la **connexion** (email + mot de passe, puis redirection par rôle), l'**inscription** (multi-étapes : rôle → détails → adresse, puis création de compte et redirection), la **déconnexion** (effacer token et utilisateur, redirection vers login), les **routes protégées** (layout basé sur le rôle qui redirige les utilisateurs non authentifiés ou avec le mauvais rôle), et la **session** (persister user/token dans localStorage, timeout d'inactivité après 3 heures avec déconnexion optionnelle). Le client API ajoute le JWT à chaque requête et redirige vers login sur 401.

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|---------|------|
| `frontend/app/(auth)/login/page.tsx` | Formulaire de connexion, authApi.login, setAuth, redirection par rôle |
| `frontend/app/(auth)/register/page.tsx` | Formulaire d'inscription en 3 étapes, authApi.register, setAuth, redirection |
| `frontend/lib/stores/auth-store.ts` | Store Zustand : user, token, setAuth, logout, isAuthenticated, _hasHydrated |
| `frontend/lib/api/client.ts` | Instance Axios, intercepteur de requête (token Bearer), 401 → clearAuth + redirection /login |
| `frontend/lib/api/endpoints.ts` | authApi.login, authApi.register, authApi.me |
| `frontend/lib/validators/auth.ts` | loginSchema, registerStep1/2/3Schema (Zod) |
| `frontend/components/layout/protected-layout.tsx` | Attend la réhydratation, vérifie auth/rôle, redirige ou rend sidebar+children |
| `frontend/components/layout/dashboard-sidebar.tsx` | Élément de menu Déconnexion (appelle logout depuis le store) |
| `frontend/components/providers/session-idle-provider.tsx` | Enregistre touchActivity, vérifie l'inactivité chaque minute, logout + redirection si 3h d'inactivité |
| `frontend/lib/session-idle.ts` | touchActivity() appelé par le client API ; callback met à jour lastActivityAt du store |
| `frontend/app/layout.tsx` | Enveloppe l'app avec SessionIdleProvider (et QueryClient, etc.) |

---

## 3. Explication fichier par fichier

### `frontend/app/(auth)/login/page.tsx`

- **Ce qu'il fait :** Rend le formulaire de connexion ; à la soumission appelle l'API d'authentification et stocke la session, puis redirige par rôle.
- **Éléments clés :** useForm avec loginSchema (Zod). useMutation : mutationFn = authApi.login(email, password).then(r => r.data). onSuccess : setAuth(data.user, data.token), toast, puis router.push vers /admin/dashboard, /partner/dashboard, ou /client/dashboard par rôle. onError : toast avec erreur de la réponse. Le formulaire utilise FormField pour email et password ; lien vers /register.

### `frontend/app/(auth)/register/page.tsx`

- **Ce qu'il fait :** Inscription en 3 étapes (rôle → email/password/nom/téléphone → adresse), puis un appel API et redirection.
- **Éléments clés :** état step (1|2|3), état role, état step2Data, addressLat/Lng. Trois formulaires : step1 (radio rôle), step2 (email, password, firstName, lastName, phone), step3 (AddressAutocomplete, adresse lat/lng). registerMutation appelle authApi.register avec les données combinées ; onSuccess setAuth et redirection par rôle. La soumission de l'étape 3 appelle registerMutation.mutate() (step2Data et step3 + addressLat/Lng sont déjà dans l'état).

### `frontend/lib/stores/auth-store.ts`

- **Ce qu'il fait :** Source unique de vérité pour l'utilisateur connecté et le token ; persiste dans localStorage ; synchronise le token avec le client API.
- **État clé :** user, token, lastActivityAt, _hasHydrated.
- **setAuth(user, token) :** Appelle setAuthToken(token) (client.ts) puis set({ user, token, lastActivityAt: Date.now() }). Persist sauvegarde user, token, lastActivityAt (partialize).
- **logout() :** clearApiAuth() (retire le token et la clé persist de localStorage), puis set({ user: null, token: null, lastActivityAt: null }).
- **isAuthenticated() :** true si token et user existent tous les deux.
- **isIdleExpired() :** true si lastActivityAt est plus ancien que 3 heures.
- **onRehydrateStorage :** Après réhydratation, setState({ _hasHydrated: true }) pour que le layout protégé sache quand exécuter la logique de redirection.

### `frontend/lib/api/client.ts`

- **Ce qu'il fait :** Instance axios de base et câblage d'authentification.
- **Intercepteur de requête :** Sur le client, lit localStorage eco_relais_token ; si présent, définit Authorization: Bearer <token> et appelle touchActivity() (met à jour lastActivityAt dans le store via session-idle).
- **Intercepteur de réponse :** Sur 401, clearAuth() et window.location.href = '/login'.
- **setAuthToken / clearAuth :** Écrit/retire eco_relais_token et les clés associées pour que le store et le client restent synchronisés.

### `frontend/lib/api/endpoints.ts`

- **authApi.login(email, password)** — POST /auth/login, retourne la réponse (data contient token, user).
- **authApi.register(body)** — POST /auth/register avec role, first_name, last_name, etc.
- **authApi.me()** — GET /users/profile, retourne normalisé { data: user }.

### `frontend/lib/validators/auth.ts`

- **loginSchema** — email (string, email), password (min 6).
- **registerStep1Schema** — rôle enum client | partner.
- **registerStep2Schema** — email, password min 6, firstName, lastName, phone optionnel.
- **registerStep3Schema** — address min 1, addressLat, addressLng nombres.

### `frontend/components/layout/protected-layout.tsx`

- **Ce qu'il fait :** Enveloppe le contenu du dashboard ; s'assure que l'utilisateur est connecté et a le bon rôle avant d'afficher la page.
- **Logique clé :** Utilise hasHydrated, user, isAuthenticated(). Dans useEffect (après hydratation) : si non authentifié ou pas d'utilisateur → router.replace('/login'). Si user.role !== rôle du layout → router.replace(ROLE_PREFIX[user.role] + '/dashboard'). Pendant !hasHydrated ou !user ou mismatch de rôle, rend loading. Sinon rend SidebarProvider, DashboardSidebar, Header, et children.

### `frontend/components/layout/dashboard-sidebar.tsx`

- **Ce qu'il fait :** Sidebar avec liens de navigation et menu utilisateur. Déconnexion : useAuthStore(s => s.logout) ; DropdownMenuItem onClick={logout}. (Pas de redirection ici ; l'utilisateur peut naviguer vers /login ou 401 redirigera.)

### `frontend/components/providers/session-idle-provider.tsx`

- **Ce qu'il fait :** Enregistre touchActivity du store avec session-idle pour que le client API puisse mettre à jour lastActivityAt. Exécute une vérification chaque minute (et au focus de la fenêtre) : si authentifié et isIdleExpired(), appelle logout() et window.location.href = '/login'. Écoute mousemove/keydown (throttled) et appelle touchActivity.
- **Fonctions clés :** registerActivityTouch(touchActivity), setInterval(checkAndLogout, 60_000), listener focus, listeners d'activité.

### `frontend/lib/session-idle.ts`

- **Ce qu'il fait :** Contient un seul callback. registerActivityTouch(cb) le définit ; touchActivity() l'invoque. Le client API appelle touchActivity() à chaque requête pour que le store d'authentification puisse mettre à jour lastActivityAt sans dépendance circulaire.

---

## 4. Flux utilisateur

1. **Connexion :** L'utilisateur ouvre /login → entre email/password → soumet → authApi.login → le backend retourne { token, user } → setAuth(user, token) → token stocké dans le store et localStorage (setAuthToken) → toast → redirection vers /client, /partner, ou /admin dashboard.
2. **Inscription :** L'utilisateur ouvre /register → étape 1 : choisir client/partner → étape 2 : email, password, nom, téléphone → étape 3 : adresse (autocomplete), soumet → authApi.register(...) → setAuth → redirection vers dashboard.
3. **Page protégée :** L'utilisateur navigue vers /client/dashboard → l'app utilise ProtectedLayout(role="client") → le layout attend _hasHydrated → si pas de token/user, redirection /login → si user.role !== 'client', redirection vers son dashboard → sinon rend sidebar + contenu.
4. **Déconnexion :** L'utilisateur clique sur Déconnexion dans la sidebar → logout() → clearAuth() et store effacé → le prochain appel API ou navigation peut envoyer vers /login ; 401 sur n'importe quel appel efface aussi l'authentification et redirige vers /login.
5. **Inactivité de session :** Chaque requête API appelle touchActivity() → lastActivityAt mis à jour. SessionIdleProvider vérifie chaque minute ; si lastActivityAt > il y a 3h et authentifié, logout et redirection /login. Mousemove/keydown touchent aussi (throttled).

---

## 5. Comment cela se connecte au backend

- **POST /api/auth/login** — Appelé par authApi.login(email, password). Attend body { email, password }. Retourne { success, token, user }. Le frontend stocke token et user.
- **POST /api/auth/register** — Appelé par authApi.register(body). Attend body avec email, password, role, first_name, last_name, phone, address, address_lat, address_lng (optionnels). Retourne { success, token, user }. Le frontend stocke token et user.
- **GET /api/users/profile** — Appelé par authApi.me(). Nécessite Authorization: Bearer <token>. Utilisé pour rafraîchir le profil si nécessaire ; non requis pour le flux initial login/register.
- **Réponses 401** — N'importe quel endpoint retournant 401 déclenche l'intercepteur de réponse du client API : clearAuth() et redirection vers /login.

---

## 6. Gestion d'état

- **Zustand (auth-store) :** user, token, lastActivityAt, _hasHydrated. Persisté dans localStorage (partialize : user, token, lastActivityAt) sous la clé eco_relais_auth. setAuth, logout, isAuthenticated, isIdleExpired, touchActivity. Utilisé par les pages login/register, ProtectedLayout, sidebar (logout), SessionIdleProvider.
- **Client API (localStorage) :** eco_relais_token est défini par setAuthToken quand setAuth est appelé ; clearAuth le retire (et eco_relais_user, eco_relais_auth). L'intercepteur de requête lit le token pour que chaque requête soit authentifiée.
- **TanStack Query :** Utilisé uniquement pour les mutations login et register (useMutation) ; pas de cache serveur pour "utilisateur actuel" au-delà du store. authApi.me() pourrait être utilisé avec useQuery ailleurs si nécessaire.
- **État local du composant :** Les formulaires login/register utilisent l'état react-hook-form ; la page register utilise step, role, step2Data, addressLat/Lng.

---

Documentation liée : [client-dashboard-feature.md](client-dashboard-feature.md), [mission-creation-feature.md](mission-creation-feature.md), [partner-dashboard-feature.md](partner-dashboard-feature.md), [admin-dashboard-feature.md](admin-dashboard-feature.md). Backend : [auth-feature.md](../../../backend/docs/features/auth-feature.md).
