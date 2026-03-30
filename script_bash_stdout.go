package stdd_hello_world_smoke

import (
	"os/exec"
)

// BashScriptStdout runs bash with basename as argv[0] and working directory dir; returns combined stdout (stderr empty on success path).
// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
// How: Subprocess binding for UNIT_TEST_SCRIPT_ENTRY / COMPOSE — no UI; same argv/Dir contract as essence_pseudocode spawn bash.
func BashScriptStdout(dir, basename string) ([]byte, error) {
	cmd := exec.Command("bash", basename)
	cmd.Dir = dir
	return cmd.Output()
}
