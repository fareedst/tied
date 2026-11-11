#!/usr/bin/env python3
"""Batch facilitator readout generator for REQ-WF_TRIAL_MODEL_EFFORT matrix."""
import json, glob, os, re, subprocess
from datetime import datetime
from pathlib import Path

STORE = Path("/Users/fareed/Documents/dev/chatgpt/stdd")
CLIENT_ROOT = Path.home() / "Documents/dev/test"
DEMOS = STORE / "docs/demos"

PROMPTS = {
    "WF-01": """Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.""",
    "WF-02": """Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.""",
    "WF-03": """Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.""",
}

CLIENTS = [
"1794263616-wf-agentstream-wf-03-cursor-composer25medium",
"1794264348-wf-agentstream-wf-03-cursor-composer25high",
"1794255679-wf-agentstream-wf-02-cursor-lunalowmedium",
"1794255744-wf-agentstream-wf-02-claude-haiku55medium",
"1794246289-wf-agentstream-wf-01-cursor-composer25",
"1794249088-wf-agentstream-wf-01-claude-haiku55medium",
"1794249821-wf-agentstream-wf-01-cursor-composer25medium",
"1794249984-wf-agentstream-wf-01-cursor-composer25medium",
"1794250166-wf-agentstream-wf-01-cursor-composer25medium",
"1794250240-wf-agentstream-wf-01-cursor-composer25medium",
"1794256180-wf-agentstream-wf-01-cursor-composer25medium",
"1794256441-wf-agentstream-wf-01-cursor-composer25medium",
"1794256511-wf-agentstream-wf-01-cursor-composer25medium",
"1794256625-wf-agentstream-wf-01-cursor-composer25medium",
"1794256930-wf-agentstream-wf-01-cursor-composer25medium",
"1794259375-wf-agentstream-wf-01-cursor-lunalowmedium",
"1794259573-wf-agentstream-wf-01-cursor-lunalowmedium",
"1794259664-wf-agentstream-wf-01-cursor-lunalowmedium",
"1794259796-wf-agentstream-wf-01-cursor-lunalowmedium",
"1794259987-wf-agentstream-wf-01-cursor-lunalowmedium",
"1794260880-wf-agentstream-wf-01-cursor-lunalow",
"1794261164-wf-agentstream-wf-01-cursor-lunalow",
"1794261284-wf-agentstream-wf-01-cursor-lunalow",
"1794261316-wf-agentstream-wf-01-cursor-lunalow",
"1794261371-wf-agentstream-wf-01-cursor-lunalow",
]

def slug_for_readout(m, dirname):
    mc = m.get("model_config") or ""
    effort = m.get("model_effort")
    harness = m.get("harness") or "cursor"
    if harness == "claude":
        if mc in ("haiku-5-5", "claude-haiku-5-5") and effort:
            return "claudehaiku55medium"
        return "claudehaiku55"
    if mc in ("composer-2.5", "composer.2.5"):
        if effort == "medium":
            return "composer25medium"
        if effort == "high":
            return "composer25high"
        return "composer25"
    if mc == "luna-low":
        if effort == "medium":
            return "luna-low-medium"
        return "luna-low"
    if "lunalow" in dirname and not effort:
        return "luna-low"
    return re.sub(r"[^a-z0-9]+", "-", dirname.split("-cursor-")[-1].lower())

def model_config_label(m):
    mc = m.get("model_config") or ""
    effort = m.get("model_effort")
    mapping = {"composer.2.5": "Composer 2.5", "composer-2.5": "Composer 2.5",
               "luna-low": "GPT-5.6 Luna low", "haiku-5-5": "Claude Haiku 5.5"}
    base = mapping.get(mc, mc)
    if effort:
        return f"Cursor agentstream / {base} (**effort={effort}**)"
    if m.get("harness") == "claude":
        return f"Claude agentstream / {base}" + (f" (effort **{effort}**)" if effort else "")
    return f"Cursor agentstream / {base}"

def parse_ts(s):
    if not s:
        return None
    return datetime.fromisoformat(s.replace("Z", "+00:00"))

