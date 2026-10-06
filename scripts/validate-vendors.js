#!/usr/bin/env node
/**
 * Validates data/vendors/*.yaml against the project schema.
 * Files that start with "_" are templates and are skipped.
 *
 * Real vendors fail this check until owner_approved is true.
 * Example vendors must stay obviously fictional and cite only example.com.
 */

const { loadTaxonomy, loadVendorFiles } = require("../lib/vendor-files");

const taxonomy = loadTaxonomy();
const idSet = (items) => new Set(items.map((item) => item.id));

const categories = idSet(taxonomy.categories);
const useCases = idSet(taxonomy.use_cases);
const fitLevels = idSet(taxonomy.fit_levels);
const riskLevels = idSet(taxonomy.risk_levels);
const confidenceLevels = idSet(taxonomy.confidence_levels);
const statuses = idSet(taxonomy.statuses);
const certificationStatuses = idSet(taxonomy.certification_statuses);
const legalStatuses = idSet(taxonomy.legal_statuses);
const screeningResults = idSet(taxonomy.screening_results);
const screeningRegimes = taxonomy.screening_regimes.map((item) => item.id);
const sentimentTones = idSet(taxonomy.sentiment_tones);
const sanctionsRisks = idSet(taxonomy.sanctions_risks);
const customerSectors = idSet(taxonomy.customer_sectors);
const customerEvidence = idSet(taxonomy.customer_evidence_types);

const BANNED_SANCTIONS_KEYS = new Set([
  "person",
  "persons",
  "individual",
  "individuals",
  "employee",
  "employees",
  "employee_name",
  "personal_data",
  "personal_email",
  "email",
  "phone",
  "address",
  "date_of_birth",
  "dob",
  "nationality",
  "passport",
  "first_name",
  "last_name",
]);

function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isHttpUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function checkSourceFields(obj, path, errors, options = {}) {
  if (!isHttpUrl(obj.source)) {
    errors.push(`${path}.source must be an http(s) URL`);
  } else if (options.exampleHostOnly) {
    const host = new URL(obj.source).hostname.replace(/^www\./, "");
    if (host !== "example.com") {
      errors.push(
        `${path}.source must use example.com while the vendor is marked as an example`
      );
    }
  }
  if (obj.source_label != null && typeof obj.source_label !== "string") {
    errors.push(`${path}.source_label must be a string`);
  }
  if (obj.accessed != null && !isDate(obj.accessed)) {
    errors.push(`${path}.accessed must be a real YYYY-MM-DD date`);
  }
  if (obj.confidence != null && !confidenceLevels.has(obj.confidence)) {
    errors.push(
      `${path}.confidence must be one of: ${[...confidenceLevels].join(", ")}`
    );
  }
}

function checkCited(obj, path, errors, options = {}) {
  const { required = true, allowRisk = false } = options;
  if (obj == null) {
    if (required) errors.push(`${path} is required`);
    return;
  }
  if (typeof obj !== "object" || Array.isArray(obj)) {
    errors.push(`${path} must be a claim object with text and source`);
    return;
  }
  if (typeof obj.text !== "string" || obj.text.trim() === "") {
    errors.push(`${path}.text must be a non-empty string`);
  }
  checkSourceFields(obj, path, errors, options);
  if (allowRisk && !riskLevels.has(obj.risk)) {
    errors.push(`${path}.risk must be one of: ${[...riskLevels].join(", ")}`);
  }
}

function checkString(obj, path, errors) {
  if (typeof obj !== "string" || obj.trim() === "") {
    errors.push(`${path} must be a non-empty string`);
  }
}

function walkBannedKeys(node, path, errors) {
  if (!node || typeof node !== "object") return;
  const entries = Array.isArray(node) ? node.entries() : Object.entries(node);
  for (const [key, value] of entries) {
    const label = Array.isArray(node) ? `${path}[${key}]` : `${path}.${key}`;
    if (!Array.isArray(node) && BANNED_SANCTIONS_KEYS.has(String(key))) {
      errors.push(
        `${label} is not allowed. Jurisdiction & sanctions exposure is company-level only. Do not record individual employees or personal data.`
      );
    }
    walkBannedKeys(value, label, errors);
  }
}

