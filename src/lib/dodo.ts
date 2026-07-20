import "server-only";
import DodoPayments from "dodopayments";

let client: DodoPayments | null = null;

export function getDodoClient() {
  if (!client) {
    client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
    });
  }
  return client;
}

export async function createProCheckoutSession(userId: string, email: string, appUrl: string) {
  const session = await getDodoClient().checkoutSessions.create({
    product_cart: [{ product_id: process.env.DODO_PRO_PRODUCT_ID!, quantity: 1 }],
    customer: { email },
    metadata: { userId },
    return_url: `${appUrl}/billing`,
  });
  return session.checkout_url;
}

export async function createCustomerPortalSession(dodoCustomerId: string, appUrl: string) {
  const session = await getDodoClient().customers.customerPortal.create(dodoCustomerId, {
    return_url: `${appUrl}/billing`,
  });
  return session.link;
}

export async function unwrapWebhook(body: string, headers: Record<string, string>) {
  return getDodoClient().webhooks.unwrap(body, { headers });
}
