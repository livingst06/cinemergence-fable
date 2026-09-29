import Image from "next/image";

const CELLS = [
  {
    src: "/images/da/filmstrip-1.jpg",
    lines: ["Des", "parcours", "réels"],
  },
  {
    src: "/images/da/filmstrip-2.jpg",
    lines: ["Une", "formation", "concrète"],
  },
  {
    src: "/images/da/filmstrip-3.jpg",
    lines: ["Une", "exigence", "créative"],
  },
  {
    src: "/images/da/filmstrip-4.jpg",
    lines: ["Une", "communauté", "qui émerge"],
  },
] as const;

export function DaFilmstrip() {
  return (
    <figure className="bg-noir">
      <ul className="grid grid-cols-2 md:grid-cols-4">
        {CELLS.map((cell, index) => (
          <li key={cell.src} className="relative aspect-[2.15/1] overflow-hidden">
            <Image
              src={cell.src}
              alt={index === 0 ? CELLS.map((c) => c.lines.join(" ")).join(". ") : ""}
              fill
              sizes="(max-width: 767px) 50vw, 25vw"
              quality={80}
              className="object-cover"
            />
            <p className="da-filmstrip-caption da-filmstrip-caption-mobile absolute bottom-[14%] left-[6%] z-10 w-max font-heading">
              {cell.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </figure>
  );
}
