RC6.3 – Recepționer AI cu disponibilitate și prețuri live

Copiază toate fișierele peste proiect, păstrând structura:

- src/lib/ai/availability-tool.ts
- src/app/api/ai/receptionist/route.ts
- src/components/ai/AIReceptionist.tsx

Nu schimba cheia OpenAI și nu modifica .env.local.

După copiere:
1. Ctrl+C
2. npm run lint
3. npm run build
4. npm run dev

TEST RECOMANDAT
Scrie în chatbot:
„Aveți disponibilitate între 15 și 19 august 2026 pentru 2 adulți și 2 copii de 5 și 8 ani?”

Comportamentul corect:
- AI-ul apelează motorul real de rezervări;
- răspunde numai cu variante confirmate de motor;
- afișează un card cu recomandarea principală și totalul sejurului;
- oferă acces către pagina de rezervare.

NOTĂ
În această versiune, butonul „Vezi opțiunile” deschide pagina /rezervare.
Prefill-ul automat al perioadei în formular va fi implementat separat.
