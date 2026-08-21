"use client";

import dynamic from "next/dynamic";

const CookieBanner = dynamic(
  () => import("@/components/CookieBanner").then((mod) => mod.CookieBanner),
  { ssr: false },
);
const Analytics = dynamic(
  () => import("@/components/Analytics").then((mod) => mod.Analytics),
  { ssr: false },
);
const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false },
);

export function DeferredSiteChrome() {
  return (
    <>
      <CookieBanner />
      <Analytics />
      <Toaster />
    </>
  );
}
