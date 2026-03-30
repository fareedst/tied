package stdd_hello_world_smoke

import (
	"errors"
	"os"
	"path/filepath"
)

// HelloWorldBasename is the primary conventional smoke script name (stdd layout).
const HelloWorldBasename = "hello_world.sh"

var helloScriptCandidates = []string{HelloWorldBasename, "hello.sh"}

// ResolveHelloScriptBasename implements procedure RESOLVE_HELLO_SCRIPT_BASENAME(moduleRoot) from IMPL-GOAGENT-BASH-HELLO-SCRIPT essence_pseudocode.
// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
// How: Ordered candidates; error if neither regular file exists.
func ResolveHelloScriptBasename(root string) (string, error) {
	for _, name := range helloScriptCandidates {
		p := filepath.Join(root, name)
		st, err := os.Stat(p)
		if err == nil && !st.IsDir() {
			return name, nil
		}
	}
	return "", errors.New("RESOLVE_HELLO_SCRIPT_BASENAME: missing smoke script; expected one of hello_world.sh or hello.sh")
}
