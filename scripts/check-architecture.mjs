/**
 * Architecture / Next.js boundary checks for CI and pre-commit.
 * Exit 1 on violations.
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const SRC = path.resolve(process.cwd(), "src");

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

function isUseServer(src) {
  return /^["']use server["']\s*;?/m.test(src);
}

function isUseClient(src) {
  return /^["']use client["']\s*;?/m.test(src);
}

function serverActionSpecifiers(files) {
  const specs = new Set();
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    if (!isUseServer(src)) continue;
    const specifier = `@/${path
      .relative(SRC, file)
      .replace(/\\/g, "/")
      .replace(/\.(tsx|ts)$/, "")}`;
    specs.add(specifier);
  }
  return specs;
}

function typeNamesInImport(clause) {
  const trimmed = clause.trim();
  const typeOnly = /^type\b/.test(trimmed);
  const body = typeOnly ? trimmed.replace(/^type\s+/, "") : trimmed;
  const brace = body.match(/\{([\s\S]*)\}/);
  const names = [];
  if (!brace) {
    if (typeOnly) {
      const name = body.split(/\s+as\s+/)[0].trim();
      if (name) names.push(name);
    }
    return names;
  }
  for (const part of brace[1].split(",")) {
    const item = part.trim();
    if (!item) continue;
    if (typeOnly || /^type\s+/.test(item)) {
      const name = item.replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (name) names.push(name);
    }
  }
  return names;
}

/**
 * Turbopack treats every name a client file imports from a "use server"
 * module as a runtime export. A type import then fails `next build`
 * with "Export X doesn't exist".
 */
export function findClientServerActionTypeImports(files = walk(SRC)) {
  const specs = serverActionSpecifiers(files);
  const violations = [];
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    if (!isUseClient(src)) continue;
    const importRe = /import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g;
    let match;
    while ((match = importRe.exec(src))) {
      const specifier = match[2];
      if (!specs.has(specifier)) continue;
      for (const name of typeNamesInImport(match[1])) {
        violations.push(
          `${rel(file)}: le composant client importe le type ${name} depuis ${specifier}. Importe ce type depuis un fichier sans "use server".`,
        );
      }
    }
  }
  return violations;
}

function findArchitectureViolations(files = walk(SRC)) {
  const violations = [];
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    const isClient = isUseClient(src);
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

    if (
      relative.startsWith("src/app/") &&
      /page\.tsx$/.test(relative) &&
      /getPayloadClient/.test(src)
    ) {
      violations.push(`${relative}: page should use lib data helpers, not getPayloadClient`);
    }
  }
  violations.push(...findClientServerActionTypeImports(files));
  return violations;
}

function main() {
  const files = walk(SRC);
  const violations = findArchitectureViolations(files);
  if (violations.length) {
    console.error("Architecture boundary violations:\n");
    for (const v of violations) console.error(` - ${v}`);
    process.exit(1);
  }
  console.log(`Architecture check OK (${files.length} files).`);
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) main();
