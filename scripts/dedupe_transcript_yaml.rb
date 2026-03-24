#!/usr/bin/env ruby
# frozen_string_literal: true

# Dedupe long (3+ lines) text in Cursor hook transcript YAML logs.
#
# Any hash in the document tree that has a `content` key is considered (depth-
# first preorder). Typical hook logs use transcript -> message -> content; the
# same rules apply when `content` sits under any other parent key.
#
# Long text may appear as:
# 1) `content` as an array of parts — each hash with `type: text` and `text`
#    (same part shape as scripts/extract_queries.rb).
# 2) `content` as a string (scalar block): sibling `digest` on the parent hash.
# 3) `content.value` when `content` is a hash: `digest` on that inner hash.
#
# All long strings in a file share one dedupe pass (first keeps payload + digest,
# later duplicates keep only digest).
#
# Digest: first 16 hex characters of SHA256 over the exact UTF-8 string (same
# bytes Psych uses for the loaded String).
#
# Rules per file:
# - Array parts: first long `text` keeps `text` + `digest`; duplicates keep
#   `digest` only (`text` removed).
# - Scalar `content` string on a parent hash: first keeps `content` + parent
#   `digest`; duplicates remove `content`, set parent `digest`.
# - `content.value`: first keeps `value` + `content.digest`; duplicates remove
#   `value`, set `content.digest`.
# - Shorter texts are left unchanged (no `digest` added).
#
# Round-trip via Psych may change YAML formatting (key order, quoting, folds).
#
# Optional pruning (default on, `--no-prune-keys` to disable): after dedupe, recursively
# delete whole hash entries (key + value) when value is nil (YAML null / bare `key:`),
# "" / [] / {}, when key is `conversation_id`, or when key is `kind` and value is the
# string `unknown`. Post-order so nested empty hashes/arrays bubble up.
#
# Usage:
#   ruby scripts/dedupe_transcript_yaml.rb [--dry-run] [--keep-backup] [--force] [--no-prune-keys] FILE [FILE ...]

require 'date'
require 'fileutils'
require 'optparse'
require 'tempfile'
require 'yaml'

require_relative 'transcript_long_text_dedupe'
require_relative 'transcript_yaml_prune'

def register_canonical!(canonical, text, digest)
  expected = TranscriptLongTextDedupe.text_digest(text)
  return { ok: false, reason: "digest mismatch for long text (expected #{expected}, got #{digest})" } unless digest == expected

  if canonical.key?(digest) && canonical[digest] != text
    return { ok: false, reason: 'same digest maps to different long texts' }
  end

  canonical[digest] = text
  { ok: true }
end

def validate_deduped_tree(records)
  canonical = {} # digest -> text

  TranscriptLongTextDedupe.each_text_content_item(records) do |item|
    text = item['text']
    digest = item['digest']

    if text && digest
      next unless TranscriptLongTextDedupe.long_text?(text)

      r = register_canonical!(canonical, text, digest)
      return r unless r[:ok]
    elsif text && TranscriptLongTextDedupe.long_text?(text) && !digest
      return { ok: false, reason: 'long text without digest (array content part)' }
    end
  end

  TranscriptLongTextDedupe.each_content_parent(records) do |parent|
    content = parent['content']

    if content.is_a?(String) && TranscriptLongTextDedupe.long_text?(content)
      digest = parent['digest']
      return { ok: false, reason: 'long scalar `content` string without sibling `digest`' } unless digest

      r = register_canonical!(canonical, content, digest)
      return r unless r[:ok]
    elsif content.is_a?(Hash)
      val = content['value']
      if TranscriptLongTextDedupe.long_text?(val)
        digest = content['digest']
        return { ok: false, reason: 'long content.value without content.digest' } unless digest

        r = register_canonical!(canonical, val, digest)
        return r unless r[:ok]
      end
    end
  end

  TranscriptLongTextDedupe.each_text_content_item(records) do |item|
    next if item['text']
    next unless item['digest']

    return { ok: false, reason: "orphan digest #{item['digest']} (array content part)" } unless canonical.key?(item['digest'])
  end

  TranscriptLongTextDedupe.each_content_parent(records) do |parent|
    digest = parent['digest']
    if digest
      content = parent['content']
      unless content.is_a?(String) && TranscriptLongTextDedupe.long_text?(content)
        return { ok: false, reason: "orphan parent digest #{digest} (not paired with long scalar content)" } unless canonical.key?(digest)
      end
    end

    next unless parent['content'].is_a?(Hash)

    ch = parent['content']
    cd = ch['digest']
    if cd && !TranscriptLongTextDedupe.long_text?(ch['value'])
      return { ok: false, reason: "orphan content.digest #{cd}" } unless canonical.key?(cd)
    end
  end

  { ok: true }
