import { createHmac, timingSafeEqual } from "node:crypto";

const TOLERANCE_SECONDS = 300;

/** Vérifie l'en-tête `Stripe-Signature` (t=…,v1=…). */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowMs = Date.now(),
): boolean {
  if (!header || !secret) return false;
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    const value = part.slice(eq + 1);
    if (key === "t") timestamp = value;
    if (key === "v1" && value) signatures.push(value);
  }
  const timestampSeconds = Number(timestamp);
  if (!timestamp || !Number.isFinite(timestampSeconds) || signatures.length === 0) return false;
  if (Math.abs(nowMs / 1000 - timestampSeconds) > TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  return signatures.some((signature) => {
    const actual = Buffer.from(signature);
    if (actual.length !== expectedBuffer.length) return false;
    return timingSafeEqual(actual, expectedBuffer);
  });
}
