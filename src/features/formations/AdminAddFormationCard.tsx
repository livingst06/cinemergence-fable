"use client";

import { AdminAddCard } from "@/components/admin/AdminAddCard";

type AdminAddFormationCardProps = {
  onAdd: () => void;
};

export function AdminAddFormationCard({ onAdd }: AdminAddFormationCardProps) {
  return <AdminAddCard label="Ajouter une formation" onAdd={onAdd} />;
}
