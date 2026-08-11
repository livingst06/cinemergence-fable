export type AdminImageUploadResult = {
  id: number | string;
  url: string;
};

export async function uploadAdminImage(
  endpoint: "/api/admin/formation-images" | "/api/admin/intervenant-photos",
  file: File,
): Promise<AdminImageUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const body = (await response.json().catch(() => null)) as
    | { id?: number | string; url?: string; error?: string }
    | null;

  if (!response.ok || !body?.id || !body?.url) {
    throw new Error(body?.error ?? "Upload impossible");
  }

  return { id: body.id, url: body.url };
}
