# Webhook inbox quality pilot

This pilot exercises `[REQ-QUALITY_ASSURANCE_EVIDENCE]` through
`[IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK]`.

Selected profiles:

- `baseline-functional`
- `external-input-security`
- `data-integrity-migration` (schema initialization and unique-key invariant)
- `stateful-reliability` (retry, recovery, and dead-letter transition)

Run the executable pilot evidence with:

```sh
npm test
```

The test boundary covers signature verification, malformed authorization,
replay-window enforcement, bounded request parsing, SQLite idempotency,
duplicate delivery, retry backoff, and terminal failure handling. The pilot
does not claim production-grade rate limiting, a vulnerability database scan,
or a migration backup/restore proof; those remain explicit limitations in the
quality evidence matrix.
