---
name: design-epure
description: Visual rules for the Cinémergence public site — sparse, fast, left-aligned, one blue, one type family. Use when changing layout, typography, color, motion, or any public page. Do not restyle the Kheiron landing.
---

# Design épuré

Le site a déjà une direction. On l'étend. On ne le réinvente pas, et on n'ouvre pas un catalogue de styles (verre, argile, brutalisme).

## À garder

- Une famille : Inter, déjà servie en local. Pas de nouvelle police.
- Cinq tailles, déjà dans `src/app/globals.css` : 14 légende, 16 corps, 20 sous-titre (`h3`), 32 titre (`h2`), 44 affichage (`h1`).
- Texte aligné à gauche.
- Bleu signature : `--convert` / `--or`, `#2F5BFF`. Pas une deuxième couleur d'accent.
- Beaucoup d'air, peu d'ombres, pas de dégradé décoratif, pas de grain, pas de curseur custom.

## Vitesse

- Pas d'animation qui retarde le texte. Un mouvement, s'il existe, est en CSS et ne bloque pas l'affichage.
- Pas de bibliothèque d'animation ajoutée pour un effet.
- Les images ont une taille réelle. La vidéo d'accueil ne se charge pas avant la fin du chargement de la page.

## Ne pas toucher

- `src/features/kheiron/kheiron.css` et le dessin de la landing Kheiron.
- Les pages publiques ne nomment pas CPF, Mon Compte Formation, AFDAS, OPCO ni France Travail.

## Revue

Pour l'accessibilité et les détails d'interface (focus, cibles, contrastes), utiliser le skill `web-design-guidelines`. Il ne choisit pas une nouvelle identité.
