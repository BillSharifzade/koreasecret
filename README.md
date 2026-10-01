# Korea Secret

Storefront for **Korea Secret**, a Korean cosmetics shop in Dushanbe, Tajikistan: landing page, catalogue with filters and product pages. The interface is in Russian; prices are in Tajik somoni (смн).

Built with **Next.js 16 (App Router) + React 19 + TypeScript**, run and built with **Bun**. The site is a static export, so the same build is served by Docker and by GitHub Pages. Carousels use [Embla](https://www.embla-carousel.com/); the header, the phone tab bar and the other see-through controls use React Bits' [GlassSurface](https://reactbits.dev/components/glass-surface) (`src/components/ui/GlassSurface.tsx`, MIT + Commons Clause — its licence sits next to it).

## Scripts

```bash
bun install          # dependencies
bun run dev          # dev server on http://localhost:3000
bun run build        # static export to out/
bun run start        # serve out/ with the Bun server (server.ts)
bun run typecheck    # TypeScript
```

## Docker

```bash
docker compose up -d --build            # http://localhost:3100
PORT=8080 docker compose up -d --build  # any other port
```

## GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. It sets the base path (`/koreasecret`) automatically through `actions/configure-pages`. Old `/ru/…` and `/en/…` links are redirected to the same page without the prefix.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/data.ts` | products, prices, shop settings (`CONFIG`), promo bar (`PROMO_BAR`), banners, bloggers, collections, stores |
| `src/lib/art.ts` | procedural SVG artwork (packshots, icons, scenes, blogger portraits) |
| `src/app/globals.css` | design system |
| `src/app/…` | routes: `/`, `/catalog`, `/product/[id]` |
| `src/components/…` | header, search, menus, cart, sliders, catalogue, product page |
| `public/stores/` | store photos and the small pre-rendered store maps |

## Content notes

- **Promo bar** above the header is switched off: set `PROMO_BAR.enabled` in `src/lib/data.ts` (meant to be driven by the admin panel later).
- **Banner ink** (text, grid lines, progress pill, header over the banner) is derived from each slide's background colours; set `tone: 'light' | 'dark'` on a slide to force it.
- **Glass ink**: glass elements read what's behind them; dark sections opt in with `data-surface="dark"` so the header and tab bar switch to white ink over them.
- **Placeholders**: products, prices, reviews, phone, store addresses and the bloggers (fictional, shown as silhouettes) are sample content. Replace them in `src/lib/data.ts`.
- **Store photos** are illustrative Wikimedia Commons images (credits are listed under the stores section and in `PHOTO_CREDITS`); swap in photos of the real shops. The store maps (`public/stores/map-<store id>.webp`) are static excerpts of the standard OpenStreetMap tiles, © OpenStreetMap contributors; replace a map image when its address changes.
