type NdaNumberProps = {
  nda: string;
  className?: string;
};

/**
 * Safari iOS transforme un numéro type NDA en `<a href="tel:">` avant
 * l'hydratation React — d'où le mismatch. Chaque groupe est un nœud séparé.
 */
export function NdaNumber({ nda, className }: NdaNumberProps) {
  const groups = nda.trim().split(/\s+/);

  return (
    <span className={className} translate="no">
      {groups.map((group, index) => (
        <span key={`${group}-${index}`}>
          {index > 0 ? "\u00a0" : null}
          {group}
        </span>
      ))}
    </span>
  );
}
