import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BreezeVillaJsonLd from "@/components/seo/BreezeVillaJsonLd";
import AIReceptionist from "@/components/ai/AIReceptionist";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import LanguageProvider from "@/components/i18n/LanguageProvider";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const siteUrl = getSiteUrl();

const siteName = "Breeze Villa Mamaia Nord";

const defaultTitle =
  "Breeze Villa Mamaia Nord | Cazare pentru familii";

const defaultDescription =
  "Cazare în Mamaia Nord la Breeze Villa: apartamente spațioase pentru familii, piscină, loc de joacă, parcare privată și rezervare directă.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  applicationName: siteName,
  manifest: "/manifest.webmanifest",

  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },

  description: defaultDescription,

  keywords: [
    "Breeze Villa",
    "Breeze Villa Mamaia Nord",
    "Breeze Villa Mamaia Sat",
    "cazare Mamaia Nord",
    "cazare Mamaia Sat",
    "apartamente Mamaia Nord",
    "apartamente Mamaia Sat",
    "apartamente cu piscină Mamaia Nord",
    "cazare cu piscină Mamaia Nord",
    "cazare cu piscină Mamaia Sat",
    "cazare familii Mamaia Nord",
    "cazare familii Mamaia Sat",
    "cazare copii Mamaia Nord",
    "cazare aproape de plajă Mamaia Nord",
    "cazare card de vacanță Mamaia Nord",
    "apartamente de vacanță Mamaia Nord",
  ],

  authors: [
    {
      name: siteName,
      url: siteUrl,
    },
  ],

  creator: siteName,
  publisher: siteName,
  category: "Turism și cazare",

  alternates: {
    canonical: "/",
    languages: {
      "ro-RO": "/",
    },
  },

  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      {
        url: "/branding/favicon-logo-20260914.png",
        type: "image/png",
      },
    ],
    shortcut: "/branding/favicon-logo-20260914.png",
    apple: [
      {
        url: "/branding/apple-touch-icon.png",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "/",
    siteName,
    title: defaultTitle,
    description:
      "Descoperă Breeze Villa, cazare pentru familii în Mamaia Nord, cu apartamente spațioase, piscină, loc de joacă și parcare privată.",
    images: [
      {
        url: "/images/hero-breeze-night.png",
        width: 1448,
        height: 1086,
        alt: "Breeze Villa Mamaia Nord – piscină și cazare pentru familii",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description:
      "Apartamente pentru familii în Mamaia Nord, cu piscină, loc de joacă, parcare privată și rezervare directă.",
    images: ["/images/hero-breeze-night.png"],
  },

  other: {
    "geo.region": "RO-CT",
    "geo.placename": "Mamaia-Sat, Năvodari",
    "geo.position": "44.29479137620329;28.617728027051683",
    ICBM: "44.29479137620329, 28.617728027051683",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className="h-full scroll-smooth antialiased"
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-[#FAFAF7] font-sans"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <BreezeVillaJsonLd />

          <Navbar />

          {children}

          <Footer />

          <AIReceptionist />

          <GoogleAnalytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
