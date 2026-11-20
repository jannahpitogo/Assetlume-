# Assetlume — Architecture

> **What Assetlume is:** a learning tool. It helps a beginner understand the investments they already hold. It does **not** buy, sell or trade anything, does not connect to any broker, exchange or crypto wallet in any version, and does not tell anyone what to buy, sell or hold. Users type in what they already own. Nothing in the app is financial advice.

> **Background:** Assetlume extends an earlier version (investIQ), which covered US stocks only. Assetlume adds cryptocurrencies, private visitor sessions and a rebuilt questionnaire.

---

## 1. Overview

Visitors enter the investments they already have (for example, 12 shares of a company, or 0.5 of a coin). Assetlume combines that with real market prices and shows the results on a dashboard: how much the portfolio is worth, how it is spread, how risky it is compared with the risk the visitor is comfortable with, and its environmental and social figures.

The app tracks:

- **150 US stocks**, the largest by market value.
- **150 cryptocurrencies**, the largest by market value. Stablecoins are included.
- **No foreign currencies (Forex) as investments.** Currency conversion is only used to show amounts in the visitor's chosen currency.

**Demo version:** no login, published online. Every visitor gets a private session (section 11.1). Market data is real. Before going online, the privacy note, rate limits and provider display rules are checked (Step 10). Later versions will add accounts and file upload (section 16).

---

## 2. The main parts

| Part | What it does |
|---|---|
| **Web app** | What the visitor sees and clicks: the questionnaire (including the portfolio form), the asset list, the dashboard and the settings. It collects input and shows results. It does **no** calculations. |
| **Server (API)** | Receives requests, checks the data, saves it, runs all calculations and sends back the results. It also runs the daily update and the session clean-up. All the rules live here. |
| **Database** | Stores the asset list, prices, currency rates, impact data, sessions and each session's answers and holdings. |
| **Outside data services** | Supply prices, company details, exchange rates and (optionally) AI-written text. Only the server talks to them, always through a provider adapter (section 12.1). |

### Tech stack

| Part | Choice |
|---|---|
| Language | TypeScript everywhere |
| Web app | React + Vite |
| Server | Node.js + Express |
| Database | PostgreSQL (`NUMERIC` for exact decimals) |
| Database access | `pg` with SQL migrations (`node-pg-migrate`) |
| Shared rules | Zod schemas in `shared/`, used by web and server |
| Money maths | `decimal.js`; money is never a plain JavaScript number |
| Scheduler | `node-cron` inside the server, with a lock |
| Tests | Vitest |
| Workspaces | npm workspaces: `web`, `api`, `shared` |

---

## 3. Key decisions

| # | Decision | Why |
|---|---|---|
| D1 | **One server program** that runs the app, the daily update and the clean-up. | One developer, one database, 300 assets, prices once a day. |
| D2 | **One project folder** for web app, server and shared code. | Shared rules are written once and used by both sides. |
| D3 | **Prices are updated once a day in the background.** The web app only reads stored prices. | Stays within free limits; the dashboard works when a provider is down. |
| D4 | **USD is the base currency.** The chosen currency is applied only at the end, for display. | Currencies can never be mixed in a total. |
| D5 | **Exact money maths.** | Normal computer decimals drift by tiny amounts. |
| D6 | **Every outside service is reached through a standard interface and a provider adapter.** One `.env` setting picks the adapter. | Switching provider means writing one adapter, not rewriting the app. |
| D7 | **No saved portfolio history.** History is always "today's holdings applied to past prices", clearly labelled. | Sessions last at most 3 days after the last visit. |
| D8 | **No ESG scores or ratings.** Values alignment uses documented rules; impact figures use the published SFDR indicators with their source and year. | No free, reliable ESG source exists; published indicators can be traced and explained. |
| D9 | **AI explains the numbers and suggests things to look at. It never calculates them and never says what to buy, sell or hold.** Its text is checked, with a plain fallback. | Financial numbers must come from the app's own maths or official computations from reliable sources. |
| D10 | **No login. Each visitor has a private anonymous session.** Data is deleted on request or 3 days after the last visit. | Visitors can use their own holdings privately. |
| D11 | **All dashboard numbers are calculated by the project's own code or if there's a reliable and official resource.** Providers only supply prices, company details, rates and reported figures. | We can explain and test every calculation. |
| D12 | **TypeScript** everywhere. | Chosen by the project owner. |
| D13 | **Crypto list includes stablecoins (labelled). Wrapped, bridged and staked coins are left out.** | Stablecoins affect the spread; wrapped coins copy another coin. |
| D14 | **The asset list is exactly 300: top 150 stocks and top 150 coins by market value.** | One simple rule for both lists. |
| D15 | **Scores use published thresholds and methods, not invented weights.** | Every number can be traced to a citable source. |
| D16 | **The database schema is defined only by migrations.** | One source of truth. |
| D17 | **Every dashboard item names its data source and its method source** (section 7.0). Where Assetlume adds its own choice (point scoring, level-to-class mapping), it is labelled as Assetlume's own. Borrowed methods are described as "based on", never as an official rating or assessment. | Visitors and reviewers can check where each number comes from. |
| D18 | **The web app is rebuilt for Assetlume, not kept as investIQ.** investIQ is a reference for layout and components only. | Matches the TypeScript, server-side design. Answers Q16. |

