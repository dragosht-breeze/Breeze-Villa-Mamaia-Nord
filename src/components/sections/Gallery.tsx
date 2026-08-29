"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
} from "lucide-react";

const images = [
  {
    src: "/images/apartments/apartament-3.jpg",
    title: "Apartament 3 camere Premium",
    category: "Apartamente",
    size: "large",
  },
  {
    src: "/images/apartments/apartament-superior.jpg",
    title: "Apartament Superior 110 mp",
    category: "Apartamente",
    size: "wide",
  },
  {
    src: "/images/apartments/apartament-3-etaj-2.jpg",
    title: "Vedere spre piscină",
    category: "Piscină",
    size: "normal",
  },
  {
    src: "/images/apartments/apartament-3-etaj-1.jpg",
    title: "Spații luminoase pentru familie",
    category: "Family",
    size: "normal",
  },
  {
    src: "/images/apartments/apartament-2-etaj-3.jpg",
    title: "Apartament 2 camere",
    category: "Apartamente",
    size: "normal",
  },
  {
    src: "/images/apartments/apartament-2.jpg",
    title: "Relaxare & confort",
    category: "Vacanță",
    size: "normal",
  },
  {
    src: "/images/apartments/studio.jpg",
    title: "Studio parter",
    category: "Cupluri",
    size: "normal",
  },
];

const filters = [
  "Toate",
  "Apartamente",
  "Piscină",
  "Family",
  "Vacanță",
  "Cupluri",
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("Toate");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filteredImages =
    activeFilter === "Toate"
      ? images
      : images.filter((image) => image.category === activeFilter);

  const activeImage =
    activeIndex !== null ? filteredImages[activeIndex] : null;

  function closeLightbox() {
    setActiveIndex(null);
  }

  function previousImage() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return null;

      return currentIndex === 0
        ? filteredImages.length - 1
        : currentIndex - 1;
    });
  }

  function nextImage() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return null;

      return currentIndex === filteredImages.length - 1
        ? 0
        : currentIndex + 1;
    });
  }

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((currentIndex) => {
          if (currentIndex === null) return null;

          return currentIndex === 0
            ? filteredImages.length - 1
            : currentIndex - 1;
        });
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((currentIndex) => {
          if (currentIndex === null) return null;

          return currentIndex === filteredImages.length - 1
            ? 0
            : currentIndex + 1;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, filteredImages.length]);

  return (
    <section
      id="galerie"
      className="relative overflow-hidden bg-white py-24"
    >
      <div
        aria-hidden="true"
        className="absolute left-[-160px] top-20 h-[360px] w-[360px] rounded-full bg-[#27C5C3]/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-[-140px] h-[420px] w-[420px] rounded-full bg-[#D9B56D]/12 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1380px] px-6">
        <div className="mx-auto mb-10 max-w-4xl text-center">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.45em] text-[#158F91]">
            Galerie
          </p>

          <h2 className="text-[38px] font-black leading-tight text-[#071B2D] md:text-[58px]">
            Descoperă atmosfera Breeze Villa
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-[16px] leading-8 text-gray-600 md:text-lg">
            Spații luminoase, apartamente generoase și locuri create
            pentru relaxare, familie și vacanțe fără griji.
          </p>
        </div>

        <div
          className="mb-9 flex flex-wrap justify-center gap-3"
          aria-label="Filtre galerie"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActiveFilter(filter);
                  setActiveIndex(null);
                }}
                className={`rounded-full px-5 py-2.5 text-xs font-black transition-colors duration-200 ${
                  isActive
                    ? "bg-[#071B2D] text-white shadow-xl"
                    : "bg-[#E9F8F8] text-[#071B2D] hover:bg-[#D9B56D]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="grid auto-rows-[230px] gap-4 md:grid-cols-4 lg:auto-rows-[250px]">
          {filteredImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`Deschide imaginea: ${image.title}`}
              onClick={() => setActiveIndex(index)}
              className={`group relative overflow-hidden rounded-[1.8rem] bg-[#071B2D] text-left shadow-[0_18px_45px_rgba(7,27,45,0.16)] transition-[transform,box-shadow] duration-500 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(7,27,45,0.28)] ${
                image.size === "large"
                  ? "md:col-span-2 md:row-span-2"
                  : image.size === "wide"
                    ? "md:col-span-2"
                    : ""
              }`}
            >
              <Image
                src={image.src}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes={
                  image.size === "large"
                    ? "(max-width: 768px) 100vw, 50vw"
                    : image.size === "wide"
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 100vw, 25vw"
                }
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#071B2D]/90 via-[#071B2D]/20 to-transparent transition-colors duration-500 group-hover:from-[#071B2D]/72"
              />

              <div className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#071B2D] shadow-lg">
                {image.category}
              </div>

              <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#071B2D] shadow-lg transition-transform duration-200 group-hover:scale-110">
                <Expand aria-hidden="true" size={17} />
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xl font-black leading-tight text-white drop-shadow-md md:text-2xl">
                  {image.title}
                </p>

                <p className="mt-1 text-sm text-white/82">
                  Breeze Villa Mamaia Nord
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie foto: ${activeImage.title}`}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#071B2D]/95 p-4 backdrop-blur-xl"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Închide galeria"
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#071B2D] shadow-xl transition-transform hover:scale-105"
          >
            <X aria-hidden="true" size={22} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              previousImage();
            }}
            aria-label="Imaginea anterioară"
            className="absolute left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#071B2D] shadow-xl transition-transform hover:scale-105 md:left-5 md:h-12 md:w-12"
          >
            <ChevronLeft aria-hidden="true" size={26} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              nextImage();
            }}
            aria-label="Imaginea următoare"
            className="absolute right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#071B2D] shadow-xl transition-transform hover:scale-105 md:right-5 md:h-12 md:w-12"
          >
            <ChevronRight aria-hidden="true" size={26} />
          </button>

          <div
            onClick={(event) => event.stopPropagation()}
            className="relative h-[80vh] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-black shadow-2xl"
          >
            <Image
              src={activeImage.src}
              alt={activeImage.title}
              fill
              className="object-contain"
              sizes="100vw"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <p className="text-2xl font-black">
                {activeImage.title}
              </p>

              <p className="mt-1 text-sm text-white/80">
                Breeze Villa Mamaia Nord
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}