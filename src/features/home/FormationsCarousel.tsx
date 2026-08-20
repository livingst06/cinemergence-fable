"use client";

import { HomePhotoCarousel, type HomePhotoSlide } from "@/features/home/HomePhotoCarousel";

export type FormationSlide = HomePhotoSlide;

type FormationsCarouselProps = {
  slides: FormationSlide[];
};

export function FormationsCarousel({ slides }: FormationsCarouselProps) {
  return (
    <HomePhotoCarousel
      slides={slides}
      previousLabel="Formation précédente"
      nextLabel="Formation suivante"
      intervalMs={2000}
    />
  );
}
