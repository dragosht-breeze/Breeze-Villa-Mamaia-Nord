RC4 – Optimizare imagini principale

Copiază folderele src și public peste proiect, păstrând structura.

Fișiere actualizate:
- src/components/sections/Hero.tsx
- src/components/sections/WhyFamiliesChooseUs.tsx
- public/images/hero-breeze-night.webp
- public/images/lateral-ziua.webp

Reducere fișiere:
- Hero: 2333852 bytes -> 214374 bytes
- Imagine laterală: 3064840 bytes -> 421556 bytes

După copiere rulează:
npm run lint
npm run build

Fișierele PNG vechi pot rămâne temporar. Componentele noi folosesc WebP.
