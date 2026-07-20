"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { createProCheckoutSession } from "@/lib/dodo";

export async function startProCheckout() {
  const user = await requireUser();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const checkoutUrl = await createProCheckoutSession(user.id, user.email, appUrl);
  if (!checkoutUrl) redirect("/billing");
  redirect(checkoutUrl);
}
