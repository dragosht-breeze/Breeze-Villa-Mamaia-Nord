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
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function todayDate() {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function shortConfirmationNumber(id: string) {
  return id.match(/(\d{4})$/)?.[1] ?? "0000";
}

export function createBookingConfirmationHtml(reservation: ReservationRequest) {
  return `
<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8" />
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, sans-serif; color: #071B2D; }
.page { width: 210mm; height: 297mm; padding: 12mm; background: #fffdf8; position: relative; }
.header { display: grid; grid-template-columns: 1fr 1.4fr 0.55fr; gap: 8mm; align-items: center; border-bottom: 2px solid #C89B3C; padding-bottom: 8mm; }
.brand { text-align: center; border: 2px solid #C89B3C; border-radius: 18px; padding: 7mm; background: white; }
.logo { font-family: Georgia, serif; font-size: 34px; font-weight: bold; }
.brand-name { font-family: Georgia, serif; font-size: 23px; letter-spacing: 3px; font-weight: bold; }
.gold { color: #C89B3C; }
.title { text-align: center; font-family: Georgia, serif; }
.title h1 { font-size: 42px; margin: 0; letter-spacing: 3px; }
.title h2 { font-size: 27px; margin: 0; color: #C89B3C; }
.confirm { background: #071B2D; color: white; text-align: center; padding: 6mm 2mm; border: 2px solid #C89B3C; border-radius: 0 0 16px 16px; }
.confirm strong { display: block; font-family: Georgia, serif; font-size: 32px; margin-top: 3mm; }
.stamp { position: absolute; top: 48mm; right: 18mm; border: 4px solid #C89B3C; color: #C89B3C; border-radius: 50%; width: 40mm; height: 40mm; display:flex; align-items:center; justify-content:center; transform: rotate(-14deg); font-weight: 900; font-size: 16px; }
.meta { margin-top: 9mm; display:grid; grid-template-columns:1fr 1.5fr 1fr; gap:5mm; background:white; border:1px solid #E5C985; border-radius:14px; padding:5mm; }
.label { font-size:10px; text-transform:uppercase; color:#C89B3C; font-weight:900; letter-spacing:1px; }
.value { font-family: Georgia, serif; font-size:18px; font-weight:800; margin-top:2mm; }
.grid { margin-top: 7mm; display:grid; grid-template-columns: 0.95fr 1.05fr; gap:7mm; }
.card { background:white; border:1px solid #E5C985; border-radius:14px; padding:6mm; box-shadow:0 8px 22px rgba(7,27,45,.08); }
.section { display:inline-block; background:#071B2D; color:white; padding:3mm 5mm; border-radius:8px; font-weight:900; margin-bottom:5mm; }
.big { font-family:Georgia,serif; font-size:23px; font-weight:800; }
.muted { color:#4b5563; font-size:12px; line-height:1.5; }
.stay { display:grid; grid-template-columns:1fr 14mm 1fr; text-align:center; align-items:center; }
.date { font-family:Georgia,serif; font-size:20px; font-weight:800; }
.arrow { color:#C89B3C; font-size:28px; font-weight:900; }
.payment { background:#071B2D; color:white; border-radius:14px; padding:6mm; }
.payline { display:flex; justify-content:space-between; border-bottom:1px dashed #C89B3C; padding:4mm 0; font-size:13px; }
.payline strong { font-family:Georgia,serif; font-size:20px; }
.status { margin-top:6mm; background:white; color:#071B2D; border:1px solid #C89B3C; border-radius:10px; padding:5mm; }
.status strong { font-family:Georgia,serif; font-size:24px; }
.footer { position:absolute; left:0; right:0; bottom:0; background:#071B2D; color:white; padding:7mm 12mm; border-top:3px solid #C89B3C; }
.footer-grid { display:grid; grid-template-columns:1.4fr 1fr 1.2fr 1fr; gap:5mm; font-size:11px; line-height:1.45; }
.footer-label { color:#C89B3C; font-weight:900; text-transform:uppercase; margin-bottom:1mm; }
.amenities { margin-top:4mm; border-top:1px solid rgba(200,155,60,.45); padding-top:4mm; display:grid; grid-template-columns:repeat(6,1fr); gap:2mm; font-size:10px; text-align:center; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      <div class="logo">BV</div>
      <div class="brand-name">BREEZE VILLA</div>
      <div class="gold">MAMAIA NORD</div>
    </div>
    <div class="title">
      <h1>BOOKING</h1>
      <h2>CONFIRMATION</h2>
      <div class="gold" style="margin-top:4mm; letter-spacing:4px;">★★★★★</div>
      <div style="margin-top:3mm; font-style:italic;">Thank you for choosing<br/>Breeze Villa Mamaia Nord</div>
    </div>
    <div class="confirm">
      <small>CONFIRMATION NO.</small>
      <strong>${escapeHtml(shortConfirmationNumber(reservation.id))}</strong>
    </div>
  </div>

  <div class="stamp">CONFIRMED</div>

  <div class="meta">
    <div><div class="label">Issue Date</div><div class="value">${escapeHtml(todayDate())}</div></div>
    <div><div class="label">Reservation By</div><div class="value">${escapeHtml(reservation.guest.name)}</div></div>
    <div><div class="label">Booking Status</div><div class="value">PARTIALLY PAID</div></div>
  </div>

  <div class="grid">
    <div>
      <div class="card">
        <div class="section">GUEST INFORMATION</div>
        <div class="label">Guest Name</div>
        <div class="big">${escapeHtml(reservation.guest.name)}</div>
        <div class="muted" style="margin-top:3mm;">${escapeHtml(reservation.guest.phone)}<br/>${escapeHtml(reservation.guest.email)}</div>
      </div>

      <div class="card" style="margin-top:6mm;">
        <div class="section">STAY DETAILS</div>
        <div class="stay">
          <div><div class="label">Check-in</div><div class="date">${escapeHtml(formatDate(reservation.checkIn))}</div></div>
          <div class="arrow">→</div>
          <div><div class="label">Check-out</div><div class="date">${escapeHtml(formatDate(reservation.checkOut))}</div></div>
        </div>
        <div class="big" style="margin-top:5mm;">${escapeHtml(reservation.nights)} NIGHTS</div>
        <div class="muted">${escapeHtml(reservation.adults)} adulți • ${escapeHtml(reservation.children)} copii</div>
      </div>

      <div class="card" style="margin-top:6mm;">
        <div class="section">ACCOMMODATION</div>
        <div class="big" style="font-size:18px;">• ${escapeHtml(reservation.apartmentTitle)}</div>
      </div>
    </div>

    <div>
      <div class="payment">
        <div style="font-size:18px; font-weight:900;">PAYMENT SUMMARY</div>
        <div class="payline"><span>Total reservation value</span><strong>${escapeHtml(reservation.total)} RON</strong></div>
        <div class="payline"><span>Amount paid</span><strong>Avans confirmat</strong></div>
        <div class="payline"><span>Outstanding balance</span><strong>Rest la check-in</strong></div>
        <div class="status"><div class="label">Payment Status</div><strong>PARTIALLY PAID</strong></div>
      </div>

      <div class="card" style="margin-top:6mm;">
        <div class="section">IMPORTANT INFORMATION</div>
        <div class="muted">
          ✓ Check-in după ora 15:00.<br/>
          ✓ Check-out până la ora 11:00.<br/>
          ✓ Restul de plată se achită la sosire.<br/>
          ✓ Vă rugăm să prezentați un act de identitate valid.<br/>
          ✓ Rezervarea este confirmată după înregistrarea avansului.
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:7mm;">
    <div class="big gold" style="font-style:italic;">Welcome to Breeze Villa!</div>
    <div class="muted" style="margin-top:2mm;">
      Ne bucurăm să confirmăm rezervarea dumneavoastră și vă așteptăm cu drag la Breeze Villa Mamaia Nord.<br/>
      Reservation ID: <strong>${escapeHtml(reservation.id)}</strong>
    </div>
  </div>

  <div class="footer">
    <div class="footer-grid">
      <div><div class="footer-label">Location</div>Mamaia Sat, Strada C2, nr. 37<br/>Mamaia Nord, Constanța</div>
      <div><div class="footer-label">Phone</div>0723 253 405</div>
      <div><div class="footer-label">Email</div>dragosht@yahoo.com</div>
      <div><div class="footer-label">Administrator</div>Toanchina Dragos</div>
    </div>
    <div class="amenities">
      <div>Kids Friendly</div><div>Outdoor Pool</div><div>BBQ Area</div><div>Spacious Terraces</div><div>Free Parking</div><div>Free Wi-Fi</div>
    </div>
  </div>
</div>
</body>
</html>`;
}