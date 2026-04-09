#!/usr/bin/env ruby
# frozen_string_literal: true

# Extract repeated tool calls from Cursor hook YAML logs (~/.cursor/logs/conv_*.yaml).
#
# Defines a "tool call signature" as SHA digest of:
#   tool_name + stable JSON of tool_input
# across hook_event_name in {preToolUse, postToolUse, postToolUseFailure}.
#
# Output: one YAML document (top-level list). Each item includes:
# - file, conversation_id, generation_id, model
# - tool_name, signature, count, first_epoch, last_epoch
# - whether any failure events occurred for that signature
#
# Usage:
#   ruby scripts/extract_repeated_tool_calls.rb --min-count 3 ~/.cursor/logs/conv_*.yaml > repeats.yaml

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

def epoch_of(rec)
  v = rec.is_a?(Hash) ? rec['epoch'] : nil
  f = v.is_a?(Numeric) ? v.to_f : nil
  return f if f && f.finite?

  nil
end

def stable_json(obj)
  JSON.generate(obj)
rescue StandardError
  obj.to_s
end

def signature(tool_name, tool_input)
  Digest::SHA256.hexdigest("#{tool_name}\n#{stable_json(tool_input)}")[0, 24]
end

options = {
  min_count: 2,
  files_from: []
}

parser = OptionParser.new do |opts|
  opts.banner = 'Usage: extract_repeated_tool_calls.rb [options] FILE [FILE ...]'

  opts.on('--min-count N', Integer, 'Only emit signatures seen at least N times (default: 2)') { |v| options[:min_count] = v }
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

acc = {}

files.each do |path|
  path = File.expand_path(path)
  File.open(path, 'r:utf-8') do |io|
    CursorHookLogStream.each_record_string(io) do |raw|
      stripped = CursorHookLogStream.strip_transcript_from_record_string(raw)
      rec = safe_load_record(stripped)
      next unless rec.is_a?(Hash)

      hook = rec['hook_event_name'].to_s
      next unless %w[preToolUse postToolUse postToolUseFailure].include?(hook)

      tool_name = rec.dig('normalized', 'details', 'tool_name').to_s
      next if tool_name.empty?

      tool_input = rec.dig('normalized', 'details', 'tool_input')
      sig = signature(tool_name, tool_input)
      conv = rec['conversation_id']
      gen = rec['generation_id']
      model = rec['model']
      ep = epoch_of(rec)

      key = [path, conv, gen, tool_name, sig]
      row = (acc[key] ||= {
        'file' => path,
        'conversation_id' => conv,
        'generation_id' => gen,
        'model' => model,
        'tool_name' => tool_name,
        'signature' => sig,
        'count' => 0,
        'first_epoch' => ep,
        'last_epoch' => ep,
        'saw_failure' => false
      })

      row['count'] += 1
      row['first_epoch'] = ep if ep && (row['first_epoch'].nil? || ep < row['first_epoch'])
      row['last_epoch'] = ep if ep && (row['last_epoch'].nil? || ep > row['last_epoch'])
      row['saw_failure'] ||= (hook == 'postToolUseFailure')
    rescue Psych::SyntaxError, Psych::Exception => e
      warn "DIAGNOSTIC: parse error in #{path}: #{e.message}"
      next
    end
  end
rescue Errno::ENOENT, Errno::EACCES => e
  warn "DIAGNOSTIC: cannot read #{path}: #{e.message}"
end

out = acc.values.select { |h| h['count'].to_i >= options[:min_count] }
out.sort_by! { |h| [-h['count'].to_i, h['tool_name'].to_s, h['file'].to_s] }

puts YAML.dump(out)

