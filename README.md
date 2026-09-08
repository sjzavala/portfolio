# Seve Zavala · portfolio

Static portfolio site for a Software Developer in Test, with a Playwright suite that tests
the site itself. The **QA Lab** section on the homepage renders the results of the last real run.

No framework, no build step: `index.html`, `css/style.css`, `js/main.js`.

## Run it locally

```bash
npm install
npx playwright install chromium webkit   # first time only
npm start                                # http://127.0.0.1:4173
```

## Test it

```bash
npm test          # full suite, Chromium + Mobile Safari
npm run test:ui   # Playwright UI mode
npm run lab       # run the suite, then regenerate lab/results.js from the JSON report
```

`lab/results.js` is generated from `test-results/results.json` by
`scripts/lab-results.mjs`. Commit it so the QA Lab has data on a fresh clone; CI regenerates
it on every deploy so the numbers on the live site always come from the run that shipped them.

## Deploy

`.github/workflows/ci.yml` runs the suite on every push and PR. On `main`, a green run
publishes `dist/` to GitHub Pages. One-time setup in the repo: **Settings → Pages → Source:
GitHub Actions**.

The site uses relative paths, so it works at `https://sjzavala.github.io/portfolio/` or at
the root of a custom domain.

## Layout

```
index.html              the whole site
css/style.css           design tokens in :root; swap --accent / --accent-dark to re-theme
js/main.js              mobile nav, scroll-spy, reveal, QA Lab rendering and replay
lab/results.js          generated test results the QA Lab reads (window.LAB_RESULTS)
e2e/*.spec.js           the Playwright suite, one file per group shown in the lab
scripts/lab-results.mjs JSON report → lab/results.js
assets/                 portrait, favicon
```

## Résumé

The résumé is not published. The nav button and the contact section open an email
request instead, and `cv/` is git-ignored so a PDF dropped there stays local.

## Editing content

Everything is in `index.html`, in section order: hero, focus strip, about, expertise,
QA Lab, principles, experience, selected work, personal projects, approach, contact.
Tests in `e2e/links.spec.js` assert the five project cards and their pipeline order, so
update that spec if you add or reorder projects.
