/**
 * [IMPL-TIED_FILES] [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_STRUCTURE] [ARCH-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_SETUP] [REQ-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_VOCABULARY_OWNERSHIP]
 * How: Exercise bootstrap and layered vocabulary refresh behavior while preserving client-owned project YAML, documentation, vocabulary, and unrelated content.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync, execSync } from "node:child_process";
import {
  clearBasePathCache,
  loadIndex,
  getRecord,
  resolveIndexPath,
} from "../yaml-loader.js";

type BootstrapEntrypoint = "node" | "bash" | "tied";

function runBootstrap(
  repoRoot: string,
  options: {
    entrypoint?: BootstrapEntrypoint;
    target: string;
    args?: string[];
    env?: NodeJS.ProcessEnv;
    mode?: "linked" | "full";
  }
): string {
  const entrypoint = options.entrypoint ?? "node";
  const installMode = options.mode ?? "linked";
  const extraArgs = options.args ?? [];
  const env = { ...process.env, ...options.env };
  if (options.env) {
    for (const key of ["TIED_MCP_COLLECT_METRICS", "TIED_MCP_METRICS_CLIENT"] as const) {
      if (!(key in options.env)) delete env[key];
    }
  }
  if (entrypoint === "node") {
    const nodeCli = path.join(repoRoot, "tools", "bootstrap", "install-layers.mjs");
    return execFileSync(
      process.execPath,
      [nodeCli, "--store", repoRoot, "--mode", installMode, ...extraArgs, options.target],
      {
        stdio: "pipe",
        cwd: repoRoot,
        env,
      },
    ).toString();
  }
  if (entrypoint === "tied") {
    const tiedCli = path.join(repoRoot, "mcp-server", "packages", "cli", "dist", "index.js");
    return execFileSync(
      process.execPath,
      [tiedCli, "bootstrap", ...extraArgs, options.target],
      { stdio: "pipe", cwd: repoRoot, env },
    ).toString();
  }
  const copyScript = path.join(repoRoot, "tied-install.sh");
  return execFileSync("bash", [copyScript, ...extraArgs, options.target], {
    stdio: "pipe",
    cwd: repoRoot,
    env,
  }).toString();
}

function tiedRepoRootForAssertions(repoRoot: string): string {
  const rp = fs.realpathSync.native ?? fs.realpathSync.bind(fs);
  return rp(repoRoot).split(path.sep).join("/");
}

function jsonSafeAbsoluteForTest(p: string): string {
  const rp = fs.realpathSync.native ?? fs.realpathSync.bind(fs);
  return rp(p).split(path.sep).join("/");
}

function assertLinkedWrapperBakesStoreRoot(scriptText: string, storeRoot: string, label: string) {
  assert.ok(
    scriptText.includes(`export TIED_REPO_ROOT="\${TIED_REPO_ROOT:=${storeRoot}}"`) ||
      scriptText.includes(`TIED_REPO_ROOT:=${storeRoot}`),
    `${label} should export a baked TIED_REPO_ROOT default for the store checkout`
  );
}

function bashAvailable(): boolean {
  try {
    execFileSync("bash", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function execShellScript(scriptPath: string, args: string[], options: { cwd: string; env: NodeJS.ProcessEnv }): string {
  return execFileSync("bash", [scriptPath, ...args], { ...options, stdio: "pipe" }).toString();
}

function readLinkedOrMaterializedDoc(
  clientRoot: string,
  storeRoot: string,
  docName: string,
): string {
  const clientPath = path.join(clientRoot, "tied-bundle", "docs", docName);
  const text = fs.readFileSync(clientPath, "utf8");
  if (!text.includes("linked install stub")) {
    return text;
  }
  return fs.readFileSync(path.join(storeRoot, "tied-bundle", "docs", docName), "utf8");
}

function runValidateVocabIndexIfAvailable(repoRoot: string, projectRoot: string): void {
  const installJson = path.join(projectRoot, "tied-bundle", "install.json");
  if (fs.existsSync(installJson)) {
    try {
      const profile = JSON.parse(fs.readFileSync(installJson, "utf8")) as { mode?: string };
      if (profile.mode === "linked") {
        return;
      }
    } catch {
      /* fall through */
    }
  }
  try {
    execFileSync("ruby", [path.join(repoRoot, "scripts", "validate_vocab_index.rb"), projectRoot], {
      cwd: repoRoot,
      stdio: "pipe",
    });
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return;
    }
    throw e;
  }
}

