import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const protect = auth.middleware({
  loginUrl: "/login",
});

export default function proxy(request: NextRequest) {
  // Server Action POSTs hit this same URL with a next-action header; the SDK's
  // middleware redirect breaks the RSC action response. The action itself
  // re-checks auth via requireUserId(), so it's safe to skip here.
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }
  return protect(request);
}

export const config = {
  matcher: [
    "/((?!login|signup|forgot-password|reset-password|verify-email|pricing|api/auth|api/dodo/webhook|_next/static|_next/image|favicon.ico).*)",
  ],
};
