/**
 * Remet la BDD dans un état nominal cohérent après les tests Stripe :
 * - supprime les inscriptions `annule` (holds abandonnés)
 * - synchronise / confirme les `en_paiement` déjà payés côté Stripe → `payee`
 * - sinon libère les holds expirés ou orphelins non payés
 * - complète tarifEuros manquants depuis le catalogue
 *
 * Usage: pnpm cleanup:inscriptions
 */
import fs from "fs";
import path from "path";
import Stripe from "stripe";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadEnvFile(path.resolve(".env.local"));
loadEnvFile(path.resolve(".env"));

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { parseEurosFromTarifLabel } = await import("../src/lib/inscription-status");
  const { defaultFormations } = await import("../src/lib/defaults");

  const payload = await getPayloadClient();
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  const stripe = secret
    ? new Stripe(secret, { apiVersion: "2026-07-29.dahlia" })
    : null;

  const catalogBySlug = new Map(defaultFormations.map((f) => [f.slug, f]));

  // ── Formations : tarifEuros ──────────────────────────────────────────────
  const formations = await payload.find({
    collection: "formations",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  let tarifFixed = 0;
  for (const f of formations.docs) {
    const current =
      typeof f.tarifEuros === "number" && f.tarifEuros > 0
        ? Math.trunc(f.tarifEuros)
        : null;
    if (current) continue;

    const cat = catalogBySlug.get(String(f.slug));
    const euros =
      parseEurosFromTarifLabel(f.tarif ? String(f.tarif) : null) ??
      cat?.tarifEuros ??
      parseEurosFromTarifLabel(cat?.tarif ?? null);
    if (euros == null) {
      console.log(`– formation ${f.slug}: pas de tarif trouvé`);
      continue;
    }
    await payload.update({
      collection: "formations",
      id: f.id,
      data: {
        tarifEuros: euros,
        ...(f.tarif ? {} : { tarif: `${euros.toLocaleString("fr-FR")} €` }),
      },
      overrideAccess: true,
    });
    tarifFixed += 1;
    console.log(`✓ tarifEuros ${f.slug} → ${euros} €`);
  }

  // ── Inscriptions ─────────────────────────────────────────────────────────
  const inscriptions = await payload.find({
    collection: "inscriptions",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  let deletedAnnule = 0;
  let confirmedPayee = 0;
  let cancelledOrphan = 0;

  for (const doc of inscriptions.docs) {
    const status = String(doc.status);

    if (status === "annule") {
      await payload.delete({
        collection: "inscriptions",
        id: doc.id,
        overrideAccess: true,
      });
      deletedAnnule += 1;
      console.log(`⌫ annule #${doc.id}`);
      continue;
    }

    if (status === "en_paiement") {
      const sessionId = doc.stripeCheckoutSessionId
        ? String(doc.stripeCheckoutSessionId)
        : null;
      let paid = false;

      if (sessionId && stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          paid =
            session.payment_status === "paid" || session.status === "complete";
          if (paid) {
            const pi =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null;
            await payload.update({
              collection: "inscriptions",
              id: doc.id,
              data: {
                status: "payee",
                stripePaymentIntentId: pi,
              },
              overrideAccess: true,
            });
            confirmedPayee += 1;
            console.log(`✓ en_paiement #${doc.id} → payee (Stripe OK)`);
            continue;
          }
        } catch (err) {
          console.warn(`! session Stripe #${doc.id}`, err);
        }
      }

      // Hold non payé → supprimer pour repartir propre
      await payload.delete({
        collection: "inscriptions",
        id: doc.id,
        overrideAccess: true,
      });
      cancelledOrphan += 1;
      console.log(`⌫ hold non payé #${doc.id}`);
    }
  }

  // Re-audit
  const after = await payload.find({
    collection: "inscriptions",
    limit: 500,
    depth: 1,
    overrideAccess: true,
    sort: "-updatedAt",
  });
  console.log("\n=== État final inscriptions ===");
  for (const doc of after.docs) {
    const formation =
      typeof doc.formation === "object" && doc.formation
        ? String((doc.formation as { slug?: string }).slug ?? "?")
        : String(doc.formation);
    console.log(`#${doc.id}  ${String(doc.status).padEnd(14)}  ${formation}`);
  }
  if (after.docs.length === 0) console.log("(aucune)");

  console.log("\nRésumé:");
  console.log(`  tarifEuros corrigés : ${tarifFixed}`);
  console.log(`  annule supprimées   : ${deletedAnnule}`);
  console.log(`  confirmées payee    : ${confirmedPayee}`);
  console.log(`  holds orphelins     : ${cancelledOrphan}`);

  // ── Formations orphelines (hors catalogue, sans tarif, sans inscription) ─
  let deletedOrphans = 0;
  const catalogSlugs = new Set(defaultFormations.map((f) => f.slug));
  const formationsAfter = await payload.find({
    collection: "formations",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });
  for (const f of formationsAfter.docs) {
    const slug = String(f.slug);
    const hasTarif = typeof f.tarifEuros === "number" && f.tarifEuros > 0;
    if (catalogSlugs.has(slug) || hasTarif) continue;

    const linked = await payload.find({
      collection: "inscriptions",
      where: { formation: { equals: f.id } },
      limit: 1,
      overrideAccess: true,
    });
    if (linked.totalDocs > 0) {
      console.log(`= garde ${slug} (inscriptions liées, sans tarif)`);
      continue;
    }

    await payload.delete({
      collection: "formations",
      id: f.id,
      overrideAccess: true,
    });
    deletedOrphans += 1;
    console.log(`⌫ formation orpheline ${slug}`);
  }
  console.log(`  formations orphelines: ${deletedOrphans}`);

  const finalFormations = await payload.find({
    collection: "formations",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });
  const withoutTarif = finalFormations.docs.filter(
    (f) => !(typeof f.tarifEuros === "number" && f.tarifEuros > 0),
  ).length;
  console.log(
    `\nNominal: ${finalFormations.docs.length} formations, ${withoutTarif} sans tarifEuros, ${after.docs.length} inscriptions`,
  );

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
