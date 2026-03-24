#!/usr/bin/env ruby
# frozen_string_literal: true

# Streaming analysis of Cursor hook YAML logs (~/.cursor/logs/conv_*.yaml).
# Splits on top-level YAML list items (unindented "- "), strips transcript subtrees before YAML parse,
# accumulates metrics. O(1) memory per record.
#
# Usage:
#   ruby scripts/analyze_hook_log.rb [options] FILE [FILE ...]
#   ruby scripts/analyze_hook_log.rb --dir ~/.cursor/logs --min-size 1M
#   ruby scripts/analyze_hook_log.rb --glob '~/.cursor/logs/conv_*.yaml'
#
# Options:
#   --min-size SIZE   Only process files >= SIZE (e.g. 100M, 1M, 512K)
#   --aggregate       After per-file YAML on stdout, print combined summary to stderr (even for one file).
#                     Summary includes summed scalars, merged events/tools/failures/reads, session and
#                     compaction totals, cross-file time_span (min first_epoch .. max last_epoch), and
#                     sessions.compaction_generation_ids_per_file_sum (sum of per-file unique ID counts;
#                     not deduplicated across files—see pre_compact_generation_ids_sample_union for a
#                     lossy union of per-file samples only).

require 'date'
require 'json'
require 'optparse'
require 'set'
require 'yaml'

require_relative 'cursor_hook_log_stream'

KNOWN_ABSENT_BASENAMES = %w[
  Rakefile Gemfile package.json package-lock.json
].freeze

def parse_min_size(str)
  s = str.to_s.strip.downcase.delete(' ')
  return nil if s.empty?

  m = s.match(/\A(\d+(?:\.\d+)?)\s*([kmgt]?)b?\z/i)
  return nil unless m

  num = m[1].to_f
  mult = case m[2].downcase
         when '' then 1
         when 'k' then 1024
         when 'm' then 1024**2
         when 'g' then 1024**3
         when 't' then 1024**4
         else return nil
         end
  (num * mult).to_i
end

def human_bytes(n)
  return '0 B' if n <= 0

  units = %w[B KB MB GB TB]
  i = 0
  f = n.to_f
  while f >= 1024 && i < units.size - 1
    f /= 1024
    i += 1
  end
  format(i.zero? ? '%d %s' : '%.2f %s', f, units[i])
end

def simplified_tool_input(details)
  return nil unless details.is_a?(Hash)

  inp = details['tool_input']
  case inp
  when Hash
    inp['file_path'] || inp['path'] || inp['pattern'] || JSON.generate(inp.sort.to_h)
  when String
    inp[0, 200]
  else
    inp.inspect
  end
end

def safe_load_record(yaml_str)
  doc = YAML.safe_load(
    yaml_str,
    permitted_classes: [Date, Time],
    aliases: true
  )
  # One hook record is a single YAML sequence element; Psych returns [Hash].
  return doc.first if doc.is_a?(Array) && doc.size == 1 && doc.first.is_a?(Hash)

  doc
end

def empty_stats
  {
    records: 0,
    parse_errors: 0,
    first_epoch: nil,
    last_epoch: nil,
    events: Hash.new(0),
    models: Set.new,
    tool_counts: Hash.new(0),
    read_paths: Hash.new(0),
    failures: {},
    session_ends: [],
    precompact_count: 0,
    precompact_gen_ids: Set.new,
    invalid_json_count: 0,
    unparsed_count: 0,
    shell_suspicious_count: 0,
    pending_tools: {},
    known_absent_reads: Hash.new(0)
  }
end

