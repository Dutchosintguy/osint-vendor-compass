#!/usr/bin/env node
/**
 * Validates published vendor files against research schema 1.2.
 * Files in data/vendors/ that start with "_" are ignored.
 * Example profiles live in data/examples/ and are not published.
 */

const { loadVendorFiles } = require("../lib/vendor-files");

const REQUIRED_SECTIONS = [
  "identity",
  "overview_360",
  "five_w1h",
  "strengths_weaknesses",
  "transparency",
  "financial_health",
  "press_sentiment",
  "opsec_risks",
  "extras",
  "red_flags",
  "gaps",
  "meta",
  "known_customers",
];

const SCORE_SECTIONS = [
  "overview_360",
  "five_w1h",
  "strengths_weaknesses",
  "transparency",
  "financial_health",
  "press_sentiment",
  "opsec_risks",
];

function isDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function checkUrlFields(node, path, errors) {
  if (!node || typeof node !== "object") return;
  if (typeof node.source === "string" && /^https?:/i.test(node.source) && !isHttpUrl(node.source)) {
    errors.push(`${path}.source is not a valid http(s) URL`);
  }
  if (typeof node.source_url === "string" && !isHttpUrl(node.source_url)) {
    errors.push(`${path}.source_url must be an http(s) URL`);
  }
  if (typeof node.official_website === "string" && !isHttpUrl(node.official_website)) {
    errors.push(`${path}.official_website must be an http(s) URL`);
  }
  if (Array.isArray(node.sources)) {
    node.sources.forEach((item, index) => {
      if (typeof item === "string" && /^https?:/i.test(item) && !isHttpUrl(item)) {
        errors.push(`${path}.sources[${index}] is not a valid http(s) URL`);
      }
    });
  }
  const text = JSON.stringify(node);
  if (/marktplaats\.nl/i.test(text)) {
    errors.push(`${path} cites Marktplaats.nl, which this schema does not allow`);
  }
  const entries = Array.isArray(node) ? node.entries() : Object.entries(node);
  for (const [key, value] of entries) {
    if (value && typeof value === "object") {
      checkUrlFields(value, Array.isArray(node) ? `${path}[${key}]` : `${path}.${key}`, errors);
    }
  }
}

function validate(file, data) {
  const errors = [];
  const fail = (message) => errors.push(`${file}: ${message}`);
  if (!data || typeof data !== "object") {
    fail("file must be a YAML mapping");
    return errors;
  }
  REQUIRED_SECTIONS.forEach((key) => {
    if (data[key] == null) fail(`missing ${key}`);
  });
  if (!data.identity || data.identity.signoff !== "APPROVED") {
    fail("identity.signoff must be APPROVED");
  }
  if (!data.identity || !data.identity.name) fail("identity.name is required");
  if (String(data.identity && data.identity.name).startsWith("Example Vendor")) {
    fail("example vendors are not published from data/vendors");
  }
  if (!data.meta || data.meta.schema_version !== "1.2") fail("meta.schema_version must be 1.2");
  if (!data.meta || data.meta.signoff_status !== "approved") fail("meta.signoff_status must be approved");
  if (!data.meta || !isDate(data.meta.last_reviewed)) fail("meta.last_reviewed must be YYYY-MM-DD");
  if (!data.meta || file !== `${data.meta.slug}.yaml`) fail("filename must match meta.slug");
  SCORE_SECTIONS.forEach((key) => {
    const score = data[key] && data[key].score;
    if (!score || !Number.isInteger(score.value) || score.value < 0 || score.value > 5) {
      fail(`${key}.score.value must be an integer from 0 to 5`);
    }
  });
  if (!Array.isArray(data.red_flags)) fail("red_flags must be a list");
  else if (data.red_flags.some((item) => typeof item !== "string")) fail("red_flags must be strings");
  if (!Array.isArray(data.gaps)) fail("gaps must be a list");
  const known = data.known_customers;
  if (!known || !["documented", "none_publicly_documented"].includes(known.status)) {
    fail("known_customers.status must be documented or none_publicly_documented");
  } else if (!Array.isArray(known.customers)) {
    fail("known_customers.customers must be a list");
  } else if (known.status === "none_publicly_documented" && known.customers.length > 0) {
    fail("none_publicly_documented profiles cannot also list customers");
  } else if (known.status === "documented" && known.customers.length === 0) {
    fail("documented profiles need at least one customer");
  } else {
    known.customers.forEach((customer, index) => {
      ["customer_name", "sector", "country", "evidence_type", "date", "source_url"].forEach((field) => {
        if (customer[field] == null || customer[field] === "") {
          fail(`known_customers.customers[${index}].${field} is required`);
        }
      });
    });
  }
  const screening =
    data.extras &&
    data.extras.jurisdiction_sanctions_exposure &&
    data.extras.jurisdiction_sanctions_exposure.sanctions_screening;
  if (!screening || typeof screening.result !== "string" || !screening.result.trim()) {
    fail("sanctions screening result is required");
  }
  if (!screening || !isDate(screening.screening_date)) {
    fail("sanctions screening_date must be YYYY-MM-DD");
  }
  checkUrlFields(data, file, errors);
  return errors;
}

function main() {
  const vendors = loadVendorFiles();
  if (vendors.length !== 37) {
    console.error(`Expected 37 published vendors, found ${vendors.length}.`);
    process.exit(1);
  }
  const errors = vendors.flatMap(({ file, data }) => validate(file, data));
  if (errors.length) {
    console.error(`Vendor validation failed (${errors.length}):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
  console.log(`Validated ${vendors.length} approved vendor profiles (schema 1.2).`);
}

main();
