"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  Camera,
  CheckCircle2,
  Home,
  Images,
  Sparkles,
  X,
} from "lucide-react";
import type { AvailableApartment } from "@/lib/booking/types";

type ApartmentResultCardProps = {
  apartment: AvailableApartment;
  formatMoney: (value: number) => string;
};

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  if (index < 0) return length - 1;
  if (index >= length) return 0;
  return index;
}

export default function ApartmentResultCard({
  apartment,
  formatMoney,
}: ApartmentResultCardProps) {
  const apartmentHref = `/apartamente/${apartment.slug}`;
  const images = useMemo(
    () =>
      apartment.galleryImages.length > 0
        ? apartment.galleryImages.map((image) => `${apartment.galleryPath}/${image}`)
        : [apartment.coverImage],
    [apartment.coverImage, apartment.galleryImages, apartment.galleryPath]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const activeImage = images[clampIndex(activeIndex, images.length)];

  function previousImage() {
    setActiveIndex((current) => clampIndex(current - 1, images.length));
  }

  function nextImage() {
    setActiveIndex((current) => clampIndex(current + 1, images.length));
  }

  useEffect(() => {
    if (!galleryOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setGalleryOpen(false);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => clampIndex(current - 1, images.length));
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => clampIndex(current + 1, images.length));
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [galleryOpen, images.length]);

  return (
    <>
      <article className="group overflow-hidden rounded-[1.8rem] border border-black/5 bg-white shadow-[0_16px_45px_rgba(7,27,45,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(7,27,45,0.16)]">
        <div className="relative h-64 overflow-hidden bg-[#071B2D] sm:h-72">
          <Image
            src={activeImage}
            alt={`${apartment.title} - fotografia ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#071B2D]/72 via-transparent to-[#071B2D]/10" />

          {apartment.badge ? (
            <span className="absolute left-4 top-4 rounded-full bg-[#D9B56D] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#071B2D] shadow-xl">
              {apartment.badge}
            </span>
          ) : null}

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={previousImage}
                aria-label="Fotografia anterioară"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#071B2D]/65 text-white shadow-lg backdrop-blur-md transition hover:bg-[#071B2D]"
              >
                <ArrowLeft size={19} />
              </button>

              <button
                type="button"
                onClick={nextImage}
                aria-label="Fotografia următoare"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#071B2D]/65 text-white shadow-lg backdrop-blur-md transition hover:bg-[#071B2D]"
              >
                <ArrowRight size={19} />
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#071B2D]/75 px-4 py-2 text-xs font-black text-white backdrop-blur-md transition hover:bg-[#071B2D]"
          >
            <Camera size={15} />
            Vezi toate cele {images.length} fotografii
          </button>

          {images.length > 1 ? (
            <div className="absolute bottom-4 left-4 flex max-w-[44%] items-center gap-1.5 rounded-full bg-[#071B2D]/65 px-3 py-2 backdrop-blur-md">
              {images.slice(0, 7).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Afișează fotografia ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex === index ? "w-5 bg-[#D9B56D]" : "w-1.5 bg-white/70"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#158F91]">
                {apartment.roomsLabel} • {apartment.floor}
              </p>
              <h4 className="mt-2 text-xl font-black leading-tight text-[#071B2D] sm:text-2xl">
                {apartment.title}
              </h4>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">Preț sejur</p>
              <p className="mt-1 text-xl font-black text-[#158F91]">
                {formatMoney(apartment.totalPrice)} lei
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-sm font-bold text-[#071B2D]">
            <div className="rounded-2xl bg-[#FAFAF7] px-3 py-3 text-center">
              <Home className="mx-auto mb-1.5 text-[#158F91]" size={18} />
              {apartment.surface} mp
            </div>
            <div className="rounded-2xl bg-[#FAFAF7] px-3 py-3 text-center">
              <BedDouble className="mx-auto mb-1.5 text-[#158F91]" size={18} />
              {apartment.bedrooms} {apartment.bedrooms === 1 ? "dormitor" : "dormitoare"}
            </div>
            <div className="rounded-2xl bg-[#FAFAF7] px-3 py-3 text-center">
              <Sparkles className="mx-auto mb-1.5 text-[#158F91]" size={18} />
              {apartment.view}
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {apartment.highlights.slice(0, 4).map((highlight) => (
              <div key={highlight} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <CheckCircle2 size={16} className="shrink-0 text-[#158F91]" />
                {highlight}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={apartmentHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#071B2D]/15 px-5 py-3 text-sm font-black text-[#071B2D] transition hover:border-[#071B2D] hover:bg-[#071B2D] hover:text-white"
            >
              Vezi apartamentul
              <ArrowUpRight size={17} />
            </Link>

            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#E9F8F8] px-5 py-3 text-sm font-black text-[#071B2D] transition hover:bg-[#158F91] hover:text-white"
            >
              <Images size={17} />
              Galerie foto
            </button>
          </div>
        </div>
      </article>

      {galleryOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020A12]/95 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie ${apartment.title}`}
        >
          <button
            type="button"
            onClick={() => setGalleryOpen(false)}
            aria-label="Închide galeria"
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white hover:text-[#071B2D] sm:right-8 sm:top-8"
          >
            <X size={24} />
          </button>

          <div className="relative h-[72vh] w-full max-w-6xl overflow-hidden rounded-[1.6rem] bg-black shadow-2xl sm:h-[82vh]">
            <Image
              src={activeImage}
              alt={`${apartment.title} - fotografia ${activeIndex + 1}`}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  aria-label="Fotografia anterioară"
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:bg-white hover:text-[#071B2D] sm:left-6"
                >
                  <ArrowLeft size={23} />
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Fotografia următoare"
                  className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:bg-white hover:text-[#071B2D] sm:right-6"
                >
                  <ArrowRight size={23} />
                </button>
              </>
            ) : null}

            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-5 pb-5 pt-16 text-white sm:px-8 sm:pb-7">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D9B56D]">
                  {apartment.title}
                </p>
                <p className="mt-1 text-sm font-bold text-white/80">
                  Fotografia {activeIndex + 1} din {images.length}
                </p>
              </div>

              <Link
                href={apartmentHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#071B2D] transition hover:bg-[#D9B56D]"
              >
                Vezi pagina apartamentului
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
