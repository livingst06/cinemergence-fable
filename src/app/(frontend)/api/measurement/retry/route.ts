import { retryMeasurementDeliveries } from "@/lib/measurement-log";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await retryMeasurementDeliveries();
    return Response.json(result);
  } catch (error) {
    console.error("[measurement-retry]", error instanceof Error ? error.message : error);
    return Response.json({ error: "retry failed" }, { status: 500 });
  }
}
