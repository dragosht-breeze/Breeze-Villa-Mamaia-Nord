# Breeze OS v0.9.1 — Authentication & Roles

- Login securizat cu sesiune HTTP-only semnată HMAC.
- Logout și protecție pentru `/admin` și `/api/admin`.
- Roluri: Administrator, Manager, Recepție, Curățenie.
- Meniu administrativ filtrat după rol.
- Administrare utilizatori în `/admin/settings`.
- Parole stocate cu scrypt + salt individual.
- Utilizatori păstrați temporar în `storage/users.json`, pregătiți pentru migrarea Prisma.
- Model Prisma `User` și enum `UserRole`.

## Primul login
- E-mail: `admin@breezevilla.ro`
- Parolă: configurată local prin `BREEZE_ADMIN_PASSWORD`

Înainte de publicarea online, setează `BREEZE_AUTH_SECRET`, `BREEZE_ADMIN_EMAIL` și `BREEZE_ADMIN_PASSWORD` în `.env.local`, apoi șterge `storage/users.json` pentru regenerarea contului inițial.
