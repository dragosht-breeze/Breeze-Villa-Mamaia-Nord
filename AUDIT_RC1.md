# Breeze Villa — Audit RC1

## Verdict

Proiectul are o bază solidă și o arhitectură surprinzător de matură pentru un produs independent: 177 fișiere în `src`, 65 rute/pagini în `app`, 52 componente și module separate pentru rezervări, CRM, plăți, taskuri, notificări, tarife și sincronizare Booking.

## Probleme critice

### 1. Secrete și credențiale implicite
În producție, aplicația poate porni cu:
- secret de sesiune implicit;
- e-mail admin implicit;
- parolă admin implicită.

Impact: risc sever de acces neautorizat.

Rezolvare inclusă în acest patch:
- în producție, aplicația refuză autentificarea dacă `BREEZE_AUTH_SECRET` lipsește;
- primul admin nu mai poate fi creat în producție fără e-mail și parolă configurate;
- `.env.example` documentează variabilele obligatorii.

### 2. Arhiva conține `.env.local` și date operaționale
Arhiva analizată include `.env.local` și folderul `storage/` cu utilizatori și date de rezervări.

Impact: aceste fișiere nu trebuie trimise mai departe, urcate public sau incluse într-un pachet de distribuție.

Acțiune obligatorie înainte de lansare:
- păstrează `.env.local` doar local și pe server;
- nu distribui `storage/users.json`, rezervări sau alte fișiere operaționale;
- rotește cheia Resend dacă arhiva a fost partajată în afara unui mediu de încredere.

## Probleme importante

### 3. Componente duplicate
Există mai multe implementări pentru aceleași secțiuni:
- `src/components/sections/*`
- `src/features/home/*`
- două componente `Location`;
- două `AdminShell`;
- două `OperationsCenter`.

Homepage-ul importă varianta din `src/components/sections`, deci celelalte par cod vechi sau nefolosit.

Impact: confuzie, modificări făcute în fișierul greșit și mentenanță dificilă.

### 4. `VacationCards.tsx` există, dar nu este folosit
Componenta este prezentă, însă nu apare importată în CTA, Footer, Rezervare sau paginile apartamentelor.

Impact: logo-urile/wordmark-urile nu pot apărea doar prin copierea componentului în proiect.

### 5. Imagini mari
Cele mai mari fișiere:
- `lateral-ziua.png` — aproximativ 2,9 MB;
- `hero-breeze-night.png` — aproximativ 2,2 MB;
- template confirmare — aproximativ 1,5 MB.

Impact: LCP și încărcare mobilă mai slabă.

Recomandare: conversie în WebP/AVIF și redimensionare la dimensiunea reală de afișare.

### 6. Logging excesiv în fluxul de e-mail
`sendEmail.ts` loghează destinatari, subiecte, atașamente și răspunsul Resend.

Impact: date personale în loguri și zgomot în producție.

Recomandare: loguri structurate, fără PII, activate diferențiat după mediu.

## Blocaj de testare automată în mediul de audit

`npm ci` nu a putut fi finalizat deoarece registrul intern de pachete a returnat 404 pentru `zod-validation-error@4.0.2`. Acesta este un blocaj al registry-ului folosit în mediul de audit, nu dovada unei erori în proiect.

Din acest motiv nu pretind că am rulat un build complet aici. Patch-ul livrat modifică doar trei fișiere de autentificare și `.env.example`.

## Prioritatea următoare

1. Aplică patch-ul de securitate.
2. Rulează local `npm run build`.
3. Curăță duplicatele nefolosite.
4. Integrează corect `VacationCards` sau elimină-l până există materiale oficiale aprobate.
5. Optimizează imaginile mari.
