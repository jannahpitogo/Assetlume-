# Assetlume — Open questions

> Questions that still need an answer before or during the build. When one is answered, move the answer into [`architecture.md`](architecture.md), then mark it **Answered** here with the date, so there is a record of what was decided and when.
>
> Numbers continue from architecture v0.1. Q1 and Q3 were missing from v0.1 (see Q0).

**Status key:** Open · Answered · Dropped

---

## Needed now (Steps 1–3)

### Q0. What were Q1 and Q3?
- **Status:** Open
- **Context:** The open-questions table in architecture v0.1 jumped from Q2 to Q4.
- **Question:** Were Q1 and Q3 already decided, and if so, what was decided? Or were they removed?
- **Needed by:** Step 1

### Q15. When does the 3-day deletion clock start?
- **Status:** Open
- **Options:**
  - (a) 3 days after the **last visit**: coming back resets the clock. *(Currently written in the architecture.)*
  - (b) 3 days after the data was **first entered**, whether or not the visitor returns.
- **Needed by:** Step 6

### Q16. Keep the investIQ web app, or rebuild it?
- **Status:** Open
- **Context:** investIQ is written in JavaScript with TanStack Router, sends everything in one request to its own backend, keeps the stock list and prices in the web app, and calculates values in the browser. Assetlume's design (TypeScript, server owns the asset list and all maths, separate API addresses) differs on each of these.
- **Options:**
  - (a) Keep the investIQ web app and adapt it: convert to TypeScript, connect it to the new server.
  - (b) Rebuild the web app for Assetlume, reusing investIQ's layout and components where they fit.
- **Needed by:** Step 2

### Q17. Can we see the investIQ backend code?
- **Status:** Open
- **Context:** Needed to answer Q12. The investIQ form sends data to a backend hosted on Render.
- **Request:** a GitHub link or the files.
- **Needed by:** Step 7 (earlier is better)

### Q18. Are the API keys ready?
- **Status:** Open
- **Needed:** free keys for Financial Modeling Prep and CoinGecko. The ECB rates need no key.
- **Needed by:** Step 3

---

## Product design

### Q2. Where does the starting list of ~200 stocks come from, and is it refreshed?
- **Status:** Open
- **Context:** The top 150 are ranked from this list, so a company outside it can never join.
- **Suggestion:** a public list of large US companies, with its date written in, refreshed each quarter.
- **Needed by:** Step 4

### Q5. Can visitors enter the price paid in a currency other than USD?
- **Status:** Open
- **Suggestion:** No, for this version. It would need the purchase date and a past exchange rate.
- **Needed by:** Step 6

### Q7. How do the four risk levels map to the SRRI classes (1–7)? (riskComparison)
- **Status:** Open
- **Suggestion:** conservative 1–4, moderate 5, growth 6, aggressive 7.
- **Note:** most portfolios of individual stocks land in class 6 or 7, and crypto pushes higher.
- **Needed by:** Step 8

### Q8. What are the questionnaire questions, and how are answers scored?
- **Status:** Open (project owner is rewriting them for Assetlume)
- **Must cover** the three areas of the ESMA MiFID II suitability guidelines (architecture 7.7): knowledge and experience; financial situation, including ability to bear losses; investment objectives, including attitude to risk.
- **Must also provide:** values to avoid (only topics with rules); holdings with decimal quantities and price paid in USD.
- **Point scoring:** Assetlume's own. Needs the points per answer and the totals for each of the four levels.
- **Rules:** financial situation in ranges only, never exact amounts; no advice-like wording; no required name; no free text.
- **Needed by:** Step 6

### Q9. Which values topics appear in the questionnaire?
- **Status:** Open
- **Context:** Each topic needs documented rules, or every holding shows "not assessed".
- **Architecture:** fossil fuels, tobacco, weapons and defence, gambling, alcohol, crypto energy use.
- **investIQ also had:** fast food and ultra-processed drinks, fast fashion (no industry category separates these cleanly), and a second question on human rights, tax avoidance, animal rights, habitats and resources (no data source).
- **Suggestion:** the architecture's six for this version.
- **Needed by:** Steps 6 and 9

### Q19. Where do crypto prices come from?
- **Status:** Open
- **Context:** The dashboard items table names FMP for prices, names and price history, but the app also holds 150 coins. Architecture v0.3 keeps **CoinGecko** for crypto.
- **Options:** (a) keep CoinGecko for crypto; (b) use FMP for crypto too, if its plan includes the top 250 coins and their history.
- **Needed by:** Step 3

### Q20. What if there is less than 5 years of price history?
- **Status:** Open
- **Context:** The SRRI method uses 5 years of weekly returns. Many coins are younger than 5 years, and free plans may give less history.
- **Options:**
  - (a) Use the longest period all holdings share, with a minimum of 1 year (52 weeks); below that, "not enough history".
  - (b) Leave out holdings with short history and show which ones.
- **Suggestion:** (a), always showing the period used.
- **Needed by:** Step 7

### Q21. Keep values alignment next to the impact figures?
- **Status:** Open
- **Context:** The dashboard items list has environmental and social impact but not the values alignment card (flagged / not flagged / not assessed) from v0.2.
- **Options:** (a) keep both: values alignment answers "do I hold what I said I want to avoid?", impact answers "what are my holdings' reported figures?"; (b) drop values alignment and the values questions.
- **Needed by:** Step 6

### Q22. Which impact indicators and companies for this version?
- **Status:** Open
- **Context:** Figures are typed in by hand from company reports. Every indicator × company adds work.
- **Suggestion:** two environmental (GHG emissions, carbon footprint) and two social (board gender diversity, gender pay gap) indicators, for the largest stocks first, one reporting year. Coverage is shown on the dashboard.
- **Needed by:** Step 9 (collecting can start any time)

### Q23. Rename `aiSuggestions`?
- **Status:** Open
- **Context:** "Suggestions" can read as investment advice. The card only gives observations and things to learn about (architecture 7.12).
- **Options:** keep the name with the strict rules, or rename to `aiInsights` / `aiExplanations`.
- **Needed by:** Step 9

---

## Later steps

### Q10. Is the demo run on our computer, or online?
- **Status:** Open
- **Context:** Private sessions now keep each visitor's data separate, so going online is possible. It still needs the privacy note, rate limits and provider display rules checked.
- **Needed by:** Step 10

### Q11. Which AI model, and how much can we spend?
- **Status:** Open
- **Suggestion:** a small, low-cost model with a daily cap for the app and a cap per session.
- **Needed by:** Step 9

### Q12. Does the investIQ calculation code match architecture section 7?
- **Status:** Open (waiting on Q17)
- **Check:** every dashboard item in architecture section 7.0: missing prices, zero cost, rounding, HHI and 5/10/40, weekly SRRI, risk tolerance scoring.
- **Needed by:** Step 7

### Q14. Which licence?
- **Status:** Open
- **Needed by:** Step 10

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
