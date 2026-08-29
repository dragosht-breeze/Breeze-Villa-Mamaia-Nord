import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Breeze Villa Mamaia Nord",
    short_name: "Breeze Villa",
    description:
      "Apartamente spațioase pentru familii în Mamaia Nord, cu piscină, parcare privată și rezervare directă.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF7",
    theme_color: "#071B2D",
    lang: "ro",
    categories: ["travel", "lifestyle"],
    icons: [
      {
        src: "/branding/favicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/branding/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
