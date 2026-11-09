/**
 * [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE] [IMPL-WF_TRIAL_READOUT_GRADING_RATIONALE]
 */
const PLACEHOLDER_RE = /^[\s—–\-–]+$/u;

const DIMENSIONS = [
  "Requirement interpretation",
  "Traceability closure",
  "Test strategy",
  "Algorithm / implementation",
  "Process adherence",
  "Workflow choreography",
  "Methodology learning readout",
];

/**
 * @param {string} cell
 * @returns {string}
 */
export function normalizeBand(cell) {
  const stripped = cell.replace(/\*\*/g, "").trim();
  return stripped.replace(/\u2212/g, "-"); // Unicode minus → ASCII for compares
}

/**
 * @param {string} bandNorm normalized via normalizeBand
 */
export function isSubABand(bandNorm) {
  if (/^N\/A$/i.test(bandNorm)) return false;
  return bandNorm !== "A";
}

/**
 * @param {string} rationale
 */
export function isPlaceholderRationale(rationale) {
  const t = rationale.trim();
  if (!t) return true;
  if (PLACEHOLDER_RE.test(t)) return true;
  return false;
}

/**
 * @param {string} rationale
 */
export function isSubstantiveSubARationale(rationale) {
  const t = rationale.trim();
  if (t.length < 15) return false;
  if (PLACEHOLDER_RE.test(t)) return false;
  if (/^[\p{P}\p{S}\s]+$/u.test(t)) return false;
  return true;
}

/**
 * @param {string} markdown
 * @returns {{ rows: { dimension: string, band: string, bandNorm: string, rationale: string }[], errors: string[] }}
 */
export function parseSessionGradingTable(markdown) {
  const errors = [];
  const heading = /^## Session grading\s*$/m;
  if (!heading.test(markdown)) {
    return { rows: [], errors: ["missing Session grading heading"] };
  }

  const after = markdown.split(/^## Session grading\s*$/m)[1] ?? "";
  const lines = after.split("\n");
  const tableLines = [];
  let inTable = false;
  for (const line of lines) {
    if (/^\|/.test(line)) {
      inTable = true;
      tableLines.push(line);
      continue;
    }
    if (inTable && !/^\|/.test(line)) break;
  }

  const headerCells = tableLines[0] ? splitTableRow(tableLines[0]) : [];
  const legacyTwoCol =
    headerCells.length === 2 && /^band$/i.test(headerCells[1].replace(/\*\*/g, ""));

  const dataRows = tableLines.filter((l) => {
    const cells = splitTableRow(l);
    if (cells.length < 2) return false;
    const dim = cells[0].trim();
    if (/^dimension$/i.test(dim) || /^---/.test(cells[0])) return false;
    return true;
  });

  const rows = dataRows.map((line) => {
    const cells = splitTableRow(line);
    const dimension = cells[0].trim();
    let band;
    let rationale;
    if (cells.length >= 3 && cells[2] !== undefined && cells[2] !== "") {
      band = cells[1].trim();
      rationale = cells[2].trim();
    } else {
      const parsed = parseLegacyBandCell(cells[1] ?? "");
      band = parsed.band;
      rationale = parsed.rationale;
    }
    const bandNorm = normalizeBand(band);
    return {
      dimension,
      band,
      bandNorm,
      rationale: rationale.trim(),
    };
  });

  if (rows.length !== 7) {
    errors.push(`expected 7 data rows, got ${rows.length}`);
  }

  for (let i = 0; i < DIMENSIONS.length && i < rows.length; i++) {
    if (rows[i].dimension !== DIMENSIONS[i]) {
      errors.push(`row ${i + 1}: expected "${DIMENSIONS[i]}", got "${rows[i].dimension}"`);
    }
  }

  return { rows, errors };
}

/**
 * @param {string} line
 * @returns {string[]}
 */
/**
 * @param {string} cell second column in legacy tables
 */
function parseLegacyBandCell(cell) {
  const trimmed = cell.trim();
  const m = trimmed.match(/^(\*\*[^*]+\*\*)\s*(.*)$/s);
  if (!m) return { band: trimmed, rationale: "" };
  const rest = m[2].trim();
  const dash = rest.match(/^[—–\-]\s*(.+)$/s);
  if (dash) {
    return { band: m[1].trim(), rationale: dash[1].trim() };
  }
  return { band: m[1].trim(), rationale: rest };
}

function splitTableRow(line) {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const parts = [];
  let cur = "";
  let link = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "[" && inner[i + 1] !== "]") link = true;
    if (ch === "|" && !link) {
      parts.push(cur);
      cur = "";
      continue;
    }
    if (ch === "]" && inner[i + 1] === "(") link = true;
    if (ch === ")" && link) link = false;
    cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim());
}

/**
 * Validate one readout body per SC-GR-04 / D-SUB-A-FLOOR.
 * @param {string} markdown
 * @returns {string[]}
 */
export function validateSessionGradingRationales(markdown) {
  const violations = [];
  const { rows, errors } = parseSessionGradingTable(markdown);
  violations.push(...errors);

  for (const row of rows) {
    const label = row.dimension;
    if (isPlaceholderRationale(row.rationale)) {
      violations.push(`${label}: empty or placeholder rationale`);
      continue;
    }
    if (isSubABand(row.bandNorm) && !isSubstantiveSubARationale(row.rationale)) {
      violations.push(`${label}: sub-A band "${row.bandNorm}" needs substantive rationale (≥15 chars)`);
    }
  }
  return violations;
}
