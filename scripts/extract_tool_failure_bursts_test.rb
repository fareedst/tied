#!/usr/bin/env ruby
# frozen_string_literal: true

# Run:
#   ruby scripts/extract_tool_failure_bursts_test.rb

require 'open3'
require 'tempfile'
require 'date'
require 'yaml'

def assert(cond, msg = 'assertion failed')
  raise msg unless cond
end

def run_cli(args)
  cmd = ['ruby', File.expand_path('extract_tool_failure_bursts.rb', __dir__), *args]
  out, err, status = Open3.capture3(*cmd)
  [out, err, status]
end

def write_temp_log!(content)
  f = Tempfile.new(%w[conv_test_ .yaml])
  f.write(content)
  f.flush
  f
end

log = write_temp_log!(<<~YAML)
  - epoch: 1.0
    hook_event_name: beforeSubmitPrompt
    conversation_id: c1
    generation_id: g1
    model: default
    normalized:
      kind: prompt
      details:
        prompt: anchor prompt
  - epoch: 2.0
    hook_event_name: postToolUseFailure
    conversation_id: c1
    generation_id: g1
    model: default
    normalized:
      kind: tool_use
      details:
        tool_name: Read
        failure_type: not_found
        error_message: "missing A"
  - epoch: 3.0
    hook_event_name: postToolUseFailure
    conversation_id: c1
    generation_id: g1
    model: default
    normalized:
      kind: tool_use
      details:
        tool_name: Read
        failure_type: not_found
        error_message: "missing B"
YAML

out, err, status = run_cli([log.path])
assert status.success?, "expected success, got #{status.exitstatus}, err=#{err.inspect}"
doc = YAML.safe_load(out, permitted_classes: [Time, Date], aliases: true)
assert doc.is_a?(Array), 'expected YAML list'
assert doc.size == 1, "expected one burst, got #{doc.size}"
assert doc.first['failure_count'] == 2
assert doc.first['tool_name'] == 'Read'
assert doc.first['anchor_prompt'] == 'anchor prompt'

puts 'extract_tool_failure_bursts_test: ok'

