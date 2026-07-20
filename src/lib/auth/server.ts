import { createNeonAuth } from "@neondatabase/auth/next/server";
import { redirect } from "next/navigation";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

export async function requireUserId(): Promise<string> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user.id;
}

export async function requireUser(): Promise<{ id: string; email: string }> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return { id: session.user.id, email: session.user.email };
}
