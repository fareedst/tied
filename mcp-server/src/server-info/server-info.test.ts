/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { clearBasePathCache } from "../yaml-loader.js";
import { bindWritableProjectCorpus } from "../test-helpers/client-path-env.js";
import { buildServerInfoSnapshot } from "./build.js";
import { loadServerInfoOutputSchema, resolveServerInfoOutputSchemaPath } from "./schema.js";
import {
  getServerInfoRuntimeContext,
  resetServerInfoRuntimeContextForTests,
  setServerInfoRuntimeContext,
} from "./runtime-context.js";
import { RESPONSE_SCHEMA_VERSION } from "./constants.js";

const mcpServerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const repoRoot = path.resolve(mcpServerRoot, "..");

function createValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);
  const schema = { ...loadServerInfoOutputSchema() };
  delete schema.$schema;
  const validate = ajv.compile(schema);
  return { validate, schema };
}

async function loadFixtureHelpers() {
  const href = pathToFileURL(
    path.join(repoRoot, "tools/bootstrap/lib/tied-runtime-fixture-loader.mjs"),
  ).href;
  return import(href) as Promise<{
    materializeTiedRuntimeFixtureById: (id: string) => {
      workspaceRoot: string;
      processEnv: Record<string, string>;
      cleanup: () => void;
    };
  }>;
}

describe("server_info builder [REQ-MCP_SERVER_INFO]", () => {
  const savedEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...savedEnv };
    clearBasePathCache();
    resetServerInfoRuntimeContextForTests();
  });

  it("linked-client fixture produces schema-valid snapshot", async () => {
    const { materializeTiedRuntimeFixtureById } = await loadFixtureHelpers();
    const mat = materializeTiedRuntimeFixtureById("linked-client");
    const mergedEnv = {
      ...process.env,
      ...mat.processEnv,
      TIED_MCP_TEST_REPO_ROOT: repoRoot,
    } as NodeJS.ProcessEnv;
    process.env = { ...mergedEnv };
    const tiedProject = path.join(mat.workspaceRoot, "tied-project");
    bindWritableProjectCorpus(tiedProject);
    setServerInfoRuntimeContext({
      implementation: { name: "tied-yaml", version: "1.0.0" },
      toolProfile: "full",
      activeToolCount: 10,
      resourcesRegistered: true,
      processEnv: process.env,
    });
    try {
      const snapshot = await buildServerInfoSnapshot(getServerInfoRuntimeContext());
      assert.equal(snapshot.schema_version, RESPONSE_SCHEMA_VERSION);
      assert.equal(snapshot.server.name, "tied-yaml");
      assert.ok(snapshot.health.checks.some((c) => c.id === "writable_corpus"));
      const { validate } = createValidator();
      const ok = validate(snapshot);
      if (!ok) {
        assert.fail(`schema validation failed: ${JSON.stringify(validate.errors)}`);
      }
      const blob = JSON.stringify(snapshot);
      assert.ok(!blob.includes("JEV_API_KEY"));
    } finally {
      mat.cleanup();
    }
  });

  it("schema rejects unknown root property", () => {
    const { validate, schema } = createValidator();
    const examplePath = path.join(
      path.dirname(resolveServerInfoOutputSchemaPath()),
      "server_info.response.example.json",
    );
    const good = JSON.parse(fs.readFileSync(examplePath, "utf8")) as Record<string, unknown>;
    assert.ok(validate(good));
    const bad = { ...good, unexpected: true };
    assert.ok(!validate(bad));
    assert.ok(schema.additionalProperties === false);
  });
});
