#!/usr/bin/env ruby
# frozen_string_literal: true

# Extract "struggle episodes" from Cursor hook YAML logs (~/.cursor/logs/conv_*.yaml).
#
# Episodes are contiguous spans of records, split primarily by:
# - hook_event_name == "beforeSubmitPrompt"
# - large gaps in record epoch (default: 120s)
# - hook_event_name == "stop"
#
# Each episode is summarized as one NDJSON line (default) with:
# - stable identifiers (file, conversation_id, generation_id)
# - epoch_start/epoch_end and duration
# - counts (tool_use, tool_failures, shell, mcp, read_file, agent_thought/response)
# - retry signals (repeated tool inputs, repeated shell commands, read thrash)
# - text signals from afterAgentThought/afterAgentResponse scanning
# - a computed struggle_score for ranking
#
# Usage:
#   ruby scripts/extract_struggle_episodes.rb ~/.cursor/logs/conv_*.yaml > episodes.ndjson
#   ruby scripts/extract_struggle_episodes.rb --gap-seconds 300 --min-score 10 --format yaml FILE...
#
# Output formats:
# - ndjson (default): one JSON object per line
# - yaml: one YAML document (top-level list of episode objects)

require 'date'
require 'digest'
require 'json'
require 'optparse'
require 'yaml'

require_relative 'cursor_hook_log_stream'

def safe_load_record(yaml_str)
  doc = YAML.safe_load(
    yaml_str,
    permitted_classes: [Date, Time],
    aliases: true
  )
  return doc.first if doc.is_a?(Array) && doc.size == 1 && doc.first.is_a?(Hash)

  doc
end

def read_files_from_list(path)
  File.read(path, mode: 'r:utf-8').lines.map(&:strip).reject { |l| l.empty? || l.start_with?('#') }
end

