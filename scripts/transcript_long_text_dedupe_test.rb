#!/usr/bin/env ruby
# frozen_string_literal: true

# Run: ruby scripts/transcript_long_text_dedupe_test.rb
# No gem dependencies; exits 0 on success, 1 on failure.

require 'fileutils'
require 'json'
require 'tmpdir'

require_relative 'transcript_long_text_dedupe'

def assert!(cond, msg)
  raise msg unless cond
end

# --- dedupe_long_texts_with_registry! across two synthetic records (same registry) ---
long = "line1\nline2\nline3\n"
digest = TranscriptLongTextDedupe.text_digest(long)

r1 = { 'content' => [{ 'type' => 'text', 'text' => long }] }
reg = {}
TranscriptLongTextDedupe.dedupe_long_texts_with_registry!([r1], reg)
assert!(r1['content'][0]['text'] == long, 'first canonical keeps text')
assert!(r1['content'][0]['digest'] == digest, 'first canonical has digest')
assert!(reg[long] == digest, 'registry stores text => digest')

r2 = { 'content' => [{ 'type' => 'text', 'text' => long }] }
TranscriptLongTextDedupe.dedupe_long_texts_with_registry!([r2], reg)
assert!(!r2['content'][0].key?('text'), 'duplicate strips text')
assert!(r2['content'][0]['digest'] == digest, 'duplicate keeps digest')

# batch dedupe matches empty-registry incremental pass
ary = [{ 'content' => [{ 'type' => 'text', 'text' => long }] }]
ary2 = [{ 'content' => [{ 'type' => 'text', 'text' => long }] }]
TranscriptLongTextDedupe.dedupe_long_texts!(ary)
TranscriptLongTextDedupe.dedupe_long_texts_with_registry!(ary2, {})
assert!(ary == ary2, 'dedupe_long_texts! matches fresh-registry incremental')

# --- ConversationStartRegistry migration + round-trip ---
require File.expand_path('../.cursor/hooks/log.rb', __dir__)

Dir.mktmpdir('dedupe_test') do |dir|
  state = File.join(dir, '.conversation_start_times.json')
  recent = Time.now.utc.iso8601
  File.write(state, JSON.generate({ 'cid' => recent }))

  reg_obj = ConversationStartRegistry.new(dir)
  reg_obj.with_conversation_state('cid') { |_t, h| h['x'] = 'y' }

  data = JSON.parse(File.read(state))
  assert!(data['cid'].is_a?(Hash), 'legacy string migrates to object')
  assert!(data['cid']['started_at'] == recent, 'started_at preserved')
  assert!(data['cid']['long_text_registry'].is_a?(Hash), 'long_text_registry exists')
  assert!(data['cid']['long_text_registry']['x'] == 'y', 'registry persisted')
end

puts 'transcript_long_text_dedupe_test: OK'
