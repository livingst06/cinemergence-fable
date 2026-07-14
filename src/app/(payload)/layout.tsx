import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import config from "@payload-config";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import "@payloadcms/next/css";
import React from "react";

import { clerkAppearance } from "@/lib/clerk-appearance";

import { importMap } from "./admin/importMap";
import "./custom.scss";

type Args = {
  children: React.ReactNode;
};

const serverFunction = async (args: {
  name: string;
  args: Record<string, unknown>;
}) => {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export const metadata: Metadata = {
  title: "Admin — Cinémergence",
};

const Layout = ({ children }: Args) => (
  <ClerkProvider appearance={clerkAppearance}>
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  </ClerkProvider>
);

export default Layout;
