/**
 * [IMPL-TIED_CORPUS_MAP_BUILD] [ARCH-TIED_META_HUB_REPRESENTATION_BOUNDARY] [REQ-TIED_META_HUB_REPRESENTATION]
 * How: generate meta-hub corpus map markdown from tied-project/ hub layout counts.
 */

import fs from "node:fs";
import path from "node:path";

export type CorpusMapBuildInput = {
  projectRoot: string;
  hubPath?: string;
  requestToken?: string;
  baselineRevision?: string;
};

export type CorpusMapCounts = {
  working_folders: number;
  citdp_files: number;
  vocab_md: number;
  req_details: number;
  arch_details: number;
  impl_details: number;
};

function countFiles(dir: string, ext?: string): number {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "evaluation") continue;
      n += countFiles(p, ext);
    } else if (!ext || ent.name.endsWith(ext)) {
      n += 1;
    }
  }
  return n;
}

function countTopLevelDirs(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).length;
}

export function collectCorpusMapCounts(projectRoot: string, hubRel = "tied-project"): CorpusMapCounts {
  const hub = path.join(projectRoot, hubRel);
  return {
    working_folders: countTopLevelDirs(path.join(hub, "working")) - 0,
    citdp_files: countFiles(path.join(hub, "citdp"), ".yaml"),
    vocab_md: countFiles(path.join(hub, "vocab"), ".md"),
    req_details: countFiles(path.join(hub, "requirements"), ".yaml"),
    arch_details: countFiles(path.join(hub, "architecture-decisions"), ".yaml"),
    impl_details: countFiles(path.join(hub, "implementation-decisions"), ".yaml"),
  };
}

export function buildCorpusMapMarkdown(input: CorpusMapBuildInput): string {
  const hubRel = input.hubPath?.replace(/\/$/, "") ?? "tied-project";
  const counts = collectCorpusMapCounts(input.projectRoot, hubRel);
  const token = input.requestToken ?? "REQ-TIED_META_HUB_REPRESENTATION";
  const baseline = input.baselineRevision ?? "HEAD";

  return `# tied-project corpus map — TIED store (generated)

**Audience:** Sponsors and agents onboarding to **this** repository.

**Source:** \`${token}\` · **Baseline:** \`${baseline}\` · **Hub:** \`${hubRel}/\`

## Layers

| Layer | Path | Role |
| --- | --- | --- |
| **Indexes** | \`${hubRel}/requirements.yaml\`, \`architecture-decisions.yaml\`, \`implementation-decisions.yaml\`, \`semantic-tokens.yaml\` | Normative REQ→ARCH→IMPL registry |
| **Detail files** | \`${hubRel}/requirements/\`, \`architecture-decisions/\`, \`implementation-decisions/\` | Token bodies + IMPL pseudo-code sidecars |
| **Working (committed)** | \`${hubRel}/working/{REQ-TOKEN}/\` | PLAN, tracker, envelope, EDPC, handoffs |
| **CITDP (canonical analysis)** | \`${hubRel}/citdp/CITDP-*.yaml\` | Persisted change analysis after close-out |
| **Vocab** | \`${hubRel}/vocab/*.md\` | PRELOAD routing — start at [routing.md](${hubRel}/vocab/routing.md) |
| **Methodology (read-only here)** | \`tied-bundle/\` | Installed corpus; refresh via \`tied-install.sh --refresh\` |

## Scale (inventory)

| Signal | Count |
| --- | --- |
| \`working/\` top-level folders | ${counts.working_folders} |
| Persisted \`citdp/\` files | ${counts.citdp_files} |
| Vocab markdown files | ${counts.vocab_md} |
| REQ detail files | ${counts.req_details} |
| ARCH detail files | ${counts.arch_details} |
| IMPL detail files | ${counts.impl_details} |

## Agent entry points

1. [AGENTS.md](../../AGENTS.md) — operating guide
2. [client-development-index.md](../../tied-bundle/docs/client-development-index.md) — scenarios and MCP tools
3. [edpc-comprehension.md](${hubRel}/vocab/edpc-comprehension.md) — EDPC terms
4. [edpc-meta-hub-engagement.md](../../tied-bundle/docs/edpc-meta-hub-engagement.md) — meta-hub pattern

## Authority rules (comprehension vs TIED)

- **Indexes + \`tied_verify\`** decide obligation status — EDPC SCM is investigative.
- **REQ/IMPL implementation status:** Treat as **Unknown** in EDPC claims unless a \`tied_verify\` receipt is attached (\`[PROC-TIED_VERIFICATION_GATED]\`).
- **CITDP:** Prefer \`${hubRel}/citdp/\` over duplicate drafts in \`working/\`.
`;
}

export function writeCorpusMapFile(input: CorpusMapBuildInput & { outPath: string }): {
  ok: true;
  path: string;
  counts: CorpusMapCounts;
} {
  const md = buildCorpusMapMarkdown(input);
  const out = path.resolve(input.outPath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, md, "utf8");
  return {
    ok: true,
    path: out,
    counts: collectCorpusMapCounts(input.projectRoot, input.hubPath ?? "tied-project"),
  };
}
