const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const root = path.join(__dirname, "..");

function readYaml(filePath) {
  // CORE_SCHEMA keeps YYYY-MM-DD values as strings. The default schema
  // turns them into Date objects and shifts them by timezone.
  return yaml.load(fs.readFileSync(filePath, "utf8"), { schema: yaml.CORE_SCHEMA });
}

function loadTaxonomy() {
  return readYaml(path.join(root, "data", "taxonomy.yaml"));
}

function loadVendorFiles() {
  const dir = path.join(root, "data", "vendors");
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".yaml") && !file.startsWith("_"))
    .sort()
    .map((file) => ({
      file,
      data: readYaml(path.join(dir, file)),
    }));
}

module.exports = {
  root,
  loadTaxonomy,
  loadVendorFiles,
};
