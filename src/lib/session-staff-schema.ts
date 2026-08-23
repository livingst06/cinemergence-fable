import type { Payload } from "payload";

/**
 * Le rattachement staff ↔ users vit dans le code.
 * Pas d’ALTER / DROP ici : la base est partagée avec la production.
 */
export async function ensureSessionStaffUsersRels(
  payload: Payload,
): Promise<void> {
  void payload;
}
