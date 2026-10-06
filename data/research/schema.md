# OSINT SaaS Vendor Profile Schema

**Purpose:** Structured vendor pages that give analysts, decision makers, and companies a 360° view of OSINT SaaS providers so they can choose the best fit for their use cases.

**Governance:** Every vendor on the site requires Nico Dekens personal sign-off before publication. This schema is for proposed profiles only until approved.

**Evidence rule:** Prefer primary sources (vendor site, filings, certificates). Cite URL + retrieval date. Flag claims that are marketing-only vs independently corroborated. Never use or cite Marktplaats.nl.

---

## Scoring approach (site-wide)

Use a dual system so scores are transparent and comparable:

1. **Dimension scores (0–5)** for each major section below, with written rationale and evidence links.
2. **Use-case fit scores (0–5)** per persona (e.g. LE investigator, corporate SOC, brand/PR, due diligence, GEOINT analyst) — not a single “best overall” rank.
3. **Confidence badge** per score: *High* (primary docs), *Medium* (reputable secondary), *Low* (vendor claims only / outdated).
4. **Red-flag count** (binary checklist items that fire independently of the numeric score — e.g. active regulatory action, unexplained ownership opacity, known OPSEC incidents).
5. **Freshness:** every scored field shows “last verified” date; scores auto-decay visually after 90 days without re-check.

Optional aggregate: **Fit Index** = weighted average of dimension scores × use-case weights chosen by the visitor (weights editable on the page). Do not present a universal #1 ranking.

---

## Core sections (required on every vendor page)

### 1. 360° company overview
| Field | What to capture | Public sources / evidence |
| --- | --- | --- |
| Legal name & trade names | Registered entity vs brand | Company registry (KvK, Companies House, SEC, etc.), About/Legal pages |
| Founded year | Year + founding story if material | About page, press, Crunchbase/PitchBook summaries |
| HQ country & offices | Primary HQ + major hubs | Contact pages, registries, LinkedIn company page |
| Ownership type | Private / public / PE-backed / subsidiary | Filings, press releases, investor pages |
| Parent / subsidiaries | Group structure | Annual reports, acquisition press |
| Headcount (band) | e.g. 11–50, 51–200, 201–1000, 1000+ | LinkedIn, filings, About |
| Customer segments | LE/gov, enterprise SOC, MSSP, journalism, etc. | Case studies, Gartner/Forrester mentions, customer logos (note if claimed) |
| Primary product(s) | Named platforms/modules | Product pages |
| Deployment model | SaaS / hybrid / on-prem / air-gapped options | Docs, RFPs, security whitepapers |
| Notable status | Acquired, renamed, rebranded, shut down modules | Press, Wayback, SEC 8-K |

**Score inputs:** completeness of public identity, clarity of product scope, stability of corporate entity.

---

### 2. 5W1H analysis
| Lens | Fields | Sources / evidence |
| --- | --- | --- |
| **Who** | Who builds it; who buys it; who operates/supports it; key executives | About, leadership bios, LinkedIn, hiring pages |
| **What** | What data types & capabilities (SOCMINT, people, dark web, GEOINT, etc.) | Product docs, API docs, datasheets |
| **Where** | Where data is collected from; where processed/stored (regions); where sold | Data residency docs, privacy policy, sales regions |
| **When** | Founded; major releases; acquisition dates; last major methodology update | Changelog, blog, press |
| **Why** | Stated mission; problem they claim to solve; buyer pain | Homepage positioning, investor narrative |
| **How** | Collection methods (API, crawl, partnership, human); enrichment; delivery (UI/API/alerts) | Methodology pages, trust center, technical blogs |

**Score inputs:** clarity and honesty of 5W1H answers; gaps marked explicitly as “unknown.”

---

### 3. Strengths and weaknesses
| Field | Guidance | Sources |
| --- | --- | --- |
| Strengths (3–7 bullets) | Capability depth, coverage, UX, integrations, niche leadership | Independent reviews, analyst reports, customer case studies, hands-on demos |
| Weaknesses (3–7 bullets) | Gaps, pricing opacity, learning curve, coverage holes, lock-in | Same + G2/Capterra themes, comparison articles, RFIs |
| Best-fit scenarios | Short list of situations where vendor excels | Derived from strengths |
| Poor-fit scenarios | When not to buy | Derived from weaknesses |
| Alternatives often shortlisted | 2–4 peers | Market comps |

