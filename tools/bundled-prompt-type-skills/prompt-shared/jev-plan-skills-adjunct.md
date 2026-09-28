# Jev plan-skills adjunct (optional)

**Scope:** Advisory vocabulary shadow for the four **explicit** main plan skills only:
`plan-new-feature`, `refine-plan`, `build-plan`, `plan-close-out`.

**Traceability:** [REQ-TIED_JEV_DECISION_COPROCESSOR](../../../tied/requirements/REQ-TIED_JEV_DECISION_COPROCESSOR.yaml) · [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../../../tied/requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml)

---

## When to run

1. Complete normal **RESOLVE** and keyword **PRELOAD** first (client `tied/vocab/routing.md` and methodology routing).
2. Run this adjunct only when **both** are true:
   - The current skill is one of the four named plan skills above.
   - Effective configuration enables plan skills (`jev.plan_skills: true` in `.tied-yaml.yaml` or `TIED_JEV_PLAN_SKILLS=1` / `true` in the MCP/CLI process environment).
3. Optional diagnostics: `tied_jev_status` (never probes the vendor).
4. Optional shadow: `tied_jev_vocab_shadow` with bounded `prompt` (and `plan_excerpt` when refining a linked plan).

## Operator surfaces

- **MCP:** `tied_jev_status`, `tied_jev_vocab_shadow`
- **CLI parity:** `.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_jev_status '{}'` and `tied-cli.sh tied_jev_vocab_shadow @args.json`

Missing MCP tools or an unbuilt server are **no-ops** with diagnostics; never block the skill authority path.

## Authority boundaries

- Treat **`keyword_glossaries`** as the authoritative PRELOAD set; Jev fields are advisory only.
- Never skip `tied_config_get_base_path`, checklist gates, envelope validation, or the explicit-skill boundary.
- Plan-skill evidence under `working/{REQ|PLAN-TOKEN}/jev/plan-skills/{run_id}/` is supplemental — **not** gate proof and **not** integrated adversarial inquiry activation.
- Jev never sets `allowed`, waives close-out, auto-invokes prompt types, or mutates TIED YAML.

## Evidence (optional)

Persist shadow JSON only when the caller supplies a valid working request token (`REQ-*` or `PLAN-*`) **and** `record_evidence: true`. Do not invent parent tokens during early refine.
