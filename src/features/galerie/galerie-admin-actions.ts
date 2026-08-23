"use server";

import { revalidatePath } from "next/cache";

import { deleteMediaByIds } from "@/lib/formation-media";
import { getPayloadClient } from "@/lib/payload";
import { requireAdmin } from "@/lib/session-profile";

export type GalleryAdminActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function revalidateGalleryPaths() {
  revalidatePath("/galerie");
  revalidatePath("/");
  revalidatePath("/formations", "layout");
}

export async function deleteGalleryMediaAction(
  id: number | string,
): Promise<GalleryAdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  try {
    const payload = await getPayloadClient();
    const deleted = await deleteMediaByIds(payload, [id]);
    if (deleted === 0) {
      return { ok: false, error: "Suppression impossible" };
    }
    revalidateGalleryPaths();
    return { ok: true, message: "Média supprimé" };
  } catch (error) {
    console.error("[deleteGalleryMediaAction]", error);
    return { ok: false, error: "Suppression impossible" };
  }
}
