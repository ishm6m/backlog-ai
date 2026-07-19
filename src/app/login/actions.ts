"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string | null) ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    redirect("/login?error=1");
  }
  redirect("/");
}

export async function logout() {
  await auth.signOut();
  redirect("/login");
}