---

## 4. How a visitor uses the app

1. **Session.** On the first visit, the server creates a private session (section 11.1).
2. **Questionnaire.** Five steps. The last step is the portfolio form: the visitor searches the 300 assets (stocks and coins), and enters the quantity held and the average price paid per share or coin, in USD.
3. **Analysis.** The server values each holding with stored prices and calculates every dashboard item (section 7).
4. **Dashboard.** The visitor sees the items in section 7. They can change holdings on the Builder page, change the display currency in Settings, and press **End session & delete my data**.

The portfolio form records what the visitor *tells* us they hold. It does not record trades.

### What the questionnaire must provide

The questions are still being written (Q8). Whatever their wording, they must give the server:

| Needed | Grouped under (MiFID II suitability areas) | Used by |
|---|---|---|
| Knowledge of and experience with stocks and crypto | Knowledge and experience | riskTolerance (7.7) |
| Financial situation, including ability to bear losses, **asked only in ranges**, never exact amounts | Financial situation | riskTolerance |
| Investment objectives: goal, time horizon, attitude to risk and losses | Investment objectives | riskTolerance |
| Values to avoid, only from topics with rules | — | Values alignment (7.10) |
| Holdings: asset, quantity (decimals allowed), average price paid in USD | — | Everything |

**Rules for the questionnaire:**

- No wording that sounds like advice or a suitability assessment ("recommendations", "suitable for you", "we suggest you invest").
- Financial situation questions use ranges (for example, "what share of your savings is invested?"), never exact income, balances or debts.
- No required name. A first name or nickname may be optional and is never sent to the AI.
- No free-text answers.
- Age, if asked, is a whole number from 18 to 99.

---

## 5. The assets we track

| List | Size | Picked by | Re-ranked |
|---|---|---|---|
| Stocks | 150 | Market value | Once a week |
| Coins (crypto) | 150 | Market value, after exclusions | Once a day |
| **Total** | **300** | | |

If fewer than 150 assets pass the rules for one list, that list is shorter, and the update log records the gap.

### 5.1 Stocks

Each stock needs at least: ticker, company name, company ID (CIK), sector, industry, current price and market value.

**Rules for choosing the 150:**

1. Ask FMP for about 200 of the largest US companies, ranked by market value. This pool is refreshed weekly, with the stock list (5.4).
2. Look up each company's details from the stock provider.
3. Include it only if it is a US company listed on NYSE, NASDAQ or AMEX, is an operating company (not an ETF or fund), is actively trading, and has a known market value and price.
4. If a company has more than one share class, keep only the most traded one.
5. Rank by market value and keep the top 150.

### 5.2 Cryptocurrencies

- Stablecoins are **included**, labelled, and count toward the 150.
- Wrapped, bridged and staked coins are **left out**. The excluded list is kept in a file, with the reason for each.
- The update fetches the top 250 by market value, then filters, to end up with 150.
- Each coin needs at least a symbol, name, current price and market value.
- Coins have no sector. We never make one up.

### 5.3 Where the data comes from

