#!/usr/bin/env ruby
# frozen_string_literal: true

# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS]
# How: Verify paired inquiry metrics, request-scoped artifact completeness, and malformed-record accounting.

# Smoke test for analyze_tied_mcp_metrics.rb
# Run: ruby scripts/analyze_tied_mcp_metrics_test.rb

require 'json'
require 'fileutils'
require 'open3'
require 'tempfile'
require 'tmpdir'
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
  { 'not' => 'a metrics record' },
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
  },
  {
    'v' => 1,
    'tool' => 'tied_adversarial_inquiry_run',
    'client' => 'volume-stats',
    'ok' => true,
    'duration_ms' => 30,
    'args_signature' => 'inquiry_sig',
    'args_summary' => { 'request_token' => 'REQ-FOO' }
  },
  {
    'v' => 1,
    'tool' => 'tied_adversarial_inquiry_run',
    'client' => 'volume-stats',
    'ok' => true,
    'duration_ms' => 40,
    'args_signature' => 'inquiry_sig',
    'args_summary' => { 'request_token' => 'REQ-FOO' }
  }
]

Dir.mktmpdir('tied-metrics-project') do |project_root|
  artifact_dir = File.join(project_root, 'working', 'REQ-FOO', 'adversarial-inquiry')
  Dir.mkdir(File.join(project_root, 'working'))
  FileUtils.mkdir_p(artifact_dir)
  %w[obligation-report.json finding-ledger.jsonl gate-result.json evidence-provenance.json].each do |name|
    File.write(File.join(artifact_dir, name), "{}\n")
  end

  Tempfile.create(['tied_mcp_metrics', '.jsonl']) do |f|
    lines.each { |row| f.puts(JSON.generate(row)) }
    f.flush
    out, err, st = run_analyzer(['--aggregate', '--project-root', project_root, f.path])
    raise "analyzer failed: #{err}" unless st.success?

    doc = YAML.safe_load(out, permitted_classes: [Date, Time], aliases: true)
    report = doc.is_a?(Array) ? doc.first : doc
    tc = report['tool_counts'] || {}
    raise "expected yaml_detail_read count 2, got #{tc.inspect}" unless tc['yaml_detail_read'] == 2
    raise "expected tied_validate_consistency count 1" unless tc['tied_validate_consistency'] == 1
    raise "expected one schema error" unless report['schema_errors'] == 1
    activation = report.fetch('activation')
    raise 'expected two inquiry calls' unless activation['inquiry_call_count'] == 2
    raise 'expected client-scoped inquiry count' unless activation.dig('by_client', 'volume-stats', 'inquiry_call_count') == 2
    raise 'expected complete request artifacts' unless activation.dig('artifact_status', 'REQ-FOO', 'complete')

    agg = YAML.safe_load(err, permitted_classes: [Date, Time], aliases: true)
    summary = agg['summary'] || {}
    raise 'aggregate missing lines' unless summary['lines'] == 6
    aggregate_activation = summary.fetch('activation')
    raise 'aggregate inquiry count mismatch' unless aggregate_activation['inquiry_call_count'] == 2
    raise 'aggregate client inquiry count mismatch' unless aggregate_activation.dig('by_client', 'volume-stats', 'inquiry_call_count') == 2
    raise 'aggregate artifact status missing' unless aggregate_activation.dig('artifact_status', 'REQ-FOO', 'complete')
    top = summary['top_signatures'] || []
    sig_a = top.find { |h| h['args_signature'] == 'sig_a' }
    raise 'expected sig_a in top_signatures' unless sig_a && sig_a['count'] == 2
  end
end

puts 'analyze_tied_mcp_metrics_test: ok'
