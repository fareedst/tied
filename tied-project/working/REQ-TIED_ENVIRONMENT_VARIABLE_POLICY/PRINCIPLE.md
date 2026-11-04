# Directive: Environment Variable Usage

**Scope:** TIED-the-product (first-party stdd tooling), not TIED methodology agent principles.

**Principle:** Environment variables provide execution context, personal preferences, and convenient invocation overrides. They must not become the application's primary configuration or operational control interface.

## Rules

1. **Prefer explicit configuration.** Define application behavior through documented, discoverable, validated configuration files, CLI options, or APIs.
2. **Use environment variables sparingly.** Appropriate uses include personal preferences, inherited execution context, temporary command overrides, and deployment-injected startup values.
3. **Do not use environment variables for operational control.** Use explicit commands or APIs for actions, state transitions, and runtime behavior changes.
4. **Avoid hidden dependencies.** Application behavior must not silently depend on undocumented or unexpectedly inherited environment variables.
5. **Centralize configuration resolution.** Apply consistent defaults, precedence, type validation, and semantic constraints regardless of the input source.
6. **Make configuration observable.** Allow inspection of effective settings and their sources, with sensitive values redacted.
7. **Preserve reproducibility.** Identical explicit configurations should produce equivalent behavior, independent of unrelated environmental state.
8. **Treat environment variables as inputs, not authority.** Their presence must not bypass validation, authorization, or operational safeguards.

## Design Test

Before introducing an environment variable, ask:

- Is this execution context, a personal preference, or a temporary override?
- Would an explicit configuration option or command be clearer?
- Can its effect be discovered, inspected, validated, and tested?
- Could inheritance cause surprising behavior?

**Default decision:** Prefer explicit configuration and control. Use environment variables only when their convenience or deployment role provides a clear benefit without sacrificing visibility, predictability, or reproducibility.

**Provenance:** Copied from [TODO.md](../../../../TODO.md) (2026-11-03 sponsor draft). Canonical copy moves to REQ detail on `@add-feature`.