| Data | Provider (adapter) |
|---|---|
| US stock details, company IDs, sectors, prices and price history | **Financial Modeling Prep (FMP)** — https://site.financialmodelingprep.com/api/pricing-md |
| Crypto details, prices and price history | **CoinGecko** (unchanged from v0.2) |
| Exchange rates | **European Central Bank (ECB)** euro foreign exchange reference rates — http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html |
| Environmental and social figures | **Seed file** built by hand from company reports (no free source) |
| AI text (optional) | AI provider: a small, low-cost model (see 11) |

**To check in Step 3:**

- FMP free plan: sector and industry for US stocks, CIK, and **5 years** of price history.
- CoinGecko free plan: whether **5 years** of price history is available. If history is limited, crypto risk uses what is available (see 7.8).
- ECB: the daily file and the full history file both load and parse.

**Notes on the ECB rates:** the ECB publishes reference rates for about 30 currencies against the euro, once a day on working days. Assetlume works in USD, so each rate is converted: USD to X = (EUR to X) ÷ (EUR to USD), and USD to EUR = 1 ÷ (EUR to USD), using exact decimals. Days without a rate (weekends, holidays) use the previous published rate, with its date shown. Full history is available from the ECB, so past rates are no problem.

### 5.4 How often the data updates

| What | How often | Notes |
|---|---|---|
| Stock list (details and ranking) | Once a week | Re-ranks the top 150 |
| Crypto list (ranking) | Once a day | Comes with the daily price update |
| Stock prices | Once a day, after the US close, trading days only | Skips weekends and US market holidays |
| Crypto prices | Once a day | |
| Exchange rates | Once a day | After the ECB publishes |
| Past prices | Once at the start (5 years), then kept up to date daily | For risk and history charts |
| Impact data | When the seed file is updated | Each figure keeps its reporting year and source |
| Session clean-up | Every hour | Deletes sessions not visited for 3 days |

Assets that drop out of the top 150 are marked **inactive**, never deleted. If a visitor holds one, its price keeps updating.

### 5.5 Market hours and data freshness

- Each stock price is dated with its US trading day. Each crypto price is dated with the day it was fetched.
- A **stock price is stale** if it is older than the last completed trading day. A **crypto price is stale** after 36 hours.
- Stale prices are still used, with a warning and the date.
- A **missing price** is left out of the totals and listed clearly. It is never treated as zero.

---

## 6. How data moves through the app

### 6.1 Daily update

1. The server starts the job. If one is already running, the new one stops.
2. Crypto prices for the top 250 coins in one request; the 150 kept are stored with their dates.
3. Stock prices for the 150 stocks (and any inactive stock a visitor holds).
4. On "too many requests", wait and retry, up to 3 times. If the daily limit is used up, stop calling that provider until tomorrow and record it.
5. ECB exchange rates.
6. Record the result: **succeeded**, **partial** or **failed**.

Running the same day twice overwrites that day's numbers. If the computer was off, the job catches up when the app starts.

### 6.2 Loading the dashboard

1. The web app asks the server for the analysis. The session cookie identifies the visitor.
2. The server loads that session's holdings and answers, the stored prices, price history, rates and impact data.
3. The server calculates every item in section 7.
4. The server sends back the results, the source and method of each item, and data-quality warnings.
5. The web app shows the numbers with their dates, sources and warnings.

The dashboard never calls a data provider directly.

---

## 7. Dashboard items

Everything is calculated on the server (D11). Each item names where its inputs come from and which published method it follows (D17).

### 7.0 Overview

