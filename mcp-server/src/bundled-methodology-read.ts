/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 * SPIKE_BUNDLED_METHODOLOGY_READ — parity probes for bundled vs copied-tree methodology reads.
 * Does not change project-only write policy (detail-loader / yaml-loader).
 */

import fs from "node:fs";
import path from "node:path";
import {
  clearBasePathCache,
  getMethodologyBasePath,
  isTokenInMethodology,
  loadIndex,
  resolveBundledMethodologyPath,
} from "./yaml-loader.js";
import { getDetailPath, listDetailTokens, loadDetail } from "./detail-loader.js";
import type { DetailType } from "./detail-loader.js";

export { resolveBundledMethodologyPath };

export type WriteCopiedTreeFixtureOptions = {
  /** G2 pilot: project YAML only on disk; methodology corpus lives in bundleOut only. */
  omitLocalMethodology?: boolean;
};

/**
 * Build parity fixture: project indexes under tiedBasePath; methodology tree copied to bundleOut.
 */
export function writeCopiedTreeFixture(
  tiedBasePath: string,
  bundleOut: string,
  options?: WriteCopiedTreeFixtureOptions,
): string[] {
  const methodologyDir = path.join(tiedBasePath, "methodology");
  const projectReqDir = path.join(tiedBasePath, "requirements");
  fs.mkdirSync(methodologyDir, { recursive: true });
  fs.mkdirSync(projectReqDir, { recursive: true });

  fs.writeFileSync(
    path.join(methodologyDir, "requirements.yaml"),
    [
      "REQ-METH-ONLY:",
      '  name: "Methodology only"',
      '  detail_file: "requirements/REQ-METH-ONLY.yaml"',
      "REQ-FALLBACK:",
      '  name: "Methodology index"',
      '  detail_file: "null"',
      "REQ-SENTINEL-ONLY:",
      '  name: "Sentinel only"',
      '  detail_file: "null"',
    ].join("\n"),
    "utf8",
  );
  fs.writeFileSync(
    path.join(tiedBasePath, "requirements.yaml"),
    [
      "REQ-FALLBACK:",
      '  name: "Project index"',
      '  detail_file: "requirements/REQ-FALLBACK.yaml"',
      "REQ-PROJECT-ONLY:",
      '  name: "Project only"',
      '  detail_file: "requirements/REQ-PROJECT-ONLY.yaml"',
    ].join("\n"),
    "utf8",
  );
  fs.mkdirSync(path.join(methodologyDir, "requirements"), { recursive: true });
  fs.writeFileSync(
    path.join(methodologyDir, "requirements", "REQ-METH-ONLY.yaml"),
    "REQ-METH-ONLY:\n  name: Methodology detail\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(methodologyDir, "requirements", "REQ-FALLBACK.yaml"),
    "REQ-FALLBACK:\n  name: Methodology copy\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(projectReqDir, "REQ-FALLBACK.yaml"),
    "REQ-FALLBACK:\n  name: Project copy\n",
    "utf8",
  );
  fs.writeFileSync(
    path.join(projectReqDir, "REQ-PROJECT-ONLY.yaml"),
    "REQ-PROJECT-ONLY:\n  name: Project detail\n",
    "utf8",
  );
  fs.writeFileSync(path.join(tiedBasePath, "architecture-decisions.yaml"), "{}\n", "utf8");
  fs.writeFileSync(path.join(tiedBasePath, "implementation-decisions.yaml"), "{}\n", "utf8");
  fs.writeFileSync(path.join(tiedBasePath, "semantic-tokens.yaml"), "{}\n", "utf8");

  fs.cpSync(methodologyDir, bundleOut, { recursive: true });
  if (options?.omitLocalMethodology) {
    fs.rmSync(methodologyDir, { recursive: true, force: true });
  }
  return ["REQ-METH-ONLY", "REQ-FALLBACK", "REQ-PROJECT-ONLY", "REQ-SENTINEL-ONLY"];
}

export type MethodologyReadProbe = {
  methodology_base: string | null;
  bundled: boolean;
  tokens: Record<
    string,
    {
      in_methodology_index: boolean;
      detail_path: string | null;
      detail_name: string | null;
    }
  >;
  list_detail_tokens: Record<DetailType, string[]>;
};

/**
 * Capture read semantics for parity comparison (methodology-first, sentinel, project fallback).
 */
