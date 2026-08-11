/**
 * Architecture / Next.js boundary checks for CI and pre-commit.
 * Exit 1 on violations.
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "src");
const violations = [];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(process.cwd(), file);
}

const files = walk(ROOT);

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const isClient = /^["']use client["']\s*;?/m.test(src);
  const relative = rel(file);

  if (isClient) {
    if (
      /from\s+["']@\/lib\/payload["']/.test(src) ||
      /from\s+["'][^"']*\/payload["']/.test(src) ||
      /getPayloadClient/.test(src)
    ) {
      violations.push(`${relative}: client file must not use getPayloadClient/payload`);
    }
    if (/formations-catalog/.test(src) || /formations-defaults/.test(src)) {
      violations.push(`${relative}: client file must not import formations catalog/defaults`);
    }
  }

  // Pages should not call getPayloadClient directly (prefer lib/)
  if (
    relative.startsWith("src/app/") &&
    /page\.tsx$/.test(relative) &&
    /getPayloadClient/.test(src)
  ) {
    violations.push(`${relative}: page should use lib data helpers, not getPayloadClient`);
  }
}

if (violations.length) {
  console.error("Architecture boundary violations:\n");
  for (const v of violations) console.error(` - ${v}`);
  process.exit(1);
}

console.log(`Architecture check OK (${files.length} files).`);
