import type { Payload } from "payload";

export async function getPayloadClient(): Promise<Payload> {
  const { getPayload } = await import("payload");
  const config = (await import("@payload-config")).default;
  return getPayload({ config });
}
