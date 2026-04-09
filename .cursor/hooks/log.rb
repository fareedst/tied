#!/usr/bin/env ruby
# frozen_string_literal: true

require 'fileutils'
require 'json'
require 'optparse'
require 'time'
require 'pathname'
require 'set'
require 'yaml'

require_relative '../../scripts/transcript_long_text_dedupe'
require_relative '../../scripts/transcript_yaml_prune'

##
# Transcript embedding policy for hook YAML logs.
# Default +{none}+ avoids O(n²) growth from repeating the full JSONL in every record.
#
class TranscriptOptions
  END_HOOKS = %w[sessionEnd stop beforeSubmitPrompt].freeze

  attr_reader :mode, :tail_lines

  # @param mode [Symbol] :none, :full, :tail, :end_only, :delta
  # @param tail_lines [Integer, nil] last N non-empty JSONL lines for :tail
  def initialize(mode:, tail_lines: nil)
    @mode = mode.to_sym
    @tail_lines = tail_lines
  end

  def self.default
    new(mode: :none)
  end

  # +str+ is +none+, +full+, +tail:50+, +end-only+, +delta+ (CLI or env).
  def self.parse(str)
    s = str.to_s.strip.downcase.tr('_', '-')
    return new(mode: :none) if s.empty? || s == 'none'

    if s == 'full'
      new(mode: :full)
    elsif s == 'end-only' || s == 'endonly'
      new(mode: :end_only)
    elsif s == 'delta'
      new(mode: :delta)
    elsif (m = s.match(/\Atail:(\d+)\z/))
      n = m[1].to_i
      raise ArgumentError, 'tail:N requires N >= 1' if n < 1

      new(mode: :tail, tail_lines: n)
    else
      raise ArgumentError, "invalid --transcript value: #{str.inspect} (expected none|full|tail:N|end-only|delta)"
    end
  end

  # Env +CURSOR_HOOK_LOG_TRANSCRIPT+; ignored if +cli_value+ is non-nil.
  def self.from_cli_and_env(cli_value)
    raw = cli_value || ENV['CURSOR_HOOK_LOG_TRANSCRIPT']
    parse(raw || 'none')
  rescue ArgumentError => e
    warn "DIAGNOSTIC: #{e.message} — using transcript mode none"
    default
  end
end

