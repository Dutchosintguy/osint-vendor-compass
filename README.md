# OSINT Vendor Compass

Independent, evidence-led comparison of OSINT SaaS vendors. Built for analysts, decision makers, and teams choosing a provider. Maintained by Nico Dekens (Dutchosintguy).

The listed profiles are the approved schema 1.2 research set in `data/vendors/`. Fictional examples remain in `data/examples/` and are not published. Do not treat a screening line as a legal clearance.

The site is static. It loads no analytics, no advertising, and no third-party scripts or fonts.

## Pages

- [Overview](src/index.njk) lists every vendor, with scores, sanctions exposure, and known-buyer sectors.
- [Compare](src/compare.njk) filters and sorts by category, HQ country, scores, sanctions screening, red flags, and customer sector. Sector totals update with the filters.
- [Use cases](src/use-cases.njk) shows fit by job.
- Vendor profiles are generated from one data file each.
- [Methodology](src/methodology.njk) explains the scores, the sanctions label, known customers, and the sign-off process.
- [About](src/about.njk) states the independence and conflict-of-interest rules.

## Repository layout

```
data/vendors/          approved schema 1.2 profiles, one file each
data/examples/         fictional samples, not listed on the site
data/research/         schema 1.2 guide, index, and longlist from the import
src/                   Eleventy templates, CSS, and first-party JavaScript
docs/vendor-schema.md  how the site maps the research schema
scripts/               validator
.github/workflows/     GitHub Pages deploy
```

Adding a vendor means adding one file under `data/vendors/`. The site renders a profile page from it. No template edit is required.

## Add a vendor

1. Read [CONTRIBUTING.md](CONTRIBUTING.md), [docs/vendor-schema.md](docs/vendor-schema.md), and [data/research/schema.md](data/research/schema.md).
2. Add `data/vendors/<slug>.yaml` using schema 1.2. The filename must match `meta.slug`.
3. Keep every source URL on its claim. Leave unknown fields as unknown.
4. Run `npm run validate`. Publication requires `identity.signoff: APPROVED` and `meta.signoff_status: approved`.
5. Open a pull request. Do not mark a file approved unless Nico Dekens has approved that vendor.

The import index, longlist, and schema notes are in `data/research/`.

## Develop locally

Requires Node.js 20 or newer.

```bash
npm install
npm run validate
npm run dev
```

`npm run dev` serves the site at `http://localhost:8080`. `npm run build` writes `_site/`.

## Deploy on GitHub Pages

The workflow in `.github/workflows/pages.yml` validates the vendor files, builds the site, and deploys on every push to `main`. Pull requests are validated and built, and are not deployed.

GitHub does not always enable Pages from the repository files alone. Turn it on once:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

After the first successful run on `main`, the site is published at:

`https://dutchosintguy.github.io/osint-vendor-compass/`

Project sites are served from `/<repository-name>/`. The workflow sets `BASE_PATH` to that path. For a custom domain, or if this repository is renamed to a user site (`<user>.github.io`), set `BASE_PATH` to `/` in the workflow and push again.

## Privacy

No cookies, no accounts, and no third-party requests. The theme button stores `theme` in `localStorage` on the visitor’s own browser.
