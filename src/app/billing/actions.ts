"use server";

import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth/server";
import { createCustomerPortalSession } from "@/lib/dodo";
import * as store from "@/lib/store";

export async function manageSubscription() {
  const userId = await requireUserId();
  const sub = await store.getSubscription(userId);
  if (!sub.dodoCustomerId) redirect("/billing");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = await createCustomerPortalSession(sub.dodoCustomerId, appUrl);
  redirect(link);
}
