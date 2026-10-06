# Vendor schema

Version 1. One vendor is one YAML file in `data/vendors/<slug>.yaml`. Copy [`data/vendors/_template.yaml`](../data/vendors/_template.yaml) and fill it in. A JSON Schema for editors lives at [`data/schema/vendor.schema.json`](../data/schema/vendor.schema.json). The running check is `npm run validate`.

Allowed ids for categories, use cases, customer sectors, evidence types, scores, and sanctions labels live in [`data/taxonomy.yaml`](../data/taxonomy.yaml).

## Claim object

Use this shape wherever a fact needs a source. The key is often `text`, but press items and legal items use `summary` plus the same source fields.

| Field | Required | Notes |
| --- | --- | --- |
| `text` | yes, on claim objects | The statement a reader should see. |
| `source` | yes | `http` or `https` URL. Example profiles must use `example.com`. |
| `source_label` | no | Short link text, such as “Privacy notice”. |
| `accessed` | recommended | `YYYY-MM-DD`. |
| `confidence` | recommended | `high`, `medium`, `low`, or `unverified`. |
| `risk` | on OPSEC and sanctions factors | `low`, `medium`, `high`, or `unknown`. |

A claim that something is absent still needs a source: the page you checked.

## Top-level fields

| Field | Required | Notes |
| --- | --- | --- |
| `schema_version` | yes | `1`. |
| `slug` | yes | Kebab-case. Must match the filename. |
| `name` | yes | Example profiles must start with `Example Vendor`. |
| `example` | yes | `true` only for fictional demonstration files. |
| `owner_approved` | yes | `false` for examples. Real vendors must be `true` before they validate. |
| `status` | yes | `example`, `draft`, `published`, or `vendor-signed-off`. Examples use `example`. Approved profiles use `published` or `vendor-signed-off`. |
| `last_reviewed` | yes | `YYYY-MM-DD`. |
| `reviewed_by` | yes | Who last checked the file. Example files say that no human review was done. |
| `tagline` | yes | One line on cards and the profile header. |
| `summary` | yes | Short overview paragraph. |
| `website` | yes | Claim object. `text` is the URL readers see. |
| `headquarters` | yes | `city`, `country`, `country_code` (ISO alpha-2), plus source fields. |
| `founded_year` | yes | Integer. |
| `categories` | yes | Non-empty list of taxonomy ids. |
| `primary_category` | yes | Must also appear in `categories`. |
| `use_cases` | yes | Non-empty list of taxonomy ids. |
| `company` | yes | 360 overview. See below. |
| `five_w` | yes | `who`, `what`, `where`, `when`, `why`, `how`. Each is a claim. `how` describes delivery, not a collection method. |
| `strengths`, `weaknesses` | yes | Lists of claims. |
| `scores` | yes | `business_transparency`, `financial_health`, `customer_opsec`. |
| `financial` | yes | Funding, investors, revenue signals, stability. |
| `press` | yes | `positive` and `negative` lists. Empty lists are allowed. |
| `social_sentiment` | yes | `tone`, `summary`, `signals`. |
| `opsec` | yes | Customer risk factors. |
| `data_residency` | yes | Regions, GDPR, DPA. |
| `certifications` | yes | List. May be empty. |
| `integrations` | yes | Summary, API, and named items. |
| `legal` | yes | List of regulatory or court items. May be empty. |
| `jurisdiction_sanctions` | yes | Company-level sanctions exposure. See below. |
| `known_customers` | yes | Public organization customers. Use `[]` if none are documented. |
| `use_case_fit` | yes | Fit notes. May be empty. |
| `reviewer_notes` | no | Claim object. |

## Company overview

`company` holds the 360 view: `legal_name`, `ownership`, `founded`, `employees`, `customers`, and `pricing_model` are claims. `products` is a list of `{ name, summary }`.

`company.customers` is the narrative summary. The structured list is `known_customers`. Keep them consistent.

## Scores

Each score object:

```yaml
business_transparency:
  score: 4          # integer 0–5
  summary:          # claim
  evidence:         # list of claims, at least one
```

The same words are used on the site and in the methodology: Unknown, Poor, Limited, Adequate, Strong, Excellent. What those words mean depends on the dimension. Customer OPSEC posture scores the risk to the customer. Higher is a lower residual risk, not a more capable product.

## Jurisdiction and sanctions exposure

Company level only. The validator rejects personal-data keys in this object (for example `person`, `email`, `phone`, `address`, `nationality`).

```yaml
jurisdiction_sanctions:
  risk: low                 # low | medium | high | unknown
  summary:                  # claim
  offices_and_entities:     # claim + risk + countries
    countries: []           # country names where a presence was found
    risk: low
  ownership_ties:           # claim + risk. Entities and roles, not people.
  workforce_signals:        # claim + risk. Aggregate headcount only.
  screening:
    - regime: EU            # EU, UN, OFAC, UK — each exactly once
      result: clear         # clear | potential-match | listed | not-screened | unknown
      screened_on: "2026-10-06"
      text: What was checked, and the result.
      source: https://example.com/vendor-a/sanctions/eu
```

Review-list countries are Russia, Belarus, China, plus any other country relevant under EU, UN, OFAC, or UK sanctions at review time. China is in scope because buyers asked for it. A presence is not the same thing as a listing.

Rules the validator enforces:

- `risk` must be `high` if any screening result is `listed`.
- `risk` cannot be `low` if any factor is medium or high, if a country is listed under offices, or if a screening result is `potential-match`.

The profile page shows `risk` as the sanctions indicator. The comparison table has a sortable Sanctions exposure column and a filter for the same label.

## Known customers and buyers

Public organizations only. Each record:

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Organization name. Example profiles must include “Example” or “Fictional”. |
| `sector` | yes | `law-enforcement`, `government`, `corporate`, `financial-services`, `journalism`, or `other`. |
| `country` | yes | Country of the customer organization. |
| `country_code` | no | ISO alpha-2. |
| `evidence_type` | yes | `case-study`, `government-contract`, `press-release`, or `press-report`. |
| `date` | yes | Date of the public evidence, `YYYY-MM-DD`. |
| `note` | no | One line of context. |
| `source` | yes | URL of the case study, contract notice, release, or article. |
| `source_label`, `accessed`, `confidence` | recommended | Same as other claims. |

Do not record a named individual buyer. A missing sector on the comparison page means no public record was filed, not that the vendor has no customers in that sector.

The comparison view aggregates these records by sector (customer count and vendor count) and can filter the table to vendors with at least one customer in the selected sector. Totals follow the other active filters.

## Other lists

Press item: `title`, `outlet`, `date`, `summary`, plus source fields.

Sentiment signal: `platform` and `observation` (a claim). `tone` is `positive`, `mixed`, `negative`, or `unknown`.

Certification: `name`, `status` (`claimed`, `verified`, `in-progress`, `not-held`, `unknown`), and `detail` (a claim).

Legal item: `title`, `date`, `status` (`none-found`, `open`, `closed`, `judgment`, `settlement`, `unknown`), `summary`, plus source fields.

Use-case fit: `id` from the use-case taxonomy, `fit` (`strong`, `moderate`, `limited`, `poor`, `unknown`), and `note` (a claim).

## Dates

Write dates as `YYYY-MM-DD`. The loader keeps them as strings. Quoting is optional but safe.