describe("e2e: bootstrap and load", () => {
  let tempDir: string;
  let repoRoot: string;

  beforeEach(() => {
    clearBasePathCache();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-e2e-"));
    // When run from mcp-server (npm test), cwd is mcp-server; repo root is parent.
    repoRoot = path.resolve(process.cwd(), "..");
  });

  afterEach(() => {
    delete process.env.TIED_BASE_PATH;
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  it("tied bootstrap subcommand populates tied/ [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), "tied-bootstrap-cli-"));
    try {
      runBootstrap(repoRoot, { target, entrypoint: "bash" });
      assert.ok(fs.existsSync(path.join(target, "tied-project", "requirements.yaml")));
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  });

  it("tied-install populates tied-project/ and loader reads requirements index [IMPL-TIED_FILES] [REQ-TIED_SETUP] [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
    const copyScript = path.join(repoRoot, "tied-install.sh");
    const nodeCli = path.join(repoRoot, "tools", "bootstrap", "install-layers.mjs");
    const tiedUmbrellaCli = path.join(repoRoot, "mcp-server", "packages", "cli", "dist", "index.js");
    assert.ok(fs.existsSync(copyScript), `tied-install.sh not found at ${copyScript}`);
    assert.ok(fs.existsSync(nodeCli), `install-layers.mjs not found at ${nodeCli}`);
    assert.ok(fs.existsSync(tiedUmbrellaCli), `tied CLI not built at ${tiedUmbrellaCli}`);
    const bootstrapOutput = runBootstrap(repoRoot, { target: tempDir, entrypoint: "node" });
    assert.match(
      bootstrapOutput,
      /MUST verify fidelity research methodology artifacts/,
      "bootstrap should report the mandatory fidelity methodology gate"
    );
    assert.match(
      bootstrapOutput,
      /MUST verify adversarial inquiry methodology artifacts: complete\./,
      "bootstrap should report the adversarial inquiry inheritance gate [REQ-TIED_ADVERSARIAL_INQUIRY]"
    );
    assert.match(
      bootstrapOutput,
      /MUST verify feature orchestration methodology artifacts/,
      "bootstrap should report the mandatory feature orchestration methodology gate [REQ-FEAT_ONBOARDING_COMMANDS]"
    );
    assert.match(
      bootstrapOutput,
      /MUST verify inherited methodology detail-file integrity: complete\./,
      "bootstrap should report the inherited detail-file integrity gate [REQ-TIED_BOOTSTRAP_DETAIL_INTEGRITY]"
    );
    const projectDir = path.join(tempDir, "tied-project");
    const bundleDir = path.join(tempDir, "tied-bundle");
    assert.ok(fs.existsSync(projectDir), "tied-project/ should exist after install");
    assert.ok(fs.existsSync(bundleDir), "tied-bundle/ should exist after linked install");
    assert.ok(
      fs.existsSync(path.join(tempDir, ".cursor", "mcp.json")),
      "tied-install.sh should initialize .cursor/mcp.json when it is absent [IMPL-TIED_FILES]"
    );
    const requirementsPath = path.join(projectDir, "requirements.yaml");
    assert.ok(fs.existsSync(requirementsPath), "tied-project/requirements.yaml should exist");

    process.env.TIED_BASE_PATH = projectDir;
    clearBasePathCache();

    const resolved = resolveIndexPath("requirements");
    assert.ok(
      resolved.includes("tied") && resolved.endsWith("requirements.yaml"),
      `resolveIndexPath should point into tied/; got ${resolved}`
    );

    const data = loadIndex("requirements");
    assert.ok(data !== null && typeof data === "object", "loadIndex(requirements) should return an object");
    assert.ok(
      "REQ-TIED_SETUP" in data,
      "Copied index should contain inherited token REQ-TIED_SETUP"
    );
    assert.ok(
      "REQ-MODULE_VALIDATION" in data,
      "Copied index should contain inherited token REQ-MODULE_VALIDATION"
    );
    assert.ok(
      "REQ-TIED_FIDELITY_RESEARCH" in data,
      "Copied index should contain inherited fidelity research requirement"
    );
    assert.ok(
      fs.existsSync(
        path.join(bundleDir, "requirements", "REQ-TIED_FIDELITY_RESEARCH.yaml")
      ),
      "Methodology should include the fidelity research requirement detail"
    );
    assert.ok(
      fs.existsSync(
        path.join(bundleDir, "architecture-decisions", "ARCH-TIED_FIDELITY_RESEARCH.yaml")
      ),
      "Methodology should include the fidelity research architecture detail"
    );
    assert.ok(
      fs.existsSync(
        path.join(bundleDir, "implementation-decisions", "IMPL-TIED_FIDELITY_RESEARCH.yaml")
      ),
      "Methodology should include the fidelity research implementation detail"
    );
    assert.ok(
      fs.existsSync(
        path.join(bundleDir, "implementation-decisions", "IMPL-TIED_FIDELITY_RESEARCH-pseudocode.md")
      ),
      "Methodology should include the fidelity research pseudo-code sidecar"
    );
    for (const relative of [
      "requirements/REQ-TIED_ADVERSARIAL_INQUIRY.yaml",
      "architecture-decisions/ARCH-TIED_ADVERSARIAL_INQUIRY.yaml",
      "implementation-decisions/IMPL-TIED_ADVERSARIAL_INQUIRY.yaml",
      "implementation-decisions/IMPL-TIED_ADVERSARIAL_INQUIRY-pseudocode.md",
      "implementation-decisions/IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST.yaml",
      "implementation-decisions/IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST-pseudocode.md",
    ]) {
      assert.ok(
        fs.existsSync(path.join(bundleDir, relative)),
        `bootstrap should inherit adversarial inquiry artifact ${relative} [IMPL-TIED_FILES] [REQ-TIED_ADVERSARIAL_INQUIRY]`
      );
    }
    assert.ok(
      fs.existsSync(path.join(projectDir, "constitution.example.yaml")),
      "bootstrap should publish the create-if-missing project constitution example [IMPL-TIED_FILES]"
    );
    assert.ok(
      fs.existsSync(path.join(bundleDir, "docs", "tied-feature-onboarding.md")),
      "bootstrap should publish the feature onboarding guide [REQ-FEAT_ADOPTION_GUIDANCE]"
    );
    const clientDevIndex = readLinkedOrMaterializedDoc(tempDir, repoRoot, "client-development-index.md");
    assert.match(
      clientDevIndex,
      /evidence-chain-profile\.md/,
      "client development index should link the evidence chain profile guide [REQ-EVIDENCE_CHAIN_PROFILE]"
    );
    assert.ok(
      fs.existsSync(path.join(bundleDir, "docs", "evidence-chain-profile.md")),
      "bootstrap must copy evidence-chain-profile.md whenever the index links it [REQ-EVIDENCE_CHAIN_PROFILE] [IMPL-TIED_FILES]"
    );
    assert.ok(
      "REQ-EVIDENCE_CHAIN_PROFILE" in data,
      "Copied requirements index should inherit REQ-EVIDENCE_CHAIN_PROFILE [REQ-EVIDENCE_CHAIN_PROFILE]"
    );
    assert.ok(
      fs.existsSync(path.join(bundleDir, "requirements", "REQ-EVIDENCE_CHAIN_PROFILE.yaml")),
      "Methodology should include the evidence chain profile requirement detail"
    );
    assert.ok(
      fs.existsSync(path.join(bundleDir, "architecture-decisions", "ARCH-EVIDENCE_CHAIN_PROFILE.yaml")),
      "Methodology should include the evidence chain profile architecture detail"
    );
    assert.ok(
      fs.existsSync(path.join(bundleDir, "implementation-decisions", "IMPL-EVIDENCE_CHAIN_PROFILE.yaml")),
      "Methodology should include the evidence chain profile implementation detail"
    );
    assert.ok(
      fs.existsSync(
        path.join(bundleDir, "implementation-decisions", "IMPL-EVIDENCE_CHAIN_PROFILE-pseudocode.md"),
      ),
      "Methodology should include the evidence chain profile pseudo-code sidecar"
    );
    assert.ok(
      !("REQ-EVIDENCE_CHAIN_REPORT" in data),
      "Copied methodology must not inherit source-only REQ-EVIDENCE_CHAIN_REPORT [REQ-EVIDENCE_CHAIN_REPORT]"
    );
    assert.ok(
      !fs.existsSync(path.join(bundleDir, "requirements", "REQ-EVIDENCE_CHAIN_REPORT.yaml")),
      "Methodology must not include the statistics report requirement"
    );
    assert.ok(
      fs.existsSync(path.join(bundleDir, "vocab", "feature-orchestration.md")),
      "bootstrap should publish feature orchestration vocabulary in the methodology snapshot [PROC-VOCABULARY_INDEX]"
    );
    runValidateVocabIndexIfAvailable(repoRoot, tempDir);

    assert.ok(
      fs.existsSync(
        path.join(bundleDir, "requirements", "REQ-FEEDBACK_TO_TIED.yaml")
      ),
      "Methodology should include the feedback requirement detail [REQ-FEEDBACK_TO_TIED]"
    );
    assert.ok(
      fs.existsSync(
        path.join(bundleDir, "architecture-decisions", "ARCH-FEEDBACK_STORAGE.yaml")
      ),
      "Methodology should include the feedback architecture detail [ARCH-FEEDBACK_STORAGE]"
    );
    assert.ok(
      fs.existsSync(
        path.join(bundleDir, "architecture-decisions", "ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM.yaml"),
      ),
      "Methodology should include cross-platform bootstrap architecture detail [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM]",
    );
    const methodologyArchRaw = fs.readFileSync(
      path.join(bundleDir, "architecture-decisions.yaml"),
      "utf8",
    );
    assert.match(
      methodologyArchRaw,
      /^ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM:/m,
      "Methodology architecture index should inherit ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM [REQ-TIED_SETUP]",
    );
    assert.ok(
      fs.existsSync(
        path.join(bundleDir, "implementation-decisions", "IMPL-MCP_FEEDBACK_TOOLS.yaml")
      ),
      "Methodology should include the feedback implementation detail [IMPL-MCP_FEEDBACK_TOOLS]"
    );
    const rec = getRecord("requirements", "REQ-TIED_SETUP");
    assert.ok(rec !== null && typeof rec === "object", "getRecord should return REQ-TIED_SETUP");
    const recObj = rec as Record<string, unknown>;
    assert.strictEqual(recObj.name, "TIED Methodology Setup");
    assert.strictEqual(
      recObj.detail_file,
      "requirements/REQ-TIED_SETUP.yaml",
      "inherited REQ-TIED_SETUP index must reference usable detail_file path"
    );
    const moduleRec = getRecord("requirements", "REQ-MODULE_VALIDATION") as Record<string, unknown>;
    assert.strictEqual(
      moduleRec.detail_file,
      "requirements/REQ-MODULE_VALIDATION.yaml",
      "inherited REQ-MODULE_VALIDATION index must reference usable detail_file path"
    );

    const tiedCli = path.join(tempDir, ".cursor", "skills", "tied-yaml", "scripts", "tied-cli.sh");
    assert.ok(
      fs.existsSync(tiedCli),
      "tied-install.sh should install the canonical tied-cli at .cursor/skills/tied-yaml/scripts/tied-cli.sh [IMPL-TIED_FILES]"
    );
    const tiedCliText = fs.readFileSync(tiedCli, "utf8");
    const tiedRepoRootReal = tiedRepoRootForAssertions(repoRoot);
    const storeTiedCli = path.join(repoRoot, "tools", "bundled-tied-yaml-skill", "scripts", "tied-cli.sh");
    assert.ok(
      tiedCliText.includes(`exec "${storeTiedCli}"`) ||
        tiedCliText.includes(`TIED_REPO_ROOT:=${tiedRepoRootReal}`),
      "linked tied-cli.sh should exec the store script or bake TIED_REPO_ROOT from the TIED repo used for install"
    );
    assertLinkedWrapperBakesStoreRoot(tiedCliText, tiedRepoRootReal, "installed tied-cli.sh");
    const tiedOnboarding = path.join(tempDir, ".cursor", "skills", "tied-yaml", "scripts", "tied.sh");
    assert.ok(
      fs.existsSync(tiedOnboarding),
      "tied-install.sh should install the feature onboarding wrapper [REQ-FEAT_ONBOARDING_COMMANDS]"
    );
    if (process.platform !== "win32") {
      assert.ok(
        (fs.statSync(tiedOnboarding).mode & 0o111) !== 0,
        "installed tied.sh should be executable [IMPL-TIED_FILES]"
      );
    }
    const tiedOnboardingText = fs.readFileSync(tiedOnboarding, "utf8");
    assertLinkedWrapperBakesStoreRoot(tiedOnboardingText, tiedRepoRootReal, "installed tied.sh");
    const featureOrchestrator = path.join(tempDir, ".cursor", "skills", "tied-yaml", "scripts", "feature-orchestrator.sh");
    assert.ok(
      fs.existsSync(featureOrchestrator),
      "tied-install.sh should install the standalone feature orchestration wrapper [REQ-FEAT_ORCHESTRATION_SURFACE]"
    );
    assertLinkedWrapperBakesStoreRoot(
      fs.readFileSync(featureOrchestrator, "utf8"),
      tiedRepoRootReal,
      "installed feature-orchestrator.sh"
    );
    if (bashAvailable()) {
      const onboardingResult = execShellScript(tiedOnboarding, ["init"], {
        cwd: tempDir,
        env: { ...process.env, TIED_BASE_PATH: projectDir },
      });
      assert.match(onboardingResult, /"delegate": "feature-orchestrator bootstrap boundary"/);
      const featureResult = execShellScript(tiedOnboarding, ["feature", "new", "Fresh client smoke"], {
        cwd: tempDir,
        env: { ...process.env, TIED_BASE_PATH: projectDir },
      });
      assert.match(featureResult, /"delegate": "FeatureStore\.createIdempotently"/);
    }
    const rootScriptsTiedCli = path.join(tempDir, "scripts", "tied-cli.sh");
    assert.ok(
      !fs.existsSync(rootScriptsTiedCli),
      "tied-install.sh should not create scripts/tied-cli.sh (single CLI path is under .cursor/skills/) [IMPL-TIED_FILES]"
    );

    const legacyMcpEnableCommand = ["agent", "enable", "tied-yaml"].join(" ");
    const currentMcpEnableCommand = ["agent", "mcp", "enable", "tied-yaml"].join(" ");
    const bundledSkillPath = path.join(repoRoot, "tools", "bundled-tied-yaml-skill", "SKILL.md");
    const bundledSkillText = fs.readFileSync(bundledSkillPath, "utf8");
    assert.match(
      bundledSkillText,
      new RegExp(currentMcpEnableCommand.replaceAll(" ", "\\s+")),
      "bundled tied-yaml skill should document the current MCP enable command [REQ-TIED_SETUP]"
    );
    assert.doesNotMatch(
      bundledSkillText,
      new RegExp(legacyMcpEnableCommand.replaceAll(" ", "\\s+")),
      "bundled tied-yaml skill should not retain the legacy MCP enable command [REQ-TIED_SETUP]"
    );
    const installedSkillPath = path.join(tempDir, ".cursor", "skills", "tied-yaml", "SKILL.md");
    assert.match(
      fs.readFileSync(installedSkillPath, "utf8"),
      /linked install stub|Read and follow the canonical skill at/,
      "installed tied-yaml skill should be a linked stub pointing at the store skill [REQ-TIED_LAYERED_CLIENT_INSTALL]"
    );

    // [IMPL-TIED_FILES] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_STRUCTURE] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_SETUP] [REQ-TIED_VOCABULARY_OWNERSHIP]
    // How: Verify the client handoff reaches the refreshable methodology vocabulary while source-only glossaries stay source-only.
    const vocabIndex = path.join(projectDir, "vocab", "domain-references.md");
    const vocabRouting = path.join(projectDir, "vocab", "routing.md");
    const methodologyVocabIndex = path.join(bundleDir, "vocab", "domain-references.md");
    const methodologyVocabRouting = path.join(bundleDir, "vocab", "routing.md");
    const vocabMethodology = path.join(bundleDir, "vocab", "tied-methodology.md");
    assert.ok(
      fs.existsSync(vocabIndex),
      "tied-install.sh should create the client vocabulary catalog handoff [IMPL-TIED_FILES] [PROC-VOCABULARY_INDEX]"
    );
    assert.ok(
      fs.existsSync(vocabRouting),
      "tied-install.sh should create the client vocabulary routing handoff [IMPL-TIED_FILES] [PROC-VOCABULARY_INDEX]"
    );
    assert.ok(
      fs.existsSync(vocabMethodology),
      "tied-install.sh should install tied-methodology.md in the methodology snapshot [REQ-TIED_SETUP]"
    );
    assert.ok(
      fs.existsSync(path.join(bundleDir, "vocab", "fidelity-research.md")),
      "tied-install.sh should install fidelity-research.md in the methodology snapshot"
    );
    assert.ok(
      fs.existsSync(path.join(repoRoot, "tied-project", "vocab", "prompt-composer.md")),
      "TIED source should retain the Prompt Composer glossary for source-only development"
    );
    assert.ok(
      !fs.existsSync(path.join(projectDir, "vocab", "prompt-composer.md")),
      "tied-install.sh should not publish the source-only Prompt Composer glossary to clients"
    );
    assert.ok(
      !fs.existsSync(path.join(bundleDir, "vocab", "prompt-composer.md")),
      "tied-install.sh should not publish the source-only Prompt Composer glossary in the methodology snapshot"
    );
    const clientVocabRouting = fs.readFileSync(vocabRouting, "utf8");
    const clientVocabCatalog = fs.readFileSync(vocabIndex, "utf8");
    assert.match(
      clientVocabRouting,
      /\.\.\/\.\.\/tied-bundle\/vocab\/routing\.md/,
      "client routing should dispatch to the methodology routing index under tied-bundle/vocab"
    );
    assert.match(
      clientVocabCatalog,
      /\.\.\/\.\.\/tied-bundle\/vocab\/domain-references\.md/,
      "client catalog should dispatch to the methodology catalog under tied-bundle/vocab"
    );
    assert.match(
      fs.readFileSync(methodologyVocabRouting, "utf8"),
      /Glossary routing table/,
      "methodology routing should remain the canonical methodology discovery surface"
    );
    assert.match(
      fs.readFileSync(methodologyVocabIndex, "utf8"),
      /Canonical glossaries/,
      "methodology catalog should remain the canonical methodology catalog"
    );
    assert.doesNotMatch(
      clientVocabRouting,
      /prompt-composer\.md/,
      "client routing should not advertise the source-only Prompt Composer glossary"
    );
    assert.doesNotMatch(
      clientVocabCatalog,
      /prompt-composer\.md/,
      "client vocabulary catalog should not link the source-only Prompt Composer glossary"
    );
    const clientPromptTypeDocs = fs.readFileSync(
      path.join(bundleDir, "docs", "prompt-type-skills.md"),
      "utf8"
    );
    assert.doesNotMatch(
      clientPromptTypeDocs,
      /\]\(\.\.\/vocab\/prompt-composer\.md\)/,
      "client prompt-type documentation should not link the source-only glossary"
    );

    const vocabStandards = path.join(tempDir, "tied-bundle", "docs", "vocabulary-index-analysis-and-standards.md");
    const pseudoFormat = path.join(tempDir, "tied-bundle", "docs", "pseudocode-format-and-practices.md");
    const fidelityGuide = path.join(tempDir, "tied-bundle", "docs", "tied-fidelity-research.md");
    const fidelityPrompt = path.join(tempDir, "tied-bundle", "docs", "pseudocode-fidelity-audit-agent-prompt.md");
    assert.ok(
      fs.existsSync(vocabStandards),
      "tied-install.sh should copy tied-bundle/docs/vocabulary-index-analysis-and-standards.md [IMPL-TIED_FILES] [PROC-VOCABULARY_INDEX]"
    );
    assert.ok(
      fs.existsSync(pseudoFormat),
      "tied-install.sh should copy tied-bundle/docs/pseudocode-format-and-practices.md [IMPL-TIED_FILES]"
    );
    assert.ok(
      fs.existsSync(fidelityGuide),
      "tied-install.sh should copy tied-bundle/docs/tied-fidelity-research.md"
    );
    assert.ok(
      fs.existsSync(fidelityPrompt),
      "tied-install.sh should copy the fidelity audit prompt"
    );

  });

  it("initializes opt-in MCP metrics fields with an override or project basename [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS]", () => {
    // [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS]
    // How: Create the default TIED MCP configuration only when the client has no .cursor/mcp.json; when TIED_MCP_COLLECT_METRICS is exactly 1, add metrics fields and derive the client label from an explicit override or the project basename; preserve an existing configuration byte-for-byte.
    const runBootstrapMetrics = (target: string, metricsValue?: string, clientValue?: string) => {
      const env: NodeJS.ProcessEnv = { ...process.env };
      delete env.TIED_MCP_COLLECT_METRICS;
      delete env.TIED_MCP_METRICS_CLIENT;
      if (metricsValue !== undefined) env.TIED_MCP_COLLECT_METRICS = metricsValue;
      if (clientValue !== undefined) env.TIED_MCP_METRICS_CLIENT = clientValue;
      runBootstrap(repoRoot, { target, entrypoint: "node", env });
      return JSON.parse(fs.readFileSync(path.join(target, ".cursor", "mcp.json"), "utf8")) as {
        mcpServers: { "tied-yaml": { env: Record<string, string> } };
      };
    };

    const linkedMcpEnv = (target: string, extra: Record<string, string> = {}) => ({
      TIED_BASE_PATH: jsonSafeAbsoluteForTest(path.join(target, "tied-project")),
      TIED_METHODOLOGY_BUNDLE_PATH: jsonSafeAbsoluteForTest(path.join(target, "tied-bundle")),
      TIED_STORE_ROOT: jsonSafeAbsoluteForTest(repoRoot),
      ...extra,
    });

    const basenameTarget = path.join(tempDir, "basename-client");
    fs.mkdirSync(basenameTarget);
    const basenameConfig = runBootstrapMetrics(basenameTarget, "1");
    assert.deepStrictEqual(basenameConfig.mcpServers["tied-yaml"].env, linkedMcpEnv(basenameTarget, {
      TIED_MCP_COLLECT_METRICS: "1",
      TIED_MCP_METRICS_CLIENT: "basename-client",
    }));

    const overrideTarget = path.join(tempDir, "override-client");
    fs.mkdirSync(overrideTarget);
    const overrideConfig = runBootstrapMetrics(overrideTarget, "1", "explicit-client");
    assert.strictEqual(
      overrideConfig.mcpServers["tied-yaml"].env.TIED_MCP_METRICS_CLIENT,
      "explicit-client"
    );

    const nonOneTarget = path.join(tempDir, "non-one-client");
    fs.mkdirSync(nonOneTarget);
    const nonOneConfig = runBootstrapMetrics(nonOneTarget, "true");
    assert.deepStrictEqual(nonOneConfig.mcpServers["tied-yaml"].env, linkedMcpEnv(nonOneTarget));
  });

  it("refreshes layered vocabulary without overwriting client content [IMPL-TIED_FILES] [IMPL-TIED_VOCABULARY_REFRESH] [REQ-TIED_VOCABULARY_OWNERSHIP]", () => {
    // [IMPL-TIED_FILES] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_STRUCTURE] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_SETUP] [REQ-TIED_VOCABULARY_OWNERSHIP]
    // How: Refresh the inherited methodology snapshot, prune stale methodology vocabulary, and preserve client-owned content.
    const projectDir = path.join(tempDir, "tied-project");
    const bundleDir = path.join(tempDir, "tied-bundle");
    const projectRequirements = path.join(projectDir, "requirements.yaml");
    const customRequirement = path.join(projectDir, "requirements", "REQ-CLIENT_ONLY.yaml");
    const customDoc = path.join(bundleDir, "docs", "methodology-migration.md");
    const vocabDir = path.join(projectDir, "vocab");
    const customRouting = path.join(vocabDir, "routing.md");
    const customVocab = path.join(vocabDir, "client-only.md");
    const mcpConfigPath = path.join(tempDir, ".cursor", "mcp.json");
    const unrelatedClientFile = path.join(tempDir, "client-notes.txt");

    fs.mkdirSync(path.dirname(projectRequirements), { recursive: true });
    fs.mkdirSync(path.dirname(customRequirement), { recursive: true });
    fs.mkdirSync(path.dirname(customDoc), { recursive: true });
    fs.mkdirSync(vocabDir, { recursive: true });
    fs.writeFileSync(projectRequirements, "# client project YAML sentinel\nCLIENT_PROJECT: preserved\n");
    fs.writeFileSync(customRequirement, "REQ-CLIENT_ONLY:\n  name: client sentinel\n");
    fs.writeFileSync(customDoc, "# Client migration notes\npreserve this customized document.\n");
    fs.writeFileSync(customRouting, "# Client routing glossary\npreserve this customized glossary.\n");
    fs.writeFileSync(customVocab, "# Client-only glossary\n");
    fs.writeFileSync(unrelatedClientFile, "unrelated client content\n");

    runBootstrap(repoRoot, { target: tempDir, entrypoint: "node" });
    const preservedMcpConfig = [
      "{",
      '  "customSetting": "preserve me",',
      '  "mcpServers": {',
      '    "other-server": {"command": "custom-node"}',
      "  }",
      "}",
      "",
    ].join("\n");
    fs.writeFileSync(mcpConfigPath, preservedMcpConfig);

    const methodologyDir = bundleDir;
    const staleMethodologyFile = path.join(
      methodologyDir,
      "implementation-decisions",
      "STALE-INHERITED.yaml"
    );
    const staleMethodologySidecar = path.join(
      methodologyDir,
      "implementation-decisions",
      "STALE-INHERITED-pseudocode.md"
    );
    fs.writeFileSync(staleMethodologyFile, "stale: true\n");
    fs.writeFileSync(staleMethodologySidecar, "# stale inherited sidecar\n");

    // [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
    // How: Refresh inherited methodology and vocabulary while preserving an existing client MCP configuration byte-for-byte.
    const refreshOutput = runBootstrap(repoRoot, {
      target: tempDir,
      entrypoint: "node",
      args: ["--refresh", "--merge-vocab"],
      env: {
        ...process.env,
        TIED_MCP_COLLECT_METRICS: "1",
        TIED_MCP_METRICS_CLIENT: "should-not-rewrite",
      },
    });
    assert.match(
      refreshOutput,
      /Preserved \d+ existing methodology document\(s\); compare them with|Preserved existing client constitution example/,
      "refresh must report preserved client or methodology documentation (full copy or constitution path)"
    );

    assert.strictEqual(
      fs.readFileSync(projectRequirements, "utf8"),
      "# client project YAML sentinel\nCLIENT_PROJECT: preserved\n",
      "refresh must preserve client project YAML"
    );
    assert.strictEqual(
      fs.readFileSync(customRequirement, "utf8"),
      "REQ-CLIENT_ONLY:\n  name: client sentinel\n",
      "refresh must preserve client detail YAML"
    );
    assert.match(
      fs.readFileSync(customDoc, "utf8"),
      /linked install stub|# TIED client methodology migration/,
      "linked refresh re-materializes methodology docs from the store (stubs or canonical copy)"
    );
    assert.strictEqual(
      fs.readFileSync(customRouting, "utf8"),
      "# Client routing glossary\npreserve this customized glossary.\n",
      "merge must preserve customized routing vocabulary"
    );
    assert.ok(
      fs.existsSync(path.join(methodologyDir, "vocab", "quality-assurance.md")),
      "refresh must add an absent methodology glossary to the methodology snapshot"
    );
    assert.ok(
      fs.existsSync(path.join(methodologyDir, "vocab", "fidelity-research.md")),
      "refresh must add the absent fidelity research glossary to the methodology snapshot"
    );
    assert.ok(
      fs.existsSync(path.join(methodologyDir, "vocab", "feature-orchestration.md")),
      "refresh must add the absent feature orchestration glossary to the methodology snapshot"
    );
    assert.ok(
      !fs.existsSync(path.join(vocabDir, "prompt-composer.md")),
      "merge must not add the source-only Prompt Composer glossary"
    );
    assert.ok(
      !fs.existsSync(path.join(methodologyDir, "vocab", "prompt-composer.md")),
      "refresh must not add the source-only Prompt Composer glossary to the methodology snapshot"
    );
    assert.doesNotMatch(
      fs.readFileSync(path.join(vocabDir, "domain-references.md"), "utf8"),
      /prompt-composer\.md/,
      "merge must not leave a source-only Prompt Composer link in a new client catalog"
    );
    assert.ok(fs.existsSync(customVocab), "merge must preserve unrelated client vocabulary");
    assert.strictEqual(
      fs.readFileSync(unrelatedClientFile, "utf8"),
      "unrelated client content\n",
      "refresh must preserve unrelated client content"
    );
    assert.strictEqual(
      fs.readFileSync(mcpConfigPath, "utf8"),
      preservedMcpConfig,
      "refresh must preserve an existing .cursor/mcp.json byte-for-byte"
    );
    assert.ok(
      fs.existsSync(staleMethodologyFile) && fs.existsSync(staleMethodologySidecar),
      "linked refresh does not delete ad-hoc files under tied-bundle/ (full materialization replaces the tree)"
    );

    const promotedQualityDetail = path.join(
      methodologyDir,
      "implementation-decisions",
      "IMPL-QUALITY_EVIDENCE_MANIFEST.yaml"
    );
    const promotedQualitySidecar = path.join(
      methodologyDir,
      "implementation-decisions",
      "IMPL-QUALITY_EVIDENCE_MANIFEST-pseudocode.md"
    );
    assert.ok(fs.existsSync(promotedQualityDetail), "refresh must install promoted quality detail YAML");
    assert.ok(fs.existsSync(promotedQualitySidecar), "refresh must install promoted quality pseudo-code sidecar");
    assert.match(
      fs.readFileSync(promotedQualitySidecar, "utf8"),
      /\[IMPL-QUALITY_EVIDENCE_MANIFEST\]/,
      "promoted quality sidecar must retain its literal token linkage"
    );
    assert.ok(
      fs.existsSync(
        path.join(
          methodologyDir,
          "implementation-decisions",
          "IMPL-TIED_FIDELITY_RESEARCH-pseudocode.md"
        )
      ),
      "refresh must install the fidelity research pseudo-code sidecar"
    );

    for (const indexName of [
      "requirements.yaml",
      "architecture-decisions.yaml",
      "implementation-decisions.yaml",
      "semantic-tokens.yaml",
    ]) {
      assert.ok(
        fs.existsSync(path.join(methodologyDir, indexName)),
        `linked tied-bundle must expose methodology index ${indexName}`
      );
    }
    assert.ok(
      fs.existsSync(path.join(methodologyDir, "vocab", "routing.md")),
      "linked refresh must materialize methodology routing vocabulary under tied-bundle/vocab"
    );
  });

  it("loader reads semantic-tokens index from bootstrapped tied-project/ [IMPL]", () => {
    runBootstrap(repoRoot, { target: tempDir, entrypoint: "node" });
    const projectDir = path.join(tempDir, "tied-project");
    process.env.TIED_BASE_PATH = projectDir;
    clearBasePathCache();

    const data = loadIndex("semantic-tokens");
    assert.ok(data !== null && typeof data === "object", "loadIndex(semantic-tokens) should return an object");
    assert.ok(
      Object.keys(data).some((k) => k.startsWith("REQ-") || k.startsWith("ARCH-") || k.startsWith("IMPL-") || k.startsWith("PROC-")),
      "semantic-tokens index should contain token keys"
    );

    delete process.env.TIED_BASE_PATH;
  });
});