| Item | Inputs and source | Method source | What Assetlume calculates |
|---|---|---|---|
| `totalPortfolioValue` | Quantities: questionnaire form. Prices: FMP (stocks), CoinGecko (crypto). Exchange rates: ECB | — | Quantity × price per holding, summed in USD, converted to the display currency |
| `portfolioChange` | Stored prices: FMP, CoinGecko | — | Change in value since the previous price date, and gain or loss against the price paid |
| `topHoldings` | Holding values (from `totalPortfolioValue`). Names: FMP, CoinGecko | — | Holdings ranked by value, with their share of the total |
| `assetAllocation` | Holding values; asset type from Assetlume's own asset records | SEC Investor.gov, beginner's guide to asset allocation, diversification and rebalancing | % of total value per asset category (stocks, crypto) |
| `sectorExposure` | Holding values. Sectors: FMP (US stocks only, free plan) | — | % of total value per sector |
| `diversification` | Holding weights and sectors | DOJ HHI; UCITS Directive Article 52; SEC Investor.gov | HHI with DOJ bands; largest positions checked against 5/10/40 limits; spread between and within asset categories |
| `riskTolerance` | Questionnaire answers | ESMA guidelines on MiFID II suitability requirements | Risk level from answers grouped into knowledge and experience, financial situation, and investment objectives. **Point scoring is Assetlume's own** |
| `portfolioRisk` | Price history: FMP, CoinGecko | CESR/ESMA 10-673 (SRRI) | Annualised volatility from weekly returns over 5 years, placed in risk class 1–7 |
| `riskComparison` | `riskTolerance` + `portfolioRisk` | MiFID II Article 25 (assessment of suitability) | Whether the portfolio's risk class is within, above or below the visitor's tolerance. **The level-to-class mapping is Assetlume's own** |
| `valuesAlignment` | Holding values; values rules (seed file) | Assetlume's documented rules (D8) | Flagged / not flagged / not assessed shares (kept from v0.2) |
| `environmentalImpact` | Seed file from company reports | SFDR Delegated Regulation (EU) 2022/1288, Annex I | Value-weighted portfolio figures for environmental indicators (for example GHG emissions, carbon footprint) |
| `socialImpact` | Seed file from company reports | SFDR Delegated Regulation (EU) 2022/1288, Annex I | Value-weighted portfolio figures for social indicators (for example board gender diversity, gender pay gap) |
| `aiInsights` | Assetlume's calculated results | — | Plain-language observations and things to learn more about (7.12) |
| `portfolioSummary` | All items above | — | A short overview card built from the items above |

**Method source links:**

- SEC Investor.gov: https://www.investor.gov/introduction-investing/investing-basics/glossary/beginners-guide-asset-allocation-diversification-and-rebalancing
- DOJ HHI: https://www.justice.gov/atr/herfindahl-hirschman-index
- UCITS Article 52: https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/ucits/article-52
- ESMA MiFID II suitability guidelines: https://www.esma.europa.eu/node/101543
- MiFID II Article 25: https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mifid-ii/article-25-assessment-suitability-and
- CESR/ESMA 10-673 (SRRI): https://www.esma.europa.eu/sites/default/files/library/2015/11/10_673.pdf
- SFDR Delegated Regulation (EU) 2022/1288, Annex I: searchable at https://eur-lex.europa.eu

**Rules for missing data (all items):**

- A holding with no price is left out of the totals and listed separately, never counted as zero.
- A holding with no sector is shown as **"Crypto"** (coins) or **"Not classified"** (stocks) on its own line.
- If the cost is zero, return is shown as "n/a".
- Every percentage breakdown adds up to exactly 100%.

### 7.1 totalPortfolioValue

For each holding with a price: quantity × latest stored price, in USD. Summed. Converted to the display currency with the latest ECB-based rate. Also shown: total cost (quantity × price paid) and overall gain or loss.

### 7.2 portfolioChange

- Change since the previous price date, per holding and in total. For stocks on a Monday, that is the change since the last trading day.
- Gain or loss against the price paid, per holding and in total.

### 7.3 topHoldings

The holdings ranked by value, with name, value and share of the total. The top 5 together are also shown.

### 7.4 assetAllocation

% of total value in each asset category: **stocks** and **crypto**, with stablecoins shown as their own line inside crypto. Following the SEC Investor.gov guide, the dashboard explains what asset allocation means and why categories behave differently.

### 7.5 sectorExposure

% of the stock part in each sector, from FMP. Coins are shown as "Crypto", not spread across sectors.

### 7.6 diversification

Three checks, each with its own method source:

1. **Concentration (DOJ HHI).** HHI = sum of each holding's squared share in percent; one holding = 10,000. Effective number of holdings = 10,000 ÷ HHI. Bands from the DOJ:

   | HHI | Label |
   |---|---|
   | Below 1,000 | Not concentrated |
   | 1,000 to 1,800 | Moderately concentrated |
   | Above 1,800 | Highly concentrated |