##
# Parses one Cursor hook JSON record and normalizes it.
#
# Input:
# - one JSON object from a file or STDIN
#
# Output:
# - writes the normalized record as YAML to ~/.cursor/logs/conv_<conversation_id>.yaml
#   (each record includes top-level `epoch`: UTC float seconds since Unix epoch at append time)
# - prints {} for Cursor hook compatibility
#
# CLI: `--no-minify` keeps empty keys and per-record `conversation_id` (default: minify, same rules as
# scripts/dedupe_transcript_yaml.rb --prune-keys). `--no-dedupe` skips inline long-`content` dedupe
# (see scripts/transcript_long_text_dedupe.rb, scripts/dedupe_transcript_yaml.rb).
#
# Transcript: `--transcript MODE` or env +CURSOR_HOOK_LOG_TRANSCRIPT+ (+none+|+full+|+tail:N+|+end-only+|+delta+).
# Default +none+ writes +transcript_path+ and +transcript_meta+ (+bytes+ only); full JSONL body is on disk.
# +delta+ appends only new JSONL lines since last hook (+transcript_delta+) using offsets in
# ~/.cursor/logs/.conversation_start_times.json.
#
class CursorRecordParser
  KIND_MAP = {
    'preToolUse' => 'tool_use',
    'postToolUse' => 'tool_use',
    'postToolUseFailure' => 'tool_use',
    'beforeShellExecution' => 'shell',
    'afterShellExecution' => 'shell',
    'beforeMCPExecution' => 'mcp',
    'afterMCPExecution' => 'mcp',
    'beforeReadFile' => 'read_file',
    'beforeSubmitPrompt' => 'prompt',
    'sessionStart' => 'session',
    'afterAgentThought' => 'agent_thought',
    'afterAgentResponse' => 'agent_response',
    'stop' => 'lifecycle'
  }.freeze

  ROOT_PROMOTED_KEYS = %w[cursor_version workspace_roots user_email conversation_id generation_id model hook_event_name transcript_path].freeze

  WORKSPACE_PREFIX = '/Users/fareed/Documents/dev/'

  def initialize(transcript_options: nil)
    @transcript_opts = transcript_options || TranscriptOptions.default
  end

  ##
  # Parse one full JSON object string.
  #
  # @param text [String]
  # @return [Hash]
  #
  def parse(text)
    raw = JSON.parse(text)
    normalize(raw)
  rescue JSON::ParserError => e
    {
      'event' => 'invalid_json',
      'unparsed' => {
        'record' => {
          'value' => text,
          'reason' => e.message
        }
      }
    }
  end

  private

  ##
  # Normalize a parsed top-level record.
  #
  # @param raw [Hash]
  # @return [Hash]
  #
  def normalize(raw)
    hook = raw['hook_event_name']
    promoted = Set.new(ROOT_PROMOTED_KEYS + extracted_raw_keys(raw))

    record = {
      'cursor_version' => raw['cursor_version'],
      'workspace_roots' => raw['workspace_roots'],
      'relative_path' => relative_path_from(raw['workspace_roots']),
      'event' => hook || 'unknown',
      'conversation_id' => raw['conversation_id'],
      'generation_id' => raw['generation_id'],
      'model' => raw['model'],
      'hook_event_name' => hook,
      'normalized' => {
        'kind' => KIND_MAP[hook] || (raw.key?('tool_name') ? 'tool_use' : 'unknown'),
        'details' => details_for(raw)
      },
      'original' => raw.reject { |k, _| promoted.include?(k) }
    }

    apply_transcript_to_record!(record, raw)

    unless raw.is_a?(Hash)
      record['unparsed'] = {
        'record' => {
          'value' => raw,
          'reason' => 'top-level record was not an object'
        }
      }
    end

    record
  end

  ##
  # Return normalized details for a record.
  #
  # @param raw [Hash]
  # @return [Hash]
  #
  def details_for(raw)
    case raw['hook_event_name']
    when 'sessionStart'
      slice(raw, 'session_id', 'composer_mode', 'model', 'is_background_agent', 'transcript_path')
    when 'beforeSubmitPrompt'
      {
        'prompt' => raw['prompt'],
        'attachments' => raw['attachments'],
        'attachment_count' => Array(raw['attachments']).size
      }
    when 'preToolUse', 'postToolUse'
      parsed_fields(
        slice(raw, 'tool_name', 'tool_use_id', 'cwd', 'duration'),
        'tool_input' => raw['tool_input'],
        'tool_output' => raw['tool_output']
      )
    when 'postToolUseFailure'
      parsed_fields(
        slice(raw, 'tool_name', 'tool_use_id', 'error_message', 'failure_type', 'duration', 'is_interrupt'),
        'tool_input' => raw['tool_input']
      )
    when 'beforeShellExecution', 'afterShellExecution'
      slice(raw, 'command', 'cwd', 'sandbox', 'duration', 'output')
    when 'beforeReadFile'
      parsed_fields(
        slice(raw, 'file_path', 'attachments'),
        'content' => raw['content']
      )
    when 'beforeMCPExecution', 'afterMCPExecution'
      parsed_fields(
        slice(raw, 'tool_name', 'command', 'duration'),
        'tool_input' => raw['tool_input'],
        'result' => raw['result_json']
      )
    when 'afterAgentThought'
      slice(raw, 'text', 'duration_ms')
    when 'afterAgentResponse'
      slice(raw, 'text')
    when 'stop'
      slice(raw, 'status', 'loop_count')
    else
      { 'keys' => raw.keys.sort }
    end
  end

  # Keep in sync with details_for — returns the raw key names consumed per event.
  def extracted_raw_keys(raw)
    case raw['hook_event_name']
    when 'sessionStart'
      %w[session_id composer_mode model is_background_agent transcript_path]
    when 'beforeSubmitPrompt'
      %w[prompt attachments]
    when 'preToolUse', 'postToolUse'
      %w[tool_name tool_use_id cwd duration tool_input tool_output]
    when 'postToolUseFailure'
      %w[tool_name tool_use_id error_message failure_type duration is_interrupt tool_input]
    when 'beforeShellExecution', 'afterShellExecution'
      %w[command cwd sandbox duration output]
    when 'beforeReadFile'
      %w[file_path attachments content]
    when 'beforeMCPExecution', 'afterMCPExecution'
      %w[tool_name command duration tool_input result_json]
    when 'afterAgentThought'
      %w[text duration_ms]
    when 'afterAgentResponse'
      %w[text]
    when 'stop'
      %w[status loop_count]
    else
      []
    end
  end

  def relative_path_from(workspace_roots)
    root = Array(workspace_roots).first
    return nil unless root&.start_with?(WORKSPACE_PREFIX)

    root.delete_prefix(WORKSPACE_PREFIX).tr('/', '_')
  end

  ##
  # Embed transcript (or pointer/meta only) per +@transcript_opts+.
  #
  def apply_transcript_to_record!(record, raw)
    path = raw['transcript_path']
    return if path.nil? || path.empty?

    hook = raw['hook_event_name']
    opts = @transcript_opts

    record['transcript_path'] = path

    case opts.mode
    when :none
      record['transcript_meta'] = transcript_file_meta_bytes_only(path)
    when :delta
      # Full body appended in CursorHookLogger#write via TranscriptDelta.append!
      record['transcript_meta'] = transcript_file_meta_bytes_only(path)
    when :full
      attach_full_transcript!(record, path)
    when :tail
      attach_tail_transcript!(record, path, opts.tail_lines)
    when :end_only
      if TranscriptOptions::END_HOOKS.include?(hook)
        attach_full_transcript!(record, path)
      else
        record['transcript_meta'] = transcript_file_meta_bytes_only(path)
      end
    end
  end

  def transcript_file_meta_bytes_only(path)
    return nil unless File.exist?(path)

    { 'bytes' => File.size(path) }
  end

  def attach_full_transcript!(record, path)
    result = load_transcript(path)
    return unless result

    entries, errors = result
    record['transcript'] = entries
    unless errors.empty?
      record['unparsed'] ||= {}
      record['unparsed']['transcript_lines'] = errors
    end
  end

  def attach_tail_transcript!(record, path, k)
    return if k.nil? || k < 1

    result = load_transcript_tail(path, k)
    return unless result

    entries, errors = result
    record['transcript'] = entries
    unless errors.empty?
      record['unparsed'] ||= {}
      record['unparsed']['transcript_lines'] = errors
    end
  end

  def load_transcript(path)
    return nil if path.nil? || path.empty?
    return nil unless File.exist?(path)

    errors = {}
    entries = []

    File.foreach(path, mode: 'r:utf-8').with_index do |line, idx|
      next if line.strip.empty?
      entries << JSON.parse(line)
    rescue JSON::ParserError => e
      entries << line.strip
      errors[idx] = e.message
    end

    [entries, errors]
  end

  ##
  # Last +k+ non-empty JSONL lines; O(file) scan, O(k) memory.
  #
  def load_transcript_tail(path, k)
    return nil if path.nil? || path.empty?
    return nil unless File.exist?(path)

    buf = []
    File.foreach(path, mode: 'r:utf-8') do |line|
      next if line.strip.empty?

      buf << line
      buf.shift while buf.size > k
    end

    errors = {}
    entries = []
    buf.each_with_index do |line, idx|
      entries << JSON.parse(line.strip)
    rescue JSON::ParserError => e
      entries << line.strip
      errors[idx] = e.message
    end

    [entries, errors]
  end

  ##
  # Parse selected fields as nested JSON when possible.
  #
  # Unparseable values are preserved with reasons in `unparsed`.
  #
  # @param base [Hash]
  # @param fields [Hash]
  # @return [Hash]
  #
  def parsed_fields(base, fields)
    unparsed = {}

    fields.each do |name, value|
      parsed, error = parse_nested(value)
      base[name] = parsed
      unparsed[name] = { 'value' => value, 'reason' => error } if error
    end

    base['unparsed'] = unparsed unless unparsed.empty?
    base
  end

  ##
  # Parse nested JSON if value is a non-empty String.
  #
  # @param value [Object]
  # @return [Array<(Object, String | nil)>]
  #
  def parse_nested(value)
    return [value, nil] if value.is_a?(Hash) || value.is_a?(Array)
    return [value, nil] unless value.is_a?(String)
    return [value, nil] if value.strip.empty?

    [JSON.parse(value), nil]
  rescue JSON::ParserError => e
    [value, e.message]
  end

  ##
  # Slice selected keys from a hash.
  #
  # @param hash [Hash]
  # @param keys [Array<String>]
  # @return [Hash]
  #
  def slice(hash, *keys)
    keys.each_with_object({}) { |key, out| out[key] = hash[key] }
  end
