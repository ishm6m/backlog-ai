"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function resetPassword(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const otp = (formData.get("otp") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !otp || password.length < 8) {
    redirect(`/reset-password?email=${encodeURIComponent(email)}&error=1`);
  }

  const { error } = await auth.emailOtp.resetPassword({ email, otp, password });
  if (error) {
    redirect(`/reset-password?email=${encodeURIComponent(email)}&error=1`);
  }
  redirect("/login?reset=1");
}