end

def prune_transcript_tree!(node)
  TranscriptYamlPrune.prune_tree!(node)
end

def prune_transcript_records!(records)
  TranscriptYamlPrune.prune_records!(records)
end

def safe_load_records(path)
  YAML.safe_load(
    File.read(path, encoding: 'UTF-8'),
    permitted_classes: [Date, Time],
    aliases: true
  )
end

def safe_load_string(str)
  YAML.safe_load(
    str,
    permitted_classes: [Date, Time],
    aliases: true
  )
end

def process_file(path, dry_run:, keep_backup:, force:, prune_keys:)
  path = File.expand_path(path)
  unless File.file?(path)
    warn "DIAGNOSTIC: skip (not a file): #{path}"
    return :skipped
  end

  backup_path = "#{path}.dedupe.bak"

  records = safe_load_records(path)
  unless records.is_a?(Array)
    warn "DIAGNOSTIC: skip (top-level is not an array): #{path}"
    return :skipped
  end

  stats = TranscriptLongTextDedupe.dedupe_long_texts!(records)
  validation = validate_deduped_tree(records)
  unless validation[:ok]
    warn "DIAGNOSTIC: internal validation failed before write: #{validation[:reason]} (#{path})"
    return :error
  end

  pruned_keys = 0
  if prune_keys
    pruned_keys = prune_transcript_records!(records)
    validation = validate_deduped_tree(records)
    unless validation[:ok]
      warn "DIAGNOSTIC: validation failed after prune: #{validation[:reason]} (#{path})"
      return :error
    end
  end

  if dry_run
    puts "#{path}: dry-run long_items=#{stats[:long_items_seen]} canonical=#{stats[:canonical_with_digest]} stripped=#{stats[:duplicates_stripped]} pruned_keys=#{pruned_keys}"
    return :ok
  end

  if File.exist?(backup_path) && !force
    warn "DIAGNOSTIC: backup exists, use --force to overwrite: #{backup_path}"
    return :error
  end

  FileUtils.cp(path, backup_path)
  dirname = File.dirname(path)
  temp = Tempfile.create(['dedupe_transcript', '.yaml'], dirname)
  temp_path = temp.path
  begin
    temp.write(YAML.dump(records))
    temp.close

    written = File.read(temp_path, encoding: 'UTF-8')
    reloaded = safe_load_string(written)
    post = validate_deduped_tree(reloaded)
    unless post[:ok]
      warn "DIAGNOSTIC: validation failed after write (restoring backup): #{post[:reason]}"
      FileUtils.cp(backup_path, path)
      FileUtils.rm_f(temp_path)
      return :error
    end

    File.rename(temp_path, path)
  rescue StandardError => e
    warn "DIAGNOSTIC: #{e.class}: #{e.message} (restoring backup if present)"
    FileUtils.cp(backup_path, path) if File.exist?(backup_path)
    FileUtils.rm_f(temp_path) if temp_path && File.exist?(temp_path)
    return :error
  end

  FileUtils.rm_f(backup_path) unless keep_backup
  puts "#{path}: wrote long_items=#{stats[:long_items_seen]} canonical=#{stats[:canonical_with_digest]} stripped=#{stats[:duplicates_stripped]} pruned_keys=#{pruned_keys}"
  :ok
end

options = { dry_run: false, keep_backup: false, force: false, prune_keys: true }
parser = OptionParser.new do |opts|
  opts.banner = 'Usage: dedupe_transcript_yaml.rb [options] FILE [FILE ...]'

  opts.on('--[no-]prune-keys', 'Remove empty keys, conversation_id, kind: unknown (default: prune)') do |v|
    options[:prune_keys] = v
  end
  opts.on('--dry-run', 'Parse, dedupe in memory, print stats; do not write or backup') { options[:dry_run] = true }
  opts.on('--keep-backup', 'Keep path.dedupe.bak after successful write') { options[:keep_backup] = true }
  opts.on('--force', 'Overwrite existing path.dedupe.bak') { options[:force] = true }
  opts.on('-h', '--help', 'Show this help') do
    puts opts
    exit 0
  end
end
parser.parse!

if ARGV.empty?
  warn 'No files given.'
  warn parser.help
  exit 2
end

status = 0
ARGV.each do |f|
  r = process_file(f, **options)
  status = 1 if r == :error
end
exit status
