"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function sendResetCode(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  if (!email) {
    redirect("/forgot-password?error=1");
  }

  await auth.emailOtp.sendVerificationOtp({ email, type: "forget-password" });
  redirect(`/reset-password?email=${encodeURIComponent(email)}`);
}
