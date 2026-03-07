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
  index.html           Single-page app shell
  css/style.css        All styles, theme variables, card layout
  js/app.js            Client logic: shuffle, infinite scroll, settings, read counter
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
