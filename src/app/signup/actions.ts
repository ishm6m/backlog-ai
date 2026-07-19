"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string | null) ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  if (!email.trim() || password.length < 8) {
    redirect("/signup?error=1");
  }

  const { error } = await auth.signUp.email({ email, password, name: email });
  if (error) {
    redirect("/signup?error=1");
  }

  await auth.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}
