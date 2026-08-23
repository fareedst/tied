#!/usr/bin/env ruby
# frozen_string_literal: true

# [IMPL-TIED_FILES] [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-TIED_ADVERSARIAL_INQUIRY]
# How: Stream MCP usage records and pair adversarial inquiry calls with request-scoped artifact completeness.

# Streaming analysis of TIED MCP usage metrics JSONL (~/.cursor/logs/tied-mcp-metrics.jsonl).
# Streams input lines; bounded report sections are emitted after each file.
#
# Usage:
#   ruby scripts/analyze_tied_mcp_metrics.rb [FILE ...]
#   # with no FILE, use ~/.cursor/logs/tied-mcp-metrics.jsonl when present
#   ruby scripts/analyze_tied_mcp_metrics.rb --aggregate FILE 2>summary.yaml
#   ruby scripts/analyze_tied_mcp_metrics.rb --project-root PATH FILE
#
# Options:
#   --aggregate  After per-file YAML on stdout, print merged summary to stderr
#   --project-root PATH  Check request-scoped adversarial artifacts under PATH

require 'json'
require 'optparse'
require 'yaml'

def empty_stats
  {
    lines: 0,
    parse_errors: 0,
    schema_errors: 0,
    tool_counts: Hash.new(0),
    client_counts: Hash.new(0),
    ok_count: 0,
    fail_count: 0,
    adversarial_inquiry_count: 0,
    adversarial_request_counts: Hash.new(0),
    adversarial_client_counts: Hash.new(0),
    adversarial_request_counts_by_client: Hash.new { |h, k| h[k] = Hash.new(0) },
    duration_by_tool: Hash.new { |h, k| h[k] = { min: nil, max: 0, sum: 0, n: 0 } },
    failures: {},
    signatures: {}
  }
end

def failure_key(tool, err)
  "#{tool}\t#{err}"
end

def ingest_line(obj, stats)
  valid = obj.is_a?(Hash) &&
    obj['v'] == 1 &&
    obj['tool'].is_a?(String) &&
    !obj['tool'].empty? &&
    obj['client'].is_a?(String) &&
    (obj['ok'].is_a?(TrueClass) || obj['ok'].is_a?(FalseClass)) &&
    obj['duration_ms'].is_a?(Numeric) &&
    obj['duration_ms'] >= 0 &&
    obj['args_summary'].is_a?(Hash) &&
    obj['args_signature'].is_a?(String)
  unless valid
    stats[:schema_errors] += 1
    return
  end
  tool = obj['tool'].to_s
  client = obj['client'].to_s
  ok = obj['ok']
  stats[:tool_counts][tool] += 1 if tool && !tool.empty?
  stats[:client_counts][client] += 1 if client && !client.empty?
  if tool == 'tied_adversarial_inquiry_run'
    stats[:adversarial_inquiry_count] += 1
    client_key = client.empty? ? '(missing client)' : client
    stats[:adversarial_client_counts][client_key] += 1
    request_token = obj.dig('args_summary', 'request_token').to_s
    request_token = '(missing request_token)' if request_token.empty?
    stats[:adversarial_request_counts][request_token] += 1
    stats[:adversarial_request_counts_by_client][client_key][request_token] += 1
  end
  if ok == true
    stats[:ok_count] += 1
  else
    stats[:fail_count] += 1
    err = obj['error_snippet'].to_s
    fk = failure_key(tool, err)
    stats[:failures][fk] ||= { 'tool' => tool, 'error' => err, 'count' => 0 }
    stats[:failures][fk]['count'] += 1
  end
  dur = obj['duration_ms']
  if dur.is_a?(Numeric)
    bucket = stats[:duration_by_tool][tool]
    d = dur.to_i
    bucket[:min] = d if bucket[:min].nil? || d < bucket[:min]
    bucket[:max] = d if d > bucket[:max]
    bucket[:sum] += d
    bucket[:n] += 1
  end
  sig = obj['args_signature'].to_s
  return if sig.empty?

  sk = "#{tool}\t#{sig}"
  stats[:signatures][sk] ||= {
    'tool' => tool,
    'args_signature' => sig,
    'count' => 0,
    'sample_args_summary' => obj['args_summary']
  }
  stats[:signatures][sk]['count'] += 1
