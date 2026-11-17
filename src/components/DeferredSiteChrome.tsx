"use client";

import dynamic from "next/dynamic";

const CookieBanner = dynamic(
  () => import("@/components/CookieBanner").then((mod) => mod.CookieBanner),
  { ssr: false },
);

export function DeferredSiteChrome() {
  return <CookieBanner />;
}
