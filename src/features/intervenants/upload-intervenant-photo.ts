import {
  uploadAdminImage,
  type AdminImageUploadResult,
} from "@/lib/upload-admin-image";

export type IntervenantPhotoUploadResult = AdminImageUploadResult;

export async function uploadIntervenantPhoto(
  file: File,
): Promise<IntervenantPhotoUploadResult> {
  return uploadAdminImage("/api/admin/intervenant-photos", file);
}
