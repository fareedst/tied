# [IMPL-FIXTURE-ADVERSARIAL] [ARCH-FIXTURE-ADVERSARIAL] [REQ-FIXTURE-ADVERSARIAL] How: preserve the divide success and zero-divisor failure contracts as structured evidence.
require_relative "../lib/sample_divide"

class SampleDivideUnsupportedTest
  def test_unsupported_precision_assertion
    assert_in_delta 0.5, divide(1, 2), 0.01
  end
end
