# Breeze Villa — RC2 Security & Privacy Fixes

## Modificări aplicate

1. **Autentificare**
   - aplicația nu mai acceptă secretul implicit în producție;
   - secretul trebuie să aibă minimum 32 de caractere;
   - contul admin inițial necesită variabile explicite în producție;
   - parola admin inițială trebuie să aibă minimum 12 caractere.

2. **Protecția datelor personale**
   - adresa de e-mail, subiectul și răspunsul complet Resend nu mai sunt scrise în log;
   - cererea de rezervare nu mai scrie în consolă numele, telefonul, e-mailul sau mesajul clientului;
   - logurile păstrează doar identificatori și metadate operaționale.

3. **Validarea cererilor**
   - validare mai strictă pentru date, nopți, total și ordinea check-in/check-out;
   - identificatorul cererii folosește `crypto.randomInt`.

4. **Protejarea fișierelor locale**
   - `.env.local` și fișierele JSON operaționale sunt excluse prin `.gitignore`;
   - `.env.example` nu mai conține o parolă reală implicită.

## Acțiuni obligatorii înainte de lansare

- generează un `BREEZE_AUTH_SECRET` unic, de minimum 32 de caractere;
- configurează datele administratorului în mediul de producție;
- schimbă parola oricărui utilizator creat anterior cu parola implicită;
- nu încărca `.env.local` sau folderul `storage` în Git, e-mail ori arhive publice;
- dacă arhiva proiectului a fost distribuită în afara unui mediu controlat, rotește toate cheile din `.env.local`.

## Verificare locală

```bash
npm run lint
npm run build
```

În mediul de audit, `npm ci` nu a putut fi finalizat deoarece registry-ul disponibil nu conținea pachetul tranzitiv `zod-validation-error@4.0.2`. Din acest motiv, build-ul complet trebuie rulat pe calculatorul proiectului.
