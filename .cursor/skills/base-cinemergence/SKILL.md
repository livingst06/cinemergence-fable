---
name: base-cinemergence
description: Database rules for this shared Postgres and Payload app. Use before any schema change, SQL, migration, or new table. Read this before postgresql-table-design. Do not ALTER existing tables on a page request.
---

# Base (ce dépôt)

Lire ce skill avant `postgresql-table-design`. Les types Postgres généraux s'appliquent aux **nouvelles** tables. Ils ne donnent pas le droit de réécrire le schéma existant.

## Source de vérité

Le fonctionnement (rôle, session, paiement, salon) est une table et ses colonnes. Les fiches CMS (`intervenants`, textes de formations) sont le contenu public. Elles ne donnent pas les droits. Détail : `.cursor/rules/tables-pas-fiches-cms.mdc`.

On dit **élève**, jamais stagiaire. Le rôle est `users.role`.

## Schéma

- `src/payload.config.ts` a `push: false`. Payload ne pousse pas le schéma.
- Pas de `CREATE`, `ALTER` ou `DROP` pendant une requête de page, une action ou un webhook.
- `ensureUsersRoleEnum` et les autres `ALTER TYPE` ne tournent qu'au seed.
- Une colonne ou une table manquante fait échouer la lecture. On ne la crée pas en cachette, et on ne remplace pas la base par un fichier.

## Base partagée

localhost, Preview et la production actuelle lisent la même base. Un `ALTER` sur une table existante touche la production.

Avant tout changement de schéma, le dire. Ne lancer le SQL qu'après un accord. Préférer une colonne nullable ajoutée, du même type que la colonne voisine. Ne pas changer le type d'une colonne qui a déjà des lignes.

Les montants déjà stockés en euros entiers (`tarif_euros`, et les tables de paiements) restent des entiers. Ne pas les migrer vers `numeric` pour coller au skill Postgres général.

## Nouveau

Une nouvelle table est un fichier SQL lancé une fois, hors requête, avec une clé primaire, les `NOT NULL` qui ont un sens, et un index sur chaque clé étrangère utilisée dans un `JOIN` ou un filtre.
