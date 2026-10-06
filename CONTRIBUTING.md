# Contributing

Vendor profiles are data, not page templates. One YAML file in `data/vendors/` becomes one profile. The field reference is [docs/vendor-schema.md](docs/vendor-schema.md). The scoring and sign-off rules are on the methodology page (`src/methodology.njk`).

## Rules

- Do not add a real company until Nico Dekens has agreed it is in scope and has set `owner_approved: true`.
- The two shipped profiles, Example Vendor A and Example Vendor B, are fictional. Keep them fictional. Do not replace them with real research.
- Example profiles must be named `Example Vendor …`, must set `example: true`, `owner_approved: false`, and `status: example`, and every source URL must use `example.com`.
- Cite a public URL for every claim, including a claim that something was not found. Record the access date.
- Jurisdiction and sanctions exposure is company-level only. Do not record named employees, personal contact details, or individual locations.
- Known customers are organizations named in a public source. Do not add a private individual, and do not paste a confidential client list.
- Do not add analytics, embedded third-party widgets, or remote fonts.

## Add a vendor file

1. Copy [`data/vendors/_template.yaml`](data/vendors/_template.yaml) to `data/vendors/<slug>.yaml`.
2. `slug` is lowercase kebab-case. The filename must be `<slug>.yaml`.
3. Set `schema_version: 1`.
4. Use ids from [`data/taxonomy.yaml`](data/taxonomy.yaml) for categories, use cases, sectors, evidence types, and screening regimes. Add a new id there first if the vocabulary is missing. Do not invent an id in the vendor file.
5. For a real vendor, leave `owner_approved: false` and `status: draft` in the pull request. The validator will fail on purpose until the owner changes `owner_approved` to `true` and `status` to `published` or `vendor-signed-off`.
6. Run:

```bash
npm install
npm run validate
npm run dev
```

7. Open a pull request that contains only that vendor file, plus a taxonomy change if you added a vocabulary id. Describe the sources you used.

## What the validator checks

`npm run validate` reads every `data/vendors/*.yaml` file except names that start with `_`. It checks required sections, allowed ids, score ranges, source URLs, screening regimes (EU, UN, OFAC, UK), and the approval gate.

It also rejects personal-data fields inside `jurisdiction_sanctions` and `known_customers`, and it rejects an example profile whose customer names are not obviously fictional.

## Review

The owner review and the optional vendor sign-off are described in the methodology. Sign-off is a factual check. It does not transfer editorial control and it does not change a score by itself.
