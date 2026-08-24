// [REQ-TIED_YAML_STYLE_CONFIGURATION] [IMPL-TIED_YAML_STYLE_RESOLVER] — 12-case client_formatter fixture matrix.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  guardProjectTiedPath,
  runClientFormatterHook,
  YamlClientFormatterError,
} from "./yaml-client-formatter.js";
import {
  resolveClientFormatter,
  validateFormatterDeclaration,
  YamlStyleConfigurationError,
} from "./yaml-style-config.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const FIXTURES_DIR = path.join(REPO_ROOT, "mcp-server/fixtures/client-formatter");

function formatterCommand(name: string): string {
  return path.join(FIXTURES_DIR, `${name}.rb`);
}

function makeProject(): { root: string; tied: string; cleanup: () => void } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-client-formatter-"));
  const tied = path.join(root, "tied");
  fs.mkdirSync(tied, { recursive: true });
  fs.mkdirSync(path.join(tied, "requirements"), { recursive: true });
  fs.mkdirSync(path.join(tied, "methodology"), { recursive: true });
  return {
    root,
    tied,
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

function writeRepoConfig(root: string, body: string): void {
  fs.writeFileSync(path.join(root, ".tied-yaml.yaml"), body, "utf8");
}

function writeSampleYaml(filePath: string, body: string): void {
  fs.writeFileSync(filePath, body, "utf8");
}

function hookDeps(project: { root: string; tied: string }) {
  return { tiedBasePath: project.tied, repoRoot: project.root };
}

test("FMT-NOT-CONFIGURED returns not_configured without spawn", async () => {
  const project = makeProject();
  try {
    const target = path.join(project.tied, "requirements/sample.yaml");
    writeSampleYaml(target, "name: sample\n");
    const result = await runClientFormatterHook(target, hookDeps(project));
    assert.deepEqual(result, { ok: true, styling_status: "not_configured" });
  } finally {
    project.cleanup();
  }
});

test("FMT-STABLE-OUTPUT produces deterministic post-hook bytes", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("stable-indent")}\n`,
    );
    const target = path.join(project.tied, "requirements/stable.yaml");
    writeSampleYaml(target, "alpha: 1\nbeta: two\n");
    const first = await runClientFormatterHook(target, hookDeps(project));
    assert.equal(first.ok, true);
    if (!first.ok || first.styling_status !== "configured") {
      assert.fail("expected configured hook result");
    }
    const afterFirst = fs.readFileSync(target, "utf8");
    fs.writeFileSync(target, "alpha: 1\nbeta: two\n", "utf8");
    const second = await runClientFormatterHook(target, hookDeps(project));
    assert.equal(second.ok, true);
    if (!second.ok || second.styling_status !== "configured") {
      assert.fail("expected configured hook result on repeat");
    }
    assert.equal(fs.readFileSync(target, "utf8"), afterFirst);
  } finally {
    project.cleanup();
  }
});

test("FMT-IDEMPOTENT accepts byte-identical second pass", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("noop")}\n`,
    );
    const target = path.join(project.tied, "requirements/idempotent.yaml");
    writeSampleYaml(target, "token: REQ-SAMPLE\nstatus: Active\n");
    const result = await runClientFormatterHook(target, hookDeps(project));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.styling_status, "configured");
  } finally {
    project.cleanup();
  }
});

test("FMT-SCALAR-TYPES preserves boolean number and null semantics", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("stable-indent")}\n`,
    );
    const target = path.join(project.tied, "requirements/scalars.yaml");
    writeSampleYaml(
      target,
      "enabled: true\ncount: 42\nmissing: null\nlabel: sample\n",
    );
    const result = await runClientFormatterHook(target, hookDeps(project));
    assert.equal(result.ok, true);
  } finally {
    project.cleanup();
  }
});

test("FMT-ORDERED-LISTS preserves sequence order", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("stable-indent")}\n`,
    );
    const target = path.join(project.tied, "requirements/ordered.yaml");
    writeSampleYaml(
      target,
      "steps:\n  - slug: alpha\n    order: 1\n  - slug: beta\n    order: 2\n",
    );
    const result = await runClientFormatterHook(target, hookDeps(project));
    assert.equal(result.ok, true);
  } finally {
    project.cleanup();
  }
});

