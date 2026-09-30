# Korea Secret

Storefront for **Korea Secret**, a Korean cosmetics brand: landing page, catalogue with filters, and product pages in Russian and English.

Built with **Next.js 16 (App Router) + React 19 + TypeScript**, run and built with **Bun**. The site is a static export, so the same build is served by Docker and by GitHub Pages.

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

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. It sets the base path (`/koreasecret`) automatically through `actions/configure-pages`.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/data.ts` | products, prices, brands, stores, home page content |
| `src/lib/i18n.ts` | RU/EN interface strings |
| `src/lib/art.ts` | procedural SVG artwork (packshots, icons, scenes) |
| `src/app/globals.css` | design system |
| `src/app/[lang]/…` | routes: home, `catalog`, `product/[id]` |
| `src/components/…` | header, menus, cart, catalogue, product page |

All catalogue data (products, prices, reviews, addresses, phone) is placeholder content. Replace it in `src/lib/data.ts`.
