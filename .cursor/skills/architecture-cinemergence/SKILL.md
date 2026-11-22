---
name: architecture-cinemergence
description: Architecture of this Next.js and Payload app. Use when adding a module, moving code between layers, reviewing boundaries, or deciding where a function belongs. Do not introduce use-case, entity, or port layers.
---

# Architecture (ce dépôt)

La règle toujours active est `.cursor/rules/server-first-architecture.mdc`. Ce skill précise comment l'appliquer.

## Sens des dépendances

`app` → `features` → `lib` → Payload.

- **Pages** (`src/app/(frontend)/**`) composent l'UI et lisent via `src/lib/**`.
- **Features** (`src/features/**`) : UI du domaine et actions serveur. Une action fait auth, valide avec Zod, appelle `lib`, puis `revalidatePath`.
- **Lib** (`src/lib/**`) : accès données, auth, validations, fonctions pures. Seul `lib` appelle `getPayloadClient`.
- **Collections** (`src/collections/**`, `src/payload.config.ts`) : schéma Payload, pas d'UI.

## Interdits

- Importer `payload`, `getPayloadClient` ou `formations-catalog` depuis un fichier `"use client"`.
- Importer un type depuis un fichier `"use server"`. Les types partagés vivent dans un fichier sans `"use server"`, comme `src/lib/admin-session-types.ts`.
- Ajouter des dossiers use case, entity, port, adapter ou presenter. Le dépôt n'utilise pas ces couches.
- Créer un barrel qui réexporte un gros module vers le client.
- `"use client"` pour un écran qui ne fait qu'afficher.

## Quand découper

Extraire un composant ou une fonction quand deux endroits divergent déjà, pas par avance. Les helpers purs (format, ids, validation) vont dans `src/lib/**` avec un test.
