# Cinémergence Fable — Site vitrine V1 Premium

Site institutionnel et génération de leads pour **Cinémergence**, association loi 1901 — centre de formation aux métiers du cinéma (Paris).

Stack : **Next.js 16**, **React 19**, **TypeScript strict**, **Tailwind CSS v4**, **shadcn/ui**, **Payload CMS 3**, **PostgreSQL**, **pnpm**.

Direction artistique : **Plateau vivant** — dominante rouge velours fauteuil de cinéma, noir profond, crème (Bebas Neue + Plus Jakarta Sans).

---

## Démarrage rapide

```bash
# 1. Variables d'environnement
cp .env.example .env.local

# 2. Base de données
docker compose up -d

# 3. Dépendances
pnpm install

# 4. Seed du contenu (serveur dev requis — pnpm dev)
pnpm dev
# Dans un autre terminal, après le démarrage :
pnpm seed
```

- Site public : http://localhost:3000
- Admin Payload : http://localhost:3000/admin
- Authentification : **Clerk** (voir section [Authentification (Clerk)](#authentification-clerk) ci-dessous). Créer un compte via `/sign-up` avec l'email `verdat.sylvain@gmail.com` pour récupérer les droits admin existants.

---

## Pages (sitemap V1)

| Page | URL |
| --- | --- |
| Accueil | `/` |
| 6 formations | `/formation-*` |
| Intervenants | `/intervenants` |
| Financement | `/financement` |
| Association | `/association` |
| Contact | `/contact` |
| Galerie | `/galerie` |
| Mentions légales | `/mentions-legales` |
| Confidentialité | `/confidentialite` |
| CGV | `/cgv` |

---

## Administration (Payload CMS)

Contenu éditorial administrable sans compétences techniques :

- **Formations** — textes, tarifs, dates, programme, FAQ, SEO
- **Intervenants** — bio, filmographie, photo
- **Témoignages** — quotes par profil
- **Médias** — galerie plateaux / livrables
- **Paramètres du site** — NDA, Qualiopi, réseaux sociaux
- **Soumissions formulaires** — contact, inscription, newsletter

### Activer Qualiopi

Dans Payload → Paramètres du site → cocher « Certification Qualiopi obtenue ». Aucun redéveloppement requis.

---

## Authentification (Clerk)

Toute l'authentification du site — visiteurs publics **et** admin Payload — est déléguée à [Clerk](https://clerk.com). Payload conserve une collection `users` en profil miroir (`clerkId`, `role`, données métier) via une [stratégie d'authentification custom](https://payloadcms.com/docs/authentication/custom-strategies) (`src/lib/clerk-strategy.ts`).

### Configuration (dashboard Clerk)

1. Créer une application sur [clerk.com](https://clerk.com) (nom : « Cinémergence »)
2. **API Keys** → copier `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY`
3. Renseigner ces clés dans `.env.local` (dev) et `.env.vercel.production` (prod), puis `./scripts/sync-vercel-env.sh`
4. Dans **Domains** (Clerk dashboard), whitelister le domaine de production (`https://cinemergence.vercel.app` puis `https://cinemergence.fr` une fois le DNS configuré)
5. Les URLs de connexion/inscription sont déjà configurées par défaut (`NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`)

### Fonctionnement

- `src/proxy.ts` protège `/admin(.*)` et toute route non listée comme publique : un visiteur non connecté est redirigé vers `/sign-in`
- À la première requête authentifiée sur `/admin`, `src/lib/clerk-strategy.ts` upsert le document `users` correspondant :
  1. Recherche par `clerkId`
  2. Sinon recherche par email (migration en douceur des comptes historiques) et lie le `clerkId`
  3. Sinon crée un nouveau document avec `role: "stagiaire"` par défaut
- Seuls les documents `users` avec `role: "admin"` peuvent accéder au panneau `/admin` (`access.admin` dans `src/collections/Users.ts`)
- Page `/mon-compte` : espace minimal (« Bonjour {prénom} » + déconnexion), point d'extension pour un futur espace stagiaire

### Migrer le compte admin historique

Le compte `verdat.sylvain@gmail.com` (ex-authentification locale Payload) doit créer un compte Clerk avec **le même email** via `/sign-up`. Son document `users` existant sera automatiquement lié par email. Pour vérifier/forcer que `role: "admin"` est bien conservé en production :

```bash
pnpm migrate:admin-role
```

L'ancien mot de passe local ne fonctionne plus après la bascule — c'est attendu.

---

## Formulaires & intégrations

- Server Actions : contact / inscription / financement
- `POST /api/newsletter` : capture email
- Brancher **Brevo** via `BREVO_API_KEY` + `BREVO_LIST_ID`
- **GA4** via `NEXT_PUBLIC_GA_MEASUREMENT_ID` (chargé après consentement cookies)

---

## Tests

```bash
pnpm test        # tests unitaires (Vitest)
pnpm test:e2e    # tests E2E (Playwright)
pnpm lint
pnpm build
```

---

## Évolutivité V2 (anticipée)

Architecture Payload extensible pour :

- Espace stagiaire complet (suivi de formation, documents, certificats) — s'appuie sur l'authentification Clerk déjà en place
- Webhook Clerk (`/api/webhooks/clerk`) pour synchronisation temps réel / désactivation de comptes
- Paiement **Stripe** + réservation de créneaux
- Admin stages / sessions / créneaux horaires
- Catalogue dynamique avec filtres

---

## Déploiement

- Hébergement EU recommandé (Vercel + Supabase Postgres + Supabase Storage EU)

### Stockage médias (local vs production)

| Environnement | Métadonnées | Fichiers |
| --- | --- | --- |
| **localhost** | PostgreSQL (Docker) | Dossier `/media` sur disque |
| **Vercel (prod)** | Supabase Postgres | Bucket Supabase `cinemergence-media` |

En développement, **ne pas** définir les variables `S3_*` : le plugin Supabase est désactivé automatiquement (`NODE_ENV=development`). Upload via `/admin` → collection **Médias** ; les fichiers restent dans `/media` et les URLs passent par `/api/media/file/…`.

### Variables Vercel (production)

Copier `.env.vercel.production.example` → `.env.vercel.production`, remplir les secrets, puis :

```bash
vercel login && vercel link
chmod +x scripts/sync-vercel-env.sh
./scripts/sync-vercel-env.sh
```

| Variable | Description |
| --- | --- |
| `DATABASE_URI` | Postgres Supabase (connection string) |
| `PAYLOAD_SECRET` | Secret Payload (32+ caractères) |
| `NEXT_PUBLIC_SITE_URL` | URL publique canonique — `https://cinemergence.vercel.app` en prod pour l'instant ; `https://cinemergence.fr` une fois le DNS configuré |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys (clé publique) |
| `CLERK_SECRET_KEY` | Clerk → API Keys (clé secrète) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `S3_BUCKET` | `cinemergence-media` |
| `S3_REGION` | ex. `eu-central-1` |
| `S3_ENDPOINT` | `https://<PROJECT_REF>.storage.supabase.co/storage/v1/s3` |
| `S3_ACCESS_KEY_ID` | Clé S3 Supabase |
| `S3_SECRET_ACCESS_KEY` | Secret S3 Supabase |
| `SUPABASE_STORAGE_PUBLIC_URL` | `https://<PROJECT_REF>.supabase.co/storage/v1/object/public/cinemergence-media` |
| `MIGRATE_MEDIA_SECRET` | Bearer pour `POST /api/seed/migrate-storage` |
| `BREVO_API_KEY` | Clé Brevo : `xsmtpsib-…` (SMTP) ou `xkeysib-…` (API REST) |
| `BREVO_SMTP_LOGIN` | **Obligatoire avec `xsmtpsib-`** — login affiché dans Brevo → SMTP & API → onglet SMTP (`xxx@smtp-brevo.com`) |
| `CONTACT_NOTIFICATION_EMAIL` | Destinataire (ex. `verdat.sylvain@gmail.com`) |
| `BREVO_SENDER_EMAIL` | Expéditeur vérifié dans Brevo (souvent la même adresse au départ) |

### Notifications email (formulaires contact)

Les soumissions sont enregistrées dans Payload (**Admin → Form submissions**), puis une notification part via **Brevo** si `BREVO_API_KEY` est configurée.

1. Créer un compte sur [brevo.com](https://www.brevo.com)
2. **Expéditeurs** → vérifier `verdat.sylvain@gmail.com` (ou ton domaine)
3. **SMTP & API → onglet SMTP** :
   - Copier le **login SMTP** (`xxx@smtp-brevo.com`) → `BREVO_SMTP_LOGIN`
   - Copier la **clé SMTP** (`xsmtpsib-…`) → `BREVO_API_KEY`
   - *(Alternative : clé API REST `xkeysib-…` sans `BREVO_SMTP_LOGIN`)*
4. Ajouter dans `.env.vercel.production` : `BREVO_API_KEY`, `BREVO_SMTP_LOGIN`, `CONTACT_NOTIFICATION_EMAIL`, `BREVO_SENDER_EMAIL`
5. `./scripts/sync-vercel-env.sh` puis redéployer Vercel

Sans `BREVO_API_KEY`, le client voit le toast vert (données sauvegardées) mais **aucun email** n'est envoyé.

### Médias en production (Supabase Storage)

1. Créer un bucket **public** `cinemergence-media` dans Supabase Storage
2. Activer **S3 Connection** et copier les clés dans Vercel
3. Après déploiement, migrer les fichiers :

```bash
curl -X POST "https://votre-domaine/api/seed/migrate-storage?force=1" \
  -H "Authorization: Bearer $MIGRATE_MEDIA_SECRET"
```

Voir `.cursor/skills/media-storage-architecture/SKILL.md` pour l'architecture complète.

### Sécurité Supabase (RLS)

Les tables Payload sont dans le schéma `public` et seraient exposées via l'API PostgREST (clé `anon`) sans protection. Payload se connecte en **postgres direct** (pooler) — pas via PostgREST.

Après la première migration Payload, activer RLS :

```bash
pnpm supabase:rls
```

Ou coller `scripts/supabase-enable-rls.sql` dans **Supabase → SQL Editor**. Cela active RLS sur toutes les tables CMS et révoque l'accès `anon` / `authenticated`. Le site et l'admin Payload continuent de fonctionner (rôle `postgres`).