**Score inputs:** balance of evidence (not marketing copy); adversarial review if available.

---

### 4. Business transparency
| Field | Sources |
| --- | --- |
| Public pricing / starting price / quote-only | Pricing page, G2, reseller listings |
| Contract norms (annual, seat, usage, data credits) | Sales sheets, public RFP responses |
| Terms of service & AUP highlights | ToS, AUP |
| Privacy policy quality (DPA available? subprocessors listed?) | Privacy policy, trust center |
| Third-party audit reports available on request | SOC 2 / ISO claims vs published reports |
| Lobbying / political contributions (if material) | OpenSecrets, EU Transparency Register |
| Media / analyst engagement | Press room activity, briefings |

**Score inputs:** how much a buyer can learn without an NDA.

---

### 5. Financial health
| Field | Sources |
| --- | --- |
| Funding stage / last round / notable investors | Crunchbase, press, PitchBook (summarize, don’t scrape paywalled) |
| Public financials (if listed) | SEC, annual reports |
| Revenue estimates (band only; label confidence) | Secondary research with citation |
| Burn / runway signals (hiring freeze, layoffs, office closures) | Layoff trackers, press, LinkedIn headcount trend |
| Acquisition / PE ownership implications | Deal press |
| Credit / lawsuit financial risk flags | Court dockets, bankruptcy notices |

**Score inputs:** stability signals for multi-year contracts; PE flip risk called out when relevant.  
**Caveat:** many vendors are private — mark “insufficient public data” rather than inventing numbers.

---

### 6. Press and social media sentiment
| Field | Sources |
| --- | --- |
| Positive press (with links + dates) | Major outlets, trade press |
| Negative press / controversies | Same + investigative journalism |
| Social sentiment snapshot | LinkedIn, X/Twitter, Reddit r/OSINT (qualitative themes, not fake precision) |
| Awards / rankings | Analyst reports, industry awards (note if paid) |
| Customer review themes | G2, Capterra, PeerSpot (n= sample size) |

**Score inputs:** ratio and severity of negative coverage; distinguish product criticism vs ethical/legal scandals.

---

### 7. OPSEC risks (for customers using the tool)
| Field | Why it matters | Sources |
| --- | --- | --- |
| Query / search logging by vendor | Can investigations be reconstructed or subpoenaed? | Privacy policy, DPA, trust docs |
| Attribution of crawlers / API keys to customer | Does use leak investigator identity to targets? | Technical docs, community reports |
| Browser extension / desktop client risks | Credential theft, fingerprinting | Extension permissions, malware reports |
| Data retention of search subjects | How long PII of *targets* is kept | Privacy policy |
| Staff access to customer queries | Insider risk | SOC reports, security FAQ |
| Jurisdiction / LE access risk | Mutual legal assistance, CLOUD Act, local law | HQ country, hosting regions |
| Shared IP / infrastructure fingerprint | Blocklists, honeypots | Practitioner write-ups |
| Incident history (breaches of the vendor) | Vendor as attack surface | Have I Been Pwned for vendor domains, breach notices |
| Recommended OPSEC controls | VPN, dedicated accounts, need-to-know, on-prem options | Vendor hardening guides + independent advice |

**Score inputs:** lower risk = strong unattributed collection options, short retention, clear access controls, transparent incident history.

---

## Suggested additional sections / site features (Nico may not have listed)

