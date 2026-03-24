#!/usr/bin/env ruby
# frozen_string_literal: true

# Stream-edit Cursor hook YAML logs: remove embedded `transcript:` subtrees and `transcript_path:`
# lines. O(1) memory per line; safe for multi-GB files.
# Line-oriented only: does not require per-record splitting or an `epoch` key (see scripts/cursor_hook_log_stream.rb).
#
# Usage:
#   ruby scripts/strip_transcripts.rb [--dry-run] [--backup] FILE [FILE ...]
#
# --dry-run   Print byte reduction per file; do not write.
# --backup    Keep path.strip.bak after successful replace (default: remove backup).

require 'fileutils'
require 'optparse'

require_relative 'cursor_hook_log_stream'

def human_bytes(n)
  return '0' if n <= 0

  units = %w[B KB MB GB TB]
  i = 0
  f = n.to_f
  while f >= 1024 && i < units.size - 1
    f /= 1024
    i += 1
  end
  format(i.zero? ? '%d %s' : '%.2f %s', f, units[i])
end

def strip_file(path, dry_run:, keep_backup:)
  path = File.expand_path(path)
  unless File.file?(path)
    warn "DIAGNOSTIC: skip (not a file): #{path}"
    return :skipped
  end

  in_size = File.size(path)
  tmp = File.join(File.dirname(path), ".strip_transcripts.#{Process.pid}.#{File.basename(path)}.tmp")

  if dry_run
    out_size = 0
    File.open(path, 'r:utf-8') do |io|
      CursorHookLogStream.each_stripped_line(io) { |_l| out_size += _l.bytesize }
    end
    saved = in_size - out_size
    pct = in_size.positive? ? (100.0 * saved / in_size) : 0.0
    puts "#{path}: in=#{human_bytes(in_size)} out=#{human_bytes(out_size)} saved=#{human_bytes(saved)} (#{format('%.1f', pct)}%)"
    return :ok
  end

  backup_path = "#{path}.strip.bak"
  FileUtils.cp(path, backup_path)

  begin
    File.open(tmp, 'w:utf-8') do |out|
      File.open(path, 'r:utf-8') do |io|
        CursorHookLogStream.each_stripped_line(io) { |l| out.write(l) }
      end
    end
    File.rename(tmp, path)
  rescue StandardError => e
    warn "DIAGNOSTIC: #{e.class}: #{e.message} — restoring from backup"
    FileUtils.cp(backup_path, path) if File.exist?(backup_path)
    FileUtils.rm_f(tmp)
    return :error
  ensure
    FileUtils.rm_f(tmp) if File.exist?(tmp)
  end

  FileUtils.rm_f(backup_path) unless keep_backup
  out_size = File.size(path)
  saved = in_size - out_size
  pct = in_size.positive? ? (100.0 * saved / in_size) : 0.0
  puts "#{path}: wrote out=#{human_bytes(out_size)} saved=#{human_bytes(saved)} (#{format('%.1f', pct)}%)"
  :ok
end

options = { dry_run: false, keep_backup: false }
parser = OptionParser.new do |opts|
  opts.banner = 'Usage: strip_transcripts.rb [options] FILE [FILE ...]'

  opts.on('--dry-run', 'Print size reduction only; do not modify files') { options[:dry_run] = true }
  opts.on('--backup', 'Keep path.strip.bak after successful write') { options[:keep_backup] = true }
  opts.on('-h', '--help', 'Show help') do
    puts opts
    exit 0
  end
end
parser.parse!

if ARGV.empty?
  warn parser.help
  exit 2
end

status = 0
ARGV.each do |f|
  r = strip_file(f, dry_run: options[:dry_run], keep_backup: options[:keep_backup])
  status = 1 if r == :error
end
exit status