2. **Largest positions (UCITS Article 52, the 5/10/40 rule).** For EU funds, a single issuer may be at most 5% of the fund, raised to 10% if all positions above 5% together are no more than 40%. Assetlume shows, for the visitor's portfolio:
   - every holding above **10%**;
   - every holding between **5% and 10%**, and their combined share against **40%**.

3. **Spread between and within categories (SEC Investor.gov).** Between: the stock vs crypto split from `assetAllocation`. Within: the HHI of the stock part and of the crypto part separately, and the number of sectors in the stock part.

**Shown with the result:** these limits were written for markets (HHI) and funds (UCITS), not personal portfolios. Assetlume uses them as reference points. The checks ignore how closely holdings move together and ignore geography.

### 7.7 riskTolerance

- Questionnaire answers are grouped into the three areas named in the ESMA MiFID II suitability guidelines: **knowledge and experience**, **financial situation** (including ability to bear losses), and **investment objectives** (including attitude to risk).
- Each answer has points. The points and the thresholds that turn a total into a level are **Assetlume's own choice**, documented in the method page (Q8).
- Result: conservative, moderate, growth or aggressive.

**Shown with the result:** "Grouped in the same way as the EU suitability guidelines. This is not a suitability assessment, and Assetlume is not an investment firm."

### 7.8 portfolioRisk

Following CESR/ESMA 10-673:

1. Build the "what if" value series: today's holdings applied to past prices.
2. Take **weekly returns** over the last **5 years**. Each week ends on Friday: the stock closing price of the last trading day that week, and the crypto price on that Friday. Using weeks lines up stock and crypto dates without filling gaps.
3. Annualised volatility = standard deviation of weekly returns × √52.
4. Place it in the SRRI bands:

| Class | Yearly volatility |
|---|---|
| 1 | 0–0.5% |
| 2 | 0.5–2% |
| 3 | 2–5% |
| 4 | 5–10% |
| 5 | 10–15% |
| 6 | 15–25% |
| 7 | 25% and above |

5. **Largest fall** (biggest drop from a peak) over the same period is shown as well.

**Shorter history:** many coins and some stocks have less than 5 years of prices, and free plans may limit history. The rule: use the longest period all holdings share, with a minimum of 1 year (52 weeks). Below 1 year, the screen shows "not enough history" instead of a risk class. The screen always states the period actually used.

### 7.9 riskComparison

- The visitor's level from `riskTolerance` is mapped to a range of SRRI classes. **The mapping is Assetlume's own:** conservative 1–4, moderate 5, growth 6, aggressive 7.
- The screen says whether the portfolio's class is **within, above or below** that range.
- It never says an investment is suitable or unsuitable, never predicts losses, and never says what to change.

**Shown with the result:** "The comparison is modelled on the risk check in MiFID II Article 25. It is not a suitability assessment."

### 7.10 valuesAlignment (kept from v0.2)

If the visitor wants to avoid something, the dashboard shows three shares: **Flagged**, **Not flagged** and **Not assessed**. Flags come from documented industry rules, a few manually reviewed companies (each with source and date), and each coin's documented consensus method. Starting topics: fossil fuels, tobacco, weapons and defence, gambling, alcohol, crypto energy use. The screen says: *"Based on industry type and limited manual review. Not an ESG rating. May be incomplete."*

### 7.11 environmentalImpact and socialImpact

- **Indicators:** taken from the mandatory principal adverse impact indicators in SFDR Delegated Regulation (EU) 2022/1288, Annex I. Environmental examples: GHG emissions, carbon footprint. Social examples: board gender diversity, unadjusted gender pay gap. For this version: two environmental indicators (GHG emissions, carbon footprint) and two social indicators (board gender diversity, gender pay gap), for the largest stocks first, using one reporting year. Coverage is shown on the dashboard.
- **Data:** no free source exists, so figures are entered by hand in a seed file (`api/seed/impact/`) from each company's own reports. Every figure records the company, indicator, value, unit, reporting year and source link.
- **Calculation:** each indicator follows the Annex I formula, applied to the visitor's holdings and weighted by value. For example, the carbon footprint relates each company's emissions to the share of the company the visitor holds, per million invested.
- **Coverage:** each figure is shown with the share of the portfolio it covers. Holdings without data, and all coins, are "not covered", never counted as zero.
- **Shown with the result:** "Based on company-reported figures for the year shown, using EU SFDR indicator definitions. Not an ESG rating. Covers X% of your portfolio."

