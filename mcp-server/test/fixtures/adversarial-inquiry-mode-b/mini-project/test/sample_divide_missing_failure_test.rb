# [IMPL-FIXTURE-ADVERSARIAL] [ARCH-FIXTURE-ADVERSARIAL] [REQ-FIXTURE-ADVERSARIAL] How: preserve the divide success and zero-divisor failure contracts as structured evidence.
require_relative "../lib/sample_divide"

class SampleDivideMissingFailureTest
  def test_success_only
    assert_equal 3, divide(6, 2)
  end
end
