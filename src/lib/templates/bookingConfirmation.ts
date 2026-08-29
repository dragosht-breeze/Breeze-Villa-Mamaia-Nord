import type { ReservationRequest } from "@/lib/reservationStore";

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function todayDate() {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function shortConfirmationNumber(id: string) {
  return id.match(/(\d{4})$/)?.[1] ?? "0000";
}

function logoSvg() {
  return `
    <svg class="logoSvg" viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        <linearGradient id="goldGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#F2D88A" />
          <stop offset="0.48" stop-color="#C89B3C" />
          <stop offset="1" stop-color="#8E6722" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="96" fill="#0A1E36" />
      <circle cx="110" cy="110" r="88" fill="none" stroke="url(#goldGradient)" stroke-width="6" />
      <path d="M68 65 C91 47, 128 48, 151 66" fill="none" stroke="url(#goldGradient)" stroke-width="4" stroke-linecap="round" />
      <path d="M69 154 C91 174, 129 174, 151 154" fill="none" stroke="url(#goldGradient)" stroke-width="4" stroke-linecap="round" />
      <text x="110" y="121" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="700" fill="#FFF8E6" letter-spacing="2">BV</text>
      <path d="M146 84 C159 75, 172 76, 181 87 C166 91, 154 90, 146 84Z" fill="url(#goldGradient)" opacity="0.95" />
      <path d="M74 137 C61 145, 48 144, 39 133 C54 129, 66 130, 74 137Z" fill="url(#goldGradient)" opacity="0.85" />
    </svg>`;
}

function iconSvg(type: "guest" | "phone" | "email" | "calendar" | "home" | "check" | "clock" | "card" | "id") {
  const icons = {
    guest: `<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"/>`,
    phone: `<path d="M7 4h3l1.5 4-2 1.2a12 12 0 0 0 5.3 5.3l1.2-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 7 4Z"/>`,
    email: `<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>`,
    calendar: `<path d="M5 5h14v15H5z"/><path d="M8 3v4M16 3v4M5 10h14"/>`,
    home: `<path d="M3 11 12 4l9 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>`,
    check: `<path d="m5 12 4 4L19 6"/>`,
    clock: `<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/><path d="M12 7v6l4 2"/>`,
    card: `<path d="M4 7h16v10H4z"/><path d="M4 10h16"/>`,
    id: `<path d="M4 5h16v14H4z"/><path d="M8 9h4M8 13h8M8 16h5"/>`,
  } as const;

  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[type]}</svg>`;
}

export function createBookingConfirmationHtml(reservation: ReservationRequest) {
  const confirmationNo = shortConfirmationNumber(reservation.id);
  const guestName = escapeHtml(reservation.guest.name);
  const guestPhone = escapeHtml(reservation.guest.phone);
  const guestEmail = escapeHtml(reservation.guest.email ?? "");
  const checkIn = escapeHtml(formatDate(reservation.checkIn));
  const checkOut = escapeHtml(formatDate(reservation.checkOut));
  const nights = escapeHtml(reservation.nights);
  const adults = escapeHtml(reservation.adults);
  const children = escapeHtml(reservation.children);
  const apartment = escapeHtml(reservation.apartmentTitle);
  const total = escapeHtml(reservation.total);
  const reservationId = escapeHtml(reservation.id);

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8" />
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #f3eee4; }
body { font-family: "Inter", "Segoe UI", Arial, sans-serif; color: #0A1E36; }
.page {
  width: 210mm;
  height: 297mm;
  position: relative;
  overflow: hidden;
  padding: 10.5mm;
  background:
    radial-gradient(circle at 13% 8%, rgba(218, 180, 84, .19), transparent 24%),
    radial-gradient(circle at 92% 78%, rgba(10, 30, 54, .10), transparent 28%),
    linear-gradient(180deg, #FFFCF5 0%, #FFFFFF 47%, #F5EEDC 100%);
}
.page:before {
  content: "";
  position: absolute;
  inset: 5.5mm;
  border: 1px solid rgba(200,155,60,.28);
  border-radius: 9mm;
  pointer-events: none;
}
.watermark {
  position: absolute;
  left: -13mm;
  bottom: 46mm;
  transform: rotate(-90deg);
  font-family: Georgia, serif;
  font-size: 44px;
  letter-spacing: 9px;
  font-weight: 700;
  color: rgba(10,30,54,.035);
  white-space: nowrap;
}
.header {
  position: relative;
  display: grid;
  grid-template-columns: 50mm 1fr 41mm;
  gap: 7mm;
  align-items: stretch;
  z-index: 2;
}
.brandPanel {
  min-height: 50mm;
  border-radius: 8mm;
  background: linear-gradient(180deg, #0A1E36 0%, #0E2A48 100%);
  border: 1.5px solid #C8A34D;
  box-shadow: 0 16px 34px rgba(10,30,54,.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 5mm;
}
.logoSvg { width: 27mm; height: 27mm; display: block; margin-bottom: 3mm; }
.brandTitle { font-family: Georgia, serif; font-size: 17px; letter-spacing: 3.2px; font-weight: 700; line-height: 1; }
.brandLocation { margin-top: 1.8mm; font-size: 8.8px; color: #D9BE70; letter-spacing: 2.7px; font-weight: 700; }
.titlePanel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 6mm;
  border-left: 2px solid #C8A34D;
}
.kicker { font-size: 9px; letter-spacing: 3.8px; color: #C8A34D; font-weight: 800; text-transform: uppercase; }
.titlePanel h1 { margin: 2mm 0 0; font-family: Georgia, serif; font-size: 31px; line-height: .95; letter-spacing: 2px; color: #0A1E36; }
.titlePanel h2 { margin: 1mm 0 0; font-family: Georgia, serif; font-size: 23px; font-weight: 400; color: #C8A34D; letter-spacing: 1.4px; }
.stars { margin-top: 2.5mm; color: #C8A34D; font-size: 12px; letter-spacing: 4px; }
.subtitle { margin-top: 2.2mm; font-family: Georgia, serif; font-size: 12px; font-style: italic; color: #53606D; line-height: 1.35; }
.numberPanel {
  border-radius: 0 0 8mm 8mm;
  background: linear-gradient(180deg, #0A1E36 0%, #12385D 100%);
  color: #fff;
  border: 1.5px solid #C8A34D;
  box-shadow: 0 16px 34px rgba(10,30,54,.20);
  padding: 6mm 3mm;
  text-align: center;
}
.numberPanel .small { font-size: 8px; letter-spacing: 1.4px; text-transform: uppercase; color: #E8D29A; font-weight: 800; }
.numberPanel .num { margin-top: 4mm; font-family: Georgia, serif; font-size: 32px; letter-spacing: 2px; line-height: 1; }
.rule { height: 1px; margin: 6mm 0 0; background: linear-gradient(90deg, transparent, rgba(200,163,77,.95), transparent); }
.stamp {
  position: absolute;
  top: 45mm;
  right: 18mm;
  width: 34mm;
  height: 34mm;
  border: 2.5px solid rgba(200,163,77,.75);
  border-radius: 50%;
  color: rgba(200,163,77,.85);
  transform: rotate(-14deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 13px;
  letter-spacing: 1px;
  z-index: 5;
}
.meta {
  display: grid;
  grid-template-columns: 1fr 1.45fr 1fr;
  gap: 4mm;
  margin-top: 6mm;
  position: relative;
  z-index: 3;
}
.metaCard, .card {
  background: rgba(255,255,255,.88);
  border: 1px solid rgba(200,163,77,.52);
  border-radius: 5.5mm;
  box-shadow: 0 10px 28px rgba(10,30,54,.075);
}
.metaCard { padding: 4.2mm; min-height: 22mm; }
.label { font-size: 8.5px; letter-spacing: 1.3px; text-transform: uppercase; color: #B88A2F; font-weight: 900; margin-bottom: 1.6mm; }
.value { font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #0A1E36; }
.badge { display: inline-block; padding: 1.7mm 3mm; border-radius: 999px; background: #EAF8F4; color: #137C6B; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: .8px; }
.main {
  display: grid;
  grid-template-columns: 1fr 1.08fr;
  gap: 5mm;
  margin-top: 5mm;
  position: relative;
  z-index: 3;
}
.card { padding: 5mm; }
.card + .card { margin-top: 4.3mm; }
.sectionTitle {
  display: inline-flex;
  align-items: center;
  gap: 2mm;
  padding: 2.4mm 4mm;
  border-radius: 999px;
  background: #0A1E36;
  color: #fff;
  font-weight: 900;
  font-size: 10.5px;
  letter-spacing: .6px;
  margin-bottom: 4mm;
}
.icon { width: 4.4mm; height: 4.4mm; color: currentColor; flex: 0 0 auto; }
.big { font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #0A1E36; line-height: 1.12; }
.muted { color: #566474; font-size: 11px; line-height: 1.5; }
.contactRows { display: grid; gap: 2mm; margin-top: 3mm; }
.contactRow { display: flex; gap: 2.2mm; align-items: center; color: #566474; font-size: 11px; }
.contactIcon { width: 6mm; height: 6mm; border-radius: 50%; background: #F5E9C9; color: #0A1E36; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; }
.stayGrid { display: grid; grid-template-columns: 1fr 12mm 1fr; align-items: center; text-align: center; margin-top: 2mm; }
.dateValue { font-family: Georgia, serif; font-size: 17px; font-weight: 700; line-height: 1.15; }
.arrow { color: #C8A34D; font-size: 24px; font-weight: 900; }
.nightsLine { margin-top: 3.5mm; padding-top: 3mm; border-top: 1px dashed rgba(200,163,77,.75); display: flex; justify-content: space-between; align-items: center; }
.nights { font-family: Georgia, serif; font-size: 17px; font-weight: 700; }
.tags { display: flex; gap: 2mm; flex-wrap: wrap; margin-top: 3mm; }
.tag { border-radius: 999px; background: #F4E8C9; color: #0A1E36; padding: 1.5mm 2.6mm; font-size: 9px; font-weight: 800; }
.paymentCard { background: linear-gradient(180deg, #0A1E36 0%, #12385D 100%); color: #fff; border-radius: 6mm; padding: 5.5mm; box-shadow: 0 17px 38px rgba(10,30,54,.24); border: 1px solid #C8A34D; }
.paymentHead { display: flex; justify-content: space-between; gap: 3mm; align-items: flex-start; margin-bottom: 2mm; }
.paymentHeadTitle { font-size: 11px; font-weight: 900; letter-spacing: 1.2px; text-transform: uppercase; color: #EAD79B; }
.totalAmount { font-family: Georgia, serif; font-size: 29px; line-height: 1; font-weight: 700; text-align: right; }
.payLine { display: flex; justify-content: space-between; gap: 4mm; border-top: 1px dashed rgba(232,210,154,.55); padding: 3.2mm 0; font-size: 11px; color: rgba(255,255,255,.78); }
.payLine strong { color: #fff; font-family: Georgia, serif; font-size: 15px; text-align: right; }
.statusBox { margin-top: 2mm; border-radius: 4.5mm; background: #FFFDF7; border: 1px solid #C8A34D; color: #0A1E36; padding: 3.6mm; }
.statusBox strong { display: block; font-family: Georgia, serif; font-size: 20px; margin-top: 1mm; }
.depositPill { display: inline-flex; align-items: center; gap: 1.5mm; margin-top: 2mm; color: #137C6B; background: #EAF8F4; border-radius: 999px; padding: 1.7mm 3mm; font-size: 9px; font-weight: 900; }
.infoGrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3mm; }
.infoItem { border: 1px solid rgba(200,163,77,.36); border-radius: 4mm; padding: 3mm; min-height: 25mm; background: #FFFDF8; }
.infoItemTitle { font-weight: 900; font-size: 11px; color: #0A1E36; display: flex; gap: 2mm; align-items: center; }
.infoItemText { margin-top: 1.5mm; font-size: 10px; color: #566474; line-height: 1.35; }
.welcome { display: grid; grid-template-columns: 1.25fr .75fr; gap: 4mm; margin-top: 4.3mm; }
.signature { font-family: Georgia, serif; color: #C8A34D; font-size: 22px; font-style: italic; margin-bottom: 1.8mm; }
.idBox { background: #0A1E36; color: #fff; border: 1px solid #C8A34D; border-radius: 5mm; padding: 4.5mm; }
.idBox .idLabel { font-size: 8.5px; color: #EAD79B; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
.idBox .idValue { margin-top: 2mm; font-size: 10px; line-height: 1.3; word-break: break-word; }
.qrBox { margin-top: 3mm; display: grid; grid-template-columns: 18mm 1fr; gap: 3mm; align-items: center; }
.qrFake { width: 18mm; height: 18mm; background: repeating-linear-gradient(90deg, #0A1E36 0 1.5mm, #fff 1.5mm 3mm), repeating-linear-gradient(0deg, rgba(10,30,54,.4) 0 1.5mm, transparent 1.5mm 3mm); border: 2px solid #fff; border-radius: 2mm; }
.footer { position: absolute; left: 0; right: 0; bottom: 0; padding: 6mm 11mm 5mm; background: #0A1E36; color: #fff; border-top: 3px solid #C8A34D; }
.footerGrid { display: grid; grid-template-columns: 1.35fr .85fr 1.15fr 1fr; gap: 4mm; font-size: 10px; line-height: 1.38; }
.footerLabel { color: #C8A34D; text-transform: uppercase; letter-spacing: .8px; font-weight: 900; font-size: 8.5px; margin-bottom: 1mm; }
.amenities { margin-top: 3.2mm; padding-top: 3mm; border-top: 1px solid rgba(200,163,77,.42); display: grid; grid-template-columns: repeat(6, 1fr); gap: 2mm; font-size: 9px; text-align: center; color: rgba(255,255,255,.88); }
</style>
</head>
<body>
<div class="page">
  <div class="watermark">BREEZE VILLA MAMAIA NORD</div>

  <header class="header">
    <section class="brandPanel">
      ${logoSvg()}
      <div class="brandTitle">BREEZE VILLA</div>
      <div class="brandLocation">MAMAIA NORD</div>
    </section>

    <section class="titlePanel">
      <div class="kicker">Official Reservation Document</div>
      <h1>BOOKING</h1>
      <h2>CONFIRMATION</h2>
      <div class="stars">★★★★★</div>
      <div class="subtitle">Thank you for choosing Breeze Villa Mamaia Nord</div>
    </section>

    <section class="numberPanel">
      <div class="small">Confirmation No.</div>
      <div class="num">${escapeHtml(confirmationNo)}</div>
    </section>
  </header>

  <div class="rule"></div>
  <div class="stamp">CONFIRMED</div>

  <section class="meta">
    <div class="metaCard"><div class="label">Issue Date</div><div class="value">${escapeHtml(todayDate())}</div></div>
    <div class="metaCard"><div class="label">Reservation By</div><div class="value">${guestName}</div></div>
    <div class="metaCard"><div class="label">Booking Status</div><div class="badge">Partially paid</div></div>
  </section>

  <main class="main">
    <div>
      <section class="card">
        <div class="sectionTitle">${iconSvg("guest")} Guest Information</div>
        <div class="label">Guest Name</div>
        <div class="big">${guestName}</div>
        <div class="contactRows">
          <div class="contactRow"><span class="contactIcon">T</span>${guestPhone}</div>
          <div class="contactRow"><span class="contactIcon">E</span>${guestEmail}</div>
        </div>
      </section>

      <section class="card">
        <div class="sectionTitle">${iconSvg("calendar")} Stay Details</div>
        <div class="stayGrid">
          <div><div class="label">Check-in</div><div class="dateValue">${checkIn}</div></div>
          <div class="arrow">→</div>
          <div><div class="label">Check-out</div><div class="dateValue">${checkOut}</div></div>
        </div>
        <div class="nightsLine"><div class="nights">${nights} nights</div><div class="muted">${adults} adulți • ${children} copii</div></div>
      </section>

      <section class="card">
        <div class="sectionTitle">${iconSvg("home")} Accommodation</div>
        <div class="big" style="font-size:18px">${apartment}</div>
        <div class="tags"><span class="tag">Kids friendly</span><span class="tag">Pool</span><span class="tag">Private terrace</span></div>
      </section>
    </div>

    <div>
      <section class="paymentCard">
        <div class="paymentHead"><div class="paymentHeadTitle">Payment Summary</div><div class="totalAmount">${total} RON</div></div>
        <div class="payLine"><span>Total reservation value</span><strong>${total} RON</strong></div>
        <div class="payLine"><span>Amount paid</span><strong>Avans confirmat</strong></div>
        <div class="payLine"><span>Outstanding balance</span><strong>Rest la check-in</strong></div>
        <div class="statusBox"><div class="label">Payment Status</div><strong>PARTIALLY PAID</strong><div class="depositPill">✓ Deposit received</div></div>
      </section>

      <section class="card" style="margin-top:4.3mm">
        <div class="sectionTitle">${iconSvg("check")} Important Information</div>
        <div class="infoGrid">
          <div class="infoItem"><div class="infoItemTitle">${iconSvg("clock")} Check-in</div><div class="infoItemText">după ora 15:00</div></div>
          <div class="infoItem"><div class="infoItemTitle">${iconSvg("clock")} Check-out</div><div class="infoItemText">până la ora 10:00</div></div>
          <div class="infoItem"><div class="infoItemTitle">${iconSvg("card")} Payment</div><div class="infoItemText">Restul de plată se achită la sosire.</div></div>
          <div class="infoItem"><div class="infoItemTitle">${iconSvg("id")} ID required</div><div class="infoItemText">Vă rugăm să prezentați un act valid.</div></div>
        </div>
      </section>
    </div>
  </main>

  <section class="welcome">
    <div class="card">
      <div class="signature">Welcome to Breeze Villa!</div>
      <div class="muted">Ne bucurăm să confirmăm rezervarea dumneavoastră și vă așteptăm cu drag la Breeze Villa Mamaia Nord. Vă dorim un sejur relaxant la malul Mării Negre.</div>
    </div>
    <div class="idBox">
      <div class="idLabel">Reservation ID</div>
      <div class="idValue">${reservationId}</div>
      <div class="qrBox"><div class="qrFake"></div><div class="muted" style="color:rgba(255,255,255,.78)">Scan for location & contact details</div></div>
    </div>
  </section>

  <footer class="footer">
    <div class="footerGrid">
      <div><div class="footerLabel">Location</div>Mamaia Sat, Strada C2, nr. 37<br/>Mamaia Nord, Constanța</div>
      <div><div class="footerLabel">Phone</div>0723 253 405</div>
      <div><div class="footerLabel">Email</div>dragosht@yahoo.com</div>
      <div><div class="footerLabel">Administrator</div>Toanchina Dragos</div>
    </div>
    <div class="amenities"><div>Kids Friendly</div><div>Outdoor Pool</div><div>BBQ Area</div><div>Spacious Terraces</div><div>Free Parking</div><div>Free Wi-Fi</div></div>
  </footer>
</div>
</body>
</html>`;
}