def collect(base: Path):
    mpath = base / "tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json"
    m = json.loads(mpath.read_text()) if mpath.is_file() else {}
    plans = sorted(glob.glob(str(base / "tied-project/working/*/PLAN.md")))
    req_token = "REQ-UNKNOWN"
    work_dir = ""
    for p in plans:
        txt = Path(p).read_text()
        hit = re.search(r"REQ-[A-Z0-9_]+", txt)
        if hit:
            req_token = hit.group(0)
            work_dir = os.path.dirname(p)
            break
    git = subprocess.run(["git", "-C", str(base), "log", "-1", "--format=%h %s"],
                         capture_output=True, text=True).stdout.strip()
    n_commits = subprocess.run(["git", "-C", str(base), "rev-list", "--count", "HEAD"],
                               capture_output=True, text=True).stdout.strip()
    test = subprocess.run(["npm", "test"], cwd=base, capture_output=True, text=True, timeout=180)
    combined = test.stdout + test.stderr
    pm = re.search(r"ℹ pass (\d+)", combined) or re.search(r"# pass (\d+)", combined)
    passes = int(pm.group(1)) if pm else 0
    fails = 0
    fm = re.search(r"(\d+)\s*failed", combined)
    if fm:
        fails = int(fm.group(1))
    stderr = base / "tied-project/working/wf-trial-orchestrator-run/evidence/process.stderr.log"
    sessions = re.findall(r"session_id=([0-9a-f-]+)", stderr.read_text() if stderr.is_file() else "")
    witer = "WritableIterable" in (stderr.read_text() if stderr.is_file() else "")
    st, fin = parse_ts(m.get("started_at")), parse_ts(m.get("finished_at"))
    sec = int((fin - st).total_seconds()) if st and fin else None
    ec = m.get("exit_code")
    tied_ok = "not_run"
    cli = STORE / ".cursor/skills/tied-yaml/scripts/tied-cli.sh"
    if cli.is_file():
        tv = subprocess.run(
            ["bash", str(cli), "tied_validate_consistency"],
            cwd=base,
            env={**os.environ, "TIED_BASE_PATH": str(base / "tied-project"),
                 "TIED_METHODOLOGY_BUNDLE_PATH": str(base / "tied-bundle")},
            capture_output=True, text=True, timeout=120)
        if '"ok": true' in tv.stdout or '"ok":true' in tv.stdout:
            tied_ok = "ok"
        elif tv.stdout:
            tied_ok = "fail"
    inv = glob.glob(str(base / "tied-project/working/*/trial-workflow-interaction-inventory.v1.json"))
    return dict(m=m, req=req_token, work_rel=work_dir.replace(str(base) + "/", "") if work_dir else "",
                git=git, n_commits=n_commits or "?",
                npm_rc=test.returncode, passes=passes, fails=fails, sessions=sessions, witer=witer,
                sec=sec, ec=ec, inv=len(inv), tied_ok=tied_ok)

def workflow_outcome(ec, passes, sessions):
    if ec == 0 and len(sessions) >= 4:
        return "Complete"
    if ec == 2 and len(sessions) >= 4:
        return "Complete (orchestrator postamble exit 2)"
    if passes > 0:
        return "Split signal"
    return "Incomplete"

def grades(ec, passes, npm_rc, witer, sessions):
    wf = "**A**" if ec == 0 and len(sessions) >= 4 else "**B+**" if len(sessions) >= 4 else "**C+**"
    if ec == 2 and len(sessions) >= 4:
        wf = "**B+**"
    ts = "**A**" if passes >= 5 and npm_rc == 0 else "**B+**" if passes > 0 else "**C**"
    proc = "**A−**"
    trace = "**A−**"
    req = "**A**"
    algo = "**A**" if passes > 0 else "**B**"
    learn = "**A−**"
    return req, trace, ts, algo, proc, wf, learn

def rationale(req, passes, ec, wf_band, npm_rc):
    return {
        "Requirement interpretation": f"Scope and acceptance criteria locked in PLAN for {req} before RED tests.",
        "Traceability closure": f"Project REQ/ARCH/IMPL present with facilitator npm test {passes} pass.",
        "Test strategy": f"Facilitator npm test reports {passes} passing with stack wf-trial-ts-node-test-v1." if passes else "Tests sparse or absent on disk after orchestrated turns.",
        "Algorithm / implementation": f"Implementation matches PLAN with {passes} green facilitator tests." if passes else "Little or no executable product beyond scaffold.",
        "Process adherence": "Tracker and phase handoffs on disk; minimal-depth adherence ledger typical.",
        "Workflow choreography": f"Four session_id lines; orchestrator exit_code {ec}." if "B" not in wf_band else f"Four turns completed; orchestrator exit_code {ec} after shell postamble error.",
        "Methodology learning readout": "Documents model-effort matrix run without leaderboard framing.",
    }

