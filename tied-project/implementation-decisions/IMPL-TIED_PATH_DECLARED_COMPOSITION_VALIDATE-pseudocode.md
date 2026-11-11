# IMPL-TIED_PATH_DECLARED_COMPOSITION_VALIDATE — essence pseudocode

<!-- [IMPL-TIED_PATH_DECLARED_COMPOSITION_VALIDATE] [ARCH-TIED_PATH_DECLARED_COMPOSITION_MANDATE] [REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE] -->

## VALIDATE_PATH_DECLARED_COMPOSITION

```
# [IMPL-TIED_PATH_DECLARED_COMPOSITION_VALIDATE] [ARCH-TIED_PATH_DECLARED_COMPOSITION_MANDATE] [REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE]
# How: read-only scan of src/**/*.test.*; mandate from tracker, binding inventory, or explicit flag.

PROCEDURE VALIDATE_PATH_DECLARED_COMPOSITION
  INPUT repo_root, enforcement, binding_inventory_rows, composition_integration_required, composition_integration_na, exempt_reason, tracker_path
  OUTPUT path-declared-composition-validate.v1

  PRE exempt_reason set AND composition_integration_na
  POST mandate_applies false WHEN exempt

  IF composition_integration_na AND exempt_reason non-empty THEN
    RETURN exempt receipt
  ENDIF

  mandate_applies := composition_integration_required OR binding_rows_testable > 0 OR tracker_composition_integration

  SCAN test files under src/
  composition_tests := SUM cases WHERE classifyTestFile(path) == composition

  satisfied := composition_tests > 0
  ok := NOT (mandate_applies AND NOT satisfied AND enforcement == blocking)

  RETURN receipt
END PROCEDURE
```
