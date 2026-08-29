import { NextResponse } from "next/server";
import { apartments } from "@/data/apartments";
import { applyRateBatch, readRateStore } from "@/lib/rates/store";
import { getEffectiveAvailabilityDays } from "@/lib/rates/service";
import type { RateBatchInput } from "@/lib/rates/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function monthBounds(month: string) {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (!Number.isInteger(year) || monthIndex < 0 || monthIndex > 11) {
    throw new Error("Luna nu este validă.");
  }

  const first = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const last = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
    lastDay
  ).padStart(2, "0")}`;

  return { first, last };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const now = new Date();
    const month =
      url.searchParams.get("month") ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const requestedSlug = url.searchParams.get("apartment") || apartments[0].slug;
    const apartment = apartments.find((item) => item.slug === requestedSlug);

    if (!apartment) {
      return NextResponse.json(
        { ok: false, message: "Apartamentul nu există." },
        { status: 404 }
      );
    }

    const { first, last } = monthBounds(month);
    const [days, store] = await Promise.all([
      getEffectiveAvailabilityDays(apartment.slug),
      readRateStore(),
    ]);

    return NextResponse.json({
      ok: true,
      month,
      apartment: {
        slug: apartment.slug,
        title: apartment.title,
        shortTitle: apartment.shortTitle,
      },
      apartments: apartments.map((item) => ({
        slug: item.slug,
        title: item.title,
        shortTitle: item.shortTitle,
      })),
      days: days.filter((day) => day.date >= first && day.date <= last),
      updatedAt: store.updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Calendarul de tarife nu a putut fi încărcat.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as RateBatchInput;
    const validSlugs = new Set(apartments.map((item) => item.slug));
    const apartmentSlugs = Array.from(new Set(body.apartmentSlugs || [])).filter(
      (slug) => validSlugs.has(slug)
    );

    if (apartmentSlugs.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Selectează cel puțin un apartament." },
        { status: 400 }
      );
    }

    if (!isDateKey(body.startDate) || !isDateKey(body.endDate)) {
      return NextResponse.json(
        { ok: false, message: "Intervalul nu este valid." },
        { status: 400 }
      );
    }

    if (body.startDate > body.endDate) {
      return NextResponse.json(
        { ok: false, message: "Data de început trebuie să fie înaintea datei de sfârșit." },
        { status: 400 }
      );
    }

    if (!body.reset) {
      if (body.price !== undefined && (!Number.isFinite(body.price) || body.price < 1)) {
        return NextResponse.json(
          { ok: false, message: "Prețul trebuie să fie mai mare decât zero." },
          { status: 400 }
        );
      }

      if (
        body.minNights !== undefined &&
        (!Number.isInteger(body.minNights) || body.minNights < 1 || body.minNights > 30)
      ) {
        return NextResponse.json(
          { ok: false, message: "Numărul minim de nopți trebuie să fie între 1 și 30." },
          { status: 400 }
        );
      }
    }

    const store = await applyRateBatch({
      ...body,
      apartmentSlugs,
      price: body.price === undefined ? undefined : Math.round(body.price),
      minNights:
        body.minNights === undefined ? undefined : Math.round(body.minNights),
    });

    return NextResponse.json({
      ok: true,
      message: body.reset
        ? "Setările intervalului au fost resetate."
        : "Tarifele au fost salvate.",
      updatedAt: store.updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Tarifele nu au putut fi salvate.",
      },
      { status: 500 }
    );
  }
}
