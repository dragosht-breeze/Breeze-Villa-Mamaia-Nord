# RC11.1 — AI Concierge Knowledge Base

## Implementat

- Bază centrală, tipizată, pentru informațiile Breeze Villa.
- Separarea datelor de proprietate de regulile conversaționale ale AI-ului.
- Ghid local centralizat pentru plajă, cumpărături, farmacie, restaurante și activități.
- Politici centralizate pentru check-in/check-out, plăți și anulări.
- Reguli explicite pentru informațiile care necesită confirmarea proprietății.
- Compatibilitate păstrată cu importul existent din `src/lib/ai/knowledge.ts`.
- RC10 (disponibilitate live și Messenger) nu a fost modificat.

## Fișiere noi

- `src/lib/ai/concierge-types.ts`
- `src/lib/ai/breeze-knowledge-base.ts`
- `src/lib/ai/concierge-system-prompt.ts`

## Fișiere reorganizate

- `src/lib/ai/knowledge.ts`
- `src/lib/ai/concierge.ts`

## Testare recomandată

1. `npm install`
2. `npm run lint`
3. `npm run build`
4. Teste AI:
   - „La ce oră este check-in?”
   - „Putem veni la ora 12?”
   - „Unde putem mânca pește?”
   - „Unde este farmacia?”
   - „Ce putem face cu copiii?”
   - o verificare live de disponibilitate, pentru regresia RC10.

## Observație

În mediul de lucru automat, instalarea dependențelor a fost blocată de indisponibilitatea pachetului `zod-validation-error@4.0.2` în registrul npm intern. Din acest motiv, lint/build trebuie rulate local.
