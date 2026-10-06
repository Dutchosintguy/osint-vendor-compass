# OSINT Vendor Compass

Independent, evidence-led comparison of OSINT SaaS vendors. Built for analysts, decision makers, and teams choosing a provider. Maintained by Nico Dekens (Dutchosintguy).

**The vendor profiles in this repository are fictional examples.** They show the format. Real vendors are added only after Nico Dekens approves them. Do not use the example profiles for a buying decision.

The site is static. It loads no analytics, no advertising, and no third-party scripts or fonts.

## Pages

- [Overview](src/index.njk) lists every vendor, with scores, sanctions exposure, and known-buyer sectors.
- [Compare](src/compare.njk) filters and sorts by category, HQ country, scores, use case, sanctions exposure, and customer sector. Sector totals update with the filters.
- [Use cases](src/use-cases.njk) shows fit by job.
- Vendor profiles are generated from one data file each.
- [Methodology](src/methodology.njk) explains the scores, the sanctions label, known customers, and the sign-off process.
- [About](src/about.njk) states the independence and conflict-of-interest rules.

## Repository layout

```
data/vendors/          one YAML file per vendor
data/taxonomy.yaml     categories, use cases, sectors, and other allowed values
data/schema/           JSON Schema for editor support
src/                   Eleventy templates, CSS, and first-party JavaScript
docs/vendor-schema.md  field reference
scripts/               validator
.github/workflows/     GitHub Pages deploy
```

Adding a vendor means adding one file under `data/vendors/`. The site renders a profile page from it. No template edit is required.

## Add a vendor

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/vendor-schema.md](docs/vendor-schema.md).
2. Copy `data/vendors/_template.yaml` to `data/vendors/<slug>.yaml`. The filename must match `slug`.
3. Fill every claim with a source URL and an access date. Use public sources only.
4. Run `npm run validate`. A real vendor fails until `owner_approved: true`.
5. Open a pull request. Nico Dekens sets `owner_approved: true` when the profile is approved.

Do not add a real vendor on your own. Example files must stay obviously fictional and may cite only `example.com`.

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
