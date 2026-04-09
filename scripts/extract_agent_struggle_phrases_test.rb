#!/usr/bin/env ruby
# frozen_string_literal: true

# Run:
#   ruby scripts/extract_agent_struggle_phrases_test.rb

require 'open3'
require 'tempfile'
require 'date'
require 'yaml'

def assert(cond, msg = 'assertion failed')
  raise msg unless cond
end

def run_cli(args)
  cmd = ['ruby', File.expand_path('extract_agent_struggle_phrases.rb', __dir__), *args]
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
    hook_event_name: afterAgentResponse
    conversation_id: c1
    generation_id: g1
    model: default
    normalized:
      kind: agent_response
      details:
        text: "Not sure why this failed, retrying."
YAML

out, err, status = run_cli([log.path])
assert status.success?, "expected success, got #{status.exitstatus}, err=#{err.inspect}"
doc = YAML.safe_load(out, permitted_classes: [Time, Date], aliases: true)
assert doc.is_a?(Array), 'expected YAML list'
assert doc.size >= 1, 'expected at least one match'
assert doc.first['conversation_id'] == 'c1'
assert doc.first['hook_event_name'] == 'afterAgentResponse'

puts 'extract_agent_struggle_phrases_test: ok'

