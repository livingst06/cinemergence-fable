export type GalleryUploadResult = {
  id: number | string;
  url: string;
  mimeType?: string;
};

export type GalleryUploadPhase = "optimize" | "upload";
export type GalleryUploadProgress = (percent: number, phase: GalleryUploadPhase) => void;

export async function uploadGalleryMedia(
  file: File,
  meta: { alt?: string; caption?: string; category: string },
  onProgress?: GalleryUploadProgress,
): Promise<GalleryUploadResult> {
  if (meta.category === "interview") {
    return uploadInterviewVideoDirect(file, meta.alt, onProgress);
  }

  const formData = new FormData();
  formData.append("file", file);
  if (meta.alt) formData.append("alt", meta.alt);
  if (meta.caption) formData.append("caption", meta.caption);
  formData.append("category", meta.category);

  const response = await fetch("/api/admin/gallery-media", {
    method: "POST",
    body: formData,
  });

  return readUploadResponse(response);
}

async function uploadInterviewVideoDirect(
  file: File,
  alt: string | undefined,
  onProgress?: GalleryUploadProgress,
): Promise<GalleryUploadResult> {
  const { optimizeAdminVideo } = await import(
    "@/features/galerie/optimize-admin-video"
  );
  onProgress?.(0, "optimize");
  const optimized = await optimizeAdminVideo(file, (percent) => {
    onProgress?.(percent, "optimize");
  });
  const mimeType = (optimized.type || "video/mp4").toLowerCase();

  const signResponse = await fetch("/api/admin/gallery-media/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mimeType, filesize: optimized.size }),
  });
  const signed = (await signResponse.json().catch(() => null)) as {
    filename?: string;
    uploadUrl?: string;
    error?: string;
  } | null;
  if (!signResponse.ok || !signed?.filename || !signed.uploadUrl) {
    throw new Error(signed?.error ?? "Signature d’upload impossible");
  }

  onProgress?.(0, "upload");
  await putFileToSignedUrl(signed.uploadUrl, optimized, mimeType, (percent) => {
    onProgress?.(percent, "upload");
  });

  const completeResponse = await fetch("/api/admin/gallery-media/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: signed.filename,
      mimeType,
      filesize: optimized.size,
      alt,
    }),
  });
  return readUploadResponse(completeResponse);
}

function putFileToSignedUrl(
  url: string,
  file: File,
  mimeType: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.timeout = 0;
    xhr.setRequestHeader("Content-Type", mimeType);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      reject(
        new Error(
          xhr.status === 403
            ? "Stockage refusé (CORS ou limite de taille Supabase)."
            : `Envoi vers le stockage impossible (${xhr.status})`,
        ),
      );
    };
    xhr.onerror = () =>
      reject(new Error("Réseau : impossible d’envoyer la vidéo vers le stockage"));
    xhr.ontimeout = () => reject(new Error("Délai dépassé pendant l’envoi"));
    xhr.send(file);
  });
}

async function readUploadResponse(response: Response): Promise<GalleryUploadResult> {
  const body = (await response.json().catch(() => null)) as
    | { id?: number | string; url?: string; mimeType?: string; error?: string }
    | null;

  if (!response.ok || !body?.id || !body?.url) {
    throw new Error(body?.error ?? "Upload impossible");
  }

  return { id: body.id, url: body.url, mimeType: body.mimeType };
}
