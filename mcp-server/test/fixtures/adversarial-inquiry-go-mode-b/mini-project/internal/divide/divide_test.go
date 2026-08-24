// [IMPL-FIXTURE-ADVERSARIAL] [ARCH-FIXTURE-ADVERSARIAL] [REQ-FIXTURE-ADVERSARIAL] How: preserve the divide success and zero-divisor failure contracts as structured evidence.
package divide

import "testing"

func TestDivideSuccess(t *testing.T) {
	got, _ := Divide(6, 2)
	if got != 3 {
		t.Errorf("Divide(6, 2) = %d, want 3", got)
	}
	_, err := Divide(1, 0)
	if err == nil {
		t.Errorf("Divide(1, 0) expected error, got nil")
	}
}