end

##
# Appends only new JSONL lines since the last recorded byte offset per +transcript_path+.
#
module TranscriptDelta
  module_function

  def append!(record, offsets)
    path = record['transcript_path']
    return unless path && File.exist?(path)

    size = File.size(path)
    offset = offsets[path].to_i
    offset = 0 if offset > size

    return if size <= offset

    new_bytes = File.binread(path, size - offset, offset)
    entries = []
    errors = {}
    new_bytes.each_line.with_index do |line, idx|
      next if line.strip.empty?

      entries << JSON.parse(line.strip)
    rescue JSON::ParserError => e
      entries << line.strip
      errors[idx] = e.message
    end

    record['transcript_delta'] = entries if entries.any?
    if errors.any?
      record['unparsed'] ||= {}
      record['unparsed']['transcript_delta_lines'] = errors
    end
    offsets[path] = size
  end
end

##
# Persists first-seen UTC start time per conversation_id for stable log filenames, and a per-
# conversation map of long multi-line strings to digest prefixes for inline YAML dedupe.
#
# State file: <log_dir>/.conversation_start_times.json — each value is either legacy (bare ISO8601
# string) or { "started_at" => ISO8601, "long_text_registry" => { ... }, "transcript_offsets" => { path => byte_offset } }.
#
class ConversationStartRegistry
  TTL_SECONDS = 2 * 24 * 60 * 60
  MAX_ENTRIES = 32

  def initialize(log_dir)
    @log_dir = Pathname(log_dir)
    @state_path = @log_dir.join('.conversation_start_times.json')
  end

  ##
  # Under an exclusive lock, migrates/prunes/caps entries, ensures +conversation_id+ exists, yields
  # UTC start Time and the mutable long_text_registry Hash, then persists. Returns the UTC start
  # Time (for log filename segment).
  #
  # @param conversation_id [String]
  # @yieldparam started [Time] UTC
  # @yieldparam long_text_registry [Hash] string => digest (16 hex chars)
  # @return [Time] UTC
  #
  def with_conversation_state(conversation_id)
    FileUtils.mkdir_p(@log_dir)

    File.open(@state_path, File::RDWR | File::CREAT, 0o644, encoding: Encoding::UTF_8) do |f|
      f.flock(File::LOCK_EX)
      data = read_hash(f)
      migrate_data!(data)
      prune!(data)
      cap!(data)
      ensure_entry!(data, conversation_id)
      cap!(data) while data.size > MAX_ENTRIES

      entry = data[conversation_id]
      started = parse_started_time!(data, conversation_id, entry)
      registry = entry['long_text_registry'] ||= {}
      offsets = entry['transcript_offsets'] ||= {}
      yield started, registry, offsets
      write_hash(f, data)
      started
    end
  end

  private

  def migrate_data!(data)
    data.keys.each do |k|
      v = data[k]
      if v.is_a?(String)
        data[k] = { 'started_at' => v, 'long_text_registry' => {}, 'transcript_offsets' => {} }
      elsif v.is_a?(Hash)
        v['long_text_registry'] ||= {}
        v['transcript_offsets'] ||= {}
      else
        data.delete(k)
      end
    end
  end

  def ensure_entry!(data, conversation_id)
    data[conversation_id] ||= {
      'started_at' => Time.now.utc.iso8601,
      'long_text_registry' => {},
      'transcript_offsets' => {}
    }
  end

  def parse_started_time!(_data, _conversation_id, entry)
    raw = entry['started_at']
    Time.parse(raw.to_s).utc
  rescue ArgumentError, TypeError
    entry['started_at'] = Time.now.utc.iso8601
    Time.parse(entry['started_at'].to_s).utc
  end

  def read_hash(f)
    f.rewind
    raw = f.read
    return {} if raw.strip.empty?

    unless raw.encoding == Encoding::UTF_8
      raw = raw.dup.force_encoding(Encoding::UTF_8)
      raw = raw.encode(Encoding::UTF_8, invalid: :replace, undef: :replace) unless raw.valid_encoding?
    end
    h = JSON.parse(raw)
    h.is_a?(Hash) ? h : {}
  rescue JSON::ParserError
    {}
  end

  def write_hash(f, data)
    payload = JSON.generate(data)
    payload = payload.encode(Encoding::UTF_8) unless payload.encoding == Encoding::UTF_8
    f.truncate(0)
    f.rewind
    f.write(payload)
    f.flush
  end

  def prune!(data)
    cutoff = Time.now.utc - TTL_SECONDS
    data.delete_if do |_id, entry|
      parse_time_utc_for_sort(entry) < cutoff
    end
  end

  def parse_time_utc_for_sort(entry)
    raw = entry.is_a?(Hash) ? entry['started_at'] : entry
    Time.parse(raw.to_s).utc
  rescue ArgumentError, TypeError
    Time.at(0).utc
  end

  def cap!(data)
    while data.size > MAX_ENTRIES
      id, _entry = data.min_by { |_i, e| parse_time_utc_for_sort(e) }
      data.delete(id)
    end
  end
