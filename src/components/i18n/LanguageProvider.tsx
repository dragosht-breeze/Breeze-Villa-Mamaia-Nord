"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { extraTranslations } from "@/components/i18n/translations-extra";
import { pageTranslations } from "@/components/i18n/translations-pages";

export type SiteLanguage = "ro" | "en" | "ru";

type LanguageContextValue = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "breeze-site-language";

const translations: Record<"en" | "ru", Record<string, string>> = {
  en: {
    "Acasă": "Home", "Apartamente": "Apartments", "Cazare": "Accommodation",
    "Facilități": "Amenities", "Galerie": "Gallery", "Recenzii": "Reviews",
    "Contact": "Contact", "Rezervă acum": "Book now", "Închide meniul": "Close menu",
    "Deschide meniul": "Open menu", "Oaza ta de relaxare": "Your relaxing retreat",
    "Vacanța în familie, cu mai mult spațiu, liniște și libertate. Apartamente generoase, piscină și natură, la doar câteva minute de plajă.": "A family holiday with more space, peace and freedom. Spacious apartments, a pool and nature, just minutes from the beach.",
    "Apartamente de până la 110 mp": "Apartments up to 110 sqm",
    "Curte, piscină și spații verzi": "Garden, pool and green spaces",
    "La câteva minute de plajă": "Just minutes from the beach",
    "Verifică disponibilitatea": "Check availability", "Discută cu noi pe WhatsApp": "Chat with us on WhatsApp",
    "Mamaia Nord, la câteva minute de plajă": "Mamaia Nord, just minutes from the beach",
    "7 apartamente": "7 apartments", "spațioase": "spacious", "Piscină": "Swimming pool",
    "pentru relaxare": "for relaxation", "Parcare privată": "Private parking",
    "în incintă": "on site", "Ideal pentru familii": "Ideal for families", "cu copii": "with children",
    "Descoperă": "Discover", "Tot ce contează pentru o vacanță relaxată": "Everything you need for a relaxing holiday",
    "Breeze Villa este gândită pentru familii care caută mai mult spațiu, liniște, piscină, curte verde și confort aproape de mare.": "Breeze Villa is designed for families looking for more space, peace, a swimming pool, a green garden and comfort near the sea.",
    "Confortul unei locuințe, atmosfera unei vacanțe": "The comfort of a home, the feeling of a holiday",
    "De ce familiile aleg Breeze Villa?": "Why do families choose Breeze Villa?",
    "Mai mult decât un loc de cazare. Un spațiu în care părinții se pot relaxa, copiii se pot bucura de vacanță, iar timpul petrecut împreună devine cu adevărat valoros.": "More than a place to stay. A space where parents can relax, children can enjoy their holiday and time together becomes truly valuable.",
    "Mai mult spațiu pentru întreaga familie": "More space for the whole family",
    "Apartamente generoase, cu zone separate pentru odihnă, relaxare și timp petrecut împreună.": "Spacious apartments with separate areas for rest, relaxation and quality time together.",
    "Un loc potrivit pentru copii": "A place designed for children",
    "Curte, piscină și spații aerisite, într-o atmosferă liniștită și prietenoasă pentru familii.": "A garden, swimming pool and open spaces in a peaceful, family-friendly atmosphere.",
    "Relaxare fără drumuri zilnice": "Relaxation without daily travel",
    "Piscina este chiar la locație, astfel încât vă puteți bucura de vacanță în propriul ritm.": "The pool is right on the property, so you can enjoy your holiday at your own pace.",
    "Liniște și natură": "Peace and nature",
    "Vegetația matură și curtea verde creează un refugiu plăcut după o zi petrecută la mare.": "Mature greenery and the garden create a pleasant retreat after a day by the sea.",
    "Sosire simplă și fără griji": "Easy, worry-free arrival",
    "Parcarea din incinta proprietății vă oferă acces rapid și mai multă comoditate pe durata sejurului.": "On-site parking gives you easy access and greater comfort throughout your stay.",
    "Marea se află la doar câteva minute, iar la întoarcere vă așteaptă liniștea de la Breeze Villa.": "The sea is just minutes away, and the peaceful atmosphere of Breeze Villa awaits your return.",
    "7 apartamente spațioase": "7 spacious apartments", "Piscină la locație": "On-site swimming pool",
    "Curte și spații verzi": "Garden and green spaces",
    "Gândită în special pentru familiile care își doresc confortul unui apartament și atmosfera relaxată a unei vacanțe la mare.": "Designed especially for families who want the comfort of an apartment and the relaxed atmosphere of a seaside holiday.",
    "Oază de liniște pentru familii în Mamaia Nord": "A peaceful family retreat in Mamaia Nord",
    "Un loc în care copiii au spațiu, iar părinții se pot bucura de liniște și relaxare.": "A place where children have room to play and parents can enjoy peace and relaxation.",
    "Piscină privată": "Private pool", "Curte verde": "Green garden", "Parcare în incintă": "On-site parking",
    "Kids Friendly": "Family friendly", "Zonă BBQ": "BBQ area", "Aproape de plajă": "Near the beach",
    "Aer condiționat": "Air conditioning", "Bucătării utilate": "Equipped kitchens", "Wi-Fi rapid": "Fast Wi-Fi",
    "Rezervare directă": "Direct booking", "Vacanța ta la Breeze Villa începe cu o rezervare simplă.": "Your Breeze Villa holiday starts with a simple booking.",
    "Verifică disponibilitatea apartamentelor sau scrie-ne direct pe WhatsApp pentru informații rapide.": "Check apartment availability or message us on WhatsApp for a quick answer.",
    "Scrie-ne pe WhatsApp": "Message us on WhatsApp", "Navigare": "Navigation", "Locație": "Location",
    "Telefon": "Phone", "Adresă": "Address", "Carduri de vacanță": "Holiday vouchers",
    "Acceptăm plata cu cardul de vacanță": "We accept holiday vouchers",
    "Plata este disponibilă prin furnizorii principali.": "Payment is available through the main providers.",
    "Deschide în Google Maps": "Open in Google Maps", "Plăți și protecția consumatorilor": "Payments and consumer protection",
    "Protecția consumatorilor": "Consumer protection", "Soluționarea alternativă a litigiilor": "Alternative dispute resolution",
    "Politica de cookie-uri": "Cookie policy", "Preferințe cookie": "Cookie preferences",
    "Termeni și condiții": "Terms and conditions", "Confidențialitate": "Privacy", "Prestarea serviciilor": "Service policy",
    "Anulare": "Cancellation", "Toate drepturile rezervate.": "All rights reserved.",
    "Caută perioada potrivită pentru vacanța ta": "Find the right dates for your holiday",
    "Alege perioada": "Choose dates", "Adulți": "Adults", "Copii": "Children", "Caută": "Search",
    "Continuă rezervarea": "Continue booking", "Înapoi": "Back", "Continuă": "Continue",
    "Nume": "Name", "Prenume": "First name", "E-mail": "Email",
    "Confirmă rezervarea": "Confirm booking", "Total": "Total", "Plătește online": "Pay online",
    ...extraTranslations.en,
    ...pageTranslations.en,
  },
  ru: {
    "Acasă": "Главная", "Apartamente": "Апартаменты", "Cazare": "Проживание",
    "Facilități": "Удобства", "Galerie": "Галерея", "Recenzii": "Отзывы",
    "Contact": "Контакты", "Rezervă acum": "Забронировать", "Închide meniul": "Закрыть меню",
    "Deschide meniul": "Открыть меню", "Oaza ta de relaxare": "Ваш оазис отдыха",
    "Vacanța în familie, cu mai mult spațiu, liniște și libertate. Apartamente generoase, piscină și natură, la doar câteva minute de plajă.": "Семейный отдых с простором, тишиной и свободой. Просторные апартаменты, бассейн и природа всего в нескольких минутах от пляжа.",
    "Apartamente de până la 110 mp": "Апартаменты до 110 м²",
    "Curte, piscină și spații verzi": "Двор, бассейн и зелёные зоны",
    "La câteva minute de plajă": "Несколько минут до пляжа",
    "Verifică disponibilitatea": "Проверить наличие", "Discută cu noi pe WhatsApp": "Написать нам в WhatsApp",
    "Mamaia Nord, la câteva minute de plajă": "Мамая Норд, несколько минут до пляжа",
    "7 apartamente": "7 апартаментов", "spațioase": "просторные", "Piscină": "Бассейн",
    "pentru relaxare": "для отдыха", "Parcare privată": "Частная парковка",
    "în incintă": "на территории", "Ideal pentru familii": "Идеально для семей", "cu copii": "с детьми",
    "Descoperă": "Узнать больше", "Tot ce contează pentru o vacanță relaxată": "Всё необходимое для спокойного отдыха",
    "Breeze Villa este gândită pentru familii care caută mai mult spațiu, liniște, piscină, curte verde și confort aproape de mare.": "Breeze Villa создана для семей, которые ценят простор, тишину, бассейн, зелёный двор и комфорт рядом с морем.",
    "Confortul unei locuințe, atmosfera unei vacanțe": "Домашний комфорт и атмосфера отпуска",
    "De ce familiile aleg Breeze Villa?": "Почему семьи выбирают Breeze Villa?",
    "Mai mult decât un loc de cazare. Un spațiu în care părinții se pot relaxa, copiii se pot bucura de vacanță, iar timpul petrecut împreună devine cu adevărat valoros.": "Больше, чем просто место для проживания. Здесь родители могут отдохнуть, дети — насладиться каникулами, а совместное время становится по-настоящему ценным.",
    "Mai mult spațiu pentru întreaga familie": "Больше пространства для всей семьи",
    "Apartamente generoase, cu zone separate pentru odihnă, relaxare și timp petrecut împreună.": "Просторные апартаменты с отдельными зонами для сна, отдыха и совместного времяпрепровождения.",
    "Un loc potrivit pentru copii": "Место, подходящее для детей",
    "Curte, piscină și spații aerisite, într-o atmosferă liniștită și prietenoasă pentru familii.": "Двор, бассейн и просторные зоны в спокойной и дружелюбной для семей атмосфере.",
    "Relaxare fără drumuri zilnice": "Отдых без ежедневных поездок",
    "Piscina este chiar la locație, astfel încât vă puteți bucura de vacanță în propriul ritm.": "Бассейн находится прямо на территории, поэтому вы можете отдыхать в собственном ритме.",
    "Liniște și natură": "Тишина и природа",
    "Vegetația matură și curtea verde creează un refugiu plăcut după o zi petrecută la mare.": "Зрелая зелень и сад создают приятное место для отдыха после дня у моря.",
    "Sosire simplă și fără griji": "Простой и спокойный заезд",
    "Parcarea din incinta proprietății vă oferă acces rapid și mai multă comoditate pe durata sejurului.": "Парковка на территории обеспечивает удобный доступ и комфорт на протяжении всего пребывания.",
    "Marea se află la doar câteva minute, iar la întoarcere vă așteaptă liniștea de la Breeze Villa.": "Море находится всего в нескольких минутах, а по возвращении вас ждёт тишина Breeze Villa.",
    "7 apartamente spațioase": "7 просторных апартаментов", "Piscină la locație": "Бассейн на территории",
    "Curte și spații verzi": "Двор и зелёные зоны",
    "Gândită în special pentru familiile care își doresc confortul unui apartament și atmosfera relaxată a unei vacanțe la mare.": "Создано специально для семей, которые ценят комфорт апартаментов и расслабленную атмосферу отдыха у моря.",
    "Oază de liniște pentru familii în Mamaia Nord": "Тихий семейный отдых в Мамая Норд",
    "Un loc în care copiii au spațiu, iar părinții se pot bucura de liniște și relaxare.": "Место, где детям есть где играть, а родители могут наслаждаться тишиной и отдыхом.",
    "Piscină privată": "Частный бассейн", "Curte verde": "Зелёный двор", "Parcare în incintă": "Парковка на территории",
    "Kids Friendly": "Для семей с детьми", "Zonă BBQ": "Зона барбекю", "Aproape de plajă": "Рядом с пляжем",
    "Aer condiționat": "Кондиционер", "Bucătării utilate": "Оборудованные кухни", "Wi-Fi rapid": "Быстрый Wi-Fi",
    "Rezervare directă": "Прямое бронирование", "Vacanța ta la Breeze Villa începe cu o rezervare simplă.": "Ваш отдых в Breeze Villa начинается с простого бронирования.",
    "Verifică disponibilitatea apartamentelor sau scrie-ne direct pe WhatsApp pentru informații rapide.": "Проверьте наличие апартаментов или напишите нам в WhatsApp для быстрого ответа.",
    "Scrie-ne pe WhatsApp": "Написать в WhatsApp", "Navigare": "Навигация", "Locație": "Расположение",
    "Telefon": "Телефон", "Adresă": "Адрес", "Carduri de vacanță": "Туристические ваучеры",
    "Acceptăm plata cu cardul de vacanță": "Мы принимаем туристические ваучеры",
    "Plata este disponibilă prin furnizorii principali.": "Оплата доступна через основных поставщиков.",
    "Deschide în Google Maps": "Открыть в Google Maps", "Plăți și protecția consumatorilor": "Платежи и защита потребителей",
    "Protecția consumatorilor": "Защита потребителей", "Soluționarea alternativă a litigiilor": "Альтернативное разрешение споров",
    "Politica de cookie-uri": "Политика cookie", "Preferințe cookie": "Настройки cookie",
    "Termeni și condiții": "Условия", "Confidențialitate": "Конфиденциальность", "Prestarea serviciilor": "Правила оказания услуг",
    "Anulare": "Отмена", "Toate drepturile rezervate.": "Все права защищены.",
    "Caută perioada potrivită pentru vacanța ta": "Найдите подходящие даты для отдыха",
    "Alege perioada": "Выберите даты", "Adulți": "Взрослые", "Copii": "Дети", "Caută": "Поиск",
    "Continuă rezervarea": "Продолжить бронирование", "Înapoi": "Назад", "Continuă": "Продолжить",
    "Nume": "Фамилия", "Prenume": "Имя", "E-mail": "Эл. почта",
    "Confirmă rezervarea": "Подтвердить бронирование", "Total": "Итого", "Plătește online": "Оплатить онлайн",
    ...extraTranslations.ru,
    ...pageTranslations.ru,
  },
};

