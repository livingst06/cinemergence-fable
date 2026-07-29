/**
 * Upload static formation/founder covers to Supabase Storage (bucket public).
 * Usage: pnpm tsx scripts/upload-covers-supabase.ts
 */
import fs from "fs";
import path from "path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { loadEnvConfig } from "@next/env";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq)] ??= trimmed.slice(eq + 1);
  }
}

loadEnvConfig(process.cwd());
loadEnvFile(path.resolve(".env.vercel.production"));

const required = [
  "S3_BUCKET",
  "S3_REGION",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "SUPABASE_STORAGE_PUBLIC_URL",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variable manquante : ${key}`);
  }
}

const bucket = process.env.S3_BUCKET!;
const publicBase = process.env.SUPABASE_STORAGE_PUBLIC_URL!.replace(/\/$/, "");

const client = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

type UploadSpec = { local: string; key: string };

const uploads: UploadSpec[] = [
  ...fs
    .readdirSync(path.resolve("public/images/formations"))
    .filter((f) => /\.jpe?g$/i.test(f))
    .map((f) => ({
      local: path.resolve("public/images/formations", f),
      key: `media/covers/${f}`,
    })),
  {
    local: path.resolve("public/images/founder/choukri-roua.jpg"),
    key: "media/covers/founder-choukri-roua.jpg",
  },
];

async function main() {
  const urls: Record<string, string> = {};

  for (const item of uploads) {
    if (!fs.existsSync(item.local)) {
      console.warn(`Skip (introuvable): ${item.local}`);
      continue;
    }
    const body = fs.readFileSync(item.local);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: item.key,
        Body: body,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const url = `${publicBase}/${item.key}`;
    urls[item.key] = url;
    console.log(`✓ ${item.key}`);
  }

  console.log("\nURLs publiques :");
  for (const [key, url] of Object.entries(urls)) {
    console.log(`${key}\n  ${url}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
