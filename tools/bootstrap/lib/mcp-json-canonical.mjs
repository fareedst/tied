/**
 * [IMPL-TIED_MCP_JSON_CANONICAL_OUTPUT] [ARCH-TIED_MCP_JSON_CANONICAL_OUTPUT] [REQ-TIED_MCP_JSON_CANONICAL_OUTPUT]
 * Deterministic key order for TIED-generated mcp.json documents.
 */

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {Record<string, string>} map
 * @returns {Record<string, string>}
 */
function sortStringMap(map) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const key of Object.keys(map).sort((a, b) => a.localeCompare(b))) {
    out[key] = map[key];
  }
  return out;
}

/**
 * @param {unknown} value
 * @param {string} [parentKey]
 * @returns {unknown}
 */
function canonicalizeValue(value, parentKey) {
  if (Array.isArray(value)) {
    if (parentKey === "args") {
      return [...value];
    }
    return value.map((item) => canonicalizeValue(item, undefined));
  }
  if (!isPlainObject(value)) {
    return value;
  }
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
    const child = value[key];
    if (key === "env" || key === "headers") {
      out[key] = isPlainObject(child) ? sortStringMap(/** @type {Record<string, string>} */ (child)) : child;
    } else {
      out[key] = canonicalizeValue(child, key);
    }
  }
  return out;
}

/**
 * @param {unknown} cfg
 * @returns {Record<string, unknown>}
 */
export function canonicalizeMcpJsonDocument(cfg) {
  if (!isPlainObject(cfg)) {
    return /** @type {Record<string, unknown>} */ ({});
  }
  return /** @type {Record<string, unknown>} */ (canonicalizeValue(cfg, undefined));
}
