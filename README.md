# Korea Secret

Storefront for **Korea Secret**, a Korean cosmetics shop in Dushanbe, Tajikistan: landing page, catalogue with filters and product pages — plus an **admin panel at `/admin`** that controls all of it. The interface is in Russian; prices are in Tajik somoni (смн).

Built with **Next.js 16 (App Router) + React 19 + TypeScript**, run and built with **Bun**. The site is a static export, so the same build is served by Docker and by GitHub Pages. Carousels use [Embla](https://www.embla-carousel.com/); the header, the phone tab bar and the other see-through controls use a slimmed-down React Bits [GlassSurface](https://reactbits.dev/components/glass-surface) (`src/components/ui/GlassSurface.tsx`, MIT + Commons Clause — its licence sits next to it): every glass surface is frosted (backdrop blur), on desktop and phone alike; `refract` turns on a one-pass SVG lens for desktop Chromium if you ever want it back.

## Scripts

```bash
bun install          # dependencies
bun run dev          # dev server on http://localhost:3000 (admin: /admin)
bun run build        # static export to out/
bun run start        # serve out/ with the Bun server (server.ts)
bun run typecheck    # TypeScript
```

## Admin panel (`/admin`)

Everything the site shows lives in **one JSON document, `content/site.json`**: products, brands, categories, banners, home page blocks, menus, texts, settings, the brand colour. The storefront renders it; the admin panel edits it and publishes it back to this repository.

**How publishing works on GitHub Pages (no server needed)**

1. Every edit goes into a **draft** saved in the browser (IndexedDB) — with undo/redo (⌘Z / ⌘⇧Z), a change list and content checks.
2. **Предпросмотр** opens the real site with the draft (`?preview=1`); open preview tabs and the previews inside the panel update live as you type.
3. **Опубликовать** makes one commit through the GitHub API: `content/site.json` plus any new pictures (resized to WebP in the browser) under `public/uploads/`.
4. The push triggers `.github/workflows/deploy.yml`; the panel follows the GitHub Actions run step by step until the site is live (1–2 minutes).
5. **Публикация** lists every published version — compare any of them with the draft or load it back (rollback), and download or restore JSON backups.

**One-time setup**

- Repository → Settings → Pages → Source: **GitHub Actions** (the workflow already exists).
- Create a [fine-grained token](https://github.com/settings/personal-access-tokens/new): *Only select repositories* → this repository; permissions **Contents: Read and write** and **Actions: Read-only**. Paste it on the panel's sign-in page (`https://<user>.github.io/<repo>/admin/`). It is stored only in that browser (or only for the tab, if «Запомнить» is off).
- Without a token the panel opens in **demo mode**: everything works, changes stay in the browser and can be downloaded as JSON and committed by hand.

The workflow passes `NEXT_PUBLIC_GITHUB_REPO` / `NEXT_PUBLIC_GITHUB_BRANCH` to the build, so the panel knows where to publish; the sign-in page lets you change both.

**What the panel covers**

| Area | Pages |
| --- | --- |
| Обзор | dashboard (KPIs vs. the previous period, revenue trend, top products, stock alerts, content checks, deploy status), orders (statuses, notes, invoices), customers (segments, lifetime value), analytics (sales, products with ABC analysis, customers, geography, weekday × hour heatmap), reports (12 reports → Excel, CSV, JSON, PDF) |
| Каталог | products (inline price/stock edits, bulk price changes, tags, visibility, Excel/CSV import and export, a full editor with photos, drawn packshot, variants, SEO preview), brands, categories & types (the mega menu), ingredients, dictionaries (skin types, concerns, offers), reviews |
| Витрина | home page builder (blocks, order, visibility, settings, live preview of the real site), banners, promos and the promo bar, stories, collections, bloggers, journal (markdown), stores (address search and OpenStreetMap map rendering), navigation (header, category tiles, footer, mega menu promos, search hints), texts & SEO |
| Система | shop settings (delivery thresholds, promo code tiers, contacts, cities, socials), appearance (brand colour with contrast check), media library, publishing & versions |

**Orders.** The shop has no order back end yet: checkouts on the storefront are kept in the visitor's browser (`localStorage`) and show up in the panel opened in the same browser, next to an optional **demo order history** (deterministic, built from the catalogue) that feeds the dashboards. Order data is never committed to the repository. To go live, replace `recordOrder()` in `src/lib/orders.ts` and `allOrders()` in `src/admin/orders/store.ts` with calls to an order API — the dashboards, reports and exports work unchanged.

## Docker

```bash
docker compose up -d --build            # http://localhost:3100
PORT=8080 docker compose up -d --build  # any other port
```

The Docker image serves the content it was built with; publishing from its `/admin` commits to GitHub — rebuild the image to pick the new content up.

## GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main` (including every publish from the admin panel). It sets the base path (`/koreasecret`) automatically through `actions/configure-pages`. Old `/ru/…` and `/en/…` links are redirected to the same page without the prefix.

## Where things live

| Path | What |
| --- | --- |
| `content/site.json` | **all content** — edited from `/admin` (or by hand) |
| `src/lib/data.ts` | content runtime: loads `site.json`, exposes `PRODUCTS`, `CONFIG`, `HERO_SLIDES`… as live bindings that preview/admin can swap |
| `src/lib/types.ts` | the content model (`SiteContent`) |
| `src/lib/art.ts` | procedural SVG artwork (packshots, icons, scenes) — driven by the content |
| `src/lib/md.ts` | safe light markdown for editable copy (everything is escaped) |
| `src/app/(site)/…` | storefront routes: `/`, `/catalog`, `/product/[id]` |
| `src/app/admin/…` | admin routes (each renders a page from `src/admin/pages/`) |
| `src/admin/state/` | draft store, GitHub client, publishing, change list, checks, references, media |
| `src/admin/ui/` | admin UI kit, pickers, charts, live previews |
| `src/admin/orders/` | orders, demo history, analytics |
| `src/app/globals.css`, `src/admin/admin.css` | design system of the site and of the panel |
| `public/stores/` | store photos and the small pre-rendered store maps |
| `public/uploads/` | pictures uploaded from the admin panel |

## Content notes

- **Banner ink** (text, grid lines, progress pill, header over the banner) is derived from each slide's background colours; set the text colour on a banner to force it.
- **Glass ink**: glass elements read what's behind them; dark sections opt in with `data-surface="dark"` so the header and tab bar switch to white ink over them.
- **Placeholders**: products, prices, reviews, phone, store addresses and the bloggers (fictional, with the default no-photo avatar) are sample content — replace them in the admin panel.
- **Store photos** are illustrative Wikimedia Commons images (credits are editable under Магазины → Авторы фото); swap in photos of the real shops. The store maps are static excerpts of the standard OpenStreetMap tiles, © OpenStreetMap contributors; the admin panel renders a new one from a store's coordinates.
