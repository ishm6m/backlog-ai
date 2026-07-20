import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLAN_AI_LIMITS } from "@/lib/store";
import { startProCheckout } from "./actions";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-2 text-muted-foreground">Track applications for free. Upgrade for more AI usage.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>$0/month</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>Unlimited applications &amp; contacts</li>
              <li>{PLAN_AI_LIMITS.free} AI calls/day (extraction, contacts, resume tailoring)</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="ring-2 ring-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>$12/month</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>Unlimited applications &amp; contacts</li>
              <li>{PLAN_AI_LIMITS.pro} AI calls/day (extraction, contacts, resume tailoring)</li>
              <li>Priority support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <form action={startProCheckout} className="w-full">
              <Button type="submit" className="w-full">
                Upgrade to Pro
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
