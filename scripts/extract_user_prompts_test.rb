#!/usr/bin/env ruby
# frozen_string_literal: true

# Run:
#   ruby scripts/extract_user_prompts_test.rb

require 'open3'
require 'tempfile'
require 'date'
require 'yaml'

def assert(cond, msg = 'assertion failed')
  raise msg unless cond
end

def run_cli(args)
  cmd = ['ruby', File.expand_path('extract_user_prompts.rb', __dir__), *args]
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
        prompt: |-
          hello
          world
        attachment_count: 0
  - epoch: 2.0
    hook_event_name: preToolUse
    normalized:
      kind: tool_use
      details:
        tool_name: Read
YAML

# Regex match: should include the one prompt entry
out, err, status = run_cli(['--regex', 'world', log.path])
assert status.success?, "expected success, got #{status.exitstatus}, err=#{err.inspect}"
doc = YAML.safe_load(out, permitted_classes: [Time, Date], aliases: true)
assert doc.is_a?(Array), 'expected YAML top-level list'
assert doc.size == 1, "expected one entry, got #{doc.size}"
assert doc.first['prompt'] == "hello\nworld", 'expected multiline prompt preserved'
assert doc.first['file'] == File.expand_path(log.path), 'expected absolute file path'
assert doc.first['conversation_id'] == 'c1'
assert doc.first['generation_id'] == 'g1'
assert doc.first['model'] == 'default'
assert doc.first['attachment_count'] == 0

# Regex miss: should return empty list
out2, err2, status2 = run_cli(['--regex', 'nomatch', log.path])
assert status2.success?, "expected success, got #{status2.exitstatus}, err=#{err2.inspect}"
doc2 = YAML.safe_load(out2, permitted_classes: [Time, Date], aliases: true)
assert doc2.is_a?(Array) && doc2.empty?, 'expected empty list on regex miss'

# no-regex: should return list with one prompt
out3, err3, status3 = run_cli(['--no-regex', log.path])
assert status3.success?, "expected success, got #{status3.exitstatus}, err=#{err3.inspect}"
doc3 = YAML.safe_load(out3, permitted_classes: [Time, Date], aliases: true)
assert doc3.is_a?(Array) && doc3.size == 1, 'expected one prompt with --no-regex'

puts 'extract_user_prompts_test: ok'
