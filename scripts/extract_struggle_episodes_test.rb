#!/usr/bin/env ruby
# frozen_string_literal: true

# Run:
#   ruby scripts/extract_struggle_episodes_test.rb

require 'json'
require 'open3'
require 'tempfile'

def assert(cond, msg = 'assertion failed')
  raise msg unless cond
end

def run_cli(args)
  cmd = ['ruby', File.expand_path('extract_struggle_episodes.rb', __dir__), *args]
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
        prompt: hello
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
          path: /nope
        failure_type: not_found
        error_message: file not found
  - epoch: 3.0
    hook_event_name: afterAgentThought
    conversation_id: c1
    generation_id: g1
    model: default
    normalized:
      kind: agent_thought
      details:
        text: "I'm stuck; let's retry."
  - epoch: 4.0
    hook_event_name: stop
    conversation_id: c1
    generation_id: g1
    model: default
    normalized:
      kind: lifecycle
      details:
        status: stop
        loop_count: 3
YAML

out, err, status = run_cli([log.path])
assert status.success?, "expected success, got #{status.exitstatus}, err=#{err.inspect}"

lines = out.lines.map(&:strip).reject(&:empty?)
assert lines.size >= 1, "expected >=1 ndjson line, got #{lines.size}"

obj = JSON.parse(lines.first)
assert obj['file'] == File.expand_path(log.path), 'expected absolute file path'
assert obj['conversation_id'] == 'c1'
assert obj['generation_id'] == 'g1'
assert obj['tool_failures'].to_i == 1
assert obj['text_score'].to_i >= 1, 'expected text_score from "stuck/retry"'
assert obj['struggle_score'].to_i >= 10, 'expected struggle_score to be non-trivial'

out2, err2, status2 = run_cli(['--format', 'yaml', log.path])
assert status2.success?, "expected success, got #{status2.exitstatus}, err=#{err2.inspect}"
assert out2.strip.start_with?('---'), 'expected YAML output'

puts 'extract_struggle_episodes_test: ok'

