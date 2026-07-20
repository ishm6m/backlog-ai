import { NextRequest, NextResponse } from "next/server";
import { unwrapWebhook } from "@/lib/dodo";
import * as store from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headers = {
    "webhook-id": req.headers.get("webhook-id") ?? "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": req.headers.get("webhook-signature") ?? "",
  };

  let event;
  try {
    event = await unwrapWebhook(body, headers);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "subscription.active":
    case "subscription.renewed": {
      const sub = event.data;
      const userId = sub.metadata?.userId;
      if (typeof userId === "string") {
        await store.upsertSubscription(userId, {
          dodoCustomerId: sub.customer.customer_id,
          dodoSubscriptionId: sub.subscription_id,
          plan: "pro",
          status: "active",
          currentPeriodEnd: sub.next_billing_date,
        });
      }
      break;
    }
    case "subscription.cancelled":
    case "subscription.expired":
    case "subscription.failed": {
      const sub = event.data;
      const userId = sub.metadata?.userId;
      if (typeof userId === "string") {
        await store.upsertSubscription(userId, {
          dodoCustomerId: sub.customer.customer_id,
          dodoSubscriptionId: sub.subscription_id,
          plan: "free",
          status: "cancelled",
          currentPeriodEnd: null,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
