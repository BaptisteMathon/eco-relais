# Fonctionnalité i18n / changement de langue (frontend)

**Ce document explique la fonctionnalité i18n (internationalisation) et changement de langue d'Eco-Relais (frontend).**

---

## 1. Ce que fait cette fonctionnalité

Le frontend supporte **deux locales**, français (fr) et anglais (en). La **locale actuelle** est stockée dans l'état React et persistée dans localStorage (et un cookie). Une **fonction de traduction** `t(key)` retourne la chaîne pour la locale actuelle depuis les fichiers de messages JSON (clés en notation point, par exemple `mission.status.pending`). Le composant **LanguageSwitcher** dans l'en-tête permet à l'utilisateur de basculer entre français et anglais. Les hooks d'aide **useMissionStatusLabels** et **usePackageSizeLabels** retournent des cartes d'étiquettes pour la locale actuelle. Tout le texte visible par l'utilisateur dans l'app utilise `t(...)` donc changer la langue met à jour l'UI.

---

## 2. Fichiers impliqués

| Fichier | Rôle |
|------|------|
| `frontend/lib/i18n/context.tsx` | I18nProvider, useTranslation, état locale, t(), setLocale, chargement des messages |
| `frontend/lib/i18n/index.ts` | Ré-exports + useMissionStatusLabels, usePackageSizeLabels |
| `frontend/messages/fr.json` | Arbre de messages français (clés et chaînes) |
| `frontend/messages/en.json` | Arbre de messages anglais |
| `frontend/components/layout/language-switcher.tsx` | Menu déroulant pour changer la locale (fr/en) |
| `frontend/components/layout/header.tsx` | Affiche LanguageSwitcher dans l'en-tête |
| Mise en page app / providers | Enveloppe l'app avec I18nProvider pour que t() et locale soient disponibles |

---

## 3. Explication fichier par fichier

### `frontend/lib/i18n/context.tsx`

- **Ce qu'il fait :** Fournit la locale et la traduction à toute l'app. Charge les messages depuis fr.json et en.json ; expose locale, setLocale et t(key).
- **Type Locale :** Locale = 'fr' | 'en'. Par défaut DEFAULT_LOCALE = 'fr'.
- **Persistance :** STORAGE_KEY = 'eco_relais_locale' ; au montage lit localStorage et définit la locale initiale ; setLocale met à jour l'état, localStorage et le cookie (setLocaleCookie). Cookie COOKIE_KEY = 'eco_relais_locale', max-age 1 an.
- **getNested(obj, path) :** Divise la clé par '.' et parcourt l'objet message (par exemple 'mission.status.pending' → obj.mission.status.pending).
- **t(key) :** Si pas monté, retourne key. Sinon getNested(messages[locale], key) ; si manquant, retourne key. Donc les clés non traduites s'affichent comme la chaîne de clé.
- **I18nProvider :** useState pour locale et mounted. useEffect au montage : lire localStorage, définir locale et cookie, setMounted(true). setLocale(next) met à jour l'état, localStorage, cookie. value = { locale, setLocale, t } ; Provider enveloppe les enfants.
- **useTranslation() :** useContext(I18nContext). Si pas de contexte (par exemple hors provider), retourne repli { locale: DEFAULT_LOCALE, setLocale: noop, t: key => key }.

### `frontend/lib/i18n/index.ts`

- **Ce qu'il fait :** Ré-exporte I18nProvider, useTranslation, Locale. Définit useMissionStatusLabels et usePackageSizeLabels.
- **useMissionStatusLabels() :** Utilise t depuis useTranslation. Retourne un objet mappant chaque clé de statut de mission (pending, accepted, collected, in_transit, delivered, cancelled) à t(`mission.status.${key}`).
- **usePackageSizeLabels() :** Retourne { small: t('mission.size.small'), medium: t('mission.size.medium'), large: t('mission.size.large') }.

### `frontend/messages/fr.json` et `frontend/messages/en.json`

- **Ce qu'ils font :** Objets JSON imbriqués. Les clés sont des clés de traduction (par exemple auth.signInTitle, mission.status.pending). Les valeurs sont des chaînes en français ou anglais. Utilisés par getNested dans context pour résoudre t(key).

### `frontend/components/layout/language-switcher.tsx`

- **Ce qu'il fait :** Menu déroulant avec déclencheur (icône Langues). Deux éléments : "Français" et "Anglais" ; la locale actuelle montre "✓". onClick sur Français appelle setLocale('fr') ; onClick sur Anglais appelle setLocale('en'). Utilise useTranslation pour locale, setLocale et t (par exemple common.language, common.french, common.english).

### `frontend/components/layout/header.tsx`

- **Ce qu'il fait :** Affiche le déclencheur de barre latérale, titre optionnel, et sur le côté droit LanguageSwitcher et ThemeToggle. Donc chaque tableau de bord (client, partenaire, admin) qui utilise cet en-tête a le sélecteur de langue.

### Mise en page App

- **Ce qu'elle fait :** La mise en page racine (ou une mise en page provider) enveloppe l'app avec I18nProvider pour que toutes les pages et composants puissent utiliser useTranslation() et voir la même locale et t().

---

## 4. Flux utilisateur

1. L'utilisateur ouvre l'app ; la locale est lue depuis localStorage (ou défaut fr). Tout le texte est rendu avec t(key) donc le français ou l'anglais apparaît.
2. L'utilisateur clique sur l'icône de langue dans l'en-tête → le menu déroulant montre "Français ✓" et "Anglais". L'utilisateur clique sur "Anglais" → setLocale('en') s'exécute → l'état locale se met à jour, localStorage et cookie sont définis → les composants se re-rendent et t() retourne des chaînes anglaises.
3. L'utilisateur navigue ou rafraîchit ; la locale est toujours 'en' depuis localStorage donc l'UI reste en anglais jusqu'à ce qu'il change à nouveau.

---

## 5. Comment cela se connecte au backend

- **Aucun appel backend.** La locale et les messages sont entièrement frontend. Le backend n'a pas besoin de connaître la langue de l'utilisateur pour cette fonctionnalité. Si le backend retourne jamais les préférences utilisateur (par exemple preferred_language), le frontend pourrait initialiser la locale depuis cela.

---

## 6. Gestion de l'état

- **État React (I18nProvider) :** locale (fr | en), mounted (pour que t() ne s'exécute pas avant l'hydratation/lecture localStorage). setLocale met à jour locale et persiste dans localStorage et cookie.
- **LocalStorage :** eco_relais_locale = 'fr' | 'en'.
- **Cookie :** eco_relais_locale (même valeur) pour utilisation côté serveur ou inter-onglets optionnelle.
- **Zustand / TanStack Query :** Non utilisés pour i18n. Les pages utilisent useTranslation() et useMissionStatusLabels() / usePackageSizeLabels() pour les étiquettes qui dépendent de la locale.

---

Documentation associée : Tous les documents de fonctionnalités qui montrent l'UI utilisent t() et optionnellement useMissionStatusLabels/usePackageSizeLabels (auth, client-dashboard, mission-creation, mission-detail, partner-dashboard, admin-dashboard, etc.).
