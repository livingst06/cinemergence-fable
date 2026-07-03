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

- Hébergement EU recommandé (Vercel + Neon Postgres EU)
- Variables d'environnement production : `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`
- HTTPS obligatoire
