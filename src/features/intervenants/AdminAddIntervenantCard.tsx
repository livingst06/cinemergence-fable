"use client";

import { AdminAddCard } from "@/components/admin/AdminAddCard";

type AdminAddIntervenantCardProps = {
  label: string;
  onAdd: () => void;
};

export function AdminAddIntervenantCard({
  label,
  onAdd,
}: AdminAddIntervenantCardProps) {
  return <AdminAddCard label={label} onAdd={onAdd} />;
}
