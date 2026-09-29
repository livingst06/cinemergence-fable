/**
 * Thème Clerk aligné sur la DA bleue Sarah (noir, anthracite, bleu #2F5BFF).
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--convert)",
    colorBackground: "var(--noir-secondary)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorInputBackground: "var(--noir-tertiary)",
    colorInputText: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorNeutral: "var(--muted-foreground)",
    fontFamily: "var(--font-sans)",
    borderRadius: "var(--radius)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "shadow-2xl border border-border",
    card: "bg-noir-secondary",
    headerTitle: "font-heading tracking-wide uppercase",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border border-border hover:bg-noir-tertiary",
    formButtonPrimary:
      "bg-convert hover:bg-convert-light transition-colors font-heading uppercase tracking-wider shadow-[0_4px_16px_-4px_var(--convert-glow)]",
    formFieldInput: "bg-noir-tertiary border-border focus:border-convert",
    footerActionLink: "text-convert hover:text-convert-light",
    identityPreviewEditButton: "text-convert",
    formFieldLabel: "text-foreground",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
  },
};
