#!/usr/bin/env ruby
# frozen_string_literal: true

# [REQ-TIED_YAML_COMPARE_RUBY_LOAD] [IMPL-TIED_FILES] [PROC-YAML_EDIT_LOOP]
# How: Load-time guard — DEFAULT_RECORD_LIST_KEYS must exist before DifferenceWalker default arg resolves.
# Run: ruby scripts/yaml_semantic_compare_load_test.rb

require_relative 'yaml_semantic_compare'

def assert(cond, msg)
  raise "ASSERT: #{msg}" unless cond
end

assert(
  YamlSemanticCompare.const_defined?(:DEFAULT_RECORD_LIST_KEYS),
  'YamlSemanticCompare::DEFAULT_RECORD_LIST_KEYS must be defined'
)
assert(
  YamlSemanticCompare::DEFAULT_RECORD_LIST_KEYS.is_a?(Array) &&
    !YamlSemanticCompare::DEFAULT_RECORD_LIST_KEYS.empty?,
  'DEFAULT_RECORD_LIST_KEYS must be a non-empty array'
)

walker = DifferenceWalker.new
assert walker.is_a?(DifferenceWalker), 'DifferenceWalker must instantiate after load'

puts 'yaml_semantic_compare_load_test.rb: OK'
