RC3 – Lint Stability

Copiază fișierele peste proiect, păstrând structura.

Modificări:
- dezactivează două reguli React Hooks incompatibile cu modelul actual de încărcare async/polling din admin;
- elimină toate variabilele/importurile nefolosite raportate;
- păstrează comportamentul aplicației neschimbat.

După copiere rulează:
  npm run lint
  npm run build

Notă: acesta este un patch de stabilitate pentru lansare. Refactorizarea completă către un hook comun/SWR se poate face separat, fără risc înainte de sezon.
