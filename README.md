# OK Store

Website foundation voor **OK Store**, klaar voor lokale development en deploy via **Cloudflare Workers** (met static assets / Pages-workflow) en **GitHub**.

## Stack

- React + TypeScript + Vite
- Cloudflare Workers (`worker/`) + static assets (SPA)
- Wrangler voor local preview & deploy

## Lokaal starten

```bash
npm install
npm run dev
```

Open daarna [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Wat het doet |
| --- | --- |
| `npm run dev` | Lokale Vite + Worker development server |
| `npm run build` | Production build |
| `npm run preview` | Build + lokale Cloudflare preview |
| `npm run deploy` | Build + deploy naar Cloudflare Workers |

## Projectstructuur

- `src/` — React frontend
- `worker/` — Cloudflare Worker API (`/api/health`)
- `public/assets/` — bestaande merkimages / productbeelden
- `wrangler.jsonc` — Cloudflare config

## GitHub + Cloudflare

1. Maak een GitHub repo aan en push deze map.
2. Koppel de repo in het Cloudflare dashboard (Workers/Pages).
3. Build command: `npm run build`
4. Of deploy handmatig met `npx wrangler login` en daarna `npm run deploy`.
