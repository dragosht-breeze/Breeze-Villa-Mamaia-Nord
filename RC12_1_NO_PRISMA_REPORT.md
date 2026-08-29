# RC12.1 Hotfix – analytics fără Prisma

## Modificare

`src/lib/analytics/storage.ts` folosește acum stocare locală append-only în:

`storage/analytics-events.ndjson`

## Nu mai este necesar

- `DATABASE_URL`
- `npx prisma generate`
- `npm run db:deploy`
- o bază PostgreSQL

## Compatibilitate

Event Bus-ul și `AnalyticsService` rămân neschimbate. O eroare de scriere a statisticilor este izolată și nu poate opri conversația AI.

## Verificare

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

După o conversație cu AI, fișierul `storage/analytics-events.ndjson` este creat automat.
