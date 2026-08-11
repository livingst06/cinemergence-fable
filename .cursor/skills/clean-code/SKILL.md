---
name: clean-code
description: Pragmatic clean-code guidelines for this Next.js + Payload app — naming, SRP, DRY for admin UI, thin boundaries, readable server actions. Use when refactoring, reviewing, or writing TypeScript/React in this repo.
---

# Clean Code (pragmatic)

## Principles

1. **Small units** — one reason to change per function/component.
2. **Names that say why** — prefer `requireAdmin` over `check`, `toRelationIds` over `fix`.
3. **DRY at call sites that already diverge** — extract shared shells (admin dialog, upload, add-card) only when 2+ copies exist.
4. **Pure helpers** — put formatting, ID coercion, and validation in `src/lib/**` with unit tests.
5. **Thin actions** — server actions: auth → validate (Zod) → mutate → return `{ ok, error? }`.
6. **No speculative abstraction** — don’t invent layers unused by the app.

## React / Next

- Server Components by default; client only for state/events.
- Colocate feature UI under `src/features/<domain>/`.
- Avoid prop drilling of huge Payload docs — map to view models in `lib/data`.

## Review checklist

- [ ] No Payload / catalog imports in `"use client"` files
- [ ] Auth on every mutation
- [ ] Duplicated JSX > ~30 lines → candidate for shared component
- [ ] Magic strings for statuses → constants or Zod enums
- [ ] Dead code / unused exports removed
