import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  assertRenderableMarkdown,
  renderComparisonMarkdown,
} from "./project-size-comparison-render.mjs";

const DOGFOOD = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../tied-project/working/REQ-TIED_PROJECT_SIZE_LAYERS/evidence/project-size-snapshot-store-dogfood.v1.json",
);

test("renderComparisonMarkdown from dogfood receipt", () => {
  const receipt = JSON.parse(fs.readFileSync(DOGFOOD, "utf8"));
  const md = renderComparisonMarkdown([{ label: "stdd-store", receipt }], {
    generatedAt: "2026-11-09T00:00:00.000Z",
    discoverParent: "/tmp/test",
    pattern: "wf-agentstream",
  });
  assertRenderableMarkdown(md);
  assert.match(md, /proof_boundary|Proof boundary/i);
  assert.match(md, /stdd-store/);
  assert.match(md, /14866/);
  assert.match(md, /## Column definitions/);
  assert.match(md, /\*\*applied_lines\*\*/);
});
