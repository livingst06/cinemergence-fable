import fs from "fs";
import path from "path";

import sharp from "sharp";

import {
  formationCovers,
  founderPhoto,
  galleryAssets,
  intervenantPhotos,
} from "./media-lib";

const assetsRoot = path.resolve("_assets-client");
const outRoot = path.resolve("public/images/site");

async function writeImage(sourceRelative: string, destRelative: string) {
  const source = path.join(assetsRoot, sourceRelative);
  const dest = path.join(outRoot, destRelative);
  if (!fs.existsSync(source)) {
    console.warn(`⚠ Missing: ${sourceRelative}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(source)
    .rotate()
    .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(dest);
  console.log(`✓ ${destRelative}`);
}

async function copyVideo(sourceRelative: string, destRelative: string) {
  const source = path.join(assetsRoot, sourceRelative);
  const dest = path.join(outRoot, destRelative);
  if (!fs.existsSync(source)) {
    console.warn(`⚠ Missing: ${sourceRelative}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
  console.log(`✓ ${destRelative}`);
}

async function main() {
  console.log("→ Formations…");
  for (const [slug, file] of Object.entries(formationCovers)) {
    await writeImage(file, `formations/${slug}.jpg`);
  }

  console.log("→ Intervenants…");
  for (const [slug, file] of Object.entries(intervenantPhotos)) {
    await writeImage(file, `intervenants/${slug}.jpg`);
  }

  console.log("→ Fondateur…");
  await writeImage(founderPhoto, "founder/choukri-roua.jpg");

  console.log("→ Galerie…");
  let photoIndex = 1;
  let videoIndex = 10;
  for (const asset of galleryAssets) {
    if (/\.(jpe?g|png|webp)$/i.test(asset.file)) {
      await writeImage(asset.file, `gallery/${String(photoIndex).padStart(2, "0")}.jpg`);
      photoIndex += 1;
    } else if (/\.(mp4|mov|webm)$/i.test(asset.file)) {
      const ext = path.extname(asset.file).toLowerCase() === ".mov" ? ".mp4" : path.extname(asset.file).toLowerCase();
      await copyVideo(asset.file, `gallery/${String(videoIndex).padStart(2, "0")}${ext}`);
      videoIndex += 1;
    }
  }

  console.log("✓ public/images/site/ synchronisé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
