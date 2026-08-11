"use client";

import { AdminAddCard } from "@/components/admin/AdminAddCard";

type AdminAddSessionCardProps = {
  onAdd: () => void;
};

export function AdminAddSessionCard({ onAdd }: AdminAddSessionCardProps) {
  return (
    <AdminAddCard
      label="Ajouter une session"
      onAdd={onAdd}
      minHeightClassName="min-h-[10rem]"
      className="rounded-2xl border"
    />
  );
}
