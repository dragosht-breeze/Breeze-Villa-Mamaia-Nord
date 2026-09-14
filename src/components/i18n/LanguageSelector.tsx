"use client";

import { Languages } from "lucide-react";
import { SiteLanguage, useSiteLanguage } from "@/components/i18n/LanguageProvider";

const options: Array<{ value: SiteLanguage; label: string; title: string }> = [
  { value: "ro", label: "RO", title: "Română" },
  { value: "en", label: "EN", title: "English" },
  { value: "ru", label: "RU", title: "Русский" },
];

export default function LanguageSelector({ mobile = false }: { mobile?: boolean }) {
  const { language, setLanguage } = useSiteLanguage();

  return (
    <div data-no-translate className={`flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.07] p-1 ${mobile ? "justify-center" : ""}`}>
      <Languages aria-hidden="true" size={14} className="ml-1 text-[#D9B56D]" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          title={option.title}
          aria-label={option.title}
          aria-pressed={language === option.value}
          className={`rounded-full px-2 py-1 text-[10px] font-black transition ${
            language === option.value
              ? "bg-[#D9B56D] text-[#071B2D]"
              : "text-white/75 hover:bg-white/10 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
