#!/usr/bin/env ruby
# frozen_string_literal: true

# Streaming analysis of TIED MCP usage metrics JSONL (~/.cursor/logs/tied-mcp-metrics.jsonl).
# O(1) memory per line.
#
# Usage:
#   ruby scripts/analyze_tied_mcp_metrics.rb FILE [FILE ...]
#   ruby scripts/analyze_tied_mcp_metrics.rb --aggregate FILE 2>summary.yaml
#
# Options:
#   --aggregate  After per-file YAML on stdout, print merged summary to stderr

require 'json'
require 'optparse'
require 'yaml'

def empty_stats
  {
    lines: 0,
    parse_errors: 0,
    tool_counts: Hash.new(0),
    client_counts: Hash.new(0),
    ok_count: 0,
    fail_count: 0,
    duration_by_tool: Hash.new { |h, k| h[k] = { min: nil, max: 0, sum: 0, n: 0 } },
    failures: {},
    signatures: {}
  }
end

def failure_key(tool, err)
  "#{tool}\t#{err}"
end

def ingest_line(obj, stats)
  stats[:lines] += 1
  tool = obj['tool'].to_s
  client = obj['client'].to_s
  ok = obj['ok']
  stats[:tool_counts][tool] += 1 if tool && !tool.empty?
  stats[:client_counts][client] += 1 if client && !client.empty?
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

def stats_to_report(path, stats)
  durations = {}
  stats[:duration_by_tool].each do |tool, bucket|
    h = duration_stats_to_hash(bucket)
    durations[tool] = h if h
  end
  failures = stats[:failures].values.sort_by { |h| -h['count'] }
  top_sigs = stats[:signatures].values.sort_by { |h| -h['count'] }.first(50)
  {
    'file' => path,
    'lines' => stats[:lines],
    'parse_errors' => stats[:parse_errors],
    'ok_count' => stats[:ok_count],
    'fail_count' => stats[:fail_count],
    'tool_counts' => stats[:tool_counts].sort_by { |_t, c| -c }.to_h,
    'client_counts' => stats[:client_counts].sort.to_h,
    'duration_by_tool' => durations.sort.to_h,
    'failures' => failures.first(30),
    'top_signatures' => top_sigs
  }
end

def analyze_file(path)
  path = File.expand_path(path)
  stats = empty_stats
  File.foreach(path, chomp: true) do |line|
    next if line.strip.empty?

    begin
      obj = JSON.parse(line)
    rescue JSON::ParserError
      stats[:parse_errors] += 1
      next
    end
    ingest_line(obj, stats)
  end
  stats_to_report(path, stats)
end

def build_aggregate(reports)
  merged = empty_stats
  reports.each do |r|
    merged[:lines] += r['lines'].to_i
    merged[:parse_errors] += r['parse_errors'].to_i
    merged[:ok_count] += r['ok_count'].to_i
    merged[:fail_count] += r['fail_count'].to_i
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
      'ok_count' => merged[:ok_count],
      'fail_count' => merged[:fail_count],
      'tool_counts' => merged[:tool_counts].sort_by { |_t, c| -c }.to_h,
      'client_counts' => merged[:client_counts].sort.to_h,
      'duration_by_tool' => merged[:duration_by_tool].transform_values { |b| duration_stats_to_hash(b) }.compact.sort.to_h,
      'failures' => merged[:failures].values.sort_by { |h| -h['count'] }.first(30),
      'top_signatures' => merged[:signatures].values.sort_by { |h| -h['count'] }.first(50)
    }
  }
end

options = { aggregate: false }
parser = OptionParser.new do |opts|
  opts.banner = 'Usage: analyze_tied_mcp_metrics.rb [options] FILE [FILE ...]'
  opts.on('--aggregate', 'Print merged summary YAML to stderr after per-file reports') do
    options[:aggregate] = true
  end
end
parser.parse!

files = ARGV
if files.empty?
  warn parser
  exit 1
end

reports = files.map { |f| analyze_file(f) }
reports.each { |r| puts YAML.dump([r]) }

if options[:aggregate]
  warn YAML.dump(build_aggregate(reports))
end
