import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { test } from "node:test";

import {
  basenameMatchesPattern,
  discoverClients,
  parseEpochFromBasename,
  parseManifestLine,
  sanitizeLabelForFilename,
} from "./project-size-discover-clients.mjs";

test("parseEpochFromBasename", () => {
  assert.equal(parseEpochFromBasename("1794231848-wf-agentstream-wf-08"), 1794231848);
  assert.equal(parseEpochFromBasename("nodigits"), null);
});

test("sanitizeLabelForFilename", () => {
  assert.equal(sanitizeLabelForFilename("a/b*c"), "a_b_c");
  assert.ok(sanitizeLabelForFilename("!!!").length > 0);
});

test("basenameMatchesPattern substring vs regex", () => {
  assert.equal(basenameMatchesPattern("x-wf-agentstream-y", "wf-agentstream", false), true);
  assert.equal(basenameMatchesPattern("other", "wf-agentstream", false), false);
  assert.equal(basenameMatchesPattern("wf-08", "^wf-\\d+$", true), true);
  assert.equal(basenameMatchesPattern("wf-agentstream", "^wf-\\d+$", true), false);
});

test("parseManifestLine", () => {
  assert.deepEqual(parseManifestLine("  /tmp/foo  "), {
    label: "foo",
    repo_root: path.resolve("/tmp/foo"),
  });
  assert.deepEqual(parseManifestLine("lbl\t/tmp/bar"), {
    label: "lbl",
    repo_root: path.resolve("/tmp/bar"),
  });
  assert.equal(parseManifestLine("# comment"), null);
});

test("discoverClients eligibility pattern limit sort", async () => {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "ps-disc-"));
  const good = path.join(root, "1700000100-wf-agentstream-wf-01");
  const bad = path.join(root, "1700000200-wf-agentstream-no-yaml");
  const other = path.join(root, "1700000300-other-dir");
  await mkdir(path.join(good, "tied-project"), { recursive: true });
  await writeFile(path.join(good, "tied-project", "requirements.yaml"), "requirements: {}\n");
  await mkdir(path.join(bad, "tied-project"), { recursive: true });
  await mkdir(path.join(other, "tied-project"), { recursive: true });
  await writeFile(path.join(other, "tied-project", "requirements.yaml"), "x: 1\n");

  const { targets, diagnostics } = await discoverClients({
    parentDir: root,
    pattern: "wf-agentstream",
    limit: 10,
    newestFirst: true,
  });

  assert.equal(targets.length, 1);
  assert.equal(targets[0].label, "1700000100-wf-agentstream-wf-01");
  assert.ok(diagnostics.some((d) => d.code === "SKIP_INELIGIBLE"));
});
