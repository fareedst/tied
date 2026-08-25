#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'
require 'minitest/autorun'
require 'fileutils'
require 'tmpdir'

require_relative '../adherence_append_action_attempted'

class AdherenceAppendActionAttemptedTest < Minitest::Test
  def setup
    @tmpdir = Dir.mktmpdir('adherence-bridge-')
    @workspace = File.join(@tmpdir, 'repo')
    @token = 'REQ-BRIDGE-TEST'
    @ledger = File.join(@workspace, 'working', @token, 'adherence', 'events.jsonl')
    @marker_path = File.join(@workspace, 'working', @token, 'adherence', 'active-turn.json')
    FileUtils.mkdir_p(File.dirname(@marker_path))
    File.write(
      @marker_path,
      JSON.generate(
        'schema_version' => 'active-turn-marker.v1',
        'request_token' => @token,
        'run_id' => 'run-bridge',
        'turn_index' => 1,
        'step_slug' => 'step-one',
        'instruction_nonce' => 'run-bridge:1:abc',
        'instruction_hash' => 'sha256:abc',
        'adherence_ledger_path' => @ledger,
        'workspace_root' => @workspace,
        'source_revision' => 'deadbeef',
        'written_at' => '2026-08-25T18:00:00Z'
      ) + "\n"
    )
  end

  def teardown
    FileUtils.rm_rf(@tmpdir)
  end

  def test_appends_when_marker_present
    record = {
      'hook_event_name' => 'postToolUse',
      'workspace_roots' => [@workspace],
      'normalized' => {
        'details' => {
          'tool_name' => 'Shell',
          'tool_use_id' => 'tool-1'
        }
      }
    }
    AdherenceAppendActionAttempted.call(record, hook_log_path: '/tmp/hook.yaml', hook_log_line: 7)

    lines = File.read(@ledger).lines
    assert_equal 1, lines.size
    row = JSON.parse(lines.first)
    assert_equal 'action_attempted', row['event_class']
    assert_equal ['tool:Shell'], row['evidence_refs']
    assert_equal({ 'path' => '/tmp/hook.yaml', 'line' => 7 }, row['hook_log_ref'])
    refute_includes row.to_json, 'tool_input'
  end

  def test_silent_when_marker_absent
    record = {
      'hook_event_name' => 'postToolUse',
      'workspace_roots' => [@workspace],
      'normalized' => {
        'details' => { 'tool_name' => 'Shell' }
      }
    }
    FileUtils.rm_f(@marker_path)
    AdherenceAppendActionAttempted.call(record, hook_log_path: '/tmp/hook.yaml', hook_log_line: 1)

    refute File.exist?(@ledger), 'ledger must not be created without marker'
  end
end
