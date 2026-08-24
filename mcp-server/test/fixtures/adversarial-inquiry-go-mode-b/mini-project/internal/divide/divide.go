// [IMPL-FIXTURE-ADVERSARIAL] [ARCH-FIXTURE-ADVERSARIAL] [REQ-FIXTURE-ADVERSARIAL] How: preserve the divide success and zero-divisor failure contracts as structured evidence.
// Production fixture source is a locus only for Mode B.
package divide

import "errors"

var ErrZeroDivisor = errors.New("divisor must not be zero")

func Divide(a, b int) (int, error) {
	if b == 0 {
		return 0, ErrZeroDivisor
	}
	return a / b, nil
}
