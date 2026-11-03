"use client";

import dynamic from "next/dynamic";

const CookieBanner = dynamic(
  () => import("@/components/CookieBanner").then((mod) => mod.CookieBanner),
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
      <Toaster />
    </>
  );
}
