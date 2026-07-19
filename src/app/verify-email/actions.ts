"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function verifyEmail(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const otp = (formData.get("otp") as string | null)?.trim() ?? "";

  if (!email || !otp) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}&error=1`);
  }

  const { error } = await auth.emailOtp.verifyEmail({ email, otp });
  if (error) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}&error=1`);
  }
  redirect("/");
}

export async function resendCode(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  if (email) {
    await auth.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
  }
  redirect(`/verify-email?email=${encodeURIComponent(email)}&sent=1`);
}
