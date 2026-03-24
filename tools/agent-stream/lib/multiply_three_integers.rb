# frozen_string_literal: true

# Process: [PROC-TIED_DEV_CYCLE]
# REQ: REQ-ATDD-MULTIPLY_THREE
# ARCH: ARCH-ATDD-MULTIPLY_THREE_PURE_MODULE
# IMPL: IMPL-ATDD-MULTIPLY_THREE
# Implements: same as pseudo-code Effect — module functions multiply_three_integers / multiply_three return a * b * c (Integer#* semantics).
module MultiplyThreeIntegers
  def multiply_three_integers(a, b, c)
    a * b * c
  end

  alias_method :multiply_three, :multiply_three_integers
  module_function :multiply_three_integers, :multiply_three
end
