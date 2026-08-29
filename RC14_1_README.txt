RC14.1 — Production Preflight / Launch Readiness

ADAUGĂ:
- src/lib/launch-readiness/types.ts
- src/lib/launch-readiness/service.ts
- src/lib/launch-readiness/index.ts
- src/app/api/admin/launch-readiness/route.ts
- src/app/admin/launch-readiness/page.tsx
- src/components/admin/launch-readiness/LaunchReadinessDashboard.tsx

ÎNLOCUIEȘTE:
- src/components/admin/AdminShell.tsx
- src/lib/auth/users.ts
- .env.example

După copiere:
1. npm run build
2. npm run dev
3. Deschide http://localhost:3000/admin/launch-readiness

Observație:
- Verificarea NU afișează chei sau parole.
- În development este normal să apară blocaje pentru variabilele de producție care nu sunt încă setate.
- WhatsApp poate rămâne warning cât timp nu există încă numărul dedicat.
