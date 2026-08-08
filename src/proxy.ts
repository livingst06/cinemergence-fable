import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk session middleware only — auth gates live on each protected page /
 * Server Action (`requireAuth` / `requireAdmin` / `auth.protect()`).
 * Stripe webhook auth is signature-based in its route handler.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|m4v|mp3|wav|pdf)).*)",
    "/(api|trpc)(.*)",
  ],
};