end

def duration_stats_to_hash(bucket)
  return nil if bucket[:n].zero?

  {
    'min_ms' => bucket[:min],
    'max_ms' => bucket[:max],
    'avg_ms' => (bucket[:sum].to_f / bucket[:n]).round(2),
    'count' => bucket[:n]
  }
end

def artifact_status(project_root, request_tokens)
  return nil if project_root.nil?

  artifact_names = %w[
    obligation-report.json
    finding-ledger.jsonl
    gate-result.json
    evidence-provenance.json
  ]
  request_tokens.to_h do |request_token, _count|
    unless /\AREQ-[A-Z0-9][A-Z0-9_-]*\z/.match?(request_token)
      files = artifact_names.to_h { |name| [name, false] }
      next [
        request_token,
        {
          'directory' => nil,
          'files' => files,
          'complete' => false,
          'diagnostic' => 'invalid_request_token'
        }
      ]
    end
    artifact_dir = File.join(project_root, 'working', request_token, 'adversarial-inquiry')
    files = artifact_names.to_h { |name| [name, File.file?(File.join(artifact_dir, name))] }
    [
      request_token,
      {
        'directory' => artifact_dir,
        'files' => files,
        'complete' => files.values.all?
      }
    ]
  end
end

def adversarial_clients_to_hash(stats)
  stats[:adversarial_client_counts].keys.sort.to_h do |client|
    [
      client,
      {
        'inquiry_call_count' => stats[:adversarial_client_counts][client],
        'request_token_counts' => stats[:adversarial_request_counts_by_client][client].sort.to_h
      }
    ]
  end
end

def stats_to_report(path, stats, project_root = nil)
  durations = {}
  stats[:duration_by_tool].each do |tool, bucket|
    h = duration_stats_to_hash(bucket)
    durations[tool] = h if h
  end
  failures = stats[:failures].values.sort_by { |h| [-h['count'], h['tool'].to_s, h['error'].to_s] }
  top_sigs = stats[:signatures].values.sort_by { |h| [-h['count'], h['tool'].to_s, h['args_signature'].to_s] }.first(50)
  {
    'file' => path,
    'lines' => stats[:lines],
    'parse_errors' => stats[:parse_errors],
    'schema_errors' => stats[:schema_errors],
    'ok_count' => stats[:ok_count],
    'fail_count' => stats[:fail_count],
    'activation' => {
      'inquiry_call_count' => stats[:adversarial_inquiry_count],
      'by_client' => adversarial_clients_to_hash(stats),
      'request_token_counts' => stats[:adversarial_request_counts].sort.to_h,
      'artifact_status' => artifact_status(project_root, stats[:adversarial_request_counts])
    },
    'tool_counts' => stats[:tool_counts].sort_by { |tool, count| [-count, tool] }.to_h,
    'client_counts' => stats[:client_counts].sort.to_h,
    'duration_by_tool' => durations.sort.to_h,
    'failures' => failures.first(30),
    'top_signatures' => top_sigs
  }
end

def analyze_file(path, project_root = nil)
  path = File.expand_path(path)
  stats = empty_stats
  File.foreach(path, chomp: true, encoding: 'UTF-8:UTF-8') do |line|
    next if line.strip.empty?
    stats[:lines] += 1

    begin
      obj = JSON.parse(line)
    rescue JSON::ParserError
      stats[:parse_errors] += 1
      next
    end
    ingest_line(obj, stats)
  end
  stats_to_report(path, stats, project_root)
end