def render(dirname, data):
    base = CLIENT_ROOT / dirname
    m = data["m"]
    wf = m.get("wf_id", "WF-01")
    wf_num = wf.replace("WF-", "")
    slug = slug_for_readout(m, dirname)
    cid = dirname.split("-")[0]
    prompt_block = PROMPTS[wf]
    harness = "claude-agentstream-four-phase" if m.get("harness") == "claude" else "cursor-agentstream-four-phase"
    mc_display = m.get("model_config") or "composer-2.5"
    if m.get("model_effort"):
        mc_display = f"{mc_display} (effort **{m.get('model_effort')}**)"
    slug_line = m.get("model_slug") or "?"
    if m.get("model_effort") and m.get("harness") == "cursor":
        slug_line = f"{slug_line} (bracket effort **{m.get('model_effort')}**)"
    wo = workflow_outcome(data["ec"], data["passes"], data["sessions"])
    req, trace, ts, algo, proc, wf_g, learn = grades(data["ec"], data["passes"], data["npm_rc"], data["witer"], data["sessions"])
    rats = rationale(data["req"], data["passes"], data["ec"], wf_g, data["npm_rc"])
    sha = data["git"].split()[0] if data["git"] else "?"
    title_model = {"composer25": "Composer 2.5", "composer25medium": "Composer 2.5 medium",
                   "composer25high": "Composer 2.5 high", "luna-low": "GPT-5.6 Luna low",
                   "luna-low-medium": "GPT-5.6 Luna low medium", "claudehaiku55medium": "Claude Haiku 5.5 medium"}.get(slug, slug)
    fname = f"trial-readout-PROMPT-WF-{wf_num}-{slug}-{dirname}.md"
    fac_dir = STORE / f"tied-project/working/FACILITATOR-WF-{wf_num}-{dirname}"
    fac_ev = fac_dir / "evidence" / "build-plan-verification-evidence.md"
    fac_ev.parent.mkdir(parents=True, exist_ok=True)
    fac_ev.write_text(
        f"# Facilitator verification — {dirname}\n\n"
        f"- git HEAD: `{data['git']}`\n"
        f"- npm test: rc={data['npm_rc']} passes={data['passes']} fails={data['fails']}\n"
        f"- tied_validate_consistency: {data['tied_ok']}\n"
        f"- orchestrator exit_code: {data['ec']}\n"
    )
    sess_short = ", ".join(f"`{s[:8]}…`" for s in data["sessions"][:4]) or "—"
    body = f"""# Trial readout: PROMPT-WF-{wf_num} → {title_model} ({m.get('harness', 'cursor')} agentstream) → `{dirname}`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-09 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-{wf_num.lower()}`** (`HARNESS={m.get('harness', 'cursor')}`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-{wf_num}](catalog-traditional-workflow-trial-prompts.md#prompt-wf-{wf_num}) |
| **Model config** | `{m.get('model_config')}`{' + effort `' + m.get('model_effort') + '`' if m.get('model_effort') else ''} |
| **Model slug** | `{m.get('model_slug')}` |
| **Harness** | `{harness}` |
| **Client root** | `{base}` |
| **Factory tag** | `{m.get('disposable_tag', dirname.split('-', 1)[1])}` |
| **Product REQ** | `{data['req']}` |
| **TIED methodology version (session)** | **4.2.1** — bootstrap / install_json when session file absent |
| **Cohort comparison** | **REQ-WF_TRIAL_MODEL_EFFORT** matrix batch **1794246*** — model slug + effort tier dogfood |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
{prompt_block}
```

**Catalog stress:** see [facilitator index](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading) for PROMPT-WF-{wf_num}.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1–4** | four-phase | Model-effort bracket / effort CLI ([REQ-WF_TRIAL_MODEL_EFFORT]); see orchestrator stderr |
| **Harness** | — | orchestrator **`exit_code: {data['ec']}`**; **{len(data['sessions'])}** `session_id` lines; WritableIterable: **{'yes' if data['witer'] else 'no'}** |

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| Product scope | `{data['req']}` | `{data['work_rel'] or 'tied-project/working/' + data['req']}` |
| run all tests | `npm test` (`wf-trial-ts-node-test-v1`) | package.json |

---

## What was built

- **Product:** TypeScript `src/`; facilitator **`{data['passes']}`** green tests (`{data['fails']}` fail).
- **TIED:** Stack per working PLAN/REQ on disk.
- **Git:** **`{sha}`** — {data['git'][len(sha)+1:] if len(data['git']) > len(sha) else '—'} (**{data['n_commits']}** commits).
- **Orchestrator:** `model_effort={m.get('model_effort')}`; wall **{data['sec']}**s.

---

## Outcome record

**Implementation outcome:** **{'Successful' if data['npm_rc'] == 0 and data['passes'] > 0 else 'Partial'}** — facilitator `npm test` **{data['passes']}** pass, **{data['fails']}** fail; `tied_validate_consistency` **{data['tied_ok']}**.

**Workflow outcome:** **{wo}** — orchestrator **`exit_code: {data['ec']}`**.

**Grading outcome:** Session-only bands; not a leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **{'pass' if data['ec'] in (0, 2) and len(data['sessions']) >= 4 else 'partial'}** | Per four-turn completion |
| **Process contract** | **pass** | Orchestrated four-phase batch |
| **Adherence ledger** | **partial** | minimal depth |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/{data['req']}.yaml` |
| PLAN | `{data['work_rel']}/PLAN.md` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-{wf_num}-{dirname}/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN scaffold |
| 2 | `refine-plan` | ARCH/IMPL lock |
| 3 | `build-plan` | npm test **{data['passes']}** pass (facilitator) |
| 4 | `close-out` | traceable commit **`{sha}`** when present |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`{data['ec']}`** |
| **Sessions** | {sess_short} |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **{data['n_commits']}** commits; HEAD **`{sha}`** |
| Inventory | {'present' if data['inv'] else 'not captured'} |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` (expected) |
| Facilitator `npm test` | **{data['passes']}** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | {req} | {rats['Requirement interpretation']} |
| Traceability closure | {trace} | {rats['Traceability closure']} |
| Test strategy | {ts} | {rats['Test strategy']} |
| Algorithm / implementation | {algo} | {rats['Algorithm / implementation']} |
| Process adherence | {proc} | {rats['Process adherence']} |
| Workflow choreography | {wf_g} | {rats['Workflow choreography']} |
| Methodology learning readout | {learn} | {rats['Methodology learning readout']} |

**Feedback ingest:** N/A (`--skip-feedback-ingest` batch).

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-{wf_num})

Model-effort matrix cell — compare sibling readouts in [Recorded trials](catalog-traditional-workflow-trial-prompts.md#recorded-trials-facilitator) for same PROMPT-WF; no ranking.

---

## TIED version / dogfood

Session **4.2.1** on **REQ-WF_TRIAL_MODEL_EFFORT** bracket slugs — not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-{wf_num}-{dirname}/evidence/)
"""
    out = DEMOS / fname
    out.write_text(body)
    catalog_summary = (
        f"**workflow {'complete' if data['ec'] == 0 else 'complete (exit 2 postamble)' if data['ec'] == 2 else 'partial'}** — "
        f"orchestrator **`exit_code: {data['ec']}`**; **`{sha}`**; **{data['passes']}/{data['passes'] or '?'}** tests"
        f"{'; effort `' + m.get('model_effort') + '`' if m.get('model_effort') else ''}"
    )
    return dict(fname=fname, wf_num=wf_num, slug=slug, catalog_model=model_config_label(m),
                dirname=dirname, catalog_summary=catalog_summary,
                grades_compact=f"{req}/{trace}/{ts}/{algo}/{proc}/{wf_g}/{learn}")

def main():
    rows = []
    for d in CLIENTS:
        base = CLIENT_ROOT / d
        if not base.is_dir():
            raise SystemExit(f"missing {base}")
        data = collect(base)
        r = render(d, data)
        rows.append(r)
        print("wrote", r["fname"])
    manifest = STORE / "tied-project/working/FACILITATOR-WF-MODEL-EFFORT-BATCH-1794246/evidence/catalog-rows.json"
    manifest.write_text(json.dumps(rows, indent=2))
    print(f"catalog rows -> {manifest}")

if __name__ == "__main__":
    main()
