import "server-only";

import { deleteMediaByIds } from "@/lib/formation-media";
import { getPayloadClient } from "@/lib/payload";

export async function deleteGalleryMedia(id: number | string): Promise<number> {
  const payload = await getPayloadClient();
  return deleteMediaByIds(payload, [id]);
}
