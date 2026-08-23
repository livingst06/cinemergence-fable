"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/ui/Section";
import { useAdminUi } from "@/features/admin/AdminUiContext";
import { AdminDeleteConfirmDialog } from "@/features/formations/AdminDeleteConfirmDialog";
import { AdminAddIntervenantCard } from "@/features/intervenants/AdminAddIntervenantCard";
import { AdminIntervenantDialog } from "@/features/intervenants/AdminIntervenantDialog";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { IntervenantCardAdmin } from "@/features/intervenants/IntervenantCardAdmin";
import { deleteIntervenantAction } from "@/features/intervenants/intervenants-admin-actions";
import type { IntervenantData } from "@/lib/defaults";

type Categorie = "professionnel" | "formateur";

type IntervenantsAdminProps = {
  intervenants: IntervenantData[];
};

export function IntervenantsAdmin({ intervenants }: IntervenantsAdminProps) {
  const { isAdminMode } = useAdminUi();
  const router = useRouter();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<IntervenantData | null>(null);
  const [defaultCategorie, setDefaultCategorie] =
    useState<Categorie>("professionnel");
  const [deleteTarget, setDeleteTarget] = useState<IntervenantData | null>(null);
  const [deletePending, startDelete] = useTransition();

  const professionnels = useMemo(
    () =>
      intervenants.filter(
        (i) =>
          (i.categorie ?? "professionnel") === "professionnel" &&
          i.slug !== "karina-testa",
      ),
    [intervenants],
  );

  const formateurs = useMemo(
    () => intervenants.filter((i) => i.categorie === "formateur"),
    [intervenants],
  );

  const showFormateursSection = isAdminMode;

  const refresh = () => router.refresh();

  const openCreate = (categorie: Categorie) => {
    setEditing(null);
    setDefaultCategorie(categorie);
    setEditorOpen(true);
  };

  const openEdit = (person: IntervenantData) => {
    if (person.id == null) {
      toast.error("Profil hors CMS — crée-le via Ajouter pour l’éditer ici.");
      return;
    }
    setEditing(person);
    setDefaultCategorie(
      person.categorie === "formateur" ? "formateur" : "professionnel",
    );
    setEditorOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget?.id) {
      toast.error("Ce profil n’a pas d’ID CMS — impossible de le supprimer ici.");
      setDeleteTarget(null);
      return;
    }
    const id = deleteTarget.id;
    startDelete(async () => {
      const result = await deleteIntervenantAction(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setDeleteTarget(null);
      refresh();
    });
  };

  const renderCard = (person: IntervenantData) => {
    if (!isAdminMode) {
      return <IntervenantCard key={person.slug} intervenant={person} />;
    }
    return (
      <IntervenantCardAdmin
        key={person.slug}
        intervenant={person}
        onEdit={() => openEdit(person)}
        onDelete={() => setDeleteTarget(person)}
      />
    );
  };

  return (
    <>
      <div className="container-page space-y-16 md:space-y-20">
        <div>
          <SectionHeader
            eyebrow="Guests"
            title={
              <>
                Nos intervenants{" "}
                <br className="md:hidden" />
                professionnels
              </>
            }
            description={
              <>
                <p>Des talents du cinéma qui interviennent en masterclass et sur le plateau</p>
                <p className="mt-1">pour un retour pro&nbsp;direct.</p>
              </>
            }
            className="mb-8 md:mb-10"
          />
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {professionnels.map(renderCard)}
            {isAdminMode ? (
              <AdminAddIntervenantCard
                label="Ajouter un intervenant"
                onAdd={() => openCreate("professionnel")}
              />
            ) : null}
          </div>
        </div>

        {showFormateursSection ? (
          <div>
            <SectionHeader
              eyebrow="Pédagogie"
              title={
              <>
                Nos formateurs{" "}
                <br className="md:hidden" />
                pédagogiques
              </>
            }
              description={
                <>
                  <p>L&apos;équipe qui encadre la progression au quotidien,</p>
                  <p className="mt-1">avec des retours concrets et&nbsp;suivis.</p>
                </>
              }
              className="mb-8 md:mb-10"
            />
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {formateurs.map(renderCard)}
              {isAdminMode ? (
                <AdminAddIntervenantCard
                  label="Ajouter un formateur"
                  onAdd={() => openCreate("formateur")}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <AdminIntervenantDialog
        open={editorOpen}
        editing={editing}
        defaultCategorie={defaultCategorie}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSaved={refresh}
      />

      <AdminDeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.nom ?? ""}
        entityLabel="fiche"
        pending={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
