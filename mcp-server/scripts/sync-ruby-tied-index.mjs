/**
 * One-shot: merge standalone REQ/ARCH/IMPL detail files into project indexes so
 * tied_validate_consistency tokenExistsInIndex succeeds. Run from repo root:
 *   node mcp-server/scripts/sync-ruby-tied-index.mjs && lint_yaml tied/requirements.yaml ...
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const tied = path.resolve(import.meta.dirname, "../../tied");

function load(p) {
  return yaml.load(fs.readFileSync(p, "utf8"));
}
function dump(obj) {
  return yaml.dump(obj, { lineWidth: -1, noRefs: true });
}

function mergeFromDetail(indexRel, subdir, tokens) {
  const indexPath = path.join(tied, indexRel);
  const idx = load(indexPath);
  for (const t of tokens) {
    const doc = load(path.join(tied, subdir, `${t}.yaml`));
    if (!doc || !doc[t]) throw new Error(`Missing key ${t} in ${subdir}/${t}.yaml`);
    idx[t] = doc[t];
  }
  fs.writeFileSync(indexPath, dump(idx));
}

mergeFromDetail("requirements.yaml", "requirements", [
  "REQ-RUBY_INT_MULTIPLY",
  "REQ-RUBY_INT_FOUR_INT_MULTIPLY",
]);
mergeFromDetail("architecture-decisions.yaml", "architecture-decisions", [
  "ARCH-RUBY_INT_MULTIPLY",
  "ARCH-RUBY_INT_FOUR_INT_MULTIPLY",
]);
mergeFromDetail("implementation-decisions.yaml", "implementation-decisions", [
  "IMPL-RUBY_INT_MULTIPLY",
  "IMPL-RUBY_INT_FOUR_INT_MULTIPLY",
]);

const semPath = path.join(tied, "semantic-tokens.yaml");
const sem = load(semPath);
const semAdds = {
  "REQ-RUBY_INT_MULTIPLY": {
    type: "REQ",
    name: "Three-integer product (Ruby)",
    category: "Functional",
    status: "Implemented",
    description: "Pure Ruby multiply_three_integers(a,b,c); see detail file.",
    cross_references: ["ARCH-RUBY_INT_MULTIPLY", "IMPL-RUBY_INT_MULTIPLY"],
    source_index: "requirements.yaml",
    detail_file: "requirements/REQ-RUBY_INT_MULTIPLY.yaml",
    metadata: { registered: "2026-03-26T00:00:00.000Z", last_updated: "2026-03-26T00:00:00.000Z" },
  },
  "REQ-RUBY_INT_FOUR_INT_MULTIPLY": {
    type: "REQ",
    name: "Four-integer product (Ruby)",
    category: "Functional",
    status: "Implemented",
    description: "Pure Ruby multiply_four_integers(a,b,c,d); see detail file.",
    cross_references: ["ARCH-RUBY_INT_FOUR_INT_MULTIPLY", "IMPL-RUBY_INT_FOUR_INT_MULTIPLY"],
    source_index: "requirements.yaml",
    detail_file: "requirements/REQ-RUBY_INT_FOUR_INT_MULTIPLY.yaml",
    metadata: { registered: "2026-03-26T00:00:00.000Z", last_updated: "2026-03-26T00:00:00.000Z" },
  },
  "ARCH-RUBY_INT_MULTIPLY": {
    type: "ARCH",
    name: "Ruby pure-function layout for three-integer product",
    status: "Active",
    description: "ARCH for three-integer multiply; see detail file.",
    cross_references: ["REQ-RUBY_INT_MULTIPLY", "IMPL-RUBY_INT_MULTIPLY"],
    source_index: "architecture-decisions.yaml",
    detail_file: "architecture-decisions/ARCH-RUBY_INT_MULTIPLY.yaml",
    metadata: { registered: "2026-03-26T00:00:00.000Z", last_updated: "2026-03-26T00:00:00.000Z" },
  },
  "ARCH-RUBY_INT_FOUR_INT_MULTIPLY": {
    type: "ARCH",
    name: "Ruby pure-function layout for four-integer product",
    status: "Active",
    description: "ARCH for four-integer multiply; see detail file.",
    cross_references: ["REQ-RUBY_INT_FOUR_INT_MULTIPLY", "IMPL-RUBY_INT_FOUR_INT_MULTIPLY"],
    source_index: "architecture-decisions.yaml",
    detail_file: "architecture-decisions/ARCH-RUBY_INT_FOUR_INT_MULTIPLY.yaml",
    metadata: { registered: "2026-03-26T00:00:00.000Z", last_updated: "2026-03-26T00:00:00.000Z" },
  },
  "IMPL-RUBY_INT_MULTIPLY": {
    type: "IMPL",
    name: "Three-integer product Ruby implementation",
    status: "Active",
    description: "lib/multiply_three_integers.rb; see detail file.",
    cross_references: ["ARCH-RUBY_INT_MULTIPLY", "REQ-RUBY_INT_MULTIPLY"],
    source_index: "implementation-decisions.yaml",
    detail_file: "implementation-decisions/IMPL-RUBY_INT_MULTIPLY.yaml",
    metadata: { registered: "2026-03-26T00:00:00.000Z", last_updated: "2026-03-26T00:00:00.000Z" },
  },
  "IMPL-RUBY_INT_FOUR_INT_MULTIPLY": {
    type: "IMPL",
    name: "Four-integer product Ruby implementation",
    status: "Active",
    description: "lib/multiply_four_integers.rb; see detail file.",
    cross_references: ["ARCH-RUBY_INT_FOUR_INT_MULTIPLY", "REQ-RUBY_INT_FOUR_INT_MULTIPLY"],
    source_index: "implementation-decisions.yaml",
    detail_file: "implementation-decisions/IMPL-RUBY_INT_FOUR_INT_MULTIPLY.yaml",
    metadata: { registered: "2026-03-26T00:00:00.000Z", last_updated: "2026-03-26T00:00:00.000Z" },
  },
};
for (const [k, v] of Object.entries(semAdds)) {
  sem[k] = v;
}
fs.writeFileSync(semPath, dump(sem));
console.log("Merged Ruby tokens into indexes + semantic-tokens.yaml");
