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
- Identifiants seed : `admin@cinemergence.paris` / `ChangeMe123!`

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

- Authentification **Clerk** + espace stagiaire
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
| `S3_BUCKET` | `cinemergence-media` |
| `S3_REGION` | ex. `eu-central-1` |
| `S3_ENDPOINT` | `https://<PROJECT_REF>.storage.supabase.co/storage/v1/s3` |
| `S3_ACCESS_KEY_ID` | Clé S3 Supabase |
| `S3_SECRET_ACCESS_KEY` | Secret S3 Supabase |
| `SUPABASE_STORAGE_PUBLIC_URL` | `https://<PROJECT_REF>.supabase.co/storage/v1/object/public/cinemergence-media` |
| `MIGRATE_MEDIA_SECRET` | Bearer pour `POST /api/seed/migrate-storage` |

- HTTPS obligatoire

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
