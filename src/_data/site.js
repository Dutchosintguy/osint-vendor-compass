const { loadPublishedVendors } = require("../../lib/vendor-files");

module.exports = function () {
  const vendors = loadPublishedVendors();
  const reviewed = [...new Set(vendors.map((vendor) => vendor._lastReviewed).filter(Boolean))];
  return {
    name: "OSINT Vendor Compass",
    description:
      "An independent comparison of OSINT SaaS vendors. Profiles are approved research records with sources, scores, sanctions screening, and publicly documented customers.",
    owner: "Nico Dekens",
    ownerHandle: "Dutchosintguy",
    repository: "https://github.com/Dutchosintguy/osint-vendor-compass",
    exampleOnly: false,
    hasExample: false,
    vendorCount: vendors.length,
    approvedCount: vendors.filter((vendor) => vendor.meta && vendor.meta.signoff_status === "approved").length,
    reviewedDates: reviewed,
  };
};
