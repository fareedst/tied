// [IMPL-FIXTURE-ADVERSARIAL] [ARCH-FIXTURE-ADVERSARIAL] [REQ-FIXTURE-ADVERSARIAL] How: preserve the divide success and zero-divisor failure contracts as structured evidence.
package divide

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDivideUnsupportedAssertion(t *testing.T) {
	got, _ := Divide(1, 2)
	assert.InDelta(t, 0.5, float64(got), 0.01)
}