end

##
# Appends normalized records to per-conversation YAML logs.
#
class CursorHookLogger
  LOG_DIR = Pathname.new(File.expand_path('~/.cursor/logs')).freeze

  ##
  # Write one record to its conversation log.
  #
  # @param record [Hash]
  # @param conversation_id [String, nil] when omitted, uses record['conversation_id'] (for records still containing it)
  # @param dedupe [Boolean] when true, apply TranscriptLongTextDedupe to long `content` slots using persisted registry
  # @param transcript_options [TranscriptOptions] controls +transcript_delta+ when mode is +delta+
  # @return [void]
  #
  def write(record, conversation_id: nil, dedupe: true, transcript_options: TranscriptOptions.default)
    conversation_id = conversation_id || record['conversation_id'] || 'unknown'
    relative_path = record['relative_path']
    prefix = relative_path ? "conv_#{relative_path}_" : 'conv_'
    registry = ConversationStartRegistry.new(LOG_DIR)
    started = registry.with_conversation_state(conversation_id) do |_t, long_text_registry, transcript_offsets|
      TranscriptDelta.append!(record, transcript_offsets) if transcript_options.mode == :delta
      TranscriptLongTextDedupe.dedupe_long_texts_with_registry!([record], long_text_registry) if dedupe
    end
    segment = started.utc.strftime('%Y-%m-%d-%H-%M')
    path = LOG_DIR.join("#{prefix}#{segment}_#{conversation_id}.yaml")

    FileUtils.mkdir_p(path.dirname)

    File.open(path, 'a:utf-8') do |file|
      record = { 'epoch' => Time.now.utc.to_f }.merge(record)
      file.write([record].to_yaml.sub(/\A---\s*\n?/, ''))
    end
  end
