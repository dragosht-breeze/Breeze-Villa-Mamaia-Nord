"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  title: string;
};

export default function ApartmentGallery({ images, title }: Props) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setActive(index)}
            className="relative aspect-[4/3] overflow-hidden rounded-3xl"
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition duration-500 hover:scale-105"
              sizes="(max-width:768px)100vw,33vw"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-6"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute right-8 top-6 text-5xl text-white"
            onClick={() => setActive(null)}
          >
            ×
          </button>

          <button
            className="absolute left-6 text-5xl text-white"
            onClick={(e) => {
              e.stopPropagation();
              setActive((active - 1 + images.length) % images.length);
            }}
          >
            ‹
          </button>

          <div
            className="relative h-[85vh] w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <button
            className="absolute right-6 text-5xl text-white"
            onClick={(e) => {
              e.stopPropagation();
              setActive((active + 1) % images.length);
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}