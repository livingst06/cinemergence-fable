"use client";

import { useEffect } from "react";

import { pushViewItem } from "@/lib/measurement-client";

export function FormationViewItem({ itemId, itemName }: { itemId: string; itemName: string }) {
  useEffect(() => {
    pushViewItem({ itemId, itemName });
  }, [itemId, itemName]);
  return null;
}
