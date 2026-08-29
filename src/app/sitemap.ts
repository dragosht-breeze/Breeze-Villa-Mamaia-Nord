import type { MetadataRoute } from "next";

import { apartments } from "@/data/apartments";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://breezevilla.ro";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/rezervare`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/politica-anulare`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
  ];

  const apartmentPages: MetadataRoute.Sitemap = apartments.map(
    (apartment) => ({
      url: `${siteUrl}/apartamente/${apartment.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: apartment.featured ? 0.95 : 0.9,
      images: [
        new URL(
          encodeURI(apartment.coverImage),
          `${siteUrl}/`
        ).toString(),
      ],
    })
  );

  return [...staticPages, ...apartmentPages];
}
