import {
  uploadAdminImage,
  type AdminImageUploadResult,
} from "@/lib/upload-admin-image";

export type FormationImageUploadResult = AdminImageUploadResult;

export async function uploadFormationImage(
  file: File,
): Promise<FormationImageUploadResult> {
  return uploadAdminImage("/api/admin/formation-images", file);
}
