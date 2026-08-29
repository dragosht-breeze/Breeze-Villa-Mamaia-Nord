# Breeze OS v0.9.4-hotfix.2 — iOS Hydration Stability

## Corecții

- Dezactivată detectarea automată iOS pentru numere de telefon, date, adrese și e-mailuri prin metadata Next.js `formatDetection`.
- Contactele din footer sunt acum linkuri explicite `tel:` și `mailto:`, astfel încât Safari nu mai rescrie structura HTML înainte de hidratarea React.
- Salutul din Dashboard și Operations Center este calculat determinist din `generatedAt`, în fusul orar `Europe/Bucharest`, nu din ceasul local în timpul randării.
- Versiunea proiectului actualizată la `0.9.4-hotfix.2`.

## Cauza probabilă a erorii de pe iPhone

Safari/iOS poate transforma automat numerele de telefon și adresele de e-mail din text în linkuri. Această modificare are loc înainte ca React să facă hydration, iar structura DOM nu mai corespunde HTML-ului generat pe server. Eroarea nu se reproduce în mod normal pe desktop.
