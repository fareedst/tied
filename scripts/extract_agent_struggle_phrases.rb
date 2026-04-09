#!/usr/bin/env ruby
# frozen_string_literal: true

# Extract "struggle phrases" from afterAgentThought / afterAgentResponse text in Cursor hook YAML logs.
#
# This is a minimal-context scan: it does not require transcript embedding and uses streaming record parsing.
#
# Output: one YAML document (top-level list). Each item includes:
# - file, epoch, conversation_id, generation_id, model
# - hook_event_name, matched_pattern, matched_text (truncated), weight
#
# Usage:
#   ruby scripts/extract_agent_struggle_phrases.rb ~/.cursor/logs/conv_*.yaml > phrases.yaml

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

DEFAULT_PHRASE_WEIGHTS = [
  [/(\bstuck\b|\bblocked\b|\bdead[- ]?end\b)/i, 6],
  [/(\btimeout\b|\btimed out\b|\brate limit\b|\b429\b)/i, 4],
  [/(\bfailed\b|\bfailure\b|\berror\b|\bexception\b)/i, 3],
  [/(\bretry\b|\btrying again\b|\blet's try\b|\banother approach\b)/i, 2],
  [/(\bnot sure\b|\bunsure\b|\bmaybe\b|\bperhaps\b)/i, 1]
].freeze

def epoch_of(rec)
  v = rec.is_a?(Hash) ? rec['epoch'] : nil
  f = v.is_a?(Numeric) ? v.to_f : nil
  return f if f && f.finite?

  nil
end

options = {
  files_from: [],
  max_per_record: 5
}

parser = OptionParser.new do |opts|
  opts.banner = 'Usage: extract_agent_struggle_phrases.rb [options] FILE [FILE ...]'

  opts.on('--max-per-record N', Integer, 'Max matches emitted per record (default: 5)') { |v| options[:max_per_record] = v }
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
  File.open(path, 'r:utf-8') do |io|
    CursorHookLogStream.each_record_string(io) do |raw|
      stripped = CursorHookLogStream.strip_transcript_from_record_string(raw)
      rec = safe_load_record(stripped)
      next unless rec.is_a?(Hash)

      hook = rec['hook_event_name'].to_s
      next unless %w[afterAgentThought afterAgentResponse].include?(hook)

      txt = rec.dig('normalized', 'details', 'text')
      next unless txt.is_a?(String) && !txt.empty?

      emitted = 0
      DEFAULT_PHRASE_WEIGHTS.each do |(re, w)|
        break if emitted >= options[:max_per_record]
        m = txt.match(re)
        next unless m

        out << {
          'file' => path,
          'epoch' => epoch_of(rec),
          'conversation_id' => rec['conversation_id'],
          'generation_id' => rec['generation_id'],
          'model' => rec['model'],
          'hook_event_name' => hook,
          'matched_pattern' => re.source,
          'matched_text' => m[0][0, 240],
          'weight' => w
        }
        emitted += 1
      end
    rescue Psych::SyntaxError, Psych::Exception => e
      warn "DIAGNOSTIC: parse error in #{path}: #{e.message}"
      next
    end
  end
rescue Errno::ENOENT, Errno::EACCES => e
  warn "DIAGNOSTIC: cannot read #{path}: #{e.message}"
end

puts YAML.dump(out)

