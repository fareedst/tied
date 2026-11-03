/**
 * [REQ-TIED_RUNTIME_DISK_CONFIG] [SC-RDC-OPERATOR-DISK] [SC-RDC-E2E-METRICS-ALIGN] [IMPL-TIED_RUNTIME_DISK_CONFIG]
 * How: E2e helpers patch store-root .tied/store.yaml operator.collect_metrics deterministically and restore prior content.
 */
import fs from "node:fs";
import path from "node:path";

const STORE_REL = ".tied/store.yaml";
const TEMPLATE_REL = "tools/bootstrap/templates/.tied/store.yaml";

const MINIMAL_STORE_YAML = `schema: tied-store-config.v1
mcp_server:
  dist: mcp-server/dist/index.js
methodology:
  bundle: tied-bundle
`;

export class StoreYamlSnapshot {
  constructor(
    private readonly storeRoot: string,
    private readonly existed: boolean,
    private readonly priorText: string | null,
  ) {}

  restore(): void {
    const storePath = path.join(this.storeRoot, STORE_REL);
    if (!this.existed) {
      if (fs.existsSync(storePath)) {
        fs.unlinkSync(storePath);
      }
      return;
    }
    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    fs.writeFileSync(storePath, this.priorText ?? "", "utf8");
  }
}

export function snapshotStoreYaml(storeRoot: string): StoreYamlSnapshot {
  const storePath = path.join(storeRoot, STORE_REL);
  if (!fs.existsSync(storePath)) {
    return new StoreYamlSnapshot(storeRoot, false, null);
  }
  return new StoreYamlSnapshot(storeRoot, true, fs.readFileSync(storePath, "utf8"));
}

function loadBaseStoreTemplate(storeRoot: string): string {
  const templatePath = path.join(storeRoot, TEMPLATE_REL);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, "utf8");
  }
  const storePath = path.join(storeRoot, STORE_REL);
  if (fs.existsSync(storePath)) {
    return fs.readFileSync(storePath, "utf8");
  }
  return MINIMAL_STORE_YAML;
}

/**
 * Materialize store yaml with explicit operator.mcp.collect_metrics (template-equivalent when false).
 */
export function seedStoreOperatorCollectMetrics(storeRoot: string, collectMetrics: boolean): void {
  let text = loadBaseStoreTemplate(storeRoot);
  if (/collect_metrics:\s*(true|false)/.test(text)) {
    text = text.replace(
      /collect_metrics:\s*(true|false)/,
      `collect_metrics: ${collectMetrics}`,
    );
  } else {
    text = `${text.trimEnd()}\noperator:\n  mcp:\n    collect_metrics: ${collectMetrics}\n`;
  }
  const storePath = path.join(storeRoot, STORE_REL);
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

export function withStoreOperatorCollectMetrics<T>(
  storeRoot: string,
  collectMetrics: boolean,
  fn: () => T,
): T {
  const snap = snapshotStoreYaml(storeRoot);
  try {
    seedStoreOperatorCollectMetrics(storeRoot, collectMetrics);
    return fn();
  } finally {
    snap.restore();
  }
}