def analyze_record(rec, stats)
  stats[:records] += 1
  epoch = rec['epoch']
  if epoch
    ef = epoch.to_f
    stats[:first_epoch] = ef if stats[:first_epoch].nil? || ef < stats[:first_epoch]
    stats[:last_epoch] = ef if stats[:last_epoch].nil? || ef > stats[:last_epoch]
  end

  event = rec['event'] || rec['hook_event_name'] || 'unknown'
  stats[:events][event] += 1

  model = rec['model']
  stats[:models].add(model) if model && !model.to_s.strip.empty?

  stats[:invalid_json_count] += 1 if event == 'invalid_json'
  stats[:unparsed_count] += 1 if rec['unparsed']

  norm = rec['normalized']
  details = norm.is_a?(Hash) ? norm['details'] : nil

  case event
  when 'preToolUse', 'postToolUse'
    tool = details.is_a?(Hash) ? details['tool_name'] : nil
    # Count each logical tool invocation once (pre only; post is the paired completion).
    stats[:tool_counts][tool] += 1 if tool && event == 'preToolUse'
    tid = details.is_a?(Hash) ? details['tool_use_id'] : nil
    if event == 'preToolUse' && tid
      stats[:pending_tools][tid] = {
        tool: tool,
        input: simplified_tool_input(details)
      }
    elsif event == 'postToolUse' && tid
      stats[:pending_tools].delete(tid)
    end
    if event == 'preToolUse' && tool.to_s == 'Read'
      fp = details.is_a?(Hash) ? details.dig('tool_input', 'file_path') : nil
      if fp
        stats[:read_paths][fp] += 1
        base = File.basename(fp)
        stats[:known_absent_reads][fp] += 1 if KNOWN_ABSENT_BASENAMES.include?(base)
      end
    end
  when 'postToolUseFailure'
    orig = rec['original'].is_a?(Hash) ? rec['original'] : {}
    tool = orig['tool_name'] || (details.is_a?(Hash) ? details['tool_name'] : nil)
    msg = (orig['error_message'] || (details.is_a?(Hash) ? details['error_message'] : nil)).to_s
    key = "#{tool}\t#{msg}"
    stats[:failures][key] ||= { 'tool' => tool, 'error' => msg, 'count' => 0 }
    stats[:failures][key]['count'] += 1
  when 'sessionEnd'
    orig = rec['original'].is_a?(Hash) ? rec['original'] : {}
    stats[:session_ends] << {
      'duration_ms' => orig['duration_ms'],
      'final_status' => orig['final_status'],
      'reason' => orig['reason']
    }
  when 'preCompact'
    stats[:precompact_count] += 1
    gi = rec['generation_id']
    stats[:precompact_gen_ids].add(gi) if gi
  when 'afterShellExecution'
    out = details.is_a?(Hash) ? details['output'].to_s : ''
    if out.match?(/\b(error|failed|exit (code|status):?\s*[1-9]|non-?zero|command failed)\b/i)
      stats[:shell_suspicious_count] += 1
    end
  end
end

def stats_to_report(path, stats)
  size_bytes = File.size(path)
  dur_h = nil
  if stats[:first_epoch] && stats[:last_epoch]
    dur_h = (stats[:last_epoch] - stats[:first_epoch]) / 3600.0
  end

  sessions = stats[:session_ends]
  all_completed = sessions.empty? ? nil : sessions.all? { |s| s['final_status'].to_s == 'completed' }

  redundant_reads = stats[:read_paths].select { |_k, c| c > 1 }.map do |fp, c|
    { 'file' => fp, 'count' => c }
  end
  redundant_reads.sort_by! { |h| -h['count'] }

  failures = stats[:failures].values.sort_by { |h| -h['count'] }

  {
    'file' => path,
    'size_bytes' => size_bytes,
    'size_human' => human_bytes(size_bytes),
    'records' => stats[:records],
    'parse_errors' => stats[:parse_errors],
    'time_span' => {
      'first_epoch' => stats[:first_epoch],
      'last_epoch' => stats[:last_epoch],
      'duration_hours' => dur_h&.round(4)
    },
    'events' => stats[:events].sort.to_h,
    'sessions' => {
      'total' => sessions.size,
      'all_completed' => all_completed,
      'compactions' => stats[:precompact_count],
      'compaction_generation_ids' => stats[:precompact_gen_ids].size
    },
    'failures' => failures,
    'redundant_reads' => redundant_reads.first(50),
    'known_absent_path_reads' => stats[:known_absent_reads].select { |_k, c| c.positive? }.map { |fp, c| { 'file' => fp, 'count' => c } },
    'models_used' => stats[:models].to_a.sort,
    'tool_call_summary' => stats[:tool_counts].sort_by { |_t, c| -c }.to_h,
    'invalid_json_events' => stats[:invalid_json_count],
    'unparsed_records' => stats[:unparsed_count],
    'shell_output_suspicious' => stats[:shell_suspicious_count],
    'interrupted_tool_calls' => stats[:pending_tools].size,
    'pre_compact_generation_ids_sample' => stats[:precompact_gen_ids].to_a.first(20)
  }
