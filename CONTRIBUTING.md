# Contributing

Published vendors are schema 1.2 YAML files in `data/vendors/`. The field guide is [data/research/schema.md](data/research/schema.md). The page map is [docs/vendor-schema.md](docs/vendor-schema.md).

## Rules

- Do not add a vendor until Nico Dekens has approved it. Set `identity.signoff` to `APPROVED` and `meta.signoff_status` to `approved` only when that approval is real.
- Do not invent facts, scores, customers, or screening results. If a field is unknown, write unknown. If no public customer was found, set `known_customers.status` to `none_publicly_documented`.
- Keep source URLs on the claim they support.
- Jurisdiction and sanctions exposure stays company-level. Do not add employee nationalities or personal contact details.
- Known customers are publicly documented organizations only.
- Do not cite Marktplaats.nl.
- Do not put fictional examples back into `data/vendors/`. Those files stay in `data/examples/` and are not listed.

## Checks

```bash
npm install
npm run validate
npm run dev
```

`npm run validate` expects the approved set in `data/vendors/` and checks sign-off, schema version 1.2, scores, customer status, screening date, and http(s) source URLs.