test("FMT-BLOCK-SCALARS preserves block-scalar bodies", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("stable-indent")}\n`,
    );
    const target = path.join(project.tied, "requirements/block.yaml");
    writeSampleYaml(
      target,
      "description: |\n  line one\n  line two\nname: block-sample\n",
    );
    const result = await runClientFormatterHook(target, hookDeps(project));
    assert.equal(result.ok, true);
  } finally {
    project.cleanup();
  }
});

test("FMT-INVALID-YAML rejects post-hook parse failure", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("emit-invalid-yaml")}\n`,
    );
    const target = path.join(project.tied, "requirements/invalid.yaml");
    const original = "name: valid\n";
    writeSampleYaml(target, original);
    const result = await runClientFormatterHook(target, hookDeps(project));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "INVALID_POST_HOOK_YAML");
    assert.equal(fs.readFileSync(target, "utf8"), original);
  } finally {
    project.cleanup();
  }
});

test("FMT-SEMANTIC-DRIFT rejects yaml_semantic_compare failure", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("break-semantics")}\n`,
    );
    const target = path.join(project.tied, "requirements/drift.yaml");
    const original = "enabled: true\ncount: 42\nmissing: null\n";
    writeSampleYaml(target, original);
    const result = await runClientFormatterHook(target, hookDeps(project));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "SEMANTIC_DRIFT");
    assert.equal(fs.readFileSync(target, "utf8"), original);
  } finally {
    project.cleanup();
  }
});

test("FMT-PATH-ESCAPE rejects paths outside tiedBasePath", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("noop")}\n`,
    );
    const outside = path.join(project.root, "outside.yaml");
    writeSampleYaml(outside, "name: outside\n");
    const result = await runClientFormatterHook(outside, hookDeps(project));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "PATH_OUT_OF_SCOPE");
  } finally {
    project.cleanup();
  }
});

test("FMT-METHODOLOGY-BLOCK rejects tied/methodology paths", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("noop")}\n`,
    );
    const methodologyPath = path.join(project.tied, "methodology/sample.yaml");
    writeSampleYaml(methodologyPath, "name: methodology\n");
    const result = await runClientFormatterHook(methodologyPath, hookDeps(project));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "METHODOLOGY_PATH_FORBIDDEN");
  } finally {
    project.cleanup();
  }
});

test("FMT-INVALID-CONFIG fails malformed client_formatter at resolve", () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      "client_formatter:\n  command: \"\"\n",
    );
    assert.throws(
      () => resolveClientFormatter(project.tied),
      (error: unknown) =>
        error instanceof YamlStyleConfigurationError &&
        error.message.includes("command must be a non-empty string"),
    );
    assert.throws(
      () => validateFormatterDeclaration({ command: "ok", extra: true }),
      (error: unknown) =>
        error instanceof YamlStyleConfigurationError &&
        error.message.includes("unknown key"),
    );
  } finally {
    project.cleanup();
  }
});

test("FMT-DISABLED-DEFAULT preserves not_configured when hook absent", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(project.root, "scalar_style: unwrapped\n");
    const target = path.join(project.tied, "requirements/default.yaml");
    writeSampleYaml(target, "name: baseline\n");
    const resolved = resolveClientFormatter(project.tied);
    assert.equal(resolved.styling_status, "not_configured");
    const result = await runClientFormatterHook(target, hookDeps(project));
    assert.deepEqual(result, { ok: true, styling_status: "not_configured" });
  } finally {
    project.cleanup();
  }
});

test("guardProjectTiedPath accepts project-owned tied descendants", () => {
  const tied = path.join("/tmp/project", "tied");
  const file = path.join(tied, "requirements/REQ-SAMPLE.yaml");
  assert.equal(guardProjectTiedPath(file, tied), path.resolve(file));
});

test("non-idempotent formatter is rejected", async () => {
  const project = makeProject();
  try {
    writeRepoConfig(
      project.root,
      `client_formatter:\n  command: ruby\n  args:\n    - ${formatterCommand("non-idempotent")}\n`,
    );
    const target = path.join(project.tied, "requirements/non-idempotent.yaml");
    writeSampleYaml(target, "name: sample\n");
    const result = await runClientFormatterHook(target, hookDeps(project));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "NON_IDEMPOTENT_OUTPUT");
  } finally {
    project.cleanup();
  }
});

test("guardProjectTiedPath throws typed errors for direct callers", () => {
  assert.throws(
    () => guardProjectTiedPath("/tmp/outside.yaml", "/tmp/project/tied"),
    (error: unknown) =>
      error instanceof YamlClientFormatterError && error.code === "PATH_OUT_OF_SCOPE",
  );
});
