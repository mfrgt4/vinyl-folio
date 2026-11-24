# Vinyl Folio
Local : `npm install && npm run dev` → http://localhost:5173
Vercel : push sur GitHub → vercel.com/new → importer (preset Vite détecté ; vercel.json gère le routing SPA). Ou `npx vercel --prod`.
Données : src/data.ts. Persistance : localStorage (clés vf-songs, vf-threads).