end

##
# CLI front end.
#
class App
  ##
  # Run the app.
  #
  # @param argv [Array<String>]
  # @return [Integer]
  #
  def self.run(argv)
    options = { minify: true, dedupe: true, transcript: nil }
    parser = OptionParser.new do |opts|
      opts.banner = 'Usage: log.rb [options] [FILE]'

      opts.on('--[no-]minify', 'Remove empty keys, conversation_id, kind: unknown (default: on); same as dedupe --prune-keys') do |v|
        options[:minify] = v
      end
      opts.on('--[no-]dedupe', 'Inline long content dedupe via ~/.cursor/logs/.conversation_start_times.json (default: on)') do |v|
        options[:dedupe] = v
      end
      opts.on('--transcript MODE', 'Transcript embedding: none (default), full, tail:N, end-only, delta; env CURSOR_HOOK_LOG_TRANSCRIPT') do |v|
        options[:transcript] = v
      end
    end
    parser.parse!(argv)

    input = argv.empty? ? $stdin.read : File.read(argv.first, mode: 'r:utf-8')

    transcript_opts = TranscriptOptions.from_cli_and_env(options[:transcript])
    record = CursorRecordParser.new(transcript_options: transcript_opts).parse(input)
    conversation_id = record['conversation_id'] || 'unknown'
    TranscriptYamlPrune.prune_tree!(record) if options[:minify]

    CursorHookLogger.new.write(
      record,
      conversation_id: conversation_id,
      dedupe: options[:dedupe],
      transcript_options: transcript_opts
    )

    puts '{}'
    0
  end
end

exit App.run(ARGV) if __FILE__ == $PROGRAM_NAME
