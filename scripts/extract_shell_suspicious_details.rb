#!/usr/bin/env ruby
# frozen_string_literal: true

# Emit afterShellExecution records whose output matches the same heuristic as
# analyze_hook_log.rb "shell_output_suspicious" (substring scan, not exit-code aware).
#
# Output: YAML list of { file, epoch, generation_id, command, output_excerpt }.
#
# Usage:
#   ruby scripts/extract_shell_suspicious_details.rb ~/.cursor/logs/conv_*.yaml

require 'date'
require 'optparse'
require 'yaml'

require_relative 'cursor_hook_log_stream'

# Keep in sync with scripts/analyze_hook_log.rb afterShellExecution branch.
SHELL_SUSPICIOUS = /\b(error|failed|exit (code|status):?\s*[1-9]|non-?zero|command failed)\b/i

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

options = {
  excerpt_chars: 4000,
  files_from: []
}

parser = OptionParser.new do |opts|
  opts.banner = 'Usage: extract_shell_suspicious_details.rb [options] FILE [FILE ...]'

  opts.on('--excerpt-chars N', Integer, 'Max output characters per record (default: 4000)') { |v| options[:excerpt_chars] = v }
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
excerpt = options[:excerpt_chars].to_i
excerpt = 4000 if excerpt <= 0

files.each do |path|
  File.open(path, 'r:utf-8') do |io|
    CursorHookLogStream.each_record_string(io) do |raw|
      stripped = CursorHookLogStream.strip_transcript_from_record_string(raw)
      rec = safe_load_record(stripped)
      next unless rec.is_a?(Hash)
      next unless rec['event'].to_s == 'afterShellExecution'

      cmd = rec.dig('normalized', 'details', 'command')
      shell_out = rec.dig('normalized', 'details', 'output').to_s
      next unless shell_out.match?(SHELL_SUSPICIOUS)

      out << {
        'file' => path,
        'epoch' => rec['epoch'],
        'generation_id' => rec['generation_id'],
        'command' => cmd,
        'output_excerpt' => shell_out[0, excerpt]
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
