// Checklist render preview for stdout (=== prompt headers).
// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
package checklist

import (
	"fmt"
	"io"
)

// Preview writes rendered checklist step messages with === headers (stdout). REQ-GOAGENT-YAML-STEP-RENDER.
func Preview(path string, opts Options, w io.Writer) error {
	msgs, err := MessagesFromYAML(path, opts)
	if err != nil {
		return err
	}
	n := len(msgs)
	for i, msg := range msgs {
		_, _ = fmt.Fprintf(w, "=== prompt %d/%d ===\n", i+1, n)
		_, _ = fmt.Fprint(w, msg)
		if i < n-1 {
			_, _ = fmt.Fprint(w, "\n---\n")
		} else {
			_, _ = fmt.Fprint(w, "\n")
		}
	}
	return nil
}
