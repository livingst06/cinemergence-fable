import fs from "fs";
import os from "os";
import path from "path";

import sharp from "sharp";

import type { Payload } from "payload";

const assetsRoot = path.resolve("_assets-client");

type MediaCategory = "plateau" | "livrable" | "portrait" | "autre";

type GalleryAsset = {
  file: string;
  alt: string;
  category: MediaCategory;
};

export const galleryAssets: GalleryAsset[] = [
  { file: "photos/DSC07202.jpg", alt: "Plateau de tournage — direction d'acteur", category: "plateau" },
  { file: "photos/DSC07225.jpg", alt: "Plateau Cinémergence — équipe technique", category: "plateau" },
  { file: "photos/DSC07227.jpg", alt: "Master class sur le plateau", category: "plateau" },
  { file: "photos/DSC07230.jpg", alt: "Tournage en conditions professionnelles", category: "plateau" },
  { file: "photos/DSC07232.jpg", alt: "Comédiens en répétition avant prise", category: "plateau" },
  { file: "photos/DSC07252.jpg", alt: "Plateau lumière cinéma", category: "plateau" },
  { file: "photos/image00007.jpeg", alt: "Ambiance plateau Cinémergence", category: "plateau" },
  { file: "photos/image00009.jpeg", alt: "Stagiaires sur le tournage", category: "livrable" },
  { file: "photos/Cinémergence 10.JPG", alt: "Master class avec les intervenants", category: "plateau" },
  { file: "videos/VIDEO-2026-02-08-16-46-36.mp4", alt: "Extrait plateau — tournage stage", category: "plateau" },
  { file: "videos/VIDEO-2026-02-08-13-01-36.mp4", alt: "Extrait plateau — mise en scène", category: "plateau" },
  { file: "videos/WhatsApp Video 2025-12-22 at 14.48.58.mp4", alt: "Livrable stagiaire — scène tournée", category: "livrable" },
];

export const formationCovers: Record<string, string> = {
  "formation-jouer-face-camera": "photos/DSC07230.jpg",
  "formation-realiser-court-metrage": "photos/DSC07252.jpg",
  "formation-ecriture-scenario": "photos/image00010.jpeg",
  "formation-bande-demo": "photos/DSC07225.jpg",
  "formation-camera-cinema": "photos/DSC07234.jpg",
  "formation-production-film": "photos/DSC07512.jpg",
};

export const intervenantPhotos: Record<string, string> = {
  "bibi-naceri": "photos/image00019.jpeg",
  "salim-kechiouche": "photos/DSC07228.jpg",
  "edouard-montoute": "photos/DSC07226.jpg",
  "karina-testa": "photos/DSC07233.jpg",
};

const heroVideoSource = "videos/VIDEO-2026-02-08-10-33-37.mp4";

function resolveAsset(relativePath: string) {
  return path.join(assetsRoot, relativePath);
}

function isImage(filePath: string) {
  return /\.(jpe?g|png|webp)$/i.test(filePath);
}

async function prepareImage(sourcePath: string): Promise<string> {
  const tmp = path.join(
    os.tmpdir(),
    `cinemergence-${path.basename(sourcePath, path.extname(sourcePath))}.jpg`,
  );
  await sharp(sourcePath)
    .rotate()
    .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(tmp);
  return tmp;
}

async function uploadMedia(
  payload: Payload,
  sourcePath: string,
  alt: string,
  category: MediaCategory,
) {
  const absolute = resolveAsset(sourcePath);
  if (!fs.existsSync(absolute)) {
    return { ok: false as const, message: `Fichier introuvable : ${sourcePath}` };
  }

  const filePath = isImage(absolute) ? await prepareImage(absolute) : absolute;

  const created = await payload.create({
    collection: "media",
    data: { alt, category },
    filePath,
  });

  if (filePath !== absolute && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return { ok: true as const, media: created };
}

export async function prepareHeroAssets() {
  const publicVideos = path.resolve("public/videos");
  fs.mkdirSync(publicVideos, { recursive: true });

  const heroVideoOut = path.join(publicVideos, "hero-plateau-travel.mp4");
  const heroPosterOut = path.join(publicVideos, "hero-plateau-poster.jpg");

  const videoIn = resolveAsset(heroVideoSource);

  if (!fs.existsSync(videoIn)) {
    return ["Source hero introuvable"];
  }

  const { execSync } = await import("child_process");
  const posterTmp = path.join(os.tmpdir(), "cinemergence-hero-poster.jpg");

  execSync(
    `ffmpeg -y -i "${videoIn}" -vf "scale=1920:-2" -c:v libx264 -crf 28 -preset fast -an -movflags +faststart "${heroVideoOut}"`,
    { stdio: "pipe" },
  );

  execSync(
    `ffmpeg -y -i "${videoIn}" -ss 00:00:02 -vframes 1 -q:v 2 "${posterTmp}"`,
    { stdio: "pipe" },
  );

  await sharp(posterTmp)
    .rotate()
    .resize(1920, 1080, { fit: "cover" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(heroPosterOut);

  if (fs.existsSync(posterTmp)) {
    fs.unlinkSync(posterTmp);
  }

  return ["Hero video + poster générés dans public/videos/"];
}

export async function seedMediaContent(payload: Payload) {
  const logs: string[] = [];

  const existing = await payload.find({ collection: "media", limit: 1 });
  if (existing.totalDocs > 0) {
    return ["Médias déjà présents — seed media ignoré."];
  }

  logs.push("Upload galerie…");
  for (const asset of galleryAssets) {
    const result = await uploadMedia(payload, asset.file, asset.alt, asset.category);
    logs.push(result.ok ? `✓ ${asset.alt}` : `⚠ ${result.message}`);
  }

  logs.push("Visuels formations…");
  for (const [slug, file] of Object.entries(formationCovers)) {
    const result = await uploadMedia(payload, file, `Couverture — ${slug}`, "plateau");
    if (!result.ok) {
      logs.push(`⚠ ${result.message}`);
      continue;
    }

    const formation = await payload.find({
      collection: "formations",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    if (formation.docs[0]) {
      await payload.update({
        collection: "formations",
        id: formation.docs[0].id,
        data: { coverImage: result.media.id },
      });
      logs.push(`✓ ${slug}`);
    }
  }

  logs.push("Portraits intervenants…");
  for (const [slug, file] of Object.entries(intervenantPhotos)) {
    const result = await uploadMedia(payload, file, `Portrait — ${slug}`, "portrait");
    if (!result.ok) {
      logs.push(`⚠ ${result.message}`);
      continue;
    }

    const intervenant = await payload.find({
      collection: "intervenants",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    if (intervenant.docs[0]) {
      await payload.update({
        collection: "intervenants",
        id: intervenant.docs[0].id,
        data: { photo: result.media.id },
      });
      logs.push(`✓ ${slug}`);
    }
  }

  logs.push("Seed media terminé.");
  return logs;
}
