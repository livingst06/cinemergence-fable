---
name: media-storage-architecture
description: >-
  Architecture médias Payload CMS avec Supabase Storage (S3), Vercel et Next.js.
  Use when configuring production media persistence, Supabase buckets, S3 env vars,
  migrating uploads, or debugging broken images on Vercel.
---

# Architecture médias — Payload + Supabase Storage

## Principes

| Couche | Rôle |
|--------|------|
| **Payload `media`** | Métadonnées (alt, catégorie, relations) en Postgres |
| **Supabase Storage** | Fichiers binaires persistants (S3-compatible) |
| **`public/videos/`** | Hero vidéo statique versionnée (hors CMS) |
| **`public/images/site/`** | Fallback **local dev uniquement** si S3 non configuré |

**Ne jamais** compter sur `/media/` ou `/api/media/file/` en production serverless.

## Configuration Supabase

1. **Storage** → créer bucket `cinemergence-media` → **Public**
2. **Storage → S3 Connection** → générer Access Key ID + Secret
3. Variables d'environnement **Vercel production uniquement** (ne pas les mettre dans `.env.local`) :

```bash
S3_BUCKET=cinemergence-media
S3_REGION=eu-central-1
S3_ENDPOINT=https://<PROJECT_REF>.storage.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
SUPABASE_STORAGE_PUBLIC_URL=https://<PROJECT_REF>.supabase.co/storage/v1/object/public/cinemergence-media
```

Switch automatique : `src/lib/storage-env.ts` — **local** = Postgres + `/media` ; **prod** = Supabase si creds présentes.

Sync Vercel : `./scripts/sync-vercel-env.sh` (après `vercel login`).

4. CORS bucket (uploads client Payload) : autoriser `PUT` depuis le domaine du site

## Code source

- Plugin : `src/payload/storage.ts` (`@payloadcms/storage-s3`, `forcePathStyle: true`)
- Détection env : `src/lib/storage-env.ts`
- URLs affichage : `src/lib/media-utils.ts` → URLs `https://` Supabase prioritaires
- Import initial prod : `pnpm migrate:prod` (depuis la machine dev, `_assets-client/` requis)
- Route legacy : `POST /api/seed/migrate-storage` (ne fonctionne pas sur Vercel serverless — pas de sharp/ffmpeg)

## Workflows

### Local sans Supabase

```bash
# .env.local : DATABASE_URI + PAYLOAD_SECRET uniquement (pas de S3_*)
pnpm dev
pnpm seed && pnpm seed:media
# Fichiers dans /media, URLs /api/media/file/…
pnpm sync:media   # optionnel — fallback public/images/site/
```

### Production (Vercel)

1. Configurer Postgres (Supabase) + variables S3 ci-dessus
2. Déployer
3. Migrer les médias une fois (depuis la machine de dev) :

```bash
pnpm migrate:prod
```

4. Vérifier qu'une URL média commence par `https://` Supabase (pas `/api/media/`)

### Nouveau média via admin

`/admin` → Médias → upload (stocké directement sur Supabase si S3 configuré)

## Dépannage

| Symptôme | Cause | Fix |
|----------|-------|-----|
| Images cassées sur Vercel | Fichiers locaux `/media/` | Configurer S3 + `pnpm migrate:prod` |
| 403 sur `/api/media/file/` | Accès Payload (legacy) | URLs doivent pointer Supabase (`disablePayloadAccessControl`) |
| SSL handshake S3 | `forcePathStyle` manquant | Déjà dans `storage.ts` |
| Upload > 4.5 Mo échoue | Limite Vercel serverless | `clientUploads: true` + CORS bucket |

## Référence détaillée

Voir [reference.md](reference.md)
