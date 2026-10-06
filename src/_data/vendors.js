const { loadPublishedVendors } = require("../../lib/vendor-files");

module.exports = function () {
  return loadPublishedVendors();
};