function validateVendor(file, data) {
  const errors = [];
  const where = file;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return [`${where}: file must contain a YAML mapping`];
  }

  const fail = (message) => errors.push(`${where}: ${message}`);

  if (data.schema_version !== 1) fail("schema_version must be 1");

  checkString(data.slug, "slug", errors);
  if (typeof data.slug === "string") {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      fail("slug must be lowercase kebab-case");
    }
    if (file !== `${data.slug}.yaml`) {
      fail(`filename must be ${data.slug}.yaml`);
    }
  }

  checkString(data.name, "name", errors);
  checkString(data.tagline, "tagline", errors);
  checkString(data.summary, "summary", errors);

  if (typeof data.example !== "boolean") fail("example must be true or false");
  if (typeof data.owner_approved !== "boolean") {
    fail("owner_approved must be true or false");
  }

  const example = data.example === true;
  const hostOnly = example;

  if (example) {
    if (!String(data.name || "").startsWith("Example Vendor")) {
      fail('example vendors must be named "Example Vendor …"');
    }
    if (data.owner_approved !== false) {
      fail("example vendors must set owner_approved to false");
    }
    if (data.status !== "example") fail('example vendors must set status to "example"');
  } else {
    if (String(data.name || "").startsWith("Example Vendor")) {
      fail('real vendors must not use an "Example Vendor" name');
    }
    if (data.owner_approved !== true) {
      fail(
        "real vendors require owner_approved: true. Nico Dekens must approve the profile before it is added."
      );
    }
    if (!["published", "vendor-signed-off"].includes(data.status)) {
      fail("approved vendors must use status published or vendor-signed-off");
    }
    checkString(data.reviewed_by, "reviewed_by", errors);
  }

  if (!statuses.has(data.status)) {
    fail(`status must be one of: ${[...statuses].join(", ")}`);
  }
  if (!isDate(data.last_reviewed)) fail("last_reviewed must be a real YYYY-MM-DD date");
  checkString(data.reviewed_by, "reviewed_by", errors);

  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    fail("categories must be a non-empty list of taxonomy ids");
  } else {
    data.categories.forEach((id) => {
      if (!categories.has(id)) fail(`unknown category "${id}"`);
    });
  }
  if (!categories.has(data.primary_category)) fail("primary_category is not in the taxonomy");
  if (Array.isArray(data.categories) && !data.categories.includes(data.primary_category)) {
    fail("primary_category must also be listed in categories");
  }

  if (!Array.isArray(data.use_cases) || data.use_cases.length === 0) {
    fail("use_cases must be a non-empty list of taxonomy ids");
  } else {
    data.use_cases.forEach((id) => {
      if (!useCases.has(id)) fail(`unknown use case "${id}"`);
    });
  }

  if (!Number.isInteger(data.founded_year) || data.founded_year < 1900 || data.founded_year > 2100) {
    fail("founded_year must be a four-digit year");
  }

  const hq = data.headquarters;
  if (!hq || typeof hq !== "object") {
    fail("headquarters is required");
  } else {
    checkString(hq.city, "headquarters.city", errors);
    checkString(hq.country, "headquarters.country", errors);
    if (typeof hq.country_code !== "string" || !/^[A-Z]{2}$/.test(hq.country_code)) {
      fail("headquarters.country_code must be an ISO alpha-2 code");
    }
    checkSourceFields(hq, "headquarters", errors, { exampleHostOnly: hostOnly });
  }

  checkCited(data.website, "website", errors, { exampleHostOnly: hostOnly });

  const company = data.company || {};
  ["legal_name", "ownership", "founded", "employees", "customers", "pricing_model"].forEach(
    (key) => checkCited(company[key], `company.${key}`, errors, { exampleHostOnly: hostOnly })
  );
  if (!Array.isArray(company.products) || company.products.length === 0) {
    fail("company.products must list at least one product");
  } else {
    company.products.forEach((product, index) => {
      checkString(product && product.name, `company.products[${index}].name`, errors);
      checkCited(product && product.summary, `company.products[${index}].summary`, errors, {
        exampleHostOnly: hostOnly,
      });
    });
  }

  ["who", "what", "where", "when", "why", "how"].forEach((key) => {
    checkCited(data.five_w && data.five_w[key], `five_w.${key}`, errors, {
      exampleHostOnly: hostOnly,
    });
  });

  ["strengths", "weaknesses"].forEach((key) => {
    if (!Array.isArray(data[key]) || data[key].length === 0) {
      fail(`${key} must contain at least one cited claim`);
    } else {
      data[key].forEach((item, index) =>
        checkCited(item, `${key}[${index}]`, errors, { exampleHostOnly: hostOnly })
      );
    }
  });

  ["business_transparency", "financial_health", "customer_opsec"].forEach((key) => {
    const score = data.scores && data.scores[key];
    if (!score) {
      fail(`scores.${key} is required`);
      return;
    }
    if (!Number.isInteger(score.score) || score.score < 0 || score.score > 5) {
      fail(`scores.${key}.score must be an integer from 0 to 5`);
    }
    checkCited(score.summary, `scores.${key}.summary`, errors, { exampleHostOnly: hostOnly });
    if (!Array.isArray(score.evidence) || score.evidence.length === 0) {
      fail(`scores.${key}.evidence must contain at least one cited claim`);
    } else {
      score.evidence.forEach((item, index) =>
        checkCited(item, `scores.${key}.evidence[${index}]`, errors, {
          exampleHostOnly: hostOnly,
        })
      );
    }
  });

  const financial = data.financial || {};
  ["funding", "revenue_signals", "stability"].forEach((key) =>
    checkCited(financial[key], `financial.${key}`, errors, { exampleHostOnly: hostOnly })
  );
  if (!Array.isArray(financial.investors)) {
    fail("financial.investors must be a list (use [] if none are recorded)");
  } else {
    financial.investors.forEach((investor, index) => {
      checkString(investor && investor.name, `financial.investors[${index}].name`, errors);
      checkCited(investor && investor.detail, `financial.investors[${index}].detail`, errors, {
        exampleHostOnly: hostOnly,
      });
    });
  }

  const press = data.press || {};
  ["positive", "negative"].forEach((key) => {
    if (!Array.isArray(press[key])) {
      fail(`press.${key} must be a list`);
      return;
    }
    press[key].forEach((item, index) => {
      const path = `press.${key}[${index}]`;
      if (!item || typeof item !== "object") {
        fail(`${path} must be an object`);
        return;
      }
      checkString(item.title, `${path}.title`, errors);
      checkString(item.outlet, `${path}.outlet`, errors);
      checkString(item.summary, `${path}.summary`, errors);
      if (!isDate(item.date)) fail(`${path}.date must be a real YYYY-MM-DD date`);
      checkSourceFields(item, path, errors, { exampleHostOnly: hostOnly });
    });
  });

  const sentiment = data.social_sentiment || {};
  if (!sentimentTones.has(sentiment.tone)) {
    fail(`social_sentiment.tone must be one of: ${[...sentimentTones].join(", ")}`);
  }
  checkCited(sentiment.summary, "social_sentiment.summary", errors, { exampleHostOnly: hostOnly });
  if (!Array.isArray(sentiment.signals)) {
    fail("social_sentiment.signals must be a list");
  } else {
    sentiment.signals.forEach((signal, index) => {
      checkString(signal && signal.platform, `social_sentiment.signals[${index}].platform`, errors);
      checkCited(signal && signal.observation, `social_sentiment.signals[${index}].observation`, errors, {
        exampleHostOnly: hostOnly,
      });
    });
  }

  const opsec = data.opsec || {};
  checkCited(opsec.summary, "opsec.summary", errors, { exampleHostOnly: hostOnly });
  ["data_retention", "query_logging", "jurisdiction", "ownership_state_links", "third_party_sharing"].forEach(
    (key) => checkCited(opsec[key], `opsec.${key}`, errors, { allowRisk: true, exampleHostOnly: hostOnly })
  );

  const residency = data.data_residency || {};
  checkCited(residency.summary, "data_residency.summary", errors, { exampleHostOnly: hostOnly });
  checkCited(residency.gdpr, "data_residency.gdpr", errors, { exampleHostOnly: hostOnly });
  checkCited(residency.dpa, "data_residency.dpa", errors, { exampleHostOnly: hostOnly });
  if (!Array.isArray(residency.regions)) fail("data_residency.regions must be a list");

  if (!Array.isArray(data.certifications)) {
    fail("certifications must be a list");
  } else {
    data.certifications.forEach((item, index) => {
      checkString(item && item.name, `certifications[${index}].name`, errors);
      if (!item || !certificationStatuses.has(item.status)) {
        fail(
          `certifications[${index}].status must be one of: ${[...certificationStatuses].join(", ")}`
        );
      }
      checkCited(item && item.detail, `certifications[${index}].detail`, errors, {
        exampleHostOnly: hostOnly,
      });
    });
  }

  const integrations = data.integrations || {};
  checkCited(integrations.summary, "integrations.summary", errors, { exampleHostOnly: hostOnly });
  checkCited(integrations.api, "integrations.api", errors, { exampleHostOnly: hostOnly });
  if (!Array.isArray(integrations.items)) {
    fail("integrations.items must be a list");
  } else {
    integrations.items.forEach((item, index) => {
      checkString(item && item.name, `integrations.items[${index}].name`, errors);
      checkCited(item && item.detail, `integrations.items[${index}].detail`, errors, {
        exampleHostOnly: hostOnly,
      });
    });
  }

  if (!Array.isArray(data.legal)) {
    fail("legal must be a list");
  } else {
    data.legal.forEach((item, index) => {
      const path = `legal[${index}]`;
      checkString(item && item.title, `${path}.title`, errors);
      checkString(item && item.summary, `${path}.summary`, errors);
      if (!item || !isDate(item.date)) fail(`${path}.date must be a real YYYY-MM-DD date`);
      if (!item || !legalStatuses.has(item.status)) {
        fail(`${path}.status must be one of: ${[...legalStatuses].join(", ")}`);
      }
      checkSourceFields(item, path, errors, { exampleHostOnly: hostOnly });
    });
  }

  if (!Array.isArray(data.use_case_fit)) {
    fail("use_case_fit must be a list");
  } else {
    data.use_case_fit.forEach((item, index) => {
      const path = `use_case_fit[${index}]`;
      if (!item || !useCases.has(item.id)) fail(`${path}.id is not a known use case`);
      if (!item || !fitLevels.has(item.fit)) {
        fail(`${path}.fit must be one of: ${[...fitLevels].join(", ")}`);
      }
      checkCited(item && item.note, `${path}.note`, errors, { exampleHostOnly: hostOnly });
    });
  }

  validateSanctions(data.jurisdiction_sanctions, hostOnly, fail, errors);
  validateCustomers(data.known_customers, example, hostOnly, fail, errors);

  if (data.reviewer_notes != null) {
    checkCited(data.reviewer_notes, "reviewer_notes", errors, { exampleHostOnly: hostOnly });
  }

  return errors.map((message) => (message.startsWith(`${where}:`) ? message : `${where}: ${message}`));
}

