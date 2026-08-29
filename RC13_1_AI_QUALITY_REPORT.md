# RC13.1 – AI Conversation Quality Suite

## Implementat
- pagină admin nouă: `/admin/ai-quality`
- API intern: `/api/admin/ai-quality`
- 38 teste deterministe, fără apel OpenAI și fără cost suplimentar
- grupuri: Context, Follow-up, Ghid local, Memorie, Vreme, Profil client
- raport vizual cu rată de succes, teste trecute/eșuate și rezultat individual
- buton pentru rerularea testelor

## Fișiere noi
- `src/lib/ai/quality/types.ts`
- `src/lib/ai/quality/runner.ts`
- `src/lib/ai/quality/index.ts`
- `src/app/api/admin/ai-quality/route.ts`
- `src/components/admin/ai-quality/AiQualityDashboard.tsx`
- `src/app/admin/ai-quality/page.tsx`

## Fișier modificat
- `src/components/admin/AdminShell.tsx`

## Validare locală
Rulează:
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run lint
npm run build
npm run dev
```
Apoi deschide `/admin/ai-quality`.
