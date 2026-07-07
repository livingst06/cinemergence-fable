import { s3Storage } from "@payloadcms/storage-s3";
import type { Plugin } from "payload";

import { isS3StorageEnabled } from "@/lib/storage-env";

const mediaPrefix = "media";

export function getStoragePlugins(): Plugin[] {
  if (!isS3StorageEnabled()) {
    return [];
  }

  return [
    s3Storage({
      acl: "public-read",
      bucket: process.env.S3_BUCKET!,
      clientUploads: true,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          prefix: mediaPrefix,
          generateFileURL: ({ filename, prefix }) => {
            const base = process.env.SUPABASE_STORAGE_PUBLIC_URL!.replace(/\/$/, "");
            const key = prefix ? `${prefix}/${filename}` : filename;
            return `${base}/${key}`;
          },
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION || "eu-west-1",
        endpoint: process.env.S3_ENDPOINT!,
        forcePathStyle: true,
      },
    }),
  ];
}
