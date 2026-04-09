#!/usr/bin/env ruby
# frozen_string_literal: true

# Extract bursts of tool failures from Cursor hook YAML logs (~/.cursor/logs/conv_*.yaml).
#
# A "burst" is consecutive postToolUseFailure records for the same (conversation_id, generation_id, tool_name)
# separated by no more than --window-seconds (default: 180s).
#
# Output: one YAML document (top-level list). Each item includes:
# - file, conversation_id, generation_id, model
# - tool_name, failure_count, failure_types, sample_error_messages
# - epoch_start/epoch_end, and nearest preceding beforeSubmitPrompt prompt as anchor
#
# Usage:
#   ruby scripts/extract_tool_failure_bursts.rb ~/.cursor/logs/conv_*.yaml > bursts.yaml

require 'date'
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

def epoch_of(rec)
  v = rec.is_a?(Hash) ? rec['epoch'] : nil
  f = v.is_a?(Numeric) ? v.to_f : nil
  return f if f && f.finite?

  nil
end

class Burst
  def initialize(file:, conversation_id:, generation_id:, model:, tool_name:, window_seconds:, anchor_prompt:, anchor_prompt_epoch:, first_epoch:)
    @file = file
    @conversation_id = conversation_id
    @generation_id = generation_id
    @model = model
    @tool_name = tool_name
    @window_seconds = window_seconds
    @anchor_prompt = anchor_prompt
    @anchor_prompt_epoch = anchor_prompt_epoch
    @epoch_start = first_epoch
    @epoch_end = first_epoch
    @failure_count = 0
    @failure_types = Hash.new(0)
    @error_messages = Hash.new(0)
  end

  def key
    [@conversation_id, @generation_id, @tool_name]
  end

  def can_absorb?(rec)
    return false unless rec.is_a?(Hash)
    return false unless rec['hook_event_name'].to_s == 'postToolUseFailure'
    return false unless rec.dig('normalized', 'details', 'tool_name').to_s == @tool_name.to_s
    return false unless rec['conversation_id'].to_s == @conversation_id.to_s
    return false unless rec['generation_id'].to_s == @generation_id.to_s

    e = epoch_of(rec)
    return false unless e && @epoch_end

    (e - @epoch_end) <= @window_seconds
  end

  def absorb!(rec)
    e = epoch_of(rec)
    @epoch_end = e if e
    @failure_count += 1
    ft = rec.dig('normalized', 'details', 'failure_type').to_s
    @failure_types[ft] += 1 unless ft.empty?
    msg = rec.dig('normalized', 'details', 'error_message').to_s
    @error_messages[msg] += 1 unless msg.empty?
  end

  def to_h
    {
      'file' => @file,
      'conversation_id' => @conversation_id,
      'generation_id' => @generation_id,
      'model' => @model,
      'tool_name' => @tool_name,
      'epoch_start' => @epoch_start,
      'epoch_end' => @epoch_end,
      'duration_s' => (@epoch_start && @epoch_end) ? (@epoch_end - @epoch_start) : nil,
      'failure_count' => @failure_count,
      'failure_types' => @failure_types.sort_by { |k, _| k.to_s }.to_h,
      'sample_error_messages' => @error_messages.sort_by { |_k, v| -v }.first(3).map { |k, v| { 'message' => k[0, 240], 'count' => v } },
      'anchor_prompt_epoch' => @anchor_prompt_epoch,
      'anchor_prompt' => @anchor_prompt
    }
  end
end

options = {
  window_seconds: 180,
  min_failures: 2,
  files_from: []
}

parser = OptionParser.new do |opts|
  opts.banner = 'Usage: extract_tool_failure_bursts.rb [options] FILE [FILE ...]'

  opts.on('--window-seconds N', Integer, 'Failures within N seconds belong to same burst (default: 180)') { |v| options[:window_seconds] = v }
  opts.on('--min-failures N', Integer, 'Only emit bursts with at least N failures (default: 2)') { |v| options[:min_failures] = v }
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

out = []

files.each do |path|
  path = File.expand_path(path)
  latest_prompt = nil
  latest_prompt_epoch = nil
  current_burst = nil

  File.open(path, 'r:utf-8') do |io|
    CursorHookLogStream.each_record_string(io) do |raw|
      stripped = CursorHookLogStream.strip_transcript_from_record_string(raw)
      rec = safe_load_record(stripped)
      next unless rec.is_a?(Hash)

      hook = rec['hook_event_name'].to_s
      if hook == 'beforeSubmitPrompt'
        ptxt = rec.dig('normalized', 'details', 'prompt')
        if ptxt.is_a?(String) && !ptxt.strip.empty?
          latest_prompt = ptxt
          latest_prompt_epoch = epoch_of(rec)
        end
      end

      if hook == 'postToolUseFailure'
        tool_name = rec.dig('normalized', 'details', 'tool_name').to_s
        conv = rec['conversation_id']
        gen = rec['generation_id']
        model = rec['model']
        e = epoch_of(rec)

        if current_burst && current_burst.can_absorb?(rec)
          current_burst.absorb!(rec)
        else
          if current_burst && current_burst.to_h['failure_count'].to_i >= options[:min_failures]
            out << current_burst.to_h
          end
          current_burst = Burst.new(
            file: path,
            conversation_id: conv,
            generation_id: gen,
            model: model,
            tool_name: tool_name,
            window_seconds: options[:window_seconds],
            anchor_prompt: latest_prompt,
            anchor_prompt_epoch: latest_prompt_epoch,
            first_epoch: e
          )
          current_burst.absorb!(rec)
        end
      end
    rescue Psych::SyntaxError, Psych::Exception => e
      warn "DIAGNOSTIC: parse error in #{path}: #{e.message}"
      next
    end
  end

  if current_burst && current_burst.to_h['failure_count'].to_i >= options[:min_failures]
    out << current_burst.to_h
  end
rescue Errno::ENOENT, Errno::EACCES => e
  warn "DIAGNOSTIC: cannot read #{path}: #{e.message}"
end

puts YAML.dump(out)