function validateSanctions(block, hostOnly, fail, errors) {
  if (!block || typeof block !== "object") {
    fail("jurisdiction_sanctions is required");
    return;
  }

  walkBannedKeys(block, "jurisdiction_sanctions", errors);

  if (!sanctionsRisks.has(block.risk)) {
    fail(`jurisdiction_sanctions.risk must be one of: ${[...sanctionsRisks].join(", ")}`);
  }
  checkCited(block.summary, "jurisdiction_sanctions.summary", errors, { exampleHostOnly: hostOnly });

  const offices = block.offices_and_entities;
  checkCited(offices, "jurisdiction_sanctions.offices_and_entities", errors, {
    allowRisk: true,
    exampleHostOnly: hostOnly,
  });
  if (!offices || !Array.isArray(offices.countries)) {
    fail("jurisdiction_sanctions.offices_and_entities.countries must be a list (use [] if none)");
  } else {
    offices.countries.forEach((country, index) => {
      if (typeof country !== "string" || country.trim() === "") {
        fail(`jurisdiction_sanctions.offices_and_entities.countries[${index}] must be a country name`);
      }
    });
    if (offices.countries.length > 0 && offices.risk === "low") {
      fail(
        "offices_and_entities.risk cannot be low when a review-list country is recorded"
      );
    }
  }

  checkCited(block.ownership_ties, "jurisdiction_sanctions.ownership_ties", errors, {
    allowRisk: true,
    exampleHostOnly: hostOnly,
  });
  checkCited(block.workforce_signals, "jurisdiction_sanctions.workforce_signals", errors, {
    allowRisk: true,
    exampleHostOnly: hostOnly,
  });

  if (!Array.isArray(block.screening)) {
    fail("jurisdiction_sanctions.screening must list EU, UN, OFAC, and UK");
    return;
  }

  const seen = new Set();
  block.screening.forEach((item, index) => {
    const path = `jurisdiction_sanctions.screening[${index}]`;
    if (!item || !screeningRegimes.includes(item.regime)) {
      fail(`${path}.regime must be one of: ${screeningRegimes.join(", ")}`);
    } else if (seen.has(item.regime)) {
      fail(`${path}.regime ${item.regime} is duplicated`);
    } else {
      seen.add(item.regime);
    }
    if (!item || !screeningResults.has(item.result)) {
      fail(
        `${path}.result must be one of: ${[...screeningResults].join(", ")}`
      );
    }
    if (!item || !isDate(item.screened_on)) {
      fail(`${path}.screened_on must be a real YYYY-MM-DD date`);
    }
    checkCited(item, path, errors, { exampleHostOnly: hostOnly });
  });

  screeningRegimes.forEach((regime) => {
    if (!seen.has(regime)) fail(`jurisdiction_sanctions.screening is missing ${regime}`);
  });

  const results = (block.screening || []).map((item) => item && item.result);
  if (results.includes("listed") && block.risk !== "high") {
    fail("jurisdiction_sanctions.risk must be high when a screening result is listed");
  }
  if (results.includes("potential-match") && block.risk === "low") {
    fail("jurisdiction_sanctions.risk cannot be low when a screening result is a potential match");
  }

  const factorRisks = [
    offices && offices.risk,
    block.ownership_ties && block.ownership_ties.risk,
    block.workforce_signals && block.workforce_signals.risk,
  ];
  if (factorRisks.some((risk) => risk === "medium" || risk === "high") && block.risk === "low") {
    fail(
      "jurisdiction_sanctions.risk cannot be low when an offices, ownership, or workforce factor is medium or high"
    );
  }
}

