# Migration waiver registry (P4-G)

`migration-waiver-registry.v1.yaml` holds time-bounded G3 exceptions for constraint-annotated loci. An **empty** `waivers: []` registry is valid: `run-fleet-waiver-registry-check.ts` exits zero and wave close-out proceeds without active waivers. At close-out, any waiver with `status: expired` or an `active` row whose `expires_at` is before the check time **blocks** stop/go composition until the waiver is renewed, superseded, or removed.
