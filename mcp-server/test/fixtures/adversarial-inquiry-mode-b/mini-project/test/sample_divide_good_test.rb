# [IMPL-FIXTURE-ADVERSARIAL] [ARCH-FIXTURE-ADVERSARIAL] [REQ-FIXTURE-ADVERSARIAL] How: preserve the divide success and zero-divisor failure contracts as structured evidence.
require_relative "../lib/sample_divide"

class SampleDivideGoodTest
  def test_success
    assert_equal 3, divide(6, 2)
    assert_raises(ZeroDivisionError) { divide(1, 0) }
  end
end