function validateCustomers(list, example, hostOnly, fail, errors) {
  if (!Array.isArray(list)) {
    fail("known_customers must be a list of organizations (use [] if none are public)");
    return;
  }
  if (example && list.length === 0) {
    fail("example vendors must include at least one fictional known customer");
  }

  const seen = new Set();
  list.forEach((item, index) => {
    const path = `known_customers[${index}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      fail(`${path} must be an object`);
      return;
    }
    walkBannedKeys(item, path, errors);
    checkString(item.name, `${path}.name`, errors);
    checkString(item.country, `${path}.country`, errors);
    if (item.country_code != null && !/^[A-Z]{2}$/.test(item.country_code)) {
      fail(`${path}.country_code must be an ISO alpha-2 code`);
    }
    if (!customerSectors.has(item.sector)) {
      fail(`${path}.sector must be one of: ${[...customerSectors].join(", ")}`);
    }
    if (!customerEvidence.has(item.evidence_type)) {
      fail(`${path}.evidence_type must be one of: ${[...customerEvidence].join(", ")}`);
    }
    if (!isDate(item.date)) fail(`${path}.date must be a real YYYY-MM-DD date`);
    if (item.note != null && (typeof item.note !== "string" || item.note.trim() === "")) {
      fail(`${path}.note must be a non-empty string when present`);
    }
    checkSourceFields(item, path, errors, { exampleHostOnly: hostOnly });
    if (example && typeof item.name === "string" && !/example|fictional/i.test(item.name)) {
      fail(`${path}.name must be obviously fictional while the vendor is an example`);
    }
    const key = `${item.name}|${item.evidence_type}|${item.date}`;
    if (seen.has(key)) fail(`${path} duplicates another customer record`);
    seen.add(key);
  });
}

function main() {
  const vendors = loadVendorFiles();
  if (vendors.length === 0) {
    console.error("No vendor files found in data/vendors.");
    process.exit(1);
  }

  const errors = vendors.flatMap(({ file, data }) => validateVendor(file, data));
  if (errors.length > 0) {
    console.error(`Vendor validation failed (${errors.length}):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  const names = vendors.map(({ data }) => data.name).join(", ");
  console.log(`Validated ${vendors.length} vendor file${vendors.length === 1 ? "" : "s"}: ${names}`);
}

main();
