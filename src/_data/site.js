const { loadVendorFiles } = require("../../lib/vendor-files");

module.exports = function () {
  const vendors = loadVendorFiles().map(({ data }) => data);
  return {
    name: "OSINT Vendor Compass",
    description:
      "An independent, evidence-led comparison of OSINT SaaS vendors for analysts, decision makers, and teams choosing a provider.",
    owner: "Nico Dekens",
    ownerHandle: "Dutchosintguy",
    repository: "https://github.com/Dutchosintguy/osint-vendor-compass",
    exampleOnly: vendors.length > 0 && vendors.every((vendor) => vendor.example === true),
    hasExample: vendors.some((vendor) => vendor.example === true),
    vendorCount: vendors.length,
    approvedCount: vendors.filter((vendor) => vendor.owner_approved === true).length,
  };
};
