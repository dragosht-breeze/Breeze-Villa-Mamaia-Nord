import type { ReservationFolder } from "@/lib/reservation-center/types";
import type { GuestAutomationTrigger } from "@/lib/guest-automation/types";

const PROPERTY_NAME = "Breeze Villa Mamaia Nord";
const ADDRESS = "Strada C2 nr. 37, Mamaia Nord, Năvodari";
const WHATSAPP = "0723 253 405";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "";
}

function salutation(folder: ReservationFolder) {
  const name = firstName(folder.summary.guest.name);
  return name ? `Bună, ${name}!` : "Bună!";
}

function apartmentLabel(folder: ReservationFolder) {
  const titles = folder.summary.apartments
    .map((apartment) => apartment.title.trim())
    .filter(Boolean);

  if (titles.length === 0) return "cazarea rezervată";
  if (titles.length === 1) return titles[0];
  return titles.join(" + ");
}

export function renderGuestAutomationMessage(
  trigger: GuestAutomationTrigger,
  folder: ReservationFolder
) {
  const hello = salutation(folder);
  const apartment = apartmentLabel(folder);

  switch (trigger) {
    case "PRE_STAY":
      return `${hello}\n\nMâine vă așteptăm la ${PROPERTY_NAME}. Check-in-ul începe la ora 15:00, iar rezervarea este pentru ${apartment}. Parcarea este disponibilă în incinta proprietății.\n\nDacă ajungeți după ora 18:00, procedura de self check-in vă va fi comunicată în ziua sosirii. Adresa: ${ADDRESS}.\n\nNe puteți răspunde cu ora aproximativă la care estimați că ajungeți. Pentru ajutor: WhatsApp ${WHATSAPP}.`;

    case "CHECK_IN_DAY":
      return `${hello}\n\nAstăzi este ziua sosirii la ${PROPERTY_NAME}. Check-in-ul începe la ora 15:00. Parcarea este în incinta proprietății, iar adresa este ${ADDRESS}.\n\nDacă ajungeți după ora 18:00, veți folosi procedura de self check-in comunicată pentru sosire. Dacă nu ne-ați transmis încă ora aproximativă de sosire, ne puteți răspunde la acest mesaj.\n\nPentru ajutor: WhatsApp ${WHATSAPP}.`;

    case "IN_STAY":
      return `${hello}\n\nSperăm că vă bucurați de sejurul la ${PROPERTY_NAME}. Dacă aveți nevoie de ajutor cu apartamentul, piscina, parcarea, grătarul sau orice alt aspect al șederii, ne puteți scrie aici și vă ajutăm.\n\nPentru o situație care necesită intervenția proprietății: WhatsApp ${WHATSAPP}.`;

    case "PRE_CHECKOUT":
      return `${hello}\n\nVă reamintim că mâine este ziua plecării, iar check-out-ul standard este între 09:00 și 10:00.\n\nDacă aveți nevoie de late check-out, îl puteți solicita, însă disponibilitatea și eventualul cost trebuie confirmate de proprietate.\n\nPentru orice nelămurire: WhatsApp ${WHATSAPP}.`;

    case "POST_STAY":
      return `${hello}\n\nVă mulțumim că ați ales ${PROPERTY_NAME}. Sperăm că ați avut un sejur frumos și că ați ajuns cu bine.\n\nDacă ați uitat ceva la proprietate sau aveți nevoie de un document legat de sejur, ne puteți scrie pe WhatsApp la ${WHATSAPP}. Dacă v-a plăcut experiența, ne-ar bucura și o recenzie.\n\nVă mai așteptăm cu drag!`;
  }
}
