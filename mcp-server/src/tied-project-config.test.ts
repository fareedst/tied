/**
 * [REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * Regression: store tied-project/config.yaml with identity.routing must load without CONFIG_UNKNOWN_KEY (gap G6).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { loadProjectConfig, TiedProjectConfigError } from "./tied-project-config.js";

describe("tied-project-config [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
  it("loadProjectConfig: identity.routing marker_only is allowed (G6 regression)", () => {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
    const loaded = loadProjectConfig(repoRoot);
    assert.ok(loaded, "store config should resolve");
    assert.match(loaded.configPath, /tied-project\/config\.yaml$/);
    const identity = loaded.record.identity as Record<string, unknown>;
    assert.equal(identity.routing, "marker_only");
  });

  it("loadProjectConfig: rejects unknown top-level keys on v1 schema", () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-cfg-"));
    const tied = path.join(temp, "tied-project");
    fs.mkdirSync(tied, { recursive: true });
    fs.writeFileSync(
      path.join(tied, "config.yaml"),
      [
        'schema: "tied-project-config.v1"',
        "yaml:",
        '  scalar_style: "wrapped"',
        "mystery_key: true",
        "",
      ].join("\n"),
    );
    assert.throws(
      () => loadProjectConfig(temp),
      (err: unknown) => {
        assert.ok(err instanceof TiedProjectConfigError);
        assert.equal(err.code, "CONFIG_UNKNOWN_KEY");
        return true;
      },
    );
  });
});
