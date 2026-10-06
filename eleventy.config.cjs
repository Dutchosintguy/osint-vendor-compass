const { loadTaxonomy, sectorLabel, evidenceLabel, personaLabel, SECTOR_ORDER } = require("./lib/vendor-files");

const taxonomy = loadTaxonomy();

const SCORE_LABELS = ["Unknown", "Poor", "Limited", "Adequate", "Strong", "Excellent"];
const RISK_ORDER = { unknown: 0, low: 1, medium: 2, high: 3 };

function lookup(list, id, field = "name") {
  const found = list.find((item) => item.id === id);
  return found ? found[field] : id;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.href;
  } catch {
    return "";
  }
}

function addSource(found, seen, value) {
  const href = isHttpUrl(value);
  if (!href || seen.has(href)) return;
  seen.add(href);
  found.push({ url: href, label: href, accessed: null });
}

function collectSources(node, found = [], seen = new Set()) {
  if (!node || typeof node !== "object") return found;
  if (typeof node.source === "string") addSource(found, seen, node.source);
  if (typeof node.source_url === "string") addSource(found, seen, node.source_url);
  if (typeof node.official_website === "string") addSource(found, seen, node.official_website);
  if (Array.isArray(node.sources)) {
    node.sources.forEach((item) => {
      if (typeof item === "string") addSource(found, seen, item);
    });
  }
  const values = Array.isArray(node) ? node : Object.values(node);
  values.forEach((value) => collectSources(value, found, seen));
  return found;
}

function screeningSummary(items) {
  if (!Array.isArray(items) || items.length === 0) return "Screening not recorded";
  const results = items.map((item) => item.result);
  if (results.includes("listed")) return "List match";
  if (results.includes("potential-match")) return "Potential match";
  if (results.every((result) => result === "clear")) return "EU, UN, OFAC, UK clear";
  if (results.some((result) => result === "not-screened" || result === "unknown")) {
    return "Screening incomplete";
  }
  return "See profile";
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("./data/");

  eleventyConfig.addFilter("longDate", (value) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return value || "";
    const [year, month, day] = String(value).split("-").map(Number);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  });

  eleventyConfig.addFilter("scoreLabel", (score) => {
    const number = Number(score);
    if (!Number.isInteger(number) || number < 0 || number > 5) return "Unscored";
    return SCORE_LABELS[number];
  });

  eleventyConfig.addFilter("categoryName", (id) => lookup(taxonomy.categories, id));
  eleventyConfig.addFilter("useCaseName", (id) => lookup(taxonomy.use_cases, id));
  eleventyConfig.addFilter("fitName", (id) => lookup(taxonomy.fit_levels, id));
  eleventyConfig.addFilter("riskName", (id) => lookup(taxonomy.risk_levels, id));
  eleventyConfig.addFilter("sanctionsName", (id) => lookup(taxonomy.sanctions_risks, id));
  eleventyConfig.addFilter("sanctionsShort", (id) => lookup(taxonomy.sanctions_risks, id, "short"));
  eleventyConfig.addFilter("confidenceName", (id) => lookup(taxonomy.confidence_levels, id));
  eleventyConfig.addFilter("statusName", (id) => lookup(taxonomy.statuses, id));
  eleventyConfig.addFilter("certStatusName", (id) => lookup(taxonomy.certification_statuses, id));
  eleventyConfig.addFilter("legalStatusName", (id) => lookup(taxonomy.legal_statuses, id));
  eleventyConfig.addFilter("screeningResultName", (id) => lookup(taxonomy.screening_results, id));
  eleventyConfig.addFilter("regimeName", (id) => lookup(taxonomy.screening_regimes, id));
  eleventyConfig.addFilter("toneName", (id) => lookup(taxonomy.sentiment_tones, id));
  eleventyConfig.addFilter("sectorName", (id) => lookup(taxonomy.customer_sectors, id));
  eleventyConfig.addFilter("evidenceName", (id) => lookup(taxonomy.customer_evidence_types, id));
  eleventyConfig.addFilter("sectorLabel", (id) => sectorLabel(id));
  eleventyConfig.addFilter("evidenceLabel", (id) => evidenceLabel(id));
  eleventyConfig.addFilter("personaLabel", (id) => personaLabel(id));
  eleventyConfig.addFilter("uniqueField", (vendors, field) =>
    [...new Set(vendors.map((vendor) => vendor[field]).filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), "en")
    )
  );
  eleventyConfig.addFilter("sectorStats", (vendors) => {
    const ids = new Set(SECTOR_ORDER);
    vendors.forEach((vendor) => {
      const customers = (vendor.known_customers && vendor.known_customers.customers) || [];
      customers.forEach((customer) => {
        if (customer.sector) ids.add(customer.sector);
      });
    });
    const ordered = [
      ...SECTOR_ORDER.filter((id) => ids.has(id)),
      ...[...ids].filter((id) => !SECTOR_ORDER.includes(id)),
    ];
    return ordered.map((id) => {
      let customers = 0;
      let vendorCount = 0;
      vendors.forEach((vendor) => {
        const matches = ((vendor.known_customers && vendor.known_customers.customers) || []).filter(
          (item) => item.sector === id
        );
        customers += matches.length;
        if (matches.length > 0) vendorCount += 1;
      });
      return { id, name: sectorLabel(id), customers, vendors: vendorCount };
    });
  });
  eleventyConfig.addFilter("undocumentedCount", (vendors) =>
    vendors.filter((vendor) => vendor._customerStatus === "none_publicly_documented").length
  );
  eleventyConfig.addFilter("uniqueCountries", (vendors) => {
    const countries = new Set();
    vendors.forEach((vendor) => {
      if (vendor.headquarters && vendor.headquarters.country) countries.add(vendor.headquarters.country);
    });
    return [...countries].sort((a, b) => a.localeCompare(b, "en"));
  });
  eleventyConfig.addFilter("joinSectors", (customers) =>
    [...new Set((customers || []).map((item) => item.sector))].join(" ")
  );
  eleventyConfig.addFilter("sectorList", (customers) =>
    (customers || []).map((item) => item.sector).join(",")
  );
  eleventyConfig.addFilter("buyerNames", (customers) =>
    (customers || []).map((item) => item.name).join(" ")
  );
  eleventyConfig.addFilter("productNames", (products) =>
    (products || []).map((item) => item.name).join(" ")
  );
  eleventyConfig.addFilter("httpUrl", isHttpUrl);
  eleventyConfig.addFilter("startsWith", (value, prefix) => String(value || "").startsWith(prefix));
  eleventyConfig.addFilter("collectSources", (vendor) => collectSources(vendor));
  eleventyConfig.addFilter("screeningSummary", screeningSummary);
  eleventyConfig.addFilter("riskSort", (id) => RISK_ORDER[id] ?? 0);
  eleventyConfig.addFilter("findFit", (vendor, useCaseId) => {
    const fits = (vendor && vendor.use_case_fit) || [];
    return fits.find((item) => item.id === useCaseId) || null;
  });

  eleventyConfig.addFilter("vendorsForUse", (vendors, useCaseId) =>
    vendors.filter((vendor) => (vendor.use_cases || []).includes(useCaseId))
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    pathPrefix: process.env.BASE_PATH || "/",
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
