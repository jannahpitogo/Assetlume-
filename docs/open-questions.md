# Assetlume — Open questions

> Questions that still need an answer before or during the build. When one is answered, its decision is written into [`architecture.md`](architecture.md) and the question is removed from this file. The record of what was decided is in the **Answered** table below.
>
> Numbers continue from architecture v0.1. Q1 and Q3 were removed.

**Status key:** Open · Answered

---

## Needed now (Steps 1–3)

### Q18. Are the API keys ready?
- **Status:** Open. Not yet.
- **Needed:** free keys for Financial Modeling Prep and CoinGecko. The ECB rates need no key.
- **Needed by:** Step 3

---

## Product design

### Q8. What are the questionnaire questions, and how are answers scored?
- **Status:** Open (project owner is writing them for Assetlume later)
- **Must cover** the three areas of the ESMA MiFID II suitability guidelines (architecture 7.7): knowledge and experience; financial situation, including ability to bear losses; investment objectives, including attitude to risk.
- **Must also provide:** values to avoid (only topics with rules); holdings with decimal quantities and price paid in USD.
- **Point scoring:** Assetlume's own. Needs the points per answer and the totals for each of the four levels.
- **Rules:** financial situation in ranges only, never exact amounts; no advice-like wording; no required name; no free text.
- **Needed by:** Step 6

---

## Later steps

### Q12. Does the calculation match architecture section 7?
- **Status:** Open. Deferred: the calculations will be redone for this version, later.
- **Context:** the investIQ backend code is not available (Q17), so the existing code cannot be compared.
- **Check instead:** every dashboard item in architecture section 7.0 against the hand-worked cases in 7.14.
- **Needed by:** Step 7

---

## Answered

| # | Question | Answer | Date |
|---|---|---|---|
| — | Tech stack | PostgreSQL, React + Vite, Express, TypeScript | 2026-11-20 |
| — | Source of company IDs | FMP (SEC list dropped) | 2026-11-20 |
| — | Currency rates source | exchange-api (replaced the same day by ECB) | 2026-11-20 |
| — | Swappable providers | Standard interfaces and adapters (D6) | 2026-11-20 |
| — | `database/` vs `api/migrations/` | Migrations only (D16) | 2026-11-20 |
| — | Future data entry | Form and file upload; never broker connections | 2026-11-20 |
| — | Diversification approach | Concentration via HHI (D15) | 2026-11-20 |
| — | Visitor privacy | Private anonymous sessions (D10) | 2026-11-20 |
| — | Data deletion | Button on the dashboard, plus automatic after 3 days | 2026-11-20 |
| Q6 | Diversification score weights | Dropped: replaced by HHI thresholds | 2026-11-20 |
| — | Dashboard items, data and method sources | Table in architecture 7.0 (D17) | 2026-11-20 |
| — | Currency rates source | ECB reference rates (replaces exchange-api) | 2026-11-20 |
| Q4 | Display currencies | USD, EUR and the ECB's currencies (about 30) | 2026-11-20 |
| Q13 | Lining up stock and crypto dates | Weekly returns, week ending Friday (SRRI method) | 2026-11-20 |
| — | Diversification limits | HHI DOJ bands plus UCITS 5/10/40 | 2026-11-20 |
| — | Risk tolerance method | Three MiFID II suitability areas; own point scoring | 2026-11-20 |
| Q0 | What were Q1 and Q3? | Removed; no decision needed | 2026-11-21 |
| Q2 | Source of the ~200-stock pool | Fetched from FMP, ranked by market value, refreshed weekly | 2026-11-21 |
| Q5 | Price paid in other currencies | No; USD only for this version | 2026-11-21 |
| Q7 | Risk levels to SRRI classes | Conservative 1–4, moderate 5, growth 6, aggressive 7 (Assetlume's own) | 2026-11-21 |
| Q9 | Values topics | The six in the architecture | 2026-11-21 |
| Q10 | Where the demo runs | Online, after privacy note, rate limits and provider display rules are checked (Step 10) | 2026-11-21 |
| Q11 | AI model and spend | Small, low-cost model with a daily cap and a per-session cap | 2026-11-21 |
| Q14 | Licence | All rights reserved | 2026-11-21 |
| Q15 | When the 3-day clock starts | 3 days after the last visit | 2026-11-21 |
| Q16 | Keep or rebuild the web app | Rebuild for Assetlume (D18) | 2026-11-21 |
| Q17 | Can we see the investIQ backend code? | Not available | 2026-11-21 |
| Q19 | Crypto prices source | CoinGecko | 2026-11-21 |
| Q20 | Less than 5 years of history | Longest period all holdings share, minimum 1 year; below that, "not enough history" | 2026-11-21 |
| Q21 | Keep values alignment | Keep both values alignment and impact | 2026-11-21 |
| Q22 | Impact indicators and companies | Two environmental and two social indicators, largest stocks first, one reporting year | 2026-11-21 |
| Q23 | Rename `aiSuggestions` | Renamed to `aiInsights` | 2026-11-21 |
