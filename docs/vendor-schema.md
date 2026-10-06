# Vendor schema

Published profiles use research schema **1.2**. The field guide shipped with the approved files is [`data/research/schema.md`](../data/research/schema.md).

The site renders that structure. It does not drop sections to fit the earlier example schema. Each profile page shows:

- 360 overview, 5W1H, strengths and weaknesses
- transparency, financial health, press and sentiment, OPSEC
- jurisdiction and sanctions exposure, including screening lines, dates, and any recorded list strings
- known customers, or `none_publicly_documented`
- red flags, gaps, ethics, residency, certifications, legal actions, API notes, and use-case fit
- every stored http(s) source next to its claim, and again in the source list
- `meta.last_reviewed`

A file is published from `data/vendors/<slug>.yaml` only when sign-off is approved. `npm run validate` checks that gate for the 37 approved files.

Fictional samples used to design the first version are in `data/examples/` and are not listed.

`data/research/` also keeps `index.yaml`, `index.md`, and `longlist.csv` from the approved import.
