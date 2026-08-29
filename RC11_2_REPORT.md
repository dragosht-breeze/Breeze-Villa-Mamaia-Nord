# RC11.2 — AI Context Engine

## Implementat

- Detectare modulară a contextului conversației înainte de fiecare apel AI.
- Contexte disponibile: `UNKNOWN`, `SEARCHING`, `BOOKING`, `HAS_RESERVATION`, `CHECKING_IN`, `IN_STAY`, `SUPPORT`, `LOCAL_GUIDE`.
- Analiză pe ultimele mesaje ale utilizatorului, cu prioritate mai mare pentru mesajul curent.
- Instrucțiuni AI adaptate automat contextului detectat.
- Contextul intern și scorul de încredere nu sunt afișate clientului.
- Verificarea live a disponibilității, endpoint-urile, Messenger și interfața AI au rămas nemodificate.

## Fișiere noi

- `src/lib/ai/context/context-types.ts`
- `src/lib/ai/context/context-detector.ts`
- `src/lib/ai/context/conversation-context.ts`
- `src/lib/ai/context/index.ts`

## Fișier modificat

- `src/lib/ai/gateway/service.ts`

## Testare locală

Oprește serverul, apoi rulează:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run lint
npm run build
npm run dev
```

## Mesaje recomandate pentru verificare

- `Vreau să rezerv pentru 2 adulți și 2 copii.` → SEARCHING/BOOKING
- `Am deja o rezervare pentru mâine.` → HAS_RESERVATION/CHECKING_IN
- `Suntem deja cazați în apartament.` → IN_STAY
- `Nu merge aerul condiționat.` → SUPPORT
- `Unde putem mânca pește bun?` → LOCAL_GUIDE

## Limitare de validare în mediul de lucru

Arhiva sursă nu conține `node_modules`, astfel că `npm run lint` nu a putut fi executat aici (`eslint: not found`). Verificarea finală lint/build trebuie rulată pe calculatorul pe care proiectul are dependențele instalate.
