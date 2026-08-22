# [IMPL-FIXTURE-ADVERSARIAL] [ARCH-FIXTURE-ADVERSARIAL] [REQ-FIXTURE-ADVERSARIAL] How: preserve the divide success and zero-divisor failure contracts as structured evidence.
# Production fixture source is a locus only for Mode B.
def divide(a, b)
  raise ZeroDivisionError, "divisor must not be zero" if b.zero?

  a / b
end