### 7.12 aiInsights

- Input: the calculated results and simple labels only, never free text or the visitor's name.
- Output: plain-language observations and things to learn more about. For example: "Over half of your portfolio is in one holding. The diversification card explains why that matters."
- **Never** suggests buying, selling or holding anything, never names an asset to add, and never says what the visitor should do with their money.
- Checks: every number must match a calculated number; advice-like wording is removed; failed parts are dropped. If the AI is unavailable, the card is hidden and the numbers stand on their own.
- Saved per session and reused until the numbers change.

### 7.13 portfolioSummary

A short overview card at the top of the dashboard built only from the items above: value, change, the largest holding, concentration label, risk class compared with tolerance, and impact coverage. No new calculations.

### 7.14 How the calculations are tested

All calculations are written for this version. The investIQ calculation code is not available to compare against, so the hand-worked cases below are the check.

Hand-worked test cases for: one holding, several holdings, a missing price, zero cost, an empty portfolio, a missing sector, a missing exchange rate, the edges of every HHI, 5/10/40 and SRRI band, weekly returns across a US holiday, a coin with less than 5 years of history, an impact indicator with partial coverage, and EUR-based to USD-based rate conversion.

---

## 8. Currency

1. All assets are priced in USD; all totals and percentages are worked out in USD first.
2. Exchange rates come from the ECB (5.3). The display currencies are **USD, EUR and the currencies the ECB publishes** (about 30).
3. The total is converted at the end, using the latest rate. Percentages don't change.
4. Each currency is shown with its normal number of decimals (for example, none for JPY).
5. Rates are saved with their date and source.
6. If a rate is missing, the app shows USD with a clear note. It never shows a made-up converted amount.
7. The price paid must be entered in USD for this version. Other currencies would need the purchase date and a past exchange rate.

---

## 9. Price history

- **Asset price history:** daily prices for each stock and coin, up to 5 years back, kept up to date daily.
- **"What if" history:** today's holdings applied to past prices. Used for the history chart and for `portfolioRisk`, and always labelled as hypothetical.

There is **no real portfolio history** (D7).

---

## 10. What we store

| Data | What it holds |
|---|---|
| **Assets** | The 300 stocks and coins (plus inactive ones), with the app's own IDs, type (stock, crypto, stablecoin) and basic details. |
| **Asset provider IDs** | Each provider's ID for each asset (FMP ticker, CoinGecko id). |
| **Daily prices** | Price of each asset on each date, and its source. |
| **Exchange rates** | ECB rates, their dates, and the derived USD-based rates. |
| **Impact figures** | Company, indicator, value, unit, reporting year, source link. |
| **Asset labels** | Sector, industry and values labels, with their source. |
| **Sessions** | Hashed session ID, created time, last-seen time. |
| **Portfolio** | One per session: display currency. |
| **Questionnaire answers** | One per session: answers (ranges and choices only), and the derived risk level. |
| **Holdings** | Per session: asset ID, quantity, average price paid. Nothing else is copied into a holding. |
| **AI text** | Saved per session, linked to the numbers it describes. |
| **Update logs** | Each daily update and clean-up: what ran, what worked, what failed. |

Deleting a session deletes its portfolio, answers, holdings and AI text in one step.

**Size:** 5 years of daily prices for about 300 assets is roughly 550,000 rows, growing about 110,000 a year. Small for PostgreSQL.

**Precision:** prices and quantities up to 10 decimal places. Rounding only when shown.

**Schema:** defined only by migrations in `api/migrations/`. A generated read-only snapshot is written to `docs/schema.sql`.

---

## 11. Safety, privacy and limits

