const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const root = path.join(__dirname, "..");

const SECTOR_LABELS = {
  law_enforcement: "Law enforcement",
  defense: "Defense",
  government: "Government",
  corporate: "Corporate",
  ngo: "NGO",
  media: "Media",
  academia: "Academia",
  other: "Other",
};

const EVIDENCE_LABELS = {
  case_study: "Case study",
  logo_page: "Logo page",
  procurement_record: "Procurement record",
  press_release: "Press release",
  credible_press: "Credible press",
  conference_talk: "Conference talk",
};

const PERSONA_LABELS = {
  le_investigator: "LE investigator",
  corporate_soc: "Corporate SOC",
  brand_pr: "Brand / PR",
  due_diligence: "Due diligence",
  geoint_analyst: "GEOINT analyst",
};

const SECTOR_ORDER = Object.keys(SECTOR_LABELS);
const PERSONA_ORDER = Object.keys(PERSONA_LABELS);

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"), { schema: yaml.CORE_SCHEMA });
}

function loadTaxonomy() {
  return readYaml(path.join(root, "data", "taxonomy.yaml"));
}

function sectorLabel(id) {
  if (!id) return "";
  return SECTOR_LABELS[id] || String(id).replaceAll("_", " ");
}

function evidenceLabel(id) {
  if (!id) return "";
  return EVIDENCE_LABELS[id] || String(id).replaceAll("_", " ");
}

function personaLabel(id) {
  return PERSONA_LABELS[id] || String(id || "").replaceAll("_", " ");
}

function sanctionsBucket(result) {
  const text = String(result || "");
  if (text.startsWith("REVIEW REQUIRED")) return "review";
  if (text.toLowerCase().startsWith("clear")) return "clear";
  return "other";
}

function loadPublishedVendors() {
  const dir = path.join(root, "data", "vendors");
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".yaml") && !file.startsWith("_"))
    .sort()
    .map((file) => {
      const data = readYaml(path.join(dir, file));
      const screening =
        data.extras &&
        data.extras.jurisdiction_sanctions_exposure &&
        data.extras.jurisdiction_sanctions_exposure.sanctions_screening;
      const customers = (data.known_customers && data.known_customers.customers) || [];
      const result = (screening && screening.result) || "";
      return {
        ...data,
        slug: data.meta && data.meta.slug,
        name: data.identity && data.identity.name,
        _file: file,
        _hq: data.identity && data.identity.hq_country,
        _category: data.identity && data.identity.category,
        _transparency: data.transparency && data.transparency.score && data.transparency.score.value,
        _financial: data.financial_health && data.financial_health.score && data.financial_health.score.value,
        _opsec: data.opsec_risks && data.opsec_risks.score && data.opsec_risks.score.value,
        _sanctionsResult: result,
        _sanctionsBucket: sanctionsBucket(result),
        _redFlagCount: Array.isArray(data.red_flags) ? data.red_flags.length : 0,
        _customerStatus: data.known_customers && data.known_customers.status,
        _sectorsAttr: [...new Set(customers.map((item) => item.sector).filter(Boolean))].join(" "),
        _sectorList: customers.map((item) => item.sector).filter(Boolean).join(","),
        _buyerNames: customers.map((item) => item.customer_name).filter(Boolean).join(" "),
        _products: ((data.overview_360 && data.overview_360.primary_products) || []).join(" "),
        _lastReviewed: data.meta && data.meta.last_reviewed,
        _founded: data.overview_360 && data.overview_360.founded_year && data.overview_360.founded_year.value,
      };
    })
    .sort((a, b) => String(a.name).localeCompare(String(b.name), "en"));
}

function loadVendorFiles() {
  return loadPublishedVendors().map((data) => ({ file: data._file, data }));
}

module.exports = {
  root,
  readYaml,
  loadTaxonomy,
  loadVendorFiles,
  loadPublishedVendors,
  sectorLabel,
  evidenceLabel,
  personaLabel,
  sanctionsBucket,
  SECTOR_ORDER,
  PERSONA_ORDER,
  SECTOR_LABELS,
};
