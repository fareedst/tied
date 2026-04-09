#!/usr/bin/env ruby
# frozen_string_literal: true

# Extract user prompts from Cursor hook YAML logs (~/.cursor/logs/conv_*.yaml).
#
# A "user prompt" is a record where:
# - hook_event_name == "beforeSubmitPrompt"
# - normalized.details.prompt is a String
#
# Output: one YAML document (top-level list). Each item includes file + prompt metadata.
#
# Usage:
#   ruby scripts/extract_user_prompts.rb --regex 'foo' ~/.cursor/logs/conv_*.yaml
#   ruby scripts/extract_user_prompts.rb --no-regex --files-from files.txt
#
# Options:
#   --regex REGEX       Ruby regexp (required unless --no-regex)
#   --ignore-case       Compile regex with Regexp::IGNORECASE
#   --no-regex          Disable regex filtering (emit all prompts from given files)
#   --files-from PATH   Newline-separated list of files to scan (in addition to positional args)

require 'date'
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
  # One hook record is a single YAML sequence element; Psych returns [Hash].
  return doc.first if doc.is_a?(Array) && doc.size == 1 && doc.first.is_a?(Hash)

  doc
end

def read_files_from_list(path)
  File.read(path, mode: 'r:utf-8').lines.map(&:strip).reject { |l| l.empty? || l.start_with?('#') }
end

options = { ignore_case: false, no_regex: false, files_from: [] }
parser = OptionParser.new do |opts|
  opts.banner = 'Usage: extract_user_prompts.rb [options] FILE [FILE ...]'

  opts.on('--regex REGEX', 'Ruby regexp string (required unless --no-regex)') { |v| options[:regex] = v }
  opts.on('--ignore-case', 'Case-insensitive regex match') { options[:ignore_case] = true }
  opts.on('--no-regex', 'Emit all prompts (no regex filtering)') { options[:no_regex] = true }
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

re = nil
unless options[:no_regex]
  if options[:regex].to_s.strip.empty?
    warn '--regex is required unless --no-regex is set'
    warn parser.help
    exit 2
  end
  flags = 0
  flags |= Regexp::IGNORECASE if options[:ignore_case]
  begin
    re = Regexp.new(options[:regex], flags)
  rescue RegexpError => e
    warn "Invalid --regex: #{e.message}"
    exit 2
  end
end

out = []

files.each do |path|
  path = File.expand_path(path)
  File.open(path, 'r:utf-8') do |io|
    CursorHookLogStream.each_record_string(io) do |raw|
      stripped = CursorHookLogStream.strip_transcript_from_record_string(raw)
      rec = safe_load_record(stripped)
      next unless rec.is_a?(Hash)
      next unless rec['hook_event_name'].to_s == 'beforeSubmitPrompt'

      prompt = rec.dig('normalized', 'details', 'prompt')
      next unless prompt.is_a?(String) && !prompt.strip.empty?
      next if re && !re.match?(prompt)

      out << {
        'attachment_count' => rec.dig('normalized', 'details', 'attachment_count'),
        'composer_mode' => rec.dig('original', 'composer_mode'),
        'conversation_id' => rec['conversation_id'],
        'epoch' => rec['epoch'],
        'file' => path,
        'generation_id' => rec['generation_id'],
        'model' => rec['model'],
        'prompt' => prompt
      }
    rescue Psych::SyntaxError, Psych::Exception => e
      warn "DIAGNOSTIC: parse error in #{path}: #{e.message}"
      next
    end
  end
rescue Errno::ENOENT, Errno::EACCES => e
  warn "DIAGNOSTIC: cannot read #{path}: #{e.message}"
end

puts YAML.dump(out)
