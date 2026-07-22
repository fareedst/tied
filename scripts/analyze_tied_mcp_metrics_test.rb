#!/usr/bin/env ruby
# frozen_string_literal: true

# Smoke test for analyze_tied_mcp_metrics.rb
# Run: ruby scripts/analyze_tied_mcp_metrics_test.rb

require 'json'
require 'open3'
require 'tempfile'
require 'yaml'
require 'date'

ROOT = File.expand_path('..', __dir__)
ANALYZER = File.join(ROOT, 'scripts', 'analyze_tied_mcp_metrics.rb')

def run_analyzer(args)
  cmd = ['ruby', ANALYZER, *args]
  out, err, st = Open3.capture3(*cmd)
  [out, err, st]
end

lines = [
  {
    'v' => 1,
    'tool' => 'yaml_detail_read',
    'client' => 'tied-cli',
    'ok' => true,
    'duration_ms' => 10,
    'args_signature' => 'sig_a',
    'args_summary' => { 'token' => 'REQ-FOO' }
  },
  {
    'v' => 1,
    'tool' => 'yaml_detail_read',
    'client' => 'cursor-mcp',
    'ok' => true,
    'duration_ms' => 20,
    'args_signature' => 'sig_a',
    'args_summary' => { 'token' => 'REQ-FOO' }
  },
  {
    'v' => 1,
    'tool' => 'tied_validate_consistency',
    'client' => 'tied-cli',
    'ok' => false,
    'duration_ms' => 5,
    'error_snippet' => 'consistency failed',
    'args_signature' => 'sig_b',
    'args_summary' => {}
  }
]

Tempfile.create(['tied_mcp_metrics', '.jsonl']) do |f|
  lines.each { |row| f.puts(JSON.generate(row)) }
  f.flush
  out, err, st = run_analyzer(['--aggregate', f.path])
  raise "analyzer failed: #{err}" unless st.success?

  doc = YAML.safe_load(out, permitted_classes: [Date, Time], aliases: true)
  report = doc.is_a?(Array) ? doc.first : doc
  tc = report['tool_counts'] || {}
  raise "expected yaml_detail_read count 2, got #{tc.inspect}" unless tc['yaml_detail_read'] == 2
  raise "expected tied_validate_consistency count 1" unless tc['tied_validate_consistency'] == 1

  agg = YAML.safe_load(err, permitted_classes: [Date, Time], aliases: true)
  summary = agg['summary'] || {}
  raise 'aggregate missing lines' unless summary['lines'] == 3
  top = summary['top_signatures'] || []
  sig_a = top.find { |h| h['args_signature'] == 'sig_a' }
  raise 'expected sig_a in top_signatures' unless sig_a && sig_a['count'] == 2
end

puts 'analyze_tied_mcp_metrics_test: ok'
