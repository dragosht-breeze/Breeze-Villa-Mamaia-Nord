# Breeze OS v0.9.2 — Task Center

## Nou
- Rută nouă `/admin/tasks` și element dedicat în meniul Admin.
- Taskuri automate sincronizate din rezervări pentru check-in, check-out, curățenie, sold restant și mentenanță.
- Taskuri manuale cu titlu, descriere, termen, categorie, prioritate și responsabil.
- Statusuri: Nou, În lucru, Finalizat și Anulat.
- Priorități: Critică, Mare, Normală și Scăzută.
- Filtre după status, categorie și responsabil.
- Indicatori pentru taskuri critice, scadente astăzi, întârziate, în lucru și finalizate.
- API CRUD în `/api/admin/tasks`.
- Persistență JSON atomică în `storage/tasks.json`, compatibilă cu Data Layer existent.
- Model Prisma `Task`, pregătit pentru migrarea ulterioară în PostgreSQL.

## Comportament
Taskurile automate folosesc o cheie unică pe rezervare și categorie. La resincronizare își păstrează statusul și responsabilul, fără a crea duplicate.