function replaceText(root: ParentNode, language: SiteLanguage) {
  const dictionary = language === "ro" ? null : translations[language];
  const reverse = new Map<string, string>();
  for (const lang of Object.values(translations)) {
    for (const [ro, translated] of Object.entries(lang)) reverse.set(translated, ro);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, code, pre, [data-no-translate]")) continue;
    const raw = node.nodeValue ?? "";
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const normalized = trimmed.replace(/\s+/g, " ");
    const protectedTerms = ["Booking.com", "Breeze Villa", "Kaufland Mamaia Nord", "WhatsApp", "NETOPIA"];
    const protectedValues: string[] = [];
    let protectedText = normalized;
    for (const term of protectedTerms) {
      protectedText = protectedText.split(term).join(`\uE000${protectedValues.push(term) - 1}\uE001`);
    }
    const restoreProtected = (value: string) => value.replace(/\uE000(\d+)\uE001/g, (_, index) => protectedValues[Number(index)] ?? "");

    let original = reverse.get(protectedText) ?? protectedText;
    if (!reverse.has(protectedText)) {
      const translatedPhrases = [...reverse.entries()].sort((a, b) => b[0].length - a[0].length);
      for (const [translated, ro] of translatedPhrases) {
        if (translated.length >= 4 && original.includes(translated)) original = original.split(translated).join(ro);
      }
    }
    let next = dictionary?.[original] ?? original;
    if (dictionary && !dictionary[original]) {
      const phrases = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
      for (const [ro, translated] of phrases) {
        if (ro.length >= 4 && next.includes(ro)) next = next.split(ro).join(translated);
      }
    }
    next = restoreProtected(next);
    if (next !== trimmed) node.nodeValue = raw.replace(trimmed, next);
  }

  for (const element of root.querySelectorAll<HTMLElement>("[aria-label], [placeholder], [title], [alt]")) {
    for (const attribute of ["aria-label", "placeholder", "title", "alt"]) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const original = reverse.get(value) ?? value;
      element.setAttribute(attribute, dictionary?.[original] ?? original);
    }
  }
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<SiteLanguage>("ro");

  const setLanguage = useCallback((next: SiteLanguage) => {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ru" || saved === "ro") setLanguageState(saved);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    document.documentElement.lang = language;
    replaceText(document.body, language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) replaceText(node as Element, language);
          if (node.nodeType === Node.TEXT_NODE && node.parentNode) replaceText(node.parentNode, language);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language, pathname]);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useSiteLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useSiteLanguage must be used inside LanguageProvider");
  return context;
}
