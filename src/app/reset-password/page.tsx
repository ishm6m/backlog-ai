import Link from "next/link";
import { resetPassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const { email, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Enter code</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Check your email for the 6-digit code, then set a new password.
      </p>
      <form action={resetPassword} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={email} required autoFocus={!email} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="otp">Code</Label>
          <Input id="otp" name="otp" inputMode="numeric" autoComplete="one-time-code" required autoFocus={!!email} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        {error && <p className="text-sm text-destructive">Invalid code or password. Try again.</p>}
        <Button type="submit" className="w-full">
          Reset password
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-foreground hover:underline">
          Send a new code
        </Link>
      </p>
    </div>
  );
}
