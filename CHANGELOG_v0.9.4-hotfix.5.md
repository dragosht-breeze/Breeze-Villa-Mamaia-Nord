# Breeze OS v0.9.4-hotfix.5

## Corecție Chrome iOS – Google Maps

- Harta Google Maps din `Location.tsx` este montată doar după hidratarea React.
- Serverul și primul rand al clientului generează acum exact același HTML.
- Atributul injectat de Chrome iOS (`__gcrchildframeremotetoken`) nu mai poate produce hydration mismatch.
- Dimensiunea zonei hărții rămâne stabilă pentru a evita salturile de layout.
