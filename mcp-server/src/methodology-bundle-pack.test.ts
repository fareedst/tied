/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 * G3 RED/GREEN: release pack copies tied/methodology corpus + manifest; bundled read parity on packed dir.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

import { compareDiskAndBundledParity, writeCopiedTreeFixture } from "./bundled-methodology-read.js";
import {
  defaultSourceMethodologyDir,
  packMethodologyBundle,
  readTiedMcpVersion,
  validateMethodologyBundleManifest,
  METHODOLOGY_BUNDLE_MANIFEST_SCHEMA,
} from "./methodology-bundle-pack.js";

describe("methodology bundle pack [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] G3", () => {
  it("packs repo tied/methodology into temp corpus with valid manifest", () => {
    const mcpServerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const source = defaultSourceMethodologyDir(mcpServerRoot);
    assert.ok(fs.existsSync(source), `expected source at ${source}`);

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-pack-"));
    const corpusOut = path.join(tempRoot, "corpus");
    const manifestOut = path.join(tempRoot, "methodology-bundle-manifest.v1.json");
    try {
      const manifest = packMethodologyBundle({
        sourceMethodologyDir: source,
        corpusOutDir: corpusOut,
        manifestOutPath: manifestOut,
        tiedMcpVersion: readTiedMcpVersion(mcpServerRoot),
      });

      assert.strictEqual(manifest.schema, METHODOLOGY_BUNDLE_MANIFEST_SCHEMA);
      assert.ok(manifest.file_count > 0);
      assert.ok(fs.existsSync(path.join(corpusOut, "requirements.yaml")));

      const onDisk = JSON.parse(fs.readFileSync(manifestOut, "utf8"));
      const validated = validateMethodologyBundleManifest(onDisk, corpusOut);
      assert.strictEqual(validated.ok, true, validated.ok ? "" : validated.errors.join("; "));
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("packed corpus supports bundled read parity vs local copied tree", () => {
    const tiedBase = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-pack-parity-"));
    const packedCorpus = fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-packed-"));
    try {
      const tokens = writeCopiedTreeFixture(tiedBase, packedCorpus);
      const result = compareDiskAndBundledParity(tiedBase, packedCorpus, tokens);
      assert.strictEqual(result.ok, true, JSON.stringify(result.gaps, null, 2));
    } finally {
      fs.rmSync(tiedBase, { recursive: true, force: true });
      fs.rmSync(packedCorpus, { recursive: true, force: true });
    }
  });
});
