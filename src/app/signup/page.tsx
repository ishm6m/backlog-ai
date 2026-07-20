import Link from "next/link";
import { signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Backlog</h1>
      <p className="mb-6 text-sm text-muted-foreground">Create your account.</p>
      <form action={signup} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        {error === "1" && <p className="text-sm text-destructive">Enter a valid email and a password of at least 8 characters.</p>}
        {error === "exists" && (
          <p className="text-sm text-destructive">
            An account with this email already exists —{" "}
            <Link href="/login" className="underline">log in instead</Link>.
          </p>
        )}
        {error === "failed" && <p className="text-sm text-destructive">Couldn&apos;t create your account — try again.</p>}
        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
