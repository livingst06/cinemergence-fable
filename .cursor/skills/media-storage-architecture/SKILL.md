---
name: media-storage-architecture
description: >-
  Architecture médias Payload CMS avec Supabase Storage (S3), Vercel et Next.js.
  Use when configuring media persistence, Supabase buckets, S3 env vars,
  migrating uploads, or debugging broken images on Vercel / local / preview.
---

# Architecture médias — Payload + Supabase Storage

## Principes

| Couche | Rôle |
|--------|------|
| **Payload `media`** | Métadonnées (alt, catégorie, relations) en Postgres |
| **Supabase Storage** | Fichiers binaires persistants (S3-compatible) |
| **`public/videos/`** | Hero vidéo statique versionnée (hors CMS) |
| **`public/images/site/`** | Fallback statique si URL CMS absente |

**Une seule BDD + un seul bucket** pour local, preview et prod.  
**Ne jamais** compter sur `/media/` ou `/api/media/file/` en serverless.

## Configuration Supabase

1. **Storage** → bucket `cinemergence-media` → **Public**
2. **Storage → S3 Connection** → Access Key ID + Secret
3. Mêmes variables dans **`.env.local`**, **preview** et **production** :

```bash
MEDIA_STORAGE=supabase
S3_BUCKET=cinemergence-media
S3_REGION=eu-central-1
S3_ENDPOINT=https://<PROJECT_REF>.storage.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
SUPABASE_STORAGE_PUBLIC_URL=https://<PROJECT_REF>.supabase.co/storage/v1/object/public/cinemergence-media
NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC_URL=... # même URL publique
DATABASE_URI=... # même Postgres Supabase
```

Switch : `src/lib/storage-env.ts` — Supabase dès que les credentials existent ; opt-out `MEDIA_STORAGE=local`.

Sync Vercel : `./scripts/sync-vercel-env.sh` (après `vercel login`).

4. CORS bucket (uploads client Payload) : autoriser `PUT` depuis localhost + domaines Vercel

## Code source

- Plugin : `src/payload/storage.ts` (`@payloadcms/storage-s3`, `forcePathStyle: true`)
- Détection env : `src/lib/storage-env.ts`
- URLs affichage : `src/lib/media-utils.ts` → URLs `https://` Supabase prioritaires
- Upload admin formations : `POST /api/admin/formation-images`
- Import initial : `pnpm migrate:prod` (depuis la machine dev)

## Workflows

### Local / preview / prod (recommandé)

```bash
# .env.local : DATABASE_URI + MEDIA_STORAGE=supabase + S3_* (mêmes valeurs que Vercel)
pnpm dev
# Uploads → bucket Supabase ; visibles immédiatement en preview/prod
```

### Opt-out disque (hors sync)

```bash
MEDIA_STORAGE=local
# Fichiers dans /media — ne pas utiliser si tu partages la BDD prod
```

## Dépannage

| Symptôme | Cause | Fix |
|----------|-------|-----|
| Images locales invisibles en prod | `MEDIA_STORAGE=local` ou S3_* absents | Copier S3_* + DATABASE_URI partagés |
| Images cassées sur Vercel | Fichiers `/media/` legacy | Configurer S3 + `pnpm migrate:prod` |
| 403 sur `/api/media/file/` | Accès Payload (legacy) | URLs doivent pointer Supabase |
| Upload > 4.5 Mo échoue | Limite Vercel serverless | `clientUploads: true` + CORS bucket |

## Référence détaillée

Voir [reference.md](reference.md)
