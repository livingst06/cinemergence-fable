/**
 * Thème Clerk aligné sur la direction artistique « Plateau vivant » du site
 * (rouge velours cinéma, fond noir profond, typographies Bebas Neue / Plus Jakarta Sans).
 * Les valeurs pointent vers les variables CSS définies dans src/app/globals.css
 * afin de suivre automatiquement le mode clair/sombre du site.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--projector)",
    colorBackground: "var(--noir-secondary)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorInputBackground: "var(--noir-tertiary)",
    colorInputText: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorNeutral: "var(--muted-foreground)",
    fontFamily: "var(--font-jakarta)",
    borderRadius: "var(--radius)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "shadow-2xl border border-border",
    card: "bg-noir-secondary",
    headerTitle: "font-heading tracking-wide",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border border-border hover:bg-noir-tertiary",
    formButtonPrimary:
      "bg-projector hover:bg-projector-light transition-colors font-sans normal-case shadow-[0_4px_16px_-4px_var(--projector-glow)]",
    formFieldInput: "bg-noir-tertiary border-border focus:border-projector-light",
    footerActionLink: "text-or-light hover:text-projector-light",
    identityPreviewEditButton: "text-or-light",
    formFieldLabel: "text-foreground",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
  },
};
