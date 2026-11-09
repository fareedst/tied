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

/** Facilitator band ladder (registry sort key); not catalog rubric weights. */
const BAND_SCORE = new Map([
  ["A", 4.0],
  ["A-", 3.7],
  ["B+", 3.3],
  ["B", 3.0],
  ["B-", 2.7],
  ["C+", 2.3],
  ["C", 2.0],
  ["C-", 1.7],
  ["D+", 1.3],
  ["D", 1.0],
  ["F", 0.0],
]);

/**
 * Map normalized band to 0.0–4.0 score; null for N/A or unknown.
 * @param {string} bandNorm normalized via normalizeBand
 * @returns {number | null}
 */
export function bandToScore(bandNorm) {
  const key = bandNorm.trim();
  if (!key || /^N\/A$/i.test(key)) return null;
  if (BAND_SCORE.has(key)) return BAND_SCORE.get(key);
  return null;
}

/**
 * Arithmetic mean of compact registry grades (Req/Tr/Ts/Al/Pr/Ch/Ml); skips N/A.
 * @param {string} compactSlash e.g. `A/A−/A/A/B+/A/A−`
 * @returns {{ mean: number | null, display: string }}
 */
export function meanCompactGrades(compactSlash) {
  const raw = compactSlash.trim();
  if (!raw || PLACEHOLDER_RE.test(raw)) {
    return { mean: null, display: "—" };
  }
  const parts = raw.split("/").map((p) => p.trim()).filter(Boolean);
  let sum = 0;
  let count = 0;
  for (const part of parts) {
    const score = bandToScore(normalizeBand(part));
    if (score == null) continue;
    sum += score;
    count += 1;
  }
  if (count === 0) {
    return { mean: null, display: "—" };
  }
  const mean = sum / count;
  return { mean, display: `${mean.toFixed(2)} · ${raw}` };
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