DEFAULT_PHRASE_WEIGHTS = [
  # high-signal "stuck" markers
  [/(\bstuck\b|\bblocked\b|\bdead[- ]?end\b)/i, 6],
  [/(\bcan't\b|\bcannot\b|\bwon't\b).*?(work|parse|compile|run|repro|fix)/i, 5],
  [/(\bfailed\b|\bfailure\b|\berror\b|\bexception\b)/i, 3],
  [/(\btimeout\b|\btimed out\b|\brate limit\b|\b429\b)/i, 4],
  # retry / iteration markers
  [/(\bretry\b|\btrying again\b|\blet's try\b|\bone more try\b|\banother approach\b)/i, 2],
  [/(\bworkaround\b|\bhack\b|\bquick fix\b)/i, 2],
  # uncertainty markers (lower weight)
  [/(\bnot sure\b|\bunsure\b|\bmaybe\b|\bperhaps\b|\bi think\b|\bguess\b)/i, 1]
].freeze

def text_signal_score(text, phrase_weights)
  return [0, []] unless text.is_a?(String) && !text.empty?

  score = 0
  hits = []
  phrase_weights.each do |(re, w)|
    m = text.match(re)
    next unless m

    score += w
    hits << { 'pattern' => re.source, 'weight' => w, 'match' => m[0][0, 200] }
  end
  [score, hits]
end

def json_stable_digest(obj)
  json = JSON.generate(obj)
  Digest::SHA256.hexdigest(json)[0, 16]
rescue StandardError
  Digest::SHA256.hexdigest(obj.to_s)[0, 16]
end

def now_epoch(rec)
  v = rec.is_a?(Hash) ? rec['epoch'] : nil
  f = v.is_a?(Numeric) ? v.to_f : nil
  return f if f && f.finite?

  nil
end

class Episode
  attr_reader :file, :conversation_id, :generation_id, :model

  def initialize(file:, phrase_weights:)
    @file = file
    @phrase_weights = phrase_weights
    reset!
  end

  def reset!
    @conversation_id = nil
    @generation_id = nil
    @model = nil

    @epoch_start = nil
    @epoch_end = nil
    @last_epoch = nil

    @latest_prompt = nil
    @latest_prompt_epoch = nil

    @counts = Hash.new(0)
    @tool_failures = 0
    @tool_calls = 0

    @tool_input_digests = Hash.new(0)
    @shell_command_digests = Hash.new(0)
    @read_paths = Hash.new(0)

    @text_score = 0
    @text_hits = []

    @stop_loop_count = nil
    @stop_status = nil
  end

  def empty?
    @epoch_start.nil?
  end

  def last_epoch
    @last_epoch
  end

  def ingest!(rec)
    return unless rec.is_a?(Hash)

    @conversation_id ||= rec['conversation_id']
    @generation_id ||= rec['generation_id']
    @model ||= rec['model']

    epoch = now_epoch(rec)
    if epoch
      @epoch_start ||= epoch
      @epoch_end = epoch
      @last_epoch = epoch
    end

    hook = rec['hook_event_name'].to_s
    kind = rec.dig('normalized', 'kind').to_s
    @counts[kind] += 1 if !kind.empty?
    @counts["hook:#{hook}"] += 1 if !hook.empty?

    case hook
    when 'beforeSubmitPrompt'
      prompt = rec.dig('normalized', 'details', 'prompt')
      if prompt.is_a?(String) && !prompt.strip.empty?
        @latest_prompt = prompt
        @latest_prompt_epoch = epoch
      end
    when 'preToolUse', 'postToolUse'
      @tool_calls += 1
      tool_name = rec.dig('normalized', 'details', 'tool_name')
      tool_input = rec.dig('normalized', 'details', 'tool_input')
      if tool_name
        digest = json_stable_digest({ 'tool_name' => tool_name, 'tool_input' => tool_input })
        @tool_input_digests[digest] += 1
      end
    when 'postToolUseFailure'
      @tool_failures += 1
      @tool_calls += 1
      tool_name = rec.dig('normalized', 'details', 'tool_name')
      tool_input = rec.dig('normalized', 'details', 'tool_input')
      if tool_name
        digest = json_stable_digest({ 'tool_name' => tool_name, 'tool_input' => tool_input })
        @tool_input_digests[digest] += 1
      end
    when 'beforeShellExecution', 'afterShellExecution'
      cmd = rec.dig('normalized', 'details', 'command') || rec.dig('original', 'command') || rec['command']
      if cmd.is_a?(String) && !cmd.strip.empty?
        digest = Digest::SHA256.hexdigest(cmd)[0, 16]
        @shell_command_digests[digest] += 1
      end
    when 'beforeReadFile'
      path = rec.dig('normalized', 'details', 'file_path')
      if path.is_a?(String) && !path.strip.empty?
        @read_paths[path] += 1
      end
    when 'afterAgentThought', 'afterAgentResponse'
      txt = rec.dig('normalized', 'details', 'text')
      s, hits = text_signal_score(txt, @phrase_weights)
      @text_score += s
      @text_hits.concat(hits) if hits.any?
    when 'stop'
      @stop_loop_count = rec.dig('normalized', 'details', 'loop_count') || rec.dig('original', 'loop_count')
      @stop_status = rec.dig('normalized', 'details', 'status') || rec.dig('original', 'status')
    end
  end

  def to_h
    duration = if @epoch_start && @epoch_end
      (@epoch_end - @epoch_start)
    end

    repeated_tool_inputs = @tool_input_digests.count { |_d, n| n >= 2 }
    repeated_shell_commands = @shell_command_digests.count { |_d, n| n >= 2 }
    read_thrash_paths = @read_paths.count { |_p, n| n >= 3 }

    tool_failure_rate = if @tool_calls > 0
      (@tool_failures.to_f / @tool_calls)
    end

    # Heuristic scoring: tune for ranking, not absolute meaning.
    struggle_score =
      (@tool_failures * 6) +
      (repeated_tool_inputs * 3) +
      (repeated_shell_commands * 2) +
      (read_thrash_paths * 2) +
      (@text_score) +
      ((@counts['read_file'] || 0) >= 30 ? 3 : 0) +
      ((@counts['tool_use'] || 0) >= 30 ? 3 : 0) +
      ((@stop_loop_count.to_i >= 3) ? 4 : 0)

    {
      'file' => @file,
      'conversation_id' => @conversation_id,
      'generation_id' => @generation_id,
      'model' => @model,
      'epoch_start' => @epoch_start,
      'epoch_end' => @epoch_end,
      'duration_s' => duration,
      'latest_prompt_epoch' => @latest_prompt_epoch,
      'latest_prompt' => @latest_prompt,
      'counts' => @counts,
      'tool_calls' => @tool_calls,
      'tool_failures' => @tool_failures,
      'tool_failure_rate' => tool_failure_rate,
      'repeated_tool_inputs' => repeated_tool_inputs,
      'repeated_shell_commands' => repeated_shell_commands,
      'read_thrash_paths' => read_thrash_paths,
      'stop_loop_count' => @stop_loop_count,
      'stop_status' => @stop_status,
      'text_score' => @text_score,
      'text_hits' => @text_hits.first(10),
      'struggle_score' => struggle_score
    }
  end
end

options = {
  gap_seconds: 120,
  min_score: nil,
  format: 'ndjson',
  files_from: []
}

parser = OptionParser.new do |opts|
  opts.banner = 'Usage: extract_struggle_episodes.rb [options] FILE [FILE ...]'

  opts.on('--gap-seconds N', Integer, 'Split episodes when epoch gap exceeds N (default: 120)') { |v| options[:gap_seconds] = v }
  opts.on('--min-score N', Integer, 'Only emit episodes with struggle_score >= N') { |v| options[:min_score] = v }
  opts.on('--format FMT', 'Output format: ndjson (default) or yaml') { |v| options[:format] = v.to_s.strip.downcase }
  opts.on('--files-from PATH', 'Read newline-separated file paths from PATH (repeatable)') { |v| options[:files_from] << v }
  opts.on('-h', '--help', 'Show help') do
    puts opts
    exit 0
  end
end
parser.parse!

files = []
options[:files_from].each do |p|
  begin
    files.concat(read_files_from_list(File.expand_path(p)))
  rescue Errno::ENOENT => e
    warn "DIAGNOSTIC: --files-from read failed: #{e.message}"
    exit 2
  end
end
files.concat(ARGV)
files.map! { |p| File.expand_path(p) }
files.uniq!
files.select! { |p| File.file?(p) }

if files.empty?
  warn 'No files to process. Pass FILE args or --files-from.'
  warn parser.help
  exit 2
end

phrase_weights = DEFAULT_PHRASE_WEIGHTS
out_yaml = []

emit = lambda do |episode|
  h = episode.to_h
  min = options[:min_score]
  return if min && h['struggle_score'].to_i < min

  if options[:format] == 'yaml'
    out_yaml << h
  else
    puts JSON.generate(h)
  end
end

files.each do |path|
  path = File.expand_path(path)
  episode = Episode.new(file: path, phrase_weights: phrase_weights)

  File.open(path, 'r:utf-8') do |io|
    CursorHookLogStream.each_record_string(io) do |raw|
      stripped = CursorHookLogStream.strip_transcript_from_record_string(raw)
      rec = safe_load_record(stripped)
      next unless rec.is_a?(Hash)

      epoch = now_epoch(rec)
      gap = if epoch && episode.last_epoch
        (epoch - episode.last_epoch)
      end

      hook = rec['hook_event_name'].to_s
      split_now =
        (!episode.empty? && hook == 'beforeSubmitPrompt') ||
        (!episode.empty? && hook == 'stop') ||
        (!episode.empty? && gap && gap > options[:gap_seconds])

      if split_now
        emit.call(episode)
        episode.reset!
      end

      episode.ingest!(rec)
    rescue Psych::SyntaxError, Psych::Exception => e
      warn "DIAGNOSTIC: parse error in #{path}: #{e.message}"
      next
    end
  end

  emit.call(episode) unless episode.empty?
rescue Errno::ENOENT, Errno::EACCES => e
  warn "DIAGNOSTIC: cannot read #{path}: #{e.message}"
end

puts YAML.dump(out_yaml) if options[:format] == 'yaml'