- **Keys stay on the server.**
- **Check all incoming data** with the shared Zod rules. A bad record for one asset does not stop the update.
- **Record where data came from and when,** including the reporting year of every impact figure.
- **Respect provider rules** (limits and attribution, for example "Data provided by CoinGecko"; ECB rates credited as the source).
- **Be clear about what the app is.** Welcome screen, footer and dashboard: *"Educational analysis only. No buying, selling or trading. Not financial advice."* No buy or sell buttons anywhere.
- **Borrowed methods are labelled as borrowed.** MiFID II, UCITS, SRRI, HHI and SFDR are described as "based on" or "modelled on". Assetlume never claims to perform a suitability assessment or to give an official rating.
- **Keep the AI in check** (7.12).
- **Limit cost and abuse.** The AI is a small, low-cost model. AI calls are capped per day and per session; exact caps are set in Step 9. New sessions per network address are rate-limited.
- **Collect the minimum.** Financial situation only in ranges; no required name; no free text; no account numbers.
- **Privacy note.** Says what is stored, for how long, and how to delete it.

### 11.1 Visitor sessions

1. On the first visit, the server creates a long random session ID and sends it in a cookie (`HttpOnly`, `Secure`, `SameSite=Lax`).
2. The database stores only a hash of the ID.
3. Every request finds the portfolio through the cookie. No portfolio ID appears in any web address.
4. Each visit updates "last seen".
5. Data is deleted:
   - **by the visitor,** with **End session & delete my data** on the dashboard (also in Settings), after a confirmation; the cookie is cleared;
   - **automatically,** 3 days after the last visit (hourly clean-up).

Visitors are told: the portfolio stays only in this browser; clearing cookies, switching browser or device, or private browsing starts an empty session; anyone using the same browser can see it.

Tests prove that one session can never read or change another session's data.

---

## 12. Project layout

```text
assetlume/
├── web/              # the web app
├── api/              # the server
│   ├── migrations/   # the database schema (only place tables are defined)
│   ├── seed/         # stock candidates, excluded coins, values rules, holidays, impact/ figures
│   ├── src/          # server code, split by job
│   └── test/         # tests, including saved provider responses
├── shared/           # Zod rules and formats used by web and api
├── poc/              # provider test scripts and findings.md
├── docs/             # architecture, open questions, method page, schema.sql (generated)
└── README.md
```

Server areas: **sessions**, **portfolio**, **assets**, **market data**, **price history**, **calculations**, **currency**, **values**, **impact**, **questionnaire**, **AI** and **providers**.

**Pages:** Welcome, Questionnaire (including the portfolio form), Builder, Dashboard, Explorer, Asset detail, Settings, Method (sources and methods for every dashboard item).

### 12.1 Swappable providers

All outside services live in `api/src/providers/`, one folder per provider, under `stocks/` (FMP), `crypto/` (CoinGecko), `fx/` (ECB) and `ai/`.

- `types.ts` defines a standard interface per kind of data. Prices are decimal strings, dates are `YYYY-MM-DD`, prices are in USD.
- Each adapter converts its provider's responses into that format, checks them with Zod, and turns provider errors into the app's own errors (`RateLimitedError`, `DailyLimitReachedError`, `NotFoundError`, `ProviderDownError`, `BadDataError`).
- The ECB adapter returns USD-based rates, so the rest of the app never knows the source is euro-based.
- Each adapter declares its limits; the daily update plans around them.
- `registry.ts` picks the adapter from `.env`.
- Every adapter of a kind must pass the same contract tests, using saved responses.

**To switch provider:** write the adapter, pass the contract tests, add its rows to the asset provider IDs, change one `.env` line.

### 12.2 Server addresses

| What it does | Address |
|---|---|
| Server status and last update | `GET /api/health` |
| Session status and deletion date | `GET /api/session` |
| End the session and delete all its data | `DELETE /api/session` |
| Search and list assets | `GET /api/assets` |
| One asset and its past prices | `GET /api/assets/:id`, `GET /api/assets/:id/prices` |
| Display currency | `GET/PUT /api/portfolio` |
| Questionnaire answers | `GET/PUT /api/portfolio/profile` |
| Holdings | `GET/POST/PUT/DELETE /api/portfolio/holdings` |
| All dashboard items, with sources and warnings | `GET /api/portfolio/analysis` |
| "What if" history | `GET /api/portfolio/history` |
| AI insights, or "unavailable" | `GET /api/portfolio/insights` |
| Update times, data-source credits and method sources | `GET /api/meta/data-status` |

