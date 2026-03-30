package stdd_hello_world_smoke

import (
	"fmt"
)

// RunScriptEntrySmokeFromRoot implements procedure COMPOSE_SCRIPT_ENTRY_SMOKE_FROM_ROOT (IMPL-GOAGENT-BASH-HELLO-SCRIPT essence_pseudocode).
// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
// How: Composition binding — ResolveHelloScriptBasename -> BashScriptStdout -> AssertScriptEntryStdoutContract; for harnesses and composition tests without UI.
func RunScriptEntrySmokeFromRoot(root string) error {
	basename, err := ResolveHelloScriptBasename(root)
	if err != nil {
		return err
	}
	out, err := BashScriptStdout(root, basename)
	if err != nil {
		return fmt.Errorf("bash %s in %s: %w", basename, root, err)
	}
	return AssertScriptEntryStdoutContract(out)
}
