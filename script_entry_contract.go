package stdd_hello_world_smoke

import (
	"bytes"
	"fmt"
)

// scriptEntryStdoutWant is the exact SCRIPT_ENTRY success OUTPUT (essence_pseudocode OUTPUT line).
// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
var scriptEntryStdoutWant = []byte("Hello World!\n")

// AssertScriptEntryStdoutContract enforces procedure SCRIPT_ENTRY OUTPUT from IMPL-GOAGENT-BASH-HELLO-SCRIPT essence_pseudocode.
// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
// How: Returns nil iff stdout equals scriptEntryStdoutWant; otherwise a descriptive error.
func AssertScriptEntryStdoutContract(out []byte) error {
	if bytes.Equal(out, scriptEntryStdoutWant) {
		return nil
	}
	return fmt.Errorf("SCRIPT_ENTRY OUTPUT: want exactly %q, got %q", scriptEntryStdoutWant, out)
}