---

## 13. How we build it

**Step 1. Agree the scope.** Answer the blocking questions in `open-questions.md` and agree this document.

**Step 2. Set up the project.** Folders, workspaces, local PostgreSQL, settings check, health check, automatic tests, README.

**Step 3. Test the data providers (do this first).** A 1–2 day test with 5 stocks (AAPL, MSFT, BRK-B, JPM, XOM) and 5 coins (bitcoin, ethereum, tether, solana, wrapped bitcoin), written to `poc/findings.md`:

- FMP free plan: do details include sector, industry, CIK, market value and trading flags? Is **5 years** of price history available? Batch requests? Limits?
- CoinGecko free plan: fields for 250 coins, and **how many years** of history.
- ECB: daily and full-history files load and parse; USD conversion matches hand-worked examples.
- Attribution and display rules for each.
- Does the whole plan fit within the daily limits, including the one-off 5-year download?

**What the result decides:** if stocks are blocked on the free plan, choose a smaller list, a paid plan (a settings change thanks to D6), or another provider (one new adapter). If history is shorter than 5 years, apply the shorter-history rule in 7.8.

**Step 4. Asset list.** The 300 assets, provider ID mapping, Explorer page.

**Step 5. Prices and rates.** Daily update with limits, retries and logs; one-off 5-year history download; ECB rates.

**Step 6. Sessions, questionnaire and portfolio form.** Session cookie and clean-up; five steps covering the three MiFID areas, with the portfolio form; Builder page; delete button.

**Step 7. Calculations.** Items 7.1–7.9 and currency, tested against the hand-worked answers.

**Step 8. Dashboard.** All cards, the method page, freshness and source labels.

**Step 9. Values, impact and AI.** Values rules; impact seed file and calculations; AI insights with checks and fallback; portfolio summary.

**Step 10. Final checks.** Test gaps, known limits, privacy note, provider rules re-checked, demo prepared.

Steps 2 and 3 can run at the same time. Collecting impact figures (Step 9) can start any time, since it is manual work.

---

## 14. Decisions still open

All open questions are kept in a separate file, [`open-questions.md`](open-questions.md), with their context, options, suggestions and the step that needs them. When a question is answered, the answer moves into this document.

---

## 15. Main risks

| Risk | Likely / serious | What we do |
|---|---|---|
| The free stock plan blocks some stocks | High / High | Step 3 test, then the three options; switching is cheap thanks to D6 |
| Less than 5 years of price history (free plans, young coins) | High / Medium | Shorter-history rule (7.8); the period used is always shown |
| The free daily limit is too small for the 5-year download | Medium / Medium | Spread the one-off download over several days |
| Collecting impact figures by hand takes too long | High / Medium | Limit indicators and companies for this version (7.11); show coverage honestly |
| Impact figures are old or inconsistent between companies | Medium / Medium | Reporting year and source on every figure |
| A provider's rules don't allow showing its data | Medium / High | Check in Step 3, ask in writing, or demo with recorded data |
| Visitors read the risk check as a suitability assessment | Medium / High | "Modelled on", "not a suitability assessment" wording on every related card |
| The AI sounds like advice | Medium / High | Number and wording checks, plain fallback |
| One visitor sees another's data | Low / High | Cookie-only lookup, hashed IDs, isolation tests |
| Abuse: many sessions or AI calls | Medium / Medium | Rate limits and per-session caps |
| The computer is asleep when the update should run | High / Low | Catch up on start-up |

---

## 16. Later versions (not in this version)

- **Accounts and login,** so a portfolio can be kept beyond 3 days and used on several devices.
- **File upload** of holdings (CSV from an Assetlume template), checked with the same Zod rules as the form.
- **Real portfolio history,** once accounts keep data long enough.
- Never: broker, exchange or wallet connections, or trading.

---

## 17. Assumptions

- **A1.** Each visitor has one private portfolio per browser session.
- **A2.** All assets are priced in USD, and the price paid is entered in USD.
- **A3.** End-of-day prices are good enough. "Current price" means the latest stored price, always shown with its date.
- **A4.** About 20 holdings per portfolio.
- **A5.** The app tracks 300 assets: 150 stocks and 150 coins, picked by market value.
