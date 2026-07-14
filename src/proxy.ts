import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/formation-(.*)",
  "/intervenants",
  "/financement",
  "/association",
  "/galerie",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
  "/cgv",
  "/robots.txt",
  "/sitemap.xml",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/newsletter",
  "/api/seed(.*)",
  "/api/webhooks(.*)",
  "/api/media/file/(.*)",
  "/videos/(.*)",
  "/images/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|m4v|mp3|wav|pdf)).*)",
    "/(api|trpc)(.*)",
  ],
};
