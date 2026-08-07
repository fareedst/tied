import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { resolveYamlStyle, YamlStyleConfigurationError } from "./yaml-style-config.js";

function makeProject(): { root: string; tied: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-yaml-style-"));
  const tied = path.join(root, "tied");
  fs.mkdirSync(tied);
  return { root, tied };
}

function withoutStyle(environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const copy = { ...environment };
  delete copy.TIED_YAML_STYLE;
  return copy;
}

test("repository YAML style overrides the global environment", () => {
  const project = makeProject();
  try {
    fs.writeFileSync(path.join(project.root, ".tied-yaml.yaml"), "scalar_style: wrapped\n");
    const resolved = resolveYamlStyle(project.tied, {
      ...process.env,
      TIED_YAML_STYLE: "unwrapped",
    });
    assert.deepEqual(resolved, {
      scalar_style: "wrapped",
      style_source: "repository",
      config_path: path.join(project.root, ".tied-yaml.yaml"),
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
    fs.writeFileSync(path.join(project.root, ".tied-yaml.yaml"), "scalar_style: invalid\n");
    assert.throws(
      () =>
        resolveYamlStyle(project.tied, {
          ...process.env,
          TIED_YAML_STYLE: "wrapped",
        }),
      (error: unknown) =>
        error instanceof YamlStyleConfigurationError &&
        error.message.includes("Invalid scalar_style") &&
        error.message.includes(".tied-yaml.yaml"),
    );
  } finally {
    fs.rmSync(project.root, { recursive: true, force: true });
  }
});
