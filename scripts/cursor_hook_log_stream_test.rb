# frozen_string_literal: true

# Run: ruby scripts/cursor_hook_log_stream_test.rb

require_relative 'cursor_hook_log_stream'

def assert(cond, msg = 'assertion failed')
  raise msg unless cond
end

# strip_transcript_from_record_string removes transcript and transcript_path
one = [
  '- epoch: 1.0',
  '  event: foo',
  '  transcript:',
  '  - role: user',
  '    message:',
  '      content:',
  '      - type: text',
  '        text: hello',
  '  transcript_path: "/tmp/t.jsonl"',
  '  other: after',
  ''
].join("\n")

stripped = CursorHookLogStream.strip_transcript_from_record_string(one)
assert !stripped.include?('role: user'), 'transcript body should be removed'
assert !stripped.include?('transcript_path:'), 'transcript_path should be removed'
assert stripped.include?('event: foo'), 'other keys preserved'
assert stripped.include?('other: after'), 'keys after transcript preserved'

# Full file: two records
two = [
  '- epoch: 1.0',
  '  event: a',
  '  transcript:',
  '  - role: user',
  '    message: x',
  '- epoch: 2.0',
  '  event: b',
  ''
].join("\n")

buf = +''
StringIO.open(two) { |io| CursorHookLogStream.each_stripped_line(io) { |l| buf << l } }
assert !buf.include?('role: user')
assert buf.include?('event: a')
assert buf.include?('event: b')

# Record splitting
recs = []
StringIO.open(two) { |io| CursorHookLogStream.each_record_string(io) { |r| recs << r } }
assert recs.size == 2
assert recs[0].start_with?('- epoch: 1.0')
assert recs[1].start_with?('- epoch: 2.0')

# Records without epoch: split on any top-level "- "
no_epoch = [
  '- event: first',
  '  cursor_version: x',
  '- event: second',
  '  model: y',
  ''
].join("\n")

recs2 = []
StringIO.open(no_epoch) { |io| CursorHookLogStream.each_record_string(io) { |r| recs2 << r } }
assert recs2.size == 2
assert recs2[0].start_with?('- event: first')
assert recs2[1].start_with?('- event: second')

puts 'cursor_hook_log_stream_test: ok'
