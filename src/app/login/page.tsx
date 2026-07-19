import Link from "next/link";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; reset?: string }>;
}) {
  const { error, created, reset } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <div className="mb-1 flex items-center gap-2">
        <img src="/logo.png" alt="Backlog AI" className="h-7 w-7 rounded-md" />
        <h1 className="text-xl font-semibold tracking-tight">Backlog</h1>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">Log in to continue.</p>
      <form action={login} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoFocus />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        {error && <p className="text-sm text-destructive">Incorrect email or password.</p>}
        {created && <p className="text-sm text-muted-foreground">Account created — log in below.</p>}
        {reset && <p className="text-sm text-muted-foreground">Password reset — log in below.</p>}
        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/signup" className="text-foreground hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
