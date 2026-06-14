# GospelScroll

Infinite-scroll Gospel reader at **gospelscroll.app**. Displays passages from all four Gospels (Matthew, Mark, Luke, John) in a calm, card-based feed. Passages are shuffled randomly and load continuously as the user scrolls.

## Tech Stack

- **Backend**: Node.js + Express (server.js)
- **Frontend**: Vanilla HTML/CSS/JS (no framework)
- **Fonts**: Lora (Google Fonts) for passage text, system sans-serif for UI
- **Deployment**: Railway, auto-deploys from GitHub `main` branch
- **Domain**: gospelscroll.app

## Project Structure

```
server.js              Express server, serves static files + JSON data
public/
  index.html           Single-page app shell (includes PWA head tags)
  css/style.css        All styles, theme variables, card layout
  js/app.js            Client logic: shuffle, infinite scroll, settings, read counter, SW registration
  manifest.json        PWA web app manifest (name, icons, colors, standalone display)
  sw.js                Service worker: offline caching of app shell + passages
  icons/               App icons (scroll motif): icon.svg + maskable.svg masters, generated PNGs
data/
  gospels.json         All 443 passages with paragraph breaks (\n\n)
source-text/           Raw WEB-C Gospel chapter files (source material)
Dockerfile             Railway deployment container
```

## Running Locally

```
npm install
npm start
# Opens on http://localhost:3000
```

## Data

Passages come from the **World English Bible (WEB)** public domain translation. Raw chapter text lives in `source-text/`. The processed `data/gospels.json` contains 443 passage objects with fields: `id`, `book`, `chapter`, `startVerse`, `endVerse`, `header`, `text`. Paragraph breaks (`\n\n`) are embedded in the text field at natural reading breakpoints.

## Key Features

- Dark/light theme toggle (persisted in localStorage)
- Five font size options (persisted in localStorage)
- Session read counter (increments as cards scroll into view, resets on refresh)
- Cards show: title → scripture reference → passage text with paragraph spacing
- **PWA**: installable ("Add to Home Screen"), runs standalone, and works fully offline. Plain website behavior at gospelscroll.app is unchanged — PWA features are purely additive.

## PWA / Offline

The service worker (`public/sw.js`) precaches the app shell + all of `data/gospels.json` + icons on install, so the entire feed works offline (e.g. on a plane) after the first online visit. App shell and data use a stale-while-revalidate strategy; Google Fonts are runtime cached. `server.js` sends `Cache-Control: no-cache` for `sw.js` and `manifest.json` so deploys propagate promptly.

**IMPORTANT — when changing `data/gospels.json` or the app shell (HTML/CSS/JS):** bump `CACHE_VERSION` in `public/sw.js` (e.g. `'v1'` → `'v2'`) before pushing, so installed users get a clean update instead of a stale cached copy.

Icons are generated from the SVG masters in `public/icons/` via `sips` (macOS), e.g.:
```
sips -s format png icon.svg --out icon-512.png -Z 512
```