def build_aggregate(reports, project_root = nil)
  merged = empty_stats
  reports.each do |r|
    merged[:lines] += r['lines'].to_i
    merged[:parse_errors] += r['parse_errors'].to_i
    merged[:ok_count] += r['ok_count'].to_i
    merged[:fail_count] += r['fail_count'].to_i
    activation = r['activation'] || {}
    merged[:adversarial_inquiry_count] += activation['inquiry_call_count'].to_i
    (activation['by_client'] || {}).each do |client, client_stats|
      merged[:adversarial_client_counts][client] += client_stats['inquiry_call_count'].to_i
      (client_stats['request_token_counts'] || {}).each do |request_token, count|
        merged[:adversarial_request_counts_by_client][client][request_token] += count.to_i
      end
    end
    (activation['request_token_counts'] || {}).each do |request_token, count|
      merged[:adversarial_request_counts][request_token] += count.to_i
    end
    (r['tool_counts'] || {}).each { |k, v| merged[:tool_counts][k] += v.to_i }
    (r['client_counts'] || {}).each { |k, v| merged[:client_counts][k] += v.to_i }
    (r['failures'] || []).each do |h|
      fk = failure_key(h['tool'], h['error'])
      merged[:failures][fk] ||= { 'tool' => h['tool'], 'error' => h['error'], 'count' => 0 }
      merged[:failures][fk]['count'] += h['count'].to_i
    end
    (r['duration_by_tool'] || {}).each do |tool, dh|
      bucket = merged[:duration_by_tool][tool]
      n = dh['count'].to_i
      next if n.zero?

      min_v = dh['min_ms'].to_i
      max_v = dh['max_ms'].to_i
      avg = dh['avg_ms'].to_f
      bucket[:min] = min_v if bucket[:min].nil? || min_v < bucket[:min]
      bucket[:max] = max_v if max_v > bucket[:max]
      bucket[:sum] += avg * n
      bucket[:n] += n
    end
    (r['top_signatures'] || []).each do |h|
      sk = "#{h['tool']}\t#{h['args_signature']}"
      merged[:signatures][sk] ||= {
        'tool' => h['tool'],
        'args_signature' => h['args_signature'],
        'count' => 0,
        'sample_args_summary' => h['sample_args_summary']
      }
      merged[:signatures][sk]['count'] += h['count'].to_i
    end
  end
  {
    'summary' => {
      'files' => reports.size,
      'lines' => merged[:lines],
      'parse_errors' => merged[:parse_errors],
      'schema_errors' => merged[:schema_errors],
      'ok_count' => merged[:ok_count],
      'fail_count' => merged[:fail_count],
      'activation' => {
        'inquiry_call_count' => merged[:adversarial_inquiry_count],
        'by_client' => adversarial_clients_to_hash(merged),
        'request_token_counts' => merged[:adversarial_request_counts].sort.to_h,
        'artifact_status' => artifact_status(project_root, merged[:adversarial_request_counts])
      },
      'tool_counts' => merged[:tool_counts].sort_by { |tool, count| [-count, tool] }.to_h,
      'client_counts' => merged[:client_counts].sort.to_h,
      'duration_by_tool' => merged[:duration_by_tool].transform_values { |b| duration_stats_to_hash(b) }.compact.sort.to_h,
      'failures' => merged[:failures].values.sort_by { |h| [-h['count'], h['tool'].to_s, h['error'].to_s] }.first(30),
      'top_signatures' => merged[:signatures].values.sort_by { |h| [-h['count'], h['tool'].to_s, h['args_signature'].to_s] }.first(50)
    }
  }
end

options = { aggregate: false, project_root: nil }
parser = OptionParser.new do |opts|
  opts.banner = 'Usage: analyze_tied_mcp_metrics.rb [options] FILE [FILE ...]'
  opts.on('--aggregate', 'Print merged summary YAML to stderr after per-file reports') do
    options[:aggregate] = true
  end
  opts.on('--project-root PATH', 'Check request-scoped adversarial artifacts under PATH') do |path|
    options[:project_root] = File.expand_path(path)
  end
end
parser.parse!

files = ARGV
if files.empty?
  default_path = File.join(Dir.home, '.cursor', 'logs', 'tied-mcp-metrics.jsonl')
  files = [default_path] if File.file?(default_path)
end
if files.empty?
  warn parser
  exit 1
end

missing_files = files.reject { |file| File.file?(file) }
unless missing_files.empty?
  warn "Metrics file not found: #{missing_files.join(', ')}"
  exit 1
end

reports = files.map { |f| analyze_file(f, options[:project_root]) }
reports.each { |r| puts YAML.dump([r]) }

if options[:aggregate]
  warn YAML.dump(build_aggregate(reports, options[:project_root]))
end
