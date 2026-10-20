# Operator baseline — MCP -32602 on record fields

**REQ:** [REQ-TIED_TOOL_INPUT_COMPATIBILITY](../../requirements/REQ-TIED_TOOL_INPUT_COMPATIBILITY.yaml)  
**Role:** Sponsor **witness** (user observed agent attempt and failure; not the executing agent).  
**Source session:** [xlate -32602 tied-cli feedback](f4f8b498-ce8f-4339-81da-6550de99375f) · 2026-10-19 (UTC-7).

## Observation

During normal operation, an **agent** attempted a reasonable `tied-cli` call using an args file:

```bash
cd /Users/fareed/Documents/dev/chatgpt/stdd && \
  .cursor/skills/tied-yaml/scripts/tied-cli.sh \
  tied_token_create_with_detail @/tmp/impl-legacy-layout-doc.json
```

**Failure (witnessed by sponsor):**

```text
MCP error -32602: Input validation error: Invalid arguments for tool tied_token_create_with_detail:
Expected string, received object at index_record
Expected string, received object at detail_record
```

The args file was JSON with `token`, `index_record`, and `detail_record` fields shaped the way agents typically supply structured payloads (via `@file`), not as pre-stringified record blobs.

## Sponsor intent (same session)

- Accept **object**-valued record fields where agents already send objects.
- Surface **hindrance** to the client instead of silent push-through.
- Record **before/after** client state via TIED feedback (Kaizen PDCA), not ISO certification.

## Workaround before countermeasure

Agents were forced toward string encoding or alternate tool paths; failures were often caught **visually** by the sponsor rather than via machine-readable CLI hindrance lines.

## Redaction

Token names and file paths in the original report referred to a **different** in-flight IMPL; this baseline describes the **failure class** only. Countermeasure scope: [PLAN.md](../PLAN.md) write-tool inventory.
