#!/usr/bin/env ruby
# frozen_string_literal: true

# Run:
#   ruby scripts/extract_repeated_tool_calls_test.rb

require 'open3'
require 'tempfile'
require 'date'
require 'yaml'

def assert(cond, msg = 'assertion failed')
  raise msg unless cond
end

def run_cli(args)
  cmd = ['ruby', File.expand_path('extract_repeated_tool_calls.rb', __dir__), *args]
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
    hook_event_name: preToolUse
    conversation_id: c1
    generation_id: g1
    model: default
    normalized:
      kind: tool_use
      details:
        tool_name: Read
        tool_input:
          path: /a
  - epoch: 2.0
    hook_event_name: postToolUseFailure
    conversation_id: c1
    generation_id: g1
    model: default
    normalized:
      kind: tool_use
      details:
        tool_name: Read
        tool_input:
          path: /a
  - epoch: 3.0
    hook_event_name: postToolUse
    conversation_id: c1
    generation_id: g1
    model: default
    normalized:
      kind: tool_use
      details:
        tool_name: Read
        tool_input:
          path: /a
YAML

out, err, status = run_cli(['--min-count', '3', log.path])
assert status.success?, "expected success, got #{status.exitstatus}, err=#{err.inspect}"
doc = YAML.safe_load(out, permitted_classes: [Time, Date], aliases: true)
assert doc.is_a?(Array), 'expected YAML list'
assert doc.size == 1, "expected one signature, got #{doc.size}"
assert doc.first['tool_name'] == 'Read'
assert doc.first['count'] == 3
assert doc.first['saw_failure'] == true

puts 'extract_repeated_tool_calls_test: ok'

