/**
 * Préremplit les sessions avec 1–2 formateurs et 1–2 intervenants au hasard (tests d’affichage).
 *
 * Usage: pnpm exec tsx --require ./scripts/next-env-shim.cjs scripts/seed-session-staff-random.ts
 * ou: NODE_OPTIONS='--require ./scripts/next-env-shim.cjs' pnpm exec tsx scripts/seed-session-staff-random.ts
 */
import fs from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

function pickRandom<T>(arr: T[], min: number, max: number): T[] {
  if (arr.length === 0) return [];
  const n = Math.min(
    arr.length,
    min + Math.floor(Math.random() * (max - min + 1)),
  );
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, n);
}

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { ensureSessionStaffUsersRels } = await import(
    "../src/lib/session-staff-schema"
  );
  const payload = await getPayloadClient();
  await ensureSessionStaffUsersRels(payload);

  const people = await payload.find({
    collection: "users",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  const formateurs = people.docs
    .filter((d) => d.role === "formateur")
    .map((d) => d.id);
  const intervenants = people.docs
    .filter((d) => d.role === "intervenant")
    .map((d) => d.id);

  console.log(
    `Formateurs: ${formateurs.length}, Intervenants: ${intervenants.length}`,
  );

  if (formateurs.length === 0 && intervenants.length === 0) {
    console.log("Rien à assigner — aucun compte formateur / intervenant.");
    process.exit(0);
  }

  const sessions = await payload.find({
    collection: "formation-sessions",
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  let updated = 0;
  for (const session of sessions.docs) {
    const formateurIds = pickRandom(formateurs, 1, 2);
    const intervenantIds = pickRandom(intervenants, 1, 2);
    await payload.update({
      collection: "formation-sessions",
      id: session.id,
      data: {
        formateurs: formateurIds,
        intervenants: intervenantIds,
      },
      overrideAccess: true,
    });
    updated++;
    console.log(
      `✓ session ${session.id}: ${formateurIds.length} formateur(s), ${intervenantIds.length} intervenant(s)`,
    );
  }

  console.log(`Done: ${updated} session(s) mises à jour`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
