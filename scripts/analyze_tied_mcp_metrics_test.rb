#!/usr/bin/env ruby
# frozen_string_literal: true

# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
# How: Verify paired inquiry metrics and request-scoped artifact completeness.

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
FIXTURES = File.join(ROOT, 'scripts', 'fixtures', 'mcp-metrics')

def run_analyzer(args)
  cmd = ['ruby', ANALYZER, *args]
  out, err, st = Open3.capture3(*cmd)
  [out, err, st]
end

def fixture(*parts)
  File.join(FIXTURES, *parts)
end

def parse_reports(yaml_stream)
  yaml_stream
    .split(/^---\s*$\n?/)
    .reject { |body| body.strip.empty? }
    .flat_map do |body|
      document = YAML.safe_load(body, permitted_classes: [Date, Time], aliases: true)
      document.is_a?(Array) ? document : [document]
    end
end

def parse_summary(yaml_text)
  YAML.safe_load(yaml_text, permitted_classes: [Date, Time], aliases: true).fetch('summary')
end

def assert(condition, message)
  raise message unless condition
end

def assert_equal(expected, actual, message)
  raise "#{message}: expected #{expected.inspect}, got #{actual.inspect}" unless expected == actual
end

def assert_success(status, stderr)
  raise "analyzer failed: #{stderr}" unless status.success?
end

def test_adversarial_activation
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
      out, err, status = run_analyzer(['--aggregate', '--project-root', project_root, f.path])
      assert_success(status, err)

      report = parse_reports(out).first
      tool_counts = report['tool_counts'] || {}
      assert_equal(2, tool_counts['yaml_detail_read'], 'yaml_detail_read count')
      assert_equal(1, tool_counts['tied_validate_consistency'], 'tied_validate_consistency count')
      assert_equal(1, report['schema_errors'], 'per-file schema error count')
      activation = report.fetch('activation')
      assert_equal(2, activation['inquiry_call_count'], 'per-file inquiry count')
      assert_equal(2, activation.dig('by_client', 'volume-stats', 'inquiry_call_count'), 'client inquiry count')
      assert(activation.dig('artifact_status', 'REQ-FOO', 'complete'), 'expected complete request artifacts')

      summary = parse_summary(err)
      assert_equal(6, summary['lines'], 'aggregate line count')
      aggregate_activation = summary.fetch('activation')
      assert_equal(2, aggregate_activation['inquiry_call_count'], 'aggregate inquiry count')
      assert_equal(2, aggregate_activation.dig('by_client', 'volume-stats', 'inquiry_call_count'), 'aggregate client inquiry count')
      assert(aggregate_activation.dig('artifact_status', 'REQ-FOO', 'complete'), 'aggregate artifact status missing')
      sig_a = summary.fetch('top_signatures').find { |row| row['args_signature'] == 'sig_a' }
      assert(sig_a && sig_a['count'] == 2, 'expected aggregated sig_a count')
    end
  end
end

