/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * Parse client `tied/vocab/routing.md` glossary table rows.
 */

export type RoutingRow = {
  priority: string;
  file: string;
  keywords: string[];
};

const ROW_RE =
  /^\|\s*([^|]+?)\s*\|\s*\[([^\]]+\.md)\]\([^)]+\)\s*\|\s*(.+?)\s*\|$/;

function splitKeywords(cell: string): string[] {
  return cell
    .split(",")
    .map((part) => part.replace(/[*`]/g, "").trim())
    .filter(Boolean);
}

export function parseRoutingTableMarkdown(markdown: string): RoutingRow[] {
  const rows: RoutingRow[] = [];
  for (const line of markdown.split("\n")) {
    const m = line.match(ROW_RE);
    if (!m) continue;
    const priority = m[1].trim();
    if (priority === "Pri" || priority.startsWith("---")) continue;
    rows.push({
      priority,
      file: m[2].trim(),
      keywords: splitKeywords(m[3]),
    });
  }
  return rows;
}

export function glossaryIdFromFile(file: string): string {
  return file.replace(/\.md$/i, "");
}
