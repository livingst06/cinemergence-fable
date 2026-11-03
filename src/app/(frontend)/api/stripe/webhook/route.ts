import { handleStripeWebhook } from "@/lib/stripe-webhook";

export async function POST(request: Request) {
  const raw = await request.text();
  const result = await handleStripeWebhook(raw, request.headers.get("stripe-signature"));
  return Response.json(result.body, { status: result.status });
}
