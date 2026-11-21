const DISCLAIMER = 'Educational analysis only. No buying, selling or trading. Not financial advice.';

// The questionnaire page is not built yet; this is where "Start" will lead.
const QUESTIONNAIRE_PATH = '/questionnaire';

const steps = [
  {
    title: 'Answer a few questions',
    body: 'Five short steps about your experience, your goals and how you feel about risk. Money questions use ranges, never exact amounts.',
  },
  {
    title: 'Enter what you already hold',
    body: 'Pick from 150 large US stocks and 150 cryptocurrencies. Add the quantity and the average price you paid, in USD.',
  },
  {
    title: 'See your dashboard',
    body: 'Assetlume values your holdings with real market prices and explains each result in plain language.',
  },
];

const dashboardItems = [
  {
    title: 'Value and change',
    body: 'What your holdings are worth today, what they cost and how they moved since the last price.',
  },
  {
    title: 'How it is spread',
    body: 'Your split between stocks and crypto, your largest holdings and your sectors.',
  },
  {
    title: 'Concentration',
    body: 'Based on the HHI concentration index and the 5/10/40 limits used for EU funds.',
  },
  {
    title: 'Risk',
    body: 'A risk class from 1 to 7, based on the EU SRRI method, compared with the risk you said you are comfortable with.',
  },
  {
    title: 'Values and impact',
    body: 'Whether you hold what you said you want to avoid, and company-reported environmental and social figures.',
  },
  {
    title: 'Plain-language insights',
    body: 'Short notes on what the numbers mean and what to learn about next. Never what to buy or sell.',
  },
];

export function WelcomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <span className="wordmark">
            <span className="wordmark-mark" aria-hidden="true" />
            Assetlume
          </span>
          <span className="badge">Educational tool</span>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <div className="container hero-inner">
            <span>Built for retail investors</span>
            <h2 className="motto">Know what you own, in plain language.</h2>
            <p className="lead">
              Type in the stocks and coins you already hold. Assetlume shows what they are worth, how
              they are spread and how risky they look.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={QUESTIONNAIRE_PATH}>
                Start the questionnaire
                <span className="button-arrow" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      stroke="#fff"
                      strokeWidth="1.333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.333 8h9.333M8 3.333 12.667 8 8 12.666"
                    />
                  </svg>
                </span>
              </a>
              <a className="button button-secondary" href="#how-it-works">
                How it works
              </a>
            </div>
            <p className="notice" role="note">
              {DISCLAIMER}
            </p>
          </div>
        </section>

        <section id="how-it-works" className="section" aria-labelledby="how-heading">
          <div className="container">
            <h2 id="how-heading">How it works</h2>
            <ol className="steps">
              {steps.map((step, i) => (
                <li key={step.title} className="step">
                  <span className="step-number" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section-alt" aria-labelledby="see-heading">
          <div className="container">
            <h2 id="see-heading">What you will see</h2>
            <p className="section-intro">
              Every number is worked out by Assetlume and shows its date, where the data comes from
              and which published method it is based on.
            </p>
            <ul className="cards">
              {dashboardItems.map((item) => (
                <li key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" aria-labelledby="not-heading">
          <div className="container two-col">
            <div>
              <h2 id="not-heading">What Assetlume does not do</h2>
              <ul className="plain-list">
                <li>It does not connect to any broker, exchange or crypto wallet.</li>
                <li>It does not buy, sell or trade anything.</li>
                <li>It does not tell you what to buy, sell or hold.</li>
                <li>It is not a suitability assessment or an official rating.</li>
              </ul>
            </div>

            <div>
              <h2>Your data stays private</h2>
              <ul className="plain-list">
                <li>No account or login. You get a private session in this browser.</li>
                <li>No name required, and no free-text answers.</li>
                <li>
                  Your data is deleted when you press <strong>End session &amp; delete my data</strong>,
                  or automatically 3 days after your last visit.
                </li>
                <li>
                  Clearing cookies, or switching browser or device, starts a new, empty session.
                  Anyone using the same browser can see it.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section cta" aria-labelledby="cta-heading">
          <div className="container cta-inner">
            <h2 id="cta-heading">Ready to look at your portfolio?</h2>
            <p>It takes a few minutes. You can change your holdings later.</p>
            <a className="button button-primary" href={QUESTIONNAIRE_PATH}>
              Start the questionnaire
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p className="footer-disclaimer">{DISCLAIMER}</p>
          <p className="footer-credits">
            Stock data: Financial Modeling Prep. Data provided by CoinGecko. Exchange rates: European
            Central Bank.
          </p>
          <p className="footer-copy">© {new Date().getFullYear()} Assetlume. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
