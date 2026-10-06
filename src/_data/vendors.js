const { loadVendorFiles } = require("../../lib/vendor-files");

module.exports = function () {
  return loadVendorFiles()
    .map(({ file, data }) => ({ ...data, _file: file }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name), "en"));
};
