import { cn } from "@/lib/utils";

type BrandSignatureProps = {
  className?: string;
};

function SignatureStroke() {
  return (
    <svg
      className="da-signature-stroke"
      viewBox="0 0 280 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M16 16C72 19.5 150 12 222 11.5C246 11.3 264 12.2 270 11.2"
        stroke="#2F5BFF"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M88 13.4C148 11.6 214 11.4 268 10.8"
        stroke="#2F5BFF"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandSignature({ className }: BrandSignatureProps) {
  return (
    <p className={cn("da-signature font-script text-cream", className)}>
      <span className="da-signature-tilt">
        <span className="block">Former.</span>
        <span className="block">Révéler.</span>
        <span className="relative block">
          Faire émerger.
          <SignatureStroke />
        </span>
      </span>
    </p>
  );
}
