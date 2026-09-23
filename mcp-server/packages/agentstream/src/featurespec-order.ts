/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-FEATURESPEC] [REQ-GOAGENT-FEATURESPEC-BATCH]
 * Feature-spec batch order filter (Go featurespec/order.go parity).
 */

export type OrderFilter =
  | { kind: "single"; value: number }
  | { kind: "range"; low: number; high: number };

const RANGE_RE = /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/;
const SINGLE_RE = /^-?\d+(?:\.\d+)?$/;

export function parseOrderFilter(s: string): OrderFilter {
  const trimmed = s.trim();
  if (trimmed === "") {
    throw new Error("missing value for order filter");
  }
  const rangeMatch = RANGE_RE.exec(trimmed);
  if (rangeMatch) {
    const low = Number.parseFloat(rangeMatch[1]!);
    const high = Number.parseFloat(rangeMatch[2]!);
    if (low > high) {
      throw new Error(`order filter range must have low <= high (got ${JSON.stringify(s)})`);
    }
    return { kind: "range", low, high };
  }
  if (!SINGLE_RE.test(trimmed)) {
    throw new Error(
      `invalid order filter value: ${JSON.stringify(s)} (expected N or N-M)`,
    );
  }
  return { kind: "single", value: Number.parseFloat(trimmed) };
}

export function orderFilterMatches(filter: OrderFilter | undefined, o: number): boolean {
  if (!filter) {
    return true;
  }
  if (filter.kind === "range") {
    return o >= filter.low && o <= filter.high;
  }
  return Math.abs(o - filter.value) < 1e-9 || o === filter.value;
}
