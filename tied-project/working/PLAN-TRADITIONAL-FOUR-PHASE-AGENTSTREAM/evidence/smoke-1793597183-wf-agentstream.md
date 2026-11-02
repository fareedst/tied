# Smoke — traditional four-phase agentstream (`1793597183-wf-agentstream`)

| Field | Value |
| --- | --- |
| **Client** | `/Users/fareed/Documents/dev/test/1793597183-wf-agentstream` |
| **Prompt** | PROMPT-WF-02 (`REQ-STDIN_DEDUP_CLI`) |
| **Model** | `composer-2.5-fast` / config `composer-2.5` |
| **Harness** | `cursor` via `run-traditional-four-phase-agentstream.sh` |
| **Date** | 2026-11-02 |

## Agentstream proof

Single wrapper invocation; **four turns**, **four new sessions** (feature-spec batch `chainFromPrevious: false`):

| Turn | Session id |
| --- | --- |
| 1 add-feature | `e9b91bce-451b-4205-8e36-d239b83c9eff` |
| 2 refine-plan | `b681cadb-51a3-433d-8e49-c4cc15244f59` |
| 3 build-plan | `793a9bb3-aaac-40c1-8dc5-913005d57ecf` |
| 4 close-out | `dcd9a022-59b6-4f9d-a3ad-addc47cade61` |

## Outcome vs IDE Composer 2.5 WF-02 (`1793562432-wf-02-composer25`)

Comparable product: TS `line-dedup`, first-occurrence-wins, ordering A/B tests, modular `src/`. This smoke run **9** Vitest tests vs **7** on the IDE Co reference; traceable commit `067c77c`; REQ **Implemented** after close-out.

## Operator notes

- **Preload:** disposable linked client had no `tied-project/agent-preload-contract.yaml`; wrapper warned and continued without `-p`. Fallback to `tied-bundle/docs/agent-preload-contract-template.yaml` added after smoke.
- **Inventory:** turn-1 agent wrote `harness_notes` implying manual IDE skills; batch YAML updated so future runs label **`cursor-agentstream-four-phase`**.
