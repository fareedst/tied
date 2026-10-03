import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  resolveTiedBasePathForYamlFile,
  resolveYamlStyle,
  resolveClientFormatter,
  tiedBasePathForYamlContext,
  validateFormatterDeclaration,
  YamlStyleConfigurationError,
} from "./yaml-style-config.js";

function makeProject(): { root: string; tied: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-yaml-style-"));
  const tied = path.join(root, "tied-project");
  fs.mkdirSync(tied);
  return { root, tied };
}

function writeProjectConfig(root: string, body: string): void {
  const dir = path.join(root, "tied-project");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "config.yaml"), body);
}

function withoutStyle(environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const copy = { ...environment };
  delete copy.TIED_YAML_STYLE;
  return copy;
}

test("repository YAML style overrides the global environment", () => {
  const project = makeProject();
  try {
    writeProjectConfig(
      project.root,
      "schema: tied-project-config.v1\nyaml:\n  scalar_style: wrapped\n",
    );
    const resolved = resolveYamlStyle(project.tied, {
      ...process.env,
      TIED_YAML_STYLE: "unwrapped",
    });
    assert.deepEqual(resolved, {
      scalar_style: "wrapped",
      style_source: "repository",
      config_path: path.join(project.root, "tied-project/config.yaml"),
    });
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
  }
});

test("environment style is used when repository configuration is absent", () => {
  const project = makeProject();
  try {
    const resolved = resolveYamlStyle(project.tied, {
      ...process.env,
      TIED_YAML_STYLE: "wrapped",
    });
    assert.equal(resolved.scalar_style, "wrapped");
    assert.equal(resolved.style_source, "environment");
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
  }
});

test("XDG style is used after environment and repository fallbacks", () => {
  const project = makeProject();
  const xdg = path.join(project.root, "xdg");
  fs.mkdirSync(path.join(xdg, "tied"), { recursive: true });
  try {
    fs.writeFileSync(path.join(xdg, "tied", "yaml-format.yaml"), "scalar_style: wrapped\n");
    const resolved = resolveYamlStyle(project.tied, {
      ...withoutStyle(process.env),
      XDG_CONFIG_HOME: xdg,
      HOME: path.join(project.root, "home"),
    });
    assert.equal(resolved.scalar_style, "wrapped");
    assert.equal(resolved.style_source, "xdg");
    assert.equal(resolved.config_path, path.join(xdg, "tied", "yaml-format.yaml"));
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
  }
});

test("unconfigured projects default to unwrapped", () => {
  const project = makeProject();
  try {
    const resolved = resolveYamlStyle(project.tied, {
      ...withoutStyle(process.env),
      XDG_CONFIG_HOME: path.join(project.root, "missing-xdg"),
      HOME: path.join(project.root, "missing-home"),
    });
    assert.deepEqual(resolved, { scalar_style: "unwrapped", style_source: "default" });
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
  }
});

test("invalid explicit repository style fails without fallback", () => {
  const project = makeProject();
  try {
    writeProjectConfig(
      project.root,
      "schema: tied-project-config.v1\nyaml:\n  scalar_style: invalid\n",
    );
    assert.throws(
      () =>
        resolveYamlStyle(project.tied, {
          ...process.env,
          TIED_YAML_STYLE: "wrapped",
        }),
      (error: unknown) =>
        error instanceof YamlStyleConfigurationError &&
        error.message.includes("Invalid scalar_style") &&
        error.message.includes("tied-project/config.yaml"),
    );
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
  }
});

test("formatter-only repository config defaults scalar_style to unwrapped", () => {
  const project = makeProject();
  try {
    writeProjectConfig(
      project.root,
      "schema: tied-project-config.v1\nyaml:\n  client_formatter:\n    command: scripts/noop.sh\n",
    );
    const style = resolveYamlStyle(project.tied, {
      ...withoutStyle(process.env),
      XDG_CONFIG_HOME: path.join(project.root, "missing-xdg"),
      HOME: path.join(project.root, "missing-home"),
    });
    assert.equal(style.scalar_style, "unwrapped");
    assert.equal(style.style_source, "repository");
    const formatter = resolveClientFormatter(project.tied);
    assert.equal(formatter.styling_status, "configured");
    assert.equal(formatter.scalar_style, "unwrapped");
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
  }
});

test("resolveClientFormatter returns not_configured when command absent", () => {
  const project = makeProject();
  try {
    writeProjectConfig(
      project.root,
      "schema: tied-project-config.v1\nyaml:\n  scalar_style: wrapped\n",
    );
    const resolved = resolveClientFormatter(project.tied);
    assert.equal(resolved.styling_status, "not_configured");
    assert.equal(resolved.scalar_style, "wrapped");
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
  }
});

test("resolveTiedBasePathForYamlFile finds tied/ from nested project YAML paths", () => {
  const project = makeProject();
  try {
    fs.writeFileSync(path.join(project.tied, "requirements.yaml"), "{}\n");
    const yamlPath = path.join(project.tied, "requirements", "REQ-FIXTURE.yaml");
    fs.mkdirSync(path.dirname(yamlPath), { recursive: true });
    fs.writeFileSync(yamlPath, "token: REQ-FIXTURE\n");
    assert.equal(resolveTiedBasePathForYamlFile(yamlPath), project.tied);
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
  }
});

test("tiedBasePathForYamlContext prefers file project over TIED_BASE_PATH", () => {
  const project = makeProject();
  const other = makeProject();
  try {
    fs.writeFileSync(path.join(project.tied, "requirements.yaml"), "{}\n");
    writeProjectConfig(
      project.root,
      "schema: tied-project-config.v1\nyaml:\n  scalar_style: wrapped\n",
    );
    const yamlPath = path.join(project.tied, "record.yaml");
    fs.writeFileSync(yamlPath, "message: hello\n");
    const previousBasePath = process.env.TIED_BASE_PATH;
    process.env.TIED_BASE_PATH = other.tied;
    try {
      assert.equal(tiedBasePathForYamlContext(yamlPath), project.tied);
      const resolved = resolveYamlStyle(tiedBasePathForYamlContext(yamlPath));
      assert.equal(resolved.scalar_style, "wrapped");
      assert.equal(resolved.config_path, path.join(project.root, "tied-project/config.yaml"));
    } finally {
      if (previousBasePath === undefined) delete process.env.TIED_BASE_PATH;
      else process.env.TIED_BASE_PATH = previousBasePath;
    }
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
    fs.rmSync(other.root, { recursive: true, force: true });
  }
});

test("validateFormatterDeclaration normalizes command and args", () => {
  const normalized = validateFormatterDeclaration({
    command: " scripts/format.rb ",
    args: ["--in-place"],
    version: "fixture-1.0",
  });
  assert.deepEqual(normalized, {
    command: "scripts/format.rb",
    args: ["--in-place"],
    version: "fixture-1.0",
  });
});
