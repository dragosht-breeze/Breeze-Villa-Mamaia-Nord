# v0.9.0-beta.2 — Prisma & PostgreSQL Foundation

Această versiune introduce schema relațională și Prisma Client, fără să schimbe încă sursa activă de date a aplicației. Modulele existente continuă să citească și să scrie în JSON până la sprintul de migrare.

## Modele introduse

- `Apartment`
- `Customer`
- `Reservation`
- `ReservationApartment`
- `Payment`
- `RateRule`

Schema include relații, indexuri, constrângeri unice, valori monetare `Decimal` și date calendaristice PostgreSQL `DATE`.

## Pregătire PostgreSQL local

1. Instalează PostgreSQL 15 sau mai nou.
2. Creează o bază de date, de exemplu `breeze_os`.
3. Adaugă în `.env.local`:

```env
DATABASE_URL="postgresql://postgres:PAROLA@localhost:5432/breeze_os?schema=public"
BREEZE_DATA_PROVIDER=json
```

4. Rulează:

```bash
npm install
npm run db:validate
npm run db:generate
npm run db:migrate -- --name initial_foundation
```

## Comenzi utile

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:studio
```

## Siguranța datelor

Nu șterge folderul `storage/`. În această etapă el rămâne sursa activă. Migrarea JSON → PostgreSQL va fi livrată separat, cu verificări de integritate și posibilitate de revenire.
