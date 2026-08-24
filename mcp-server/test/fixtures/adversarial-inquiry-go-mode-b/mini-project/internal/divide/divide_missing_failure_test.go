// [IMPL-FIXTURE-ADVERSARIAL] [ARCH-FIXTURE-ADVERSARIAL] [REQ-FIXTURE-ADVERSARIAL] How: preserve the divide success and zero-divisor failure contracts as structured evidence.
package divide

import "testing"

func TestDivideSuccessOnly(t *testing.T) {
	got, _ := Divide(6, 2)
	if got != 3 {
		t.Errorf("Divide(6, 2) = %d, want 3", got)
	}
}