end

def analyze_file(path)
  path = File.expand_path(path)
  stats = empty_stats

  File.open(path, 'r:utf-8') do |io|
    CursorHookLogStream.each_record_string(io) do |raw|
      stripped = CursorHookLogStream.strip_transcript_from_record_string(raw)
      begin
        rec = safe_load_record(stripped)
      rescue Psych::SyntaxError, Psych::Exception => e
        stats[:parse_errors] += 1
        warn "DIAGNOSTIC: parse error at record ~#{stats[:records] + 1}: #{e.message} (#{path})"
        next
      end

      unless rec.is_a?(Hash)
        stats[:parse_errors] += 1
        next
      end

      analyze_record(rec, stats)
    end
  end

  stats_to_report(path, stats)
end

# Builds stderr aggregate from per-file report hashes (see stats_to_report).
def build_aggregate_summary(reports)
  total_bytes = reports.sum { |r| r['size_bytes'].to_i }
  total_records = reports.sum { |r| r['records'].to_i }
  total_parse_errors = reports.sum { |r| r['parse_errors'].to_i }
  total_failure_events = reports.sum { |r| (r['failures'] || []).sum { |h| h['count'].to_i } }

  first_ep = nil
  last_ep = nil
  reports.each do |r|
    ts = r['time_span']
    next unless ts.is_a?(Hash)

    fe = ts['first_epoch']
    if fe
      ff = fe.to_f
      first_ep = ff if first_ep.nil? || ff < first_ep
    end
    le = ts['last_epoch']
    if le
      lf = le.to_f
      last_ep = lf if last_ep.nil? || lf > last_ep
    end
  end
  dur_h = nil
  dur_h = ((last_ep - first_ep) / 3600.0).round(4) if first_ep && last_ep

  session_total = 0
  compactions_sum = 0
  gen_id_per_file_sum = 0
  reports.each do |r|
    s = r['sessions']
    next unless s.is_a?(Hash)

    session_total += s['total'].to_i
    compactions_sum += s['compactions'].to_i
    gen_id_per_file_sum += s['compaction_generation_ids'].to_i
  end

  agg_all_completed = nil
  if session_total.positive?
    relevant = reports.select do |r|
      st = r['sessions']
      st.is_a?(Hash) && st['total'].to_i.positive?
    end
    agg_all_completed = relevant.all? { |r| r['sessions']['all_completed'] == true }
  end

  events_merged = Hash.new(0)
  reports.each do |r|
    (r['events'] || {}).each { |k, v| events_merged[k] += v.to_i }
  end

  tools_merged = Hash.new(0)
  reports.each do |r|
    (r['tool_call_summary'] || {}).each { |k, v| tools_merged[k] += v.to_i }
  end

  models = Set.new
  reports.each { |r| (r['models_used'] || []).each { |m| models.add(m) } }

  failures_merged = {}
  reports.each do |r|
    (r['failures'] || []).each do |h|
      next unless h.is_a?(Hash)

      key = "#{h['tool']}\t#{h['error']}"
      failures_merged[key] ||= { 'tool' => h['tool'], 'error' => h['error'], 'count' => 0 }
      failures_merged[key]['count'] += h['count'].to_i
    end
  end
  failures_top = failures_merged.values.sort_by { |h| -h['count'] }.first(30)

  redundant_merged = Hash.new(0)
  reports.each do |r|
    (r['redundant_reads'] || []).each do |h|
      next unless h.is_a?(Hash) && h['file']

      redundant_merged[h['file']] += h['count'].to_i
    end
  end
  redundant_list = redundant_merged.map { |fp, c| { 'file' => fp, 'count' => c } }
  redundant_list.sort_by! { |h| -h['count'] }

  absent_merged = Hash.new(0)
  reports.each do |r|
    (r['known_absent_path_reads'] || []).each do |h|
      next unless h.is_a?(Hash) && h['file']

      absent_merged[h['file']] += h['count'].to_i
    end
  end
  absent_list = absent_merged.map { |fp, c| { 'file' => fp, 'count' => c } }
  absent_list.sort_by! { |h| -h['count'] }

  sample_union = []
  reports.each { |r| sample_union.concat(Array(r['pre_compact_generation_ids_sample'])) }
  sample_union = sample_union.compact.uniq.first(40)

  {
    'files' => reports.size,
    'total_size_bytes' => total_bytes,
    'total_size_human' => human_bytes(total_bytes),
    'total_records' => total_records,
    'total_failure_events' => total_failure_events,
    'parse_errors' => total_parse_errors,
    'time_span' => {
      'first_epoch' => first_ep,
      'last_epoch' => last_ep,
      'duration_hours' => dur_h
    },
    'sessions' => {
      'total' => session_total,
      'all_completed' => agg_all_completed,
      'compactions' => compactions_sum,
      'compaction_generation_ids_per_file_sum' => gen_id_per_file_sum
    },
    'events' => events_merged.sort.to_h,
    'tool_call_summary' => tools_merged.sort_by { |_t, c| -c }.to_h,
    'models_used' => models.to_a.sort,
    'failures' => failures_top,
    'redundant_reads' => redundant_list.first(50),
    'known_absent_path_reads' => absent_list,
    'invalid_json_events' => reports.sum { |r| r['invalid_json_events'].to_i },
    'unparsed_records' => reports.sum { |r| r['unparsed_records'].to_i },
    'shell_output_suspicious' => reports.sum { |r| r['shell_output_suspicious'].to_i },
    'interrupted_tool_calls' => reports.sum { |r| r['interrupted_tool_calls'].to_i },
    'pre_compact_generation_ids_sample_union' => sample_union
  }
