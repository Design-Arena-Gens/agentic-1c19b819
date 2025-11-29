# Agentic Geo-SEO Review Generator

Full-featured Next.js application that turns any e-commerce product link into a Google Discover-ready review article. The tool orchestrates ChatGPT for narrative structure, scrapes product intel automatically, runs bilingual spell-check, injects affiliate monetization, and (optionally) requests imagery from the Nano Banana generator. Built for effortless deployment on Vercel.

## Features
- **Product intelligence**: Scrapes title, description, specs, pricing clues, and imagery from the source URL with Cheerio.
- **ChatGPT article drafting**: Structured JSON generation with configurable tone, persona, keywords, and minimum length. Default model can be overridden via `OPENAI_MODEL`.
- **Spell checker**: Uses `nspell` dictionaries (Portuguese + English) to automatically correct the AI output while keeping fluency.
- **Geo + SEO focus**: Injects keyword and region requirements, surfaces a checklist highlighting localization cues.
- **Affiliate automation**: Supports Amazon, Mercado Livre, Shopee, Magalu, Clickbank, Hotmart, Eduzz, Kiwify, and Braip with per-network base URLs and tracking tags.
- **Nano Banana integration**: Generates bespoke prompts for section imagery and calls the Nano Banana API when credentials are present.
- **Copy-ready output**: Instant Markdown export plus structured preview blocks for article sections, FAQs, CTAs, and affiliate placements.

## Configuration
Set the following environment variables before running the app:

```bash
OPENAI_API_KEY=sk-...
# Optional overrides
OPENAI_MODEL=gpt-4o-mini
NANO_BANANA_API_KEY=nb-...
NANO_BANANA_API_URL=https://api.nanobanana.ai/v1/generate
```

> The Nano Banana configuration is optional. When no API key is present the UI still renders prompts but skips remote image calls.

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to use the interface. The development server hot-reloads changes to both the UI and API routes.

## Production Build

```bash
npm run build
npm run start
```

## Deployment

Ready for zero-config deployment on Vercel. After building locally, deploy with:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-1c19b819
```

Once live, verify propagation:

```bash
curl https://agentic-1c19b819.vercel.app
```

If verification fails, retry the curl command up to three times with a brief delay to account for DNS warm-up.

## Tech Stack
- Next.js App Router + React Server Components
- TypeScript, Tailwind CSS
- OpenAI SDK, Cheerio, Zod, nspell, p-limit

## Project Structure
```
src/
  app/
    api/generate/route.ts   # Article generation endpoint
    layout.tsx              # Global metadata + fonts
    page.tsx                # Main UI
  lib/
    nano-banana.ts          # Nano Banana client wrapper
    openai.ts               # OpenAI client helper
    product-scraper.ts      # Web scraping utilities
    spellcheck.ts           # Spell checking helpers
    types.ts                # Shared types
  types.d.ts               # Module shims for dictionary packages
```

## Notes
- Crawling policies vary between merchants—ensure you have rights to reuse the scraped content and respect robots directives.
- Google Discover favors high-quality original imagery; keep the Nano Banana prompts specific and use generated renders judiciously.
- Supplement the automatic spell corrections with manual QA when publishing in additional languages.
