"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { isEmailVerified } from "@/lib/store";

export async function signup(formData: FormData) {
  const email = ((formData.get("email") as string | null) ?? "").trim();
  const password = (formData.get("password") as string | null) ?? "";
  if (!email || password.length < 8) {
    redirect("/signup?error=1");
  }

  const { error } = await auth.signUp.email({ email, password, name: email });
  if (error) {
    if (error.code?.startsWith("USER_ALREADY_EXISTS")) {
      if (await isEmailVerified(email)) {
        redirect("/signup?error=exists");
      }
      // Account exists but was never verified — resume the verification flow.
      await auth.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
      redirect(`/verify-email?email=${encodeURIComponent(email)}&sent=1`);
    }
    redirect("/signup?error=failed");
  }

  await auth.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}