end

def expand_dir(dir, min_bytes)
  d = File.expand_path(dir)
  return [] unless Dir.exist?(d)

  Dir.glob(File.join(d, '*.yaml')).sort.select do |p|
    File.file?(p) && File.size(p) >= min_bytes
  end
end

# Expands ~ and relative cwd segments, then returns sorted existing file paths.
def paths_from_glob(pattern)
  abs = File.expand_path(pattern)
  Dir.glob(abs).sort.select { |p| File.file?(p) }
end

options = { min_size: 0, aggregate: false, output: $stdout, globs: [] }
parser = OptionParser.new do |opts|
  opts.banner = 'Usage: analyze_hook_log.rb [options] FILE [FILE ...]'

  opts.on('-g', '--glob PATTERN', 'Add files matching glob (repeatable); ~ and relative patterns OK') do |v|
    options[:globs] << v
  end
  opts.on('--dir PATH', 'Process all *.yaml in PATH (use with --min-size to filter)') { |v| options[:dir] = v }
  opts.on('--min-size SIZE', 'Minimum file size (e.g. 1M, 100M)') { |v| options[:min_size_str] = v }
  opts.on('--aggregate', 'Print full merged summary to stderr after per-file YAML on stdout') { options[:aggregate] = true }
  opts.on('-h', '--help', 'Show help') do
    puts opts
    exit 0
  end
end
parser.parse!

min_bytes = 0
if options[:min_size_str]
  min_bytes = parse_min_size(options[:min_size_str])
  unless min_bytes
    warn "Invalid --min-size: #{options[:min_size_str].inspect}"
    exit 2
  end
end

files = []
files += expand_dir(options[:dir], min_bytes) if options[:dir]
options[:globs].each { |pat| files.concat(paths_from_glob(pat)) }
files += ARGV.map { |f| File.expand_path(f) }
files.uniq!
files.select! { |p| File.file?(p) && File.size(p) >= min_bytes }

if files.empty?
  warn 'No files to process. Pass FILE args, --glob PATTERN, or --dir with matching *.yaml'
  warn parser.help
  exit 2
end

reports = []
files.each do |f|
  reports << analyze_file(f)
  puts YAML.dump(reports.last)
  puts '---'
end

if options[:aggregate] && reports.any?
  $stderr.puts YAML.dump('summary' => build_aggregate_summary(reports))
end
