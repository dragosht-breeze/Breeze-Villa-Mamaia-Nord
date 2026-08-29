RC6.2 – AI Receptionist conectat la OpenAI

FIȘIERE
- src/lib/ai/knowledge.ts
- src/app/api/ai/receptionist/route.ts
- src/components/ai/AIReceptionist.tsx
- .env.ai.example

INSTALARE
1. Copiază fișierele peste proiect, păstrând structura.
2. Deschide .env.local și adaugă:
   OPENAI_API_KEY=cheia_ta
   OPENAI_MODEL=gpt-5.6-luna
3. Nu folosi prefixul NEXT_PUBLIC_ pentru cheia OpenAI.
4. Repornește serverul:
   Ctrl+C
   npm run dev
5. Rulează:
   npm run lint
   npm run build

CE FACE
- Trimite conversația către un API server-side.
- Cheia OpenAI nu ajunge în browser.
- Folosește Responses API.
- Răspunde pe baza informațiilor Breeze Villa din knowledge.ts.
- Nu confirmă încă disponibilitatea sau tarifele în timp real.
- Are limită de lungime, istoric scurt, timeout și fallback către rezervare/WhatsApp.

IMPORTANT
- Creează cheia API din contul OpenAI Platform și configurează billing/limită de cheltuieli.
- ChatGPT Plus și creditul API sunt servicii de facturare separate.
