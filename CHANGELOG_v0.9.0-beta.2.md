# Breeze OS v0.9.0-beta.2

## Adăugat

- Prisma ORM 7 și Prisma Client.
- Adaptor PostgreSQL bazat pe `pg`.
- `prisma/schema.prisma` cu modelele operaționale de bază.
- `prisma.config.ts` pentru configurarea CLI și a conexiunii.
- Client Prisma singleton în `src/lib/db/prisma.ts`.
- Scripturi npm pentru validare, generare, migrare, deploy și Prisma Studio.
- Documentație de instalare PostgreSQL.

## Compatibilitate

- Sursa activă de date rămâne JSON în această versiune.
- Nu este necesară migrarea imediată a datelor existente.
- Interfața și fluxurile existente nu sunt schimbate.
