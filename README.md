# Assetlume

> **Educational analysis only. No buying, selling or trading. Not financial advice.**

Assetlume is a learning tool that helps beginners understand the investments they already hold. You type in what you own (for example, 12 shares of a company or 0.5 of a coin), and Assetlume shows what your portfolio is worth, what it cost, how it is spread out and how risky it looks, all explained in plain language.

Assetlume does **not** connect to any broker, exchange or wallet, in any version. It never makes trades and never tells anyone what to buy, sell or hold.

**Status:** early development. The design is described in [`docs/architecture.md`](docs/architecture.md) (Draft v0.3).

> **Demo version.** For now, Assetlume runs as a demo with no login. The market data is real, fetched from live APIs (stock prices, crypto prices and currency rates). Each visitor enters their own holdings through the form in the questionnaire, and the dashboard analyses them with real prices.
>
> **Every visitor gets a private session.** Their questionnaire answers and portfolio belong to their browser only; no other visitor can see them. Data is deleted when they press **End session & delete my data** on the dashboard, or automatically **3 days after their last visit**. Because the session lives in the browser, clearing cookies or switching browser or device starts a new, empty session.
>
> **Planned for later:** each user will have their own private portfolio with their real data, added in two ways:
>
> - **Form:** typing in each holding (asset, quantity, average price paid), as in the demo's portfolio builder, but saved to their own account.
> - **File upload:** uploading a file of their holdings (for example, a CSV made from Assetlume's template), which the app checks and shows for review before saving.
>
> This needs user accounts and login, and stronger privacy protection for personal data. Data only comes in through what the user types or uploads. Assetlume will never link to a broker account and will stay read-only: no buying, selling or trading.

---

## Contents

- [What it does](#what-it-does)
- [What it tracks](#what-it-tracks)
- [Tech stack](#tech-stack)
- [Project layout](#project-layout)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Daily data update](#daily-data-update)
- [Visitor sessions](#visitor-sessions)
- [Dashboard items](#dashboard-items)
- [Swapping data providers](#swapping-data-providers)
- [API](#api)
- [Testing](#testing)
- [Data sources and attribution](#data-sources-and-attribution)
- [Known limits](#known-limits)
- [Roadmap](#roadmap)
- [Security and privacy](#security-and-privacy)

---

## What it does

1. **Questionnaire:** five steps covering personal details, goals, comfort with risk, values and portfolio setup.
2. **Portfolio entry (inside the questionnaire):** in the portfolio setup step, the person enters their own holdings through a form: pick an asset from the 300, then enter the quantity held and the average price paid (in USD). Holdings can be changed later on the Builder page.
3. **Dashboard:** value and change, top holdings, asset allocation, sector exposure, diversification, risk tolerance, portfolio risk (class 1 to 7) and how the two compare, values alignment, environmental and social impact, AI suggestions and a summary. Every item names its data source and the published method it follows (see [Dashboard items](#dashboard-items)). It also has an **End session & delete my data** button.
4. **Plain-language explanations:** optional AI-written summaries of the numbers. The AI never calculates anything. If it is unavailable, the dashboard shows the numbers on their own.
5. **Display currency:** USD, EUR or any currency in the European Central Bank's reference rates (about 30). All maths is done in USD and converted only for display, with each currency's normal number of decimals (for example, none for JPY).

Every number on the dashboard is shown with its date. Old prices are flagged as stale, and missing prices are listed separately, never counted as zero.

## What it tracks

| List | Size | Chosen by | Re-ranked |
|---|---|---|---|
| US stocks (NYSE, NASDAQ, AMEX operating companies) | 150 | Market value | Weekly |
| Cryptocurrencies (stablecoins included and labelled; wrapped, bridged and staked coins excluded) | 150 | Market value | Daily |
| **Total** | **300** | | |

Assets that drop out of the top 150 are marked inactive, never deleted. If someone still holds one, its price keeps updating.

## Tech stack

| Part | Choice | Why |
|---|---|---|
| Language | TypeScript (web, server and shared code) | Decision D12 |
| Web app | React + Vite | Fast to start; the web app only shows results and collects input |
| Server (API) | Node.js + Express | Simple and widely documented |
| Database | PostgreSQL | `NUMERIC` columns store exact decimals (prices up to 10 decimal places) |
| Database access | `pg` (node-postgres) with SQL migrations (`node-pg-migrate`) | Plain SQL; easy to read and explain |
| Shared rules | Zod | One definition of a valid asset or holding, used by web and api (D2) |
| Money maths | `decimal.js` | No floating-point drift (D5) |
| Scheduler | `node-cron` inside the server, with a lock so runs never overlap | One server program (D1) |
| Tests | Vitest | Works with TypeScript and Vite out of the box |
| Workspaces | npm workspaces (`web`, `api`, `shared`) | One project folder (D2) |

**Rule for money values:** numbers come out of PostgreSQL as strings and go straight into `decimal.js`. They are never turned into plain JavaScript numbers. They are rounded only when shown.

## Project layout

```text
assetlume/
├── web/              # the web app the user sees
├── api/              # the server: rules, calculations, daily update
│   ├── migrations/   # the database schema: the only place tables are defined
│   ├── seed/         # starting data (stock candidates, excluded coins, values rules, holidays, impact figures)
│   ├── src/          # server code, split by job
│   └── test/         # tests, including saved provider responses
├── shared/           # rules and formats used by both web and api
├── poc/              # data-provider test scripts and findings.md
├── docs/             # architecture, open questions, calculation method, schema.sql (generated)
└── README.md
```

**Database schema rule:** tables are created and changed only through migrations in `api/migrations/`, run in order. A migration that has been run is never edited; a change is always a new migration. To see the whole schema at once, run `npm run db:schema`, which writes a read-only snapshot to `docs/schema.sql`. That file is generated, never edited by hand.

Inside `api/src`, each folder has one job: `sessions`, `portfolio`, `assets`, `market-data`, `price-history`, `calculations`, `currency`, `values`, `insights` (AI) and `questionnaire`. They are parts of one app, not separate services.

All outside services live in one place, `api/src/providers/`. No other folder imports provider code directly (see [Swapping data providers](#swapping-data-providers)).

```text
api/src/providers/
├── types.ts              # the standard formats and interfaces every provider must follow
├── registry.ts           # picks the provider named in .env
├── stocks/
│   ├── fmp/              # Financial Modeling Prep (today)
│   └── contract.test.ts  # tests every stock provider must pass
├── crypto/
│   ├── coingecko/        # CoinGecko (today)
│   └── contract.test.ts
├── fx/
│   ├── ecb/              # European Central Bank reference rates (today)
│   └── contract.test.ts
└── ai/
    ├── none/             # "AI unavailable" fallback
    └── contract.test.ts
```

Web pages: Welcome, Questionnaire, Builder, Dashboard, Explorer (asset list), Asset detail, Settings.

## Getting started

### Requirements

- Node.js 22 or newer
- PostgreSQL 16 or newer, either installed locally or run with Docker (see below)
- Free API keys for Financial Modeling Prep and CoinGecko

### Start PostgreSQL with Docker (optional)

```bash
docker compose up -d db      # starts PostgreSQL on port 5432
```

### Setup

```bash
git clone <repo-url> assetlume
cd assetlume
npm install                  # installs web, api and shared
cp .env.example .env         # then fill in your keys
npm run db:migrate           # create the database tables
npm run db:seed              # load starting lists
npm run update:history       # one-off download of 5 years of past prices
npm run dev                  # starts the API (port 3000) and the web app (port 5173)
```

Then open http://localhost:5173 and go through the questionnaire. The Vite dev server forwards `/api` requests to the Express server.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start web and api in development mode |
| `npm test` | Run all tests |
| `npm run typecheck` | Check types across all workspaces |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Load starting lists |
| `npm run db:schema` | Write a read-only schema snapshot to `docs/schema.sql` |
| `npm run update:daily` | Run the daily update now, by hand |
| `npm run update:history` | One-off download of past prices |

## Configuration

All settings live in `.env` on the server. Keys are **never** sent to the web app.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection, e.g. `postgres://assetlume:assetlume@localhost:5432/assetlume` |
| `PORT` | API server port (default `3000`) |
| `STOCK_PROVIDER` | Which stock adapter to use (default `fmp`) |
| `CRYPTO_PROVIDER` | Which crypto adapter to use (default `coingecko`) |
| `FX_PROVIDER` | Which exchange-rate adapter to use (default `ecb`) |
| `AI_PROVIDER` | Which AI adapter to use (default `none`) |
| `FMP_API_KEY` | Financial Modeling Prep (stocks) |
| `COINGECKO_API_KEY` | CoinGecko (crypto) |
| `AI_API_KEY` | AI provider key (optional; app works without it) |
| `AI_DAILY_CALL_CAP` | Maximum AI calls per day, for the whole app |
| `AI_SESSION_CALL_CAP` | Maximum AI calls per session per day |
| `SESSION_MAX_IDLE_DAYS` | Days after the last visit before a session's data is deleted (default `3`) |
| `NEW_SESSIONS_PER_HOUR` | Limit on new sessions from one network address, to stop abuse |
| `UPDATE_TIME` | When the daily update runs (after the US market close) |

The server checks these at start-up and refuses to run if a required one is missing.

## Daily data update

Runs once a day in the background. The dashboard only reads stored data, so it still works when a provider is down.

1. Crypto prices for the 150 coins (one request).
2. Stock prices for the 150 stocks (trading days only; skips weekends and US market holidays).
3. ECB exchange rates.
4. Clean-up: delete every session (with its answers, holdings and saved AI text) not visited for 3 days.
5. A log entry: **succeeded**, **partial** or **failed**.

The clean-up also runs every hour, so data is never kept much longer than 3 days even if the price update fails.

Rate limits are retried up to 3 times. If a provider's daily limit runs out, the job stops calling it until the next day. Running the same day twice overwrites that day; it never creates duplicates. If the computer was off, the update catches up when the app next starts.

Stock list re-ranking runs weekly. The crypto list is re-ranked as part of the daily update.

## Visitor sessions

Assetlume has no login, but each visitor's data is private.

1. On the first visit, the server creates a long random session ID and sends it in a cookie that page scripts cannot read (`HttpOnly`, `Secure`, `SameSite=Lax`).
2. The database stores only a hashed version of the ID. The portfolio, questionnaire answers, holdings and saved AI text all belong to one session.
3. Every request finds the portfolio through the cookie. No portfolio ID ever appears in a web address, so nobody can reach another visitor's data by changing a link.
4. Each visit updates the session's "last seen" time.
5. Data is deleted in one of two ways:
   - **By the visitor:** the **End session & delete my data** button on the dashboard (also in Settings). After a confirmation, everything is deleted straight away and the cookie is cleared.
   - **Automatically:** 3 days after the last visit.

**What visitors are told:** the portfolio is kept only in this browser, for up to 3 days after the last visit. Clearing cookies, using another browser or device, or private browsing starts a new, empty session. Anyone using the same browser can see it.

**Later, with accounts:** a visitor will be able to keep a session's portfolio by creating an account.

## Dashboard items

Every dashboard number is calculated by Assetlume's own code on the server. Each item names where its inputs come from and which published method it follows. Where Assetlume adds its own choice, it says so. Borrowed methods are always described as "based on", never as an official rating or a suitability assessment. The full details are in [`docs/architecture.md`](docs/architecture.md), section 7.

The item-by-item table (inputs, data source, method source and what Assetlume calculates) is in [`docs/architecture.md`](docs/architecture.md), section 7.0.

### Key rules in short

- **Diversification:** HHI below 1,000 is not concentrated, 1,000–1,800 moderately concentrated, above 1,800 highly concentrated. Holdings above 10% are flagged, and holdings between 5% and 10% are checked against a combined 40%.
- **Portfolio risk:** weekly returns (week ending Friday) over 5 years, annualised with √52, placed in the SRRI bands: 1 (0–0.5%), 2 (0.5–2%), 3 (2–5%), 4 (5–10%), 5 (10–15%), 6 (15–25%), 7 (25% and above). The period actually used is always shown.
- **Risk comparison:** proposed mapping conservative 1–4, moderate 5, growth 6, aggressive 7. The screen says only "within, above or below", never "suitable".
- **Impact:** every figure carries its company, reporting year and source link; coverage is always shown, and missing data is never counted as zero.

## Swapping data providers

Every outside service (stocks, crypto, currency rates, AI) can be replaced, for example by a paid plan or a different company, **without changing the rest of the app**. Only one new folder is written and one setting is changed.

### How it works

1. **One interface per kind of data.** `api/src/providers/types.ts` defines what the app needs, in the app's own words. Nothing in it mentions a provider.
2. **One adapter per provider.** Each adapter calls its provider, checks the response with Zod, and converts it into the standard format. Provider field names, URLs, error messages and rate-limit rules stay inside the adapter.
3. **One setting picks the adapter.** `registry.ts` reads `.env` (for example `STOCK_PROVIDER=fmp`) and hands the chosen adapter to the rest of the app.
4. **The rest of the app only sees the interface.** The daily update, calculations, dashboard and database never know which provider is in use.

### The standard interfaces (simplified)

```ts
// All prices and amounts are decimal strings, never JS numbers.
// All dates are "YYYY-MM-DD". All prices are in USD.

export interface ProviderInfo {
  name: string;                  // e.g. "fmp"
  attribution?: string;          // e.g. "Data provided by CoinGecko"
  limits: {
    requestsPerDay?: number;     // undefined = no known limit
    requestsPerMinute?: number;
    maxSymbolsPerRequest: number; // 1 = no batching
    historyDays?: number;        // how far back past prices go
  };
}

export interface StockProvider {
  info: ProviderInfo;
  getProfiles(symbols: string[]): Promise<StockProfile[]>; // name, sector, industry, exchange, CIK, market value, flags
  getLatestPrices(symbols: string[]): Promise<PriceQuote[]>;
  getPriceHistory(symbol: string, from: string, to: string): Promise<PriceBar[]>;
}

export interface CryptoProvider {
  info: ProviderInfo;
  getTopCoins(limit: number): Promise<CoinProfile[]>;     // ranked by market value, with prices
  getLatestPrices(ids: string[]): Promise<PriceQuote[]>;
  getPriceHistory(id: string, from: string, to: string): Promise<PriceBar[]>;
}

export interface FxProvider {
  info: ProviderInfo;
  getRates(date: string): Promise<FxRates>;              // USD to every currency on that date
  listCurrencies(): Promise<CurrencyInfo[]>;
}

export interface AiProvider {
  info: ProviderInfo;
  explain(input: InsightInput): Promise<string>;         // numbers in, plain text out
}
```

The adapter decides **how** to get the data. If the free plan allows one symbol per request, the FMP adapter loops; if a paid plan allows batches, the adapter sends batches. The daily update just calls `getLatestPrices(all150)` either way, and reads `info.limits` to plan its requests.

### Rules that keep providers swappable

- **The app uses its own asset IDs.** Each provider's ID for an asset (FMP ticker, CoinGecko id like `bitcoin`) is stored in a separate `asset_provider_ids` table. A new provider only needs its own rows there; holdings and prices stay linked to the app's IDs.
- **Every stored price and rate records its source.** Old data from the previous provider stays valid and still explains where it came from.
- **Provider names appear only in `api/src/providers/`** and in `.env`. A lint rule blocks imports of provider folders from anywhere else.
- **One set of contract tests per interface.** Every adapter must pass the same tests (correct formats, decimals as strings, missing data reported as missing rather than zero, rate-limit errors turned into the app's own `RateLimitedError`). Tests use saved responses, never live calls.
- **Errors are standard too.** Adapters turn provider errors into a small set of app errors: `RateLimitedError`, `DailyLimitReachedError`, `NotFoundError`, `ProviderDownError`, `BadDataError`. The daily update only knows these.

### To switch to a new provider

1. Create a folder, for example `api/src/providers/stocks/newprovider/`.
2. Implement the interface and pass the contract tests with saved responses.
3. Add its rows to `asset_provider_ids` (a seed script can map tickers automatically).
4. Change `.env`: `STOCK_PROVIDER=newprovider` and add its key.
5. Restart. Nothing else changes.

## API

All addresses start with `/api`.

| Address | Purpose |
|---|---|
| `GET /api/health` | Server status and result of the last update |
| `GET /api/assets` | Search and list assets |
| `GET /api/assets/:id` | One asset's details |
| `GET /api/assets/:id/prices` | One asset's past prices |
| `GET /api/session` | Session status and when its data will be deleted |
| `DELETE /api/session` | End the session and delete all its data now |
| `GET/PUT /api/portfolio` | Portfolio name and display currency |
| `GET/PUT /api/portfolio/profile` | Questionnaire answers |
| `GET/POST/PUT/DELETE /api/portfolio/holdings` | Manage holdings |
| `GET /api/portfolio/analysis` | All dashboard items, with their sources and data-quality warnings |
| `GET /api/portfolio/history` | "What if" history: today's holdings applied to past prices |
| `GET /api/portfolio/insights` | AI suggestions, or "unavailable" |
| `GET /api/meta/data-status` | When each update last ran, data-source credits and method sources |

## Testing

```bash
npm test
```

- Every calculation has hand-worked test cases: one holding, several holdings, missing price, zero cost, empty portfolio, missing sector, missing exchange rate, each HHI, 5/10/40 and SRRI band edge, weekly returns across a US holiday, a coin with less than 5 years of history, partial impact coverage, and EUR-based to USD-based rate conversion.
- Session tests: one session can never read or change another session's data, and deleted or expired sessions leave nothing behind.
- Every breakdown must add up to exactly 100%.
- Provider code is tested against saved responses in `api/test/`, so tests never call real providers.

## Data sources and attribution

| Data | Source |
|---|---|
| US stock details, company IDs, sectors, prices and history | [Financial Modeling Prep](https://site.financialmodelingprep.com/api/pricing-md) |
| Crypto details, prices and history | [CoinGecko](https://www.coingecko.com) |
| Exchange rates (about 30 currencies) | [European Central Bank reference rates](http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) |
| Environmental and social figures | Seed file built by hand from company reports |

Data provided by CoinGecko. Exchange rates: European Central Bank. Each provider's display and attribution rules are checked before the app is shown to anyone else.

**Exchange rate notes:** the ECB publishes rates against the euro on working days. The ECB adapter converts them to USD-based rates (USD to X = EUR to X ÷ EUR to USD) with exact decimals, so the rest of the app never sees euro-based rates. Weekends and holidays use the previous published rate, with its date shown.

## Known limits

- Prices are end-of-day only. "Current price" means the latest stored price, shown with its date.
- Costs must be entered in USD.
- Diversification checks ignore how closely holdings move together and ignore geography.
- HHI, UCITS, SRRI, MiFID II and SFDR methods were written for markets, funds and investment firms. Assetlume borrows them as reference points; it does not give official ratings or suitability assessments.
- Many coins and some stocks have less than 5 years of prices; the risk class then uses a shorter period, which is always shown.
- Impact figures cover only companies in the seed file, for the reporting year shown. Coins have no impact figures.
- Portfolios are kept for at most 3 days after the last visit, so there is no real portfolio history; the history chart is always the "what if" line, clearly labelled.
- Values alignment is based on industry rules and limited manual review. **It is not an ESG rating and may be incomplete.**
- No login: a session lives in one browser. Clearing cookies or switching device loses it.

## Roadmap

- [ ] 1. Agree the scope and the architecture (answer [`docs/open-questions.md`](docs/open-questions.md))
- [ ] 2. Set up the project (folders, database, settings check, health check, tests)
- [ ] 3. Test the data providers → `poc/findings.md`
- [ ] 4. Build the asset list (150 stocks + 150 coins) and Explorer page
- [ ] 5. Daily price update and one-off history download
- [ ] 6. Questionnaire and portfolio builder
- [ ] 7. Calculations and currency
- [ ] 8. Dashboard
- [ ] 9. Values alignment and AI explanations
- [ ] 10. Final checks, method page and demo

Steps 2 and 3 can run in parallel. Step 6 can start during step 5.

## Security and privacy

- API keys stay on the server.
- All incoming data (from users and providers) is checked before it is saved. One bad record does not stop an update.
- Each visitor's data is private to their session and deleted on request or 3 days after the last visit.
- Collect the minimum: no required name, no free-text answers, no account numbers. Only simple labels, never free text, are sent to the AI.
- A short privacy note explains what is stored, for how long, and how to delete it.
- AI text is checked: every number must match a calculated number, and advice-like wording is removed.
- Limits on new sessions and AI calls per session stop one visitor from using up the app's resources.

## License

_To decide._
