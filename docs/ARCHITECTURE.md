# Breeze PMS — Arhitectură RC1

## Sursa de adevăr

`Reservation Folder` este sursa principală pentru:

- datele rezervării;
- situația financiară;
- tranzacții;
- solicitări;
- timeline;
- documente.

## Module

- Booking Engine — căutare, disponibilitate și creare rezervare;
- Reservation Center — dosarul complet al rezervării;
- Dashboard — activitate și priorități;
- Operational Calendar — vizualizare operațională;
- Financial Center — încasări și solduri;
- Live Admin Events — sincronizarea interfețelor deschise.

## Reguli comerciale

Configurația comună este în `src/config/breeze.ts`.

- check-in: 15:00;
- check-out: 09:00–10:00;
- self check-in: după 18:00;
- avans: maximum dintre 30% și o noapte;
- expirare cerere neplătită: 48 ore;
- politica de anulare este păstrată centralizat.

## Regula de migrare

Noile module folosesc configurația și helper-ele comune. Modulele existente sunt migrate incremental numai împreună cu teste de regresie.
