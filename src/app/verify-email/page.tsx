import Link from "next/link";
import { verifyEmail, resendCode } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string; sent?: string }>;
}) {
  const { email, error, sent } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Verify your email</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        We sent a 6-digit code to {email ?? "your email"}.
      </p>
      <form action={verifyEmail} className="space-y-3">
        <input type="hidden" name="email" value={email ?? ""} />
        <div className="space-y-1.5">
          <Label htmlFor="otp">Code</Label>
          <Input id="otp" name="otp" inputMode="numeric" autoComplete="one-time-code" required autoFocus />
        </div>
        {error && <p className="text-sm text-destructive">Invalid or expired code.</p>}
        {sent && <p className="text-sm text-muted-foreground">New code sent.</p>}
        <Button type="submit" className="w-full">
          Verify
        </Button>
      </form>
      <form action={resendCode} className="mt-3">
        <input type="hidden" name="email" value={email ?? ""} />
        <Button type="submit" variant="ghost" className="w-full">
          Resend code
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-foreground hover:underline">
          Skip for now
        </Link>
      </p>
    </div>
  );
}