1. **Data sourcing ethics & legality** — Whether collection stays within ToS/law (no credential stuffing, no illicit market purchases framed as “OSINT”); critical for EU buyers and court-admissible evidence.  
2. **GDPR / data residency & transfer mechanisms** — EU SCCs, UK IDTA, Swiss transfers, residency options (EU-only cloud); decisive for Dutch/EU procurement.  
3. **Pricing transparency & TCO model** — Seat vs credit vs data-pack costs, overage traps, training fees; prevents post-POC sticker shock.  
4. **Ownership, investors & state-adjacent ties** — PE roll-ups, sovereign wealth, sanctioned jurisdictions, dual-use export controls; trust and supply-chain risk.  
5. **Security certifications & trust center** — SOC 2 Type II, ISO 27001, FedRAMP/IL, Cyber Essentials; baseline for enterprise/gov RFPs.  
6. **API, integrations & export formats** — SIEM/SOAR, Maltego transforms, STIX/TAXII, CSV/JSON; determines workflow fit.  
7. **Use-case fit matrix** — Interactive scoring by persona (fraud, CTI, brand, LE, KYC, GEOINT); turns a catalog into a decision tool.  
8. **Customer reviews & referenceability** — Verified logos, case studies, willingness to provide EU references; reduces vendor vaporware.  
9. **Legal / regulatory actions & sanctions screening** — Ongoing litigation, GDPR fines, export violations; hard stop for many buyers.  
10. **Update cadence & public methodology page** — How often sources/models refresh; reproducibility for analysts and auditors.  
11. **Conflict-of-interest & editorial disclosure** — Site funding, affiliate links, sponsored rankings; protects the comparison site’s credibility.  
12. **Training, certification & partner ecosystem** — Onboarding burden and local (NL/EU) partners; affects time-to-value.  
13. **Evidence & chain-of-custody features** — Hashing, audit logs, export for court; essential for LE and compliance investigations.  
14. **Language / regional coverage** — CJK, Arabic, RU, NL sources; global vs Western-web bias.  
15. **Vendor lock-in & exit / data portability** — Can you export cases and cancel cleanly?; multi-year risk control.

---

## Recommended page chrome (cross-cutting UI)

- **Sign-off status banner:** Proposed | Under review | Approved by Nico | Deprecated  
- **Last verified date** + “Report a correction”  
- **Compare drawer:** select 2–4 vendors side-by-side on chosen dimensions  
- **Glossary** for OSINT terms (SOCMINT, EASM, DRP, etc.)  
- **Sources appendix** on every page (full citation list)

---

## Field completeness checklist (editor)

Before requesting Nico’s sign-off, a draft profile should have:

- [ ] Official website verified live  
- [ ] HQ country confirmed from ≥1 primary or strong secondary source  
- [ ] Category + one-line description  
- [ ] At least one strength and one weakness with citations  
- [ ] OPSEC section started (even if “unknown — needs inquiry”)  
- [ ] Ownership / acquisition note if applicable  
- [ ] No Marktplaats.nl citations  
- [ ] Explicit “Proposed — awaiting Nico sign-off” status

---

## Jurisdiction & sanctions exposure (required under OPSEC / ownership) — schema v1.1

**Scope: company-level only.** Do not list or name individual employees by nationality.

| Field | What to capture | Sources |
| --- | --- | --- |
| Offices / R&D / subsidiaries in sanctioned countries | Presence in Russia, Belarus, China, Iran, DPRK, Syria, Cuba (and analogous sanctioned jurisdictions) | About/contact, registries, filings |
| Ownership / investor / leadership ties (entity-level) | Documented company or controlling-owner ties to those countries — not personal nationality lists | Filings, press, ownership disclosures |
| Workforce location signals (aggregate) | LinkedIn company location breakdowns, job-posting geographies described in aggregate | LinkedIn company page, careers pages |
| Sanctions screening | Screen legal name + key owning entities against EU, UN, OFAC SDN, UK lists; record result + date | Official list search portals |

Every claim needs a source URL. Mark `unknown` when unclear. Re-screen before procurement; AI review is not legal advice.

---

## Known customers / buyers (required) — schema v1.2

**Only publicly documented customers.** Never infer from speculation, employee LinkedIn, or “trusted by thousands” marketing without named logos/case studies.

| Field | Required |
| --- | --- |
| customer_name | Exact public name |
| sector | law_enforcement / defense / government / corporate / ngo / media / academia / other |
| country | Customer country if stated; else unknown |
| evidence_type | case_study / logo_page / procurement_record / press_release / credible_press / conference_talk |
| date | YYYY-MM-DD or YYYY or unknown |
| source_url | URL of the evidence |

If none found after reasonable search: `status: none_publicly_documented` with notes on what was checked.
