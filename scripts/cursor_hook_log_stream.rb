# frozen_string_literal: true

require 'stringio'

# Shared line-oriented helpers for Cursor hook YAML logs (~/.cursor/logs/conv_*.yaml).
# Records are top-level YAML sequence items: a line with no leading indent before "-" (e.g. "- epoch:", "- event:").
# The first key inside an item is optional; +epoch+ is not required for splitting or stripping.
# Under each item, sibling keys use two leading spaces (e.g. "  transcript:", "  event:").

module CursorHookLogStream
  module_function

  # True if +line+ starts a new top-level sequence entry (unindented "- " / "-\t" / "- key").
  def top_level_sequence_item_line?(line)
    line.is_a?(String) && line.match?(/\A-\s/)
  end

  # True if +line+ looks like a sibling key at indent 2 under a list item (not "  - list_item").
  def top_level_record_key_line?(line)
    return false unless line.is_a?(String)

    line.match?(/\A  [a-zA-Z_][a-zA-Z0-9_]*:\s*\z/) ||
      line.match?(/\A  [a-zA-Z_][a-zA-Z0-9_]*:\s+/)
  end

  # Strip embedded transcript blocks and transcript_path lines. Yields each output line (with newline).
  # O(1) memory: one line at a time.
  def each_stripped_line(io)
    skipping_transcript = false

    io.each_line do |line|
      if skipping_transcript
        if top_level_record_key_line?(line)
          skipping_transcript = false
          unless line.start_with?('  transcript:') || line.start_with?('  transcript_path:')
            yield line
          end
          next
        end
        next
      end

      if line.start_with?('  transcript:')
        # Inline empty transcript
        next if line.match?(/\A  transcript:\s*(\[\s*\]|~|null)\s*\z/)

        skipping_transcript = true
        next
      end

      next if line.start_with?('  transcript_path:')

      yield line
    end
  end

  # Enumerate each raw record string (leading line is a top-level "- ..." list item) from a hook log file.
  def each_record_string(io)
    buf = +''
    io.each_line do |line|
      if top_level_sequence_item_line?(line) && !buf.empty?
        yield buf
        buf = line.dup
      else
        buf << line
      end
    end
    yield buf unless buf.empty?
  end

  # Remove transcript subtree from a single record string (same rules as each_stripped_line).
  def strip_transcript_from_record_string(str)
    out = +''
    StringIO.open(str) do |sio|
      each_stripped_line(sio) { |l| out << l }
    end
    out
  end
end