export function captureMethodologyReadProbe(reqTokens: string[]): MethodologyReadProbe {
  const methodologyBase = getMethodologyBasePath();
  const bundled = resolveBundledMethodologyPath() !== null;
  const tokens: MethodologyReadProbe["tokens"] = {};
  for (const token of reqTokens) {
    const inM = isTokenInMethodology("requirements", token);
    const detailPath = getDetailPath(token);
    const loaded = loadDetail(token) as Record<string, unknown> | null;
    const detailName = loaded && typeof loaded.name === "string" ? loaded.name : null;
    tokens[token] = {
      in_methodology_index: inM,
      detail_path: detailPath,
      detail_name: detailName,
    };
  }
  const list_detail_tokens: Record<DetailType, string[]> = {
    requirement: listDetailTokens("requirement"),
    architecture: listDetailTokens("architecture"),
    implementation: listDetailTokens("implementation"),
  };
  return {
    methodology_base: methodologyBase,
    bundled,
    tokens,
    list_detail_tokens,
  };
}

export type ParityGap = { field: string; disk: unknown; bundled: unknown };

/**
 * Compare disk copied-tree reads vs bundled corpus reads for the same fixture tokens.
 */
export function compareDiskAndBundledParity(
  tiedBasePath: string,
  bundledCorpusPath: string,
  reqTokens: string[],
): { ok: boolean; gaps: ParityGap[] } {
  if (!fs.existsSync(bundledCorpusPath)) {
    return {
      ok: false,
      gaps: [{ field: "bundle", disk: bundledCorpusPath, bundled: "BundleMissing" }],
    };
  }

  const runProbe = (useBundle: boolean): MethodologyReadProbe => {
    process.env.TIED_BASE_PATH = tiedBasePath;
    if (useBundle) {
      process.env.TIED_METHODOLOGY_BUNDLE_PATH = bundledCorpusPath;
    } else {
      delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
    }
    clearBasePathCache();
    return captureMethodologyReadProbe(reqTokens);
  };

  let diskProbe: MethodologyReadProbe;
  let bundleProbe: MethodologyReadProbe;
  try {
    diskProbe = runProbe(false);
    bundleProbe = runProbe(true);
  } finally {
    delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
    delete process.env.TIED_BASE_PATH;
    clearBasePathCache();
  }

  const gaps: ParityGap[] = [];
  const stripBase = (p: string | null, base: string | null): string | null => {
    if (!p || !base) return p;
    if (p.startsWith(base + path.sep)) return p.slice(base.length + 1);
    return p;
  };

  for (const token of reqTokens) {
    const d = diskProbe.tokens[token];
    const b = bundleProbe.tokens[token];
    if (d.in_methodology_index !== b.in_methodology_index) {
      gaps.push({
        field: `${token}.in_methodology_index`,
        disk: d.in_methodology_index,
        bundled: b.in_methodology_index,
      });
    }
    const dRel = stripBase(d.detail_path, diskProbe.methodology_base);
    const bRel = stripBase(b.detail_path, bundleProbe.methodology_base);
    if (dRel !== bRel) {
      gaps.push({ field: `${token}.detail_path`, disk: dRel, bundled: bRel });
    }
    if (d.detail_name !== b.detail_name) {
      gaps.push({ field: `${token}.detail_name`, disk: d.detail_name, bundled: b.detail_name });
    }
  }

  for (const kind of ["requirement", "architecture", "implementation"] as const) {
    const dList = [...diskProbe.list_detail_tokens[kind]].sort();
    const bList = [...bundleProbe.list_detail_tokens[kind]].sort();
    if (JSON.stringify(dList) !== JSON.stringify(bList)) {
      gaps.push({
        field: `listDetailTokens.${kind}`,
        disk: dList,
        bundled: bList,
      });
    }
  }

  // Merged index keys for requirements (methodology + project override semantics)
  process.env.TIED_BASE_PATH = tiedBasePath;
  delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
  clearBasePathCache();
  const diskIndexKeys = Object.keys(loadIndex("requirements") ?? {}).filter((k) => !k.startsWith("#"));
  process.env.TIED_METHODOLOGY_BUNDLE_PATH = bundledCorpusPath;
  clearBasePathCache();
  const bundleIndexKeys = Object.keys(loadIndex("requirements") ?? {}).filter((k) => !k.startsWith("#"));
  delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
  delete process.env.TIED_BASE_PATH;
  clearBasePathCache();

  if (JSON.stringify(diskIndexKeys.sort()) !== JSON.stringify(bundleIndexKeys.sort())) {
    gaps.push({
      field: "loadIndex.requirements.keys",
      disk: diskIndexKeys.sort(),
      bundled: bundleIndexKeys.sort(),
    });
  }

  return { ok: gaps.length === 0, gaps };
}