# - [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Bound deterministic per-file and aggregate signature analysis, disclose candidate visibility through signature_coverage, and sum aggregate schema errors without conflating parse errors.
def test_bounded_signature_aggregation
  empty = fixture('within_bound', 'empty.jsonl')
  fifty = fixture('within_bound', 'fifty.jsonl')
  fifty_one = fixture('multi_file_signatures', 'approximate.jsonl')

  out, err, status = run_analyzer([empty, fifty, fifty_one])
  assert_success(status, err)
  reports = parse_reports(out)
  assert_equal(3, reports.length, 'per-file report count')

  zero_coverage = reports[0].fetch('signature_coverage')
  assert_equal(
    { 'bound' => 50, 'considered' => 0, 'emitted' => 0, 'omitted' => 0, 'status' => 'exact_within_bound' },
    zero_coverage,
    'zero-signature coverage'
  )
  fifty_coverage = reports[1].fetch('signature_coverage')
  assert_equal(
    { 'bound' => 50, 'considered' => 50, 'emitted' => 50, 'omitted' => 0, 'status' => 'exact_within_bound' },
    fifty_coverage,
    'fifty-signature coverage'
  )
  fifty_one_coverage = reports[2].fetch('signature_coverage')
  assert_equal(
    { 'bound' => 50, 'considered' => 51, 'emitted' => 50, 'omitted' => 1, 'status' => 'approximate' },
    fifty_one_coverage,
    'fifty-one-signature coverage'
  )

  _out, exact_err, exact_status = run_analyzer(['--aggregate', empty, fifty])
  assert_success(exact_status, exact_err)
  assert_equal('exact_within_bound', parse_summary(exact_err).dig('signature_coverage', 'status'), 'exact aggregate status')

  _out, truncated_err, truncated_status = run_analyzer(
    ['--aggregate', fifty_one, fixture('multi_file_signatures', 'overlap.jsonl')]
  )
  assert_success(truncated_status, truncated_err)
  truncated_coverage = parse_summary(truncated_err).fetch('signature_coverage')
  assert_equal('approximate', truncated_coverage['status'], 'aggregate status after per-file truncation')
  assert_equal(50, truncated_coverage['considered'], 'visible candidate count after per-file truncation')
  assert_equal(0, truncated_coverage['omitted'], 'visible aggregate omission after per-file truncation')

  _out, overflow_err, overflow_status = run_analyzer(
    ['--aggregate', fifty, fixture('visible_overflow', 'one_more.jsonl')]
  )
  assert_success(overflow_status, overflow_err)
  overflow_coverage = parse_summary(overflow_err).fetch('signature_coverage')
  assert_equal('approximate', overflow_coverage['status'], 'aggregate status after visible overflow')
  assert_equal(51, overflow_coverage['considered'], 'visible overflow considered count')
  assert_equal(1, overflow_coverage['omitted'], 'visible overflow omitted count')
end

def test_determinism_and_error_boundaries
  schema_a = fixture('schema_errors_multi', 'a.jsonl')
  schema_b = fixture('schema_errors_multi', 'b.jsonl')
  _out, schema_err, schema_status = run_analyzer(['--aggregate', schema_a, schema_b])
  assert_success(schema_status, schema_err)
  schema_summary = parse_summary(schema_err)
  assert_equal(2, schema_summary['schema_errors'], 'aggregate schema error sum')
  assert_equal(0, schema_summary['parse_errors'], 'aggregate parse error separation')

  ties_out, ties_err, ties_status = run_analyzer([fixture('signature_ties.jsonl')])
  assert_success(ties_status, ties_err)
  tie_keys = parse_reports(ties_out).first.fetch('top_signatures').map do |row|
    [row['count'], row['tool'], row['args_signature']]
  end
  assert_equal(
    [[2, 'tool_a', 'sig_a'], [2, 'tool_a', 'sig_b'], [2, 'tool_b', 'sig_z'], [1, 'tool_a', 'sig_c']],
    tie_keys,
    'count/tool/signature tie ordering'
  )

  permutation_a = fixture('permutation_order', 'a.jsonl')
  permutation_b = fixture('permutation_order', 'b.jsonl')
  _out, forward_err, forward_status = run_analyzer(['--aggregate', permutation_a, permutation_b])
  _out, reverse_err, reverse_status = run_analyzer(['--aggregate', permutation_b, permutation_a])
  assert_success(forward_status, forward_err)
  assert_success(reverse_status, reverse_err)
  assert_equal(
    parse_summary(forward_err)['top_signatures'],
    parse_summary(reverse_err)['top_signatures'],
    'aggregate top_signatures under reversed argv order'
  )

  mixed_out, mixed_err, mixed_status = run_analyzer([fixture('malformed_and_valid.jsonl')])
  assert_success(mixed_status, mixed_err)
  mixed = parse_reports(mixed_out).first
  assert_equal(1, mixed['parse_errors'], 'mixed parse error count')
  assert_equal(1, mixed['schema_errors'], 'mixed schema error count')
  assert_equal(1, mixed['ok_count'], 'mixed valid record count')

  empty_out, empty_err, empty_status = run_analyzer([fixture('empty.jsonl')])
  assert_success(empty_status, empty_err)
  empty = parse_reports(empty_out).first
  assert_equal(0, empty['lines'], 'empty file line count')
  assert_equal('exact_within_bound', empty.dig('signature_coverage', 'status'), 'empty file coverage status')
end

test_adversarial_activation
test_bounded_signature_aggregation
test_determinism_and_error_boundaries

puts 'analyze_tied_mcp_metrics_test: ok'
