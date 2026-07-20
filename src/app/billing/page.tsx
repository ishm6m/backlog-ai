import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth/server";
import * as store from "@/lib/store";
import { manageSubscription } from "./actions";

export default async function BillingPage() {
  const userId = await requireUserId();
  const [sub, used] = await Promise.all([store.getSubscription(userId), store.getAiUsageToday(userId)]);
  const limit = store.PLAN_AI_LIMITS[sub.plan];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Billing</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current plan
            <Badge variant={sub.plan === "pro" ? "default" : "secondary"}>
              {sub.plan === "pro" ? "Pro" : "Free"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {used} / {limit} AI calls used today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sub.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </CardContent>
        <CardFooter>
          {sub.plan === "pro" ? (
            <form action={manageSubscription}>
              <Button type="submit" variant="outline">
                Manage subscription
              </Button>
            </form>
          ) : (
            <Button render={<Link href="/pricing" />} nativeButton={false}>
              Upgrade to Pro
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
