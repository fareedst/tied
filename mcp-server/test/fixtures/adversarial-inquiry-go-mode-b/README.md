# Go Mode B adversarial case fixture

Deterministic Go mini-project exercising the native **Mode B** project-input
inquiry boundary. Layout derived from client `1787507684` / `REQ-ROOTJOBS`
operator paths (repo-relative only).

## Cases

| Case | Expected verdict | Notes |
|------|------------------|-------|
| `case-good` | `RELIABLE_INCOMPLETE` | Success + zero-divisor t.Errorf observations |
| `case-missing-failure` | `RELIABLE_INCOMPLETE` | Missing zero-divisor test evidence |
| `case-unsupported-assertion` | `UNRESOLVED` | `assert.InDelta` unsupported adapter |

The `mode-b-input.json` files use `__PROJECT_ROOT__` as a placeholder. Tests
replace it with the absolute path to `mini-project/`.

## Supported Go constructs

- `t.Error`, `t.Errorf`, `t.Fatal`, `t.Fatalf`
- `assert.Equal`, `assert.NoError`, `require.Equal`, `require.NoError`

Unsupported constructs emit `unsupported_adapter` and remain `UNRESOLVED`.
