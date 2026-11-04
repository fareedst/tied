# Non-TIED plan artifacts

Committed plans for the **`non-tied-plan` → `non-tied-refine` → `non-tied-build` → `non-tied-close`** sequence.

Each slug gets a folder:

```text
tied-project/non-tied-plans/{slug}/
├── PLAN.md
├── CITDP-{slug}.yaml   # tied_tokens_new: [] always
├── test-strategy.md    # optional
└── evidence/           # optional
```

Not a substitute for `tied-project/working/{REQ-TOKEN}/` on the full TIED lane. See [prompt-execution-mode.md](../../tools/bundled-prompt-type-skills/prompt-shared/prompt-execution-mode.md).
