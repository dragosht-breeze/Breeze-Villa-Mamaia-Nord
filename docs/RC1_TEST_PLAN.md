# RC1 — Plan de testare

## Build

1. `npm ci`
2. `npm run build`
3. `npm run lint`

## Rezervare

1. creare rezervare cu avans card bancar;
2. creare rezervare cu plată integrală;
3. card de vacanță integral prin link;
4. card de vacanță parțial prin link;
5. verificarea soldului și a avansului minim;
6. confirmarea rezervării după încasarea avansului.

## Admin

1. rezervarea apare în Dashboard;
2. rezervarea apare pe intervalul corect în Calendar;
3. Reservation Drawer afișează financiarul și solicitările;
4. înregistrarea unei plăți actualizează toate modulele;
5. Financial Center recalculează soldul;
6. actualizarea live funcționează între două file.

## Regresie

1. site-ul public se afișează cu Navbar și Footer;
2. Admin folosește layout-ul dedicat;
3. calendarul lunar încape pe ecran;
4. filtrele Calendarului funcționează;
5. exportul CSV financiar funcționează.
