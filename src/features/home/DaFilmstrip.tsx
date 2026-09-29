import Image from "next/image";

export function DaFilmstrip() {
  return (
    <figure className="bg-noir">
      <Image
        src="/images/da/filmstrip.jpg"
        alt="Des parcours réels. Une formation concrète. Une exigence créative. Une communauté qui émerge."
        width={3999}
        height={466}
        sizes="100vw"
        quality={80}
        className="h-auto w-full"
      />
    </figure>
  );
}
